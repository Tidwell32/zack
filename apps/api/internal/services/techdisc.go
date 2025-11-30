package services

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/repository"
	"github.com/Tidwell32/zack/apps/api/internal/techdisc"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type TechDiscService struct {
	repo repository.TechDiscRepository
}

func NewTechDiscService(repo repository.TechDiscRepository) *TechDiscService {
	return &TechDiscService{
		repo: repo,
	}
}

type ImportTechDiscCSVInput struct {
	CSVData    []byte
	UserID     *string
	Handedness string // "left", "right", or "ambidextrous"
}

type ThrowFilters struct {
	Date      *time.Time
	StartDate *time.Time
	EndDate   *time.Time
}

func (s *TechDiscService) parseCSV(csvData []byte) ([]techdisc.ThrowCSVRow, error) {
	reader := csv.NewReader(bytes.NewReader(csvData))

	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to parse CSV: %w", err)
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSV must have header and at least one data row")
	}

	header := records[0]
	dataRows := records[1:]

	colIndex := make(map[string]int)
	for i, col := range header {
		colIndex[col] = i
	}

	var rows []techdisc.ThrowCSVRow
	for i, record := range dataRows {
		row, err := s.parseThrowCSVRow(record, colIndex)
		if err != nil {
			return nil, fmt.Errorf("error parsing row %d: %w", i+2, err)
		}
		rows = append(rows, row)
	}

	return rows, nil
}

func (s *TechDiscService) parseThrowCSVRow(record []string, colIndex map[string]int) (techdisc.ThrowCSVRow, error) {
	getCol := func(name string) string {
		if idx, ok := colIndex[name]; ok && idx < len(record) {
			return strings.TrimSpace(record[idx])
		}
		return ""
	}

	parseFloat := func(val string) float64 {
		f, _ := strconv.ParseFloat(val, 64)
		return f
	}

	parseInt := func(val string) int {
		i, _ := strconv.Atoi(val)
		return i
	}

	parseInt64 := func(val string) int64 {
		i, _ := strconv.ParseInt(val, 10, 64)
		return i
	}

	return techdisc.ThrowCSVRow{
		ID:               parseInt(getCol("id")),
		Time:             getCol("time"),
		TimeSeconds:      parseInt64(getCol("timeSeconds")),
		SpeedMph:         parseFloat(getCol("speedMph")),
		SpeedKmh:         parseFloat(getCol("speedKmh")),
		AdvanceRatio:     parseFloat(getCol("advanceRatio")),
		SpinRpm:          parseFloat(getCol("spinRpm")),
		LaunchAngle:      parseFloat(getCol("launchAngle")),
		NoseAngle:        parseFloat(getCol("noseAngle")),
		HyzerAngle:       parseFloat(getCol("hyzerAngle")),
		WobbleAngle:      parseFloat(getCol("wobbleAngle")),
		DistanceFeet:     parseFloat(getCol("distanceFeet")),
		DistanceMeters:   parseFloat(getCol("distanceMeters")),
		ThrowType:        getCol("throwType"),
		PrimaryThrowType: getCol("primaryThrowType"),
		Tags:             getCol("tags"),
		Notes:            getCol("notes"),
	}, nil
}

func (s *TechDiscService) transformThrowCSVRowsToThrows(userID *string, rows []techdisc.ThrowCSVRow) []techdisc.ThrowRaw {
	throws := make([]techdisc.ThrowRaw, 0, len(rows))
	now := time.Now().UTC()

	for _, row := range rows {
		tags := s.parseTags(row.Tags)

		handedness := s.inferHandedness(tags)

		throwTime := time.Unix(row.TimeSeconds, 0)

		throw := techdisc.ThrowRaw{
			ID:               bson.NewObjectID(),
			UserID:           userID,
			TechDiscID:       row.ID,
			Time:             throwTime,
			ThrowType:        row.ThrowType,
			PrimaryThrowType: row.PrimaryThrowType,
			Handedness:       handedness,
			Tags:             tags,
			Notes:            row.Notes,
			SpeedMph:         row.SpeedMph,
			SpeedKmh:         row.SpeedKmh,
			SpinRpm:          row.SpinRpm,
			DistanceFeet:     row.DistanceFeet,
			DistanceMeters:   row.DistanceMeters,
			AdvanceRatio:     row.AdvanceRatio,
			LaunchAngle:      row.LaunchAngle,
			NoseAngle:        row.NoseAngle,
			HyzerAngle:       row.HyzerAngle,
			WobbleAngle:      row.WobbleAngle,
			CreatedAt:        now,
			UpdatedAt:        now,
		}

		throws = append(throws, throw)
	}

	return throws
}

func (s *TechDiscService) parseTags(tagsStr string) []string {
	if tagsStr == "" {
		return []string{}
	}

	parts := strings.Split(tagsStr, "|")
	tags := make([]string, 0, len(parts))

	for _, tag := range parts {
		tag = strings.TrimSpace(tag)
		tag = strings.ToLower(tag)
		if tag != "" {
			tags = append(tags, tag)
		}
	}

	return tags
}

func (s *TechDiscService) inferHandedness(tags []string) *string {
	hasLeft := false
	hasRight := false

	for _, tag := range tags {
		if strings.Contains(tag, "left") {
			hasLeft = true
		}
		if strings.Contains(tag, "right") {
			hasRight = true
		}
	}

	if hasLeft == hasRight {
		return nil
	}

	if hasLeft {
		left := "left"
		return &left
	}

	right := "right"
	return &right
}

func (s *TechDiscService) ImportTechDiscCSV(ctx context.Context, input ImportTechDiscCSVInput) (*techdisc.ImportResponse, error) {
	ThrowCSVRows, err := s.parseCSV(input.CSVData)
	if err != nil {
		return nil, fmt.Errorf("CSV parsing failed: %w", err)
	}

	if len(ThrowCSVRows) == 0 {
		return nil, fmt.Errorf("CSV contains no data rows")
	}

	throws := s.transformThrowCSVRowsToThrows(input.UserID, ThrowCSVRows)

	throws = s.applyHandedness(throws, input.Handedness)

	persisted := false
	if input.UserID != nil {
		if err := s.repo.UpsertThrows(ctx, throws); err != nil {
			return nil, fmt.Errorf("failed to save throws: %w", err)
		}
		persisted = true
	}

	return &techdisc.ImportResponse{
		Throws:    throws,
		Persisted: persisted,
	}, nil
}

func (s *TechDiscService) applyHandedness(throws []techdisc.ThrowRaw, handedness string) []techdisc.ThrowRaw {
	left := "left"
	right := "right"

	switch handedness {
	case "left":
		for i := range throws {
			throws[i].Handedness = &left
		}

	case "right":
		for i := range throws {
			throws[i].Handedness = &right
		}

	case "ambidextrous":
		// Keep existing handedness from tags, set untagged to nil
	default:

	}

	return throws
}

func (s *TechDiscService) GetThrowsForUser(ctx context.Context, userID string, filters ThrowFilters, loc *time.Location) ([]techdisc.ThrowView, error) {
	throws, err := s.repo.GetThrowsForUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Fallback to UTC if no timezone provided
	if loc == nil {
		loc = time.UTC
	}

	views := techdisc.AnnotateOutliers(throws, loc)

	filtered := s.filterThrowsByDate(views, filters, loc)

	s.sortThrowsByDate(filtered)

	return filtered, nil
}

func (s *TechDiscService) filterThrowsByDate(views []techdisc.ThrowView, filters ThrowFilters, loc *time.Location) []techdisc.ThrowView {
	if filters.Date == nil && filters.StartDate == nil && filters.EndDate == nil {
		return views
	}

	filtered := make([]techdisc.ThrowView, 0)

	for _, v := range views {
		if filters.Date != nil {
			y, m, d := filters.Date.Date()
			targetDate := fmt.Sprintf("%04d-%02d-%02d", y, int(m), d)

			if v.SessionDate == targetDate {
				filtered = append(filtered, v)
			}
			continue
		}

		throwDate, err := time.ParseInLocation("2006-01-02", v.SessionDate, loc)
		if err != nil {
			continue
		}

		if filters.StartDate != nil {
			startOfDay := time.Date(filters.StartDate.Year(), filters.StartDate.Month(), filters.StartDate.Day(), 0, 0, 0, 0, loc)
			if throwDate.Before(startOfDay) {
				continue
			}
		}

		if filters.EndDate != nil {
			endOfDay := time.Date(filters.EndDate.Year(), filters.EndDate.Month(), filters.EndDate.Day(), 23, 59, 59, 999999999, loc)
			if throwDate.After(endOfDay) {
				continue
			}
		}

		filtered = append(filtered, v)
	}

	return filtered
}

func (s *TechDiscService) sortThrowsByDate(views []techdisc.ThrowView) {
	sort.Slice(views, func(i, j int) bool {
		if views[i].SessionDate != views[j].SessionDate {
			return views[i].SessionDate > views[j].SessionDate
		}
		return views[i].Time.After(views[j].Time)
	})
}

func (s *TechDiscService) GetSessionSummariesForUser(ctx context.Context, userID string, filters ThrowFilters, loc *time.Location) ([]techdisc.SessionSummary, error) {
	views, err := s.GetThrowsForUser(ctx, userID, filters, loc)
	if err != nil {
		return nil, err
	}

	// TODO: maybe let this be a frontend filter
	useStrict := false

	summaries := techdisc.BuildSessionSummaries(views, useStrict)

	s.sortSessionsByDate(summaries)

	return summaries, nil
}

func (s *TechDiscService) sortSessionsByDate(summaries []techdisc.SessionSummary) {
	sort.Slice(summaries, func(i, j int) bool {
		return summaries[i].SessionDate > summaries[j].SessionDate
	})
}
