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
	"github.com/Tidwell32/zack/apps/api/internal/udisc"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type UDiscService struct {
	repo repository.UDiscRepository
}

func NewUDiscService(repo repository.UDiscRepository) *UDiscService {
	return &UDiscService{
		repo: repo,
	}
}

type ImportUDiscCSVInput struct {
	CSVData  []byte
	UserID   *string
	Timezone *time.Location
}

type RoundFilters struct {
	StartDate  *time.Time
	EndDate    *time.Time
	PlayerName string
}

func (s *UDiscService) parseCSV(csvData []byte) ([]udisc.RoundCSVRow, error) {
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

	var rows []udisc.RoundCSVRow
	for i, record := range dataRows {
		isEmpty := true
		for _, v := range record {
			if strings.TrimSpace(v) != "" {
				isEmpty = false
				break
			}
		}
		if isEmpty {
			continue
		}

		row, err := s.parseRoundCSVRow(record, colIndex)
		if err != nil {
			return nil, fmt.Errorf("error parsing row %d: %w", i+2, err)
		}
		rows = append(rows, row)
	}

	return rows, nil
}

func (s *UDiscService) parseRoundCSVRow(record []string, colIndex map[string]int) (udisc.RoundCSVRow, error) {
	getCol := func(name string) string {
		if idx, ok := colIndex[name]; ok && idx < len(record) {
			return strings.TrimSpace(record[idx])
		}
		return ""
	}

	return udisc.RoundCSVRow{
		PlayerName:   getCol("PlayerName"),
		CourseName:   getCol("CourseName"),
		LayoutName:   getCol("LayoutName"),
		StartDateStr: getCol("StartDate"),
		EndDateStr:   getCol("EndDate"),
		TotalStr:     getCol("Total"),
		PlusMinus:    getCol("+/-"),
		RoundRating:  getCol("RoundRating"),

		Hole1:  getCol("Hole1"),
		Hole2:  getCol("Hole2"),
		Hole3:  getCol("Hole3"),
		Hole4:  getCol("Hole4"),
		Hole5:  getCol("Hole5"),
		Hole6:  getCol("Hole6"),
		Hole7:  getCol("Hole7"),
		Hole8:  getCol("Hole8"),
		Hole9:  getCol("Hole9"),
		Hole10: getCol("Hole10"),
		Hole11: getCol("Hole11"),
		Hole12: getCol("Hole12"),
		Hole13: getCol("Hole13"),
		Hole14: getCol("Hole14"),
		Hole15: getCol("Hole15"),
		Hole16: getCol("Hole16"),
		Hole17: getCol("Hole17"),
		Hole18: getCol("Hole18"),
		Hole19: getCol("Hole19"),
		Hole20: getCol("Hole20"),
		Hole21: getCol("Hole21"),
	}, nil
}

func (s *UDiscService) ImportUDiscCSV(ctx context.Context, input ImportUDiscCSVInput) (*udisc.ImportResponse, error) {
	rows, err := s.parseCSV(input.CSVData)
	if err != nil {
		return nil, fmt.Errorf("CSV parsing failed: %w", err)
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("CSV contains no data rows")
	}

	rounds, err := s.buildRoundsFromCSVRows(input.UserID, rows, input.Timezone)
	if err != nil {
		return nil, fmt.Errorf("failed to build rounds from CSV: %w", err)
	}

	persisted := false
	if input.UserID != nil {
		if err := s.repo.UpsertRounds(ctx, rounds); err != nil {
			return nil, fmt.Errorf("failed to save rounds: %w", err)
		}
		persisted = true

		allRounds, err := s.repo.GetRoundsForUser(ctx, *input.UserID)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch rounds after import: %w", err)
		}
		rounds = allRounds
	}

	primaryPlayer := udisc.FindPrimaryPlayer(rounds)
	players := extractDistinctPlayers(rounds)
	courses := extractDistinctCourses(rounds)

	roundViews := udisc.NormalizeCourses(rounds)

	sort.Slice(roundViews, func(i, j int) bool {
		return roundViews[i].Round.StartTime.After(roundViews[j].Round.StartTime)
	})

	return &udisc.ImportResponse{
		Rounds:        roundViews,
		Persisted:     persisted,
		PrimaryPlayer: primaryPlayer,
		Players:       players,
		Courses:       courses,
	}, nil
}

type roundGroup struct {
	courseName string
	layoutName string
	startTime  time.Time
	endTime    time.Time
	rows       []udisc.RoundCSVRow
}

func (s *UDiscService) buildRoundsFromCSVRows(userID *string, rows []udisc.RoundCSVRow, loc *time.Location) ([]udisc.Round, error) {
	if loc == nil {
		loc = time.UTC
	}

	groupMap := make(map[string]*roundGroup)

	getUserID := func() string {
		if userID == nil {
			return ""
		}
		return *userID
	}
	userIDVal := getUserID()

	for _, row := range rows {
		if strings.TrimSpace(row.CourseName) == "" || strings.TrimSpace(row.LayoutName) == "" {
			continue
		}

		startTime, err := udisc.ParseUDiscTime(row.StartDateStr, loc)
		if err != nil {
			return nil, fmt.Errorf("invalid StartDate %q: %w", row.StartDateStr, err)
		}
		endTime, err := udisc.ParseUDiscTime(row.EndDateStr, loc)
		if err != nil {
			endTime = startTime
		}

		key := fmt.Sprintf("%s|%s|%s|%s", userIDVal, row.CourseName, row.LayoutName, startTime.Format(time.RFC3339))

		if _, ok := groupMap[key]; !ok {
			groupMap[key] = &roundGroup{
				courseName: row.CourseName,
				layoutName: row.LayoutName,
				startTime:  startTime,
				endTime:    endTime,
				rows:       []udisc.RoundCSVRow{},
			}
		}

		group := groupMap[key]
		group.rows = append(group.rows, row)

		if endTime.After(group.endTime) {
			group.endTime = endTime
		}
	}

	rounds := make([]udisc.Round, 0, len(groupMap))
	now := time.Now().UTC()

	for _, group := range groupMap {
		round, err := s.buildRoundFromGroup(userID, group, now)
		if err != nil {
			return nil, err
		}
		rounds = append(rounds, round)
	}

	sort.Slice(rounds, func(i, j int) bool {
		return rounds[i].StartTime.After(rounds[j].StartTime)
	})

	return rounds, nil
}

func (s *UDiscService) buildRoundFromGroup(userID *string, group *roundGroup, now time.Time) (udisc.Round, error) {
	userIDVal := ""
	if userID != nil {
		userIDVal = *userID
	}

	var parRow *udisc.RoundCSVRow
	playerRows := make([]udisc.RoundCSVRow, 0, len(group.rows))

	for i := range group.rows {
		row := group.rows[i]
		if strings.EqualFold(strings.TrimSpace(row.PlayerName), "par") {
			if parRow == nil {
				parRow = &row
			}
			continue
		}
		playerRows = append(playerRows, row)
	}

	var pars []int
	holeCount := 0
	totalPar := 0

	if parRow != nil {
		pars = udisc.ParseHoleScores(*parRow)
		holeCount = len(pars)
		totalPar = udisc.CalculateTotalPar(pars)
	}

	players := make([]udisc.PlayerScore, 0, len(group.rows))

	maxHoleCount := holeCount

	if holeCount == 0 {
		for _, row := range playerRows {
			scores := udisc.ParseHoleScores(row)
			if len(scores) > maxHoleCount {
				maxHoleCount = len(scores)
			}
		}
		holeCount = maxHoleCount
	}

	for _, row := range playerRows {
		scores := udisc.ParseHoleScores(row)

		var totalPtr *int
		if strings.TrimSpace(row.TotalStr) != "" {
			if totalVal, err := strconv.Atoi(strings.TrimSpace(row.TotalStr)); err == nil {
				totalPtr = &totalVal
			}
		}

		plusMinus := strings.TrimSpace(row.PlusMinus)
		plusMinusInt := udisc.ParsePlusMinus(plusMinus, totalPtr, totalPar)

		var ratingPtr *int
		if strings.TrimSpace(row.RoundRating) != "" {
			if ratingVal, err := strconv.Atoi(strings.TrimSpace(row.RoundRating)); err == nil {
				ratingPtr = &ratingVal
			}
		}

		player := udisc.PlayerScore{
			PlayerName:   strings.TrimSpace(row.PlayerName),
			Total:        totalPtr,
			PlusMinus:    plusMinus,
			PlusMinusInt: plusMinusInt,
			RoundRating:  ratingPtr,
			Scores:       scores,
			HoleCount:    len(scores),
			IsComplete:   udisc.IsRoundComplete(scores, holeCount),
		}

		players = append(players, player)
	}

	round := udisc.Round{
		ID:         bson.NewObjectID(),
		UserID:     userIDVal,
		CourseName: group.courseName,
		LayoutName: group.layoutName,
		StartTime:  group.startTime,
		EndTime:    group.endTime,
		HoleCount:  holeCount,
		Pars:       pars,
		TotalPar:   totalPar,
		Players:    players,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	return round, nil
}

func (s *UDiscService) GetRoundsForUser(ctx context.Context, userID string, filters RoundFilters, loc *time.Location) (*udisc.RoundsResponse, error) {
	rounds, err := s.repo.GetRoundsForUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	if loc == nil {
		loc = time.UTC
	}

	filtered := s.filterRounds(rounds, filters, loc)

	if filtered == nil {
		filtered = []udisc.Round{}
	}

	roundViews := udisc.NormalizeCourses(filtered)

	sort.Slice(roundViews, func(i, j int) bool {
		return roundViews[i].Round.StartTime.After(roundViews[j].Round.StartTime)
	})

	return &udisc.RoundsResponse{
		Rounds:        roundViews,
		PrimaryPlayer: udisc.FindPrimaryPlayer(filtered),
	}, nil
}

func (s *UDiscService) filterRounds(rounds []udisc.Round, filters RoundFilters, loc *time.Location) []udisc.Round {
	if filters.StartDate == nil && filters.EndDate == nil && strings.TrimSpace(filters.PlayerName) == "" {
		return rounds
	}

	player := strings.TrimSpace(filters.PlayerName)
	player = strings.ToLower(player)

	result := make([]udisc.Round, 0, len(rounds))

	for _, r := range rounds {
		startLocal := r.StartTime.In(loc)
		roundDate := time.Date(startLocal.Year(), startLocal.Month(), startLocal.Day(), 0, 0, 0, 0, loc)

		if filters.StartDate != nil {
			startBoundary := time.Date(filters.StartDate.Year(), filters.StartDate.Month(), filters.StartDate.Day(), 0, 0, 0, 0, loc)
			if roundDate.Before(startBoundary) {
				continue
			}
		}

		if filters.EndDate != nil {
			endBoundary := time.Date(filters.EndDate.Year(), filters.EndDate.Month(), filters.EndDate.Day(), 23, 59, 59, 999999999, loc)
			if roundDate.After(endBoundary) {
				continue
			}
		}

		if player != "" {
			found := false
			for _, p := range r.Players {
				if strings.ToLower(strings.TrimSpace(p.PlayerName)) == player {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}

		result = append(result, r)
	}

	return result
}

func (s *UDiscService) GetDistinctPlayersForUser(ctx context.Context, userID string) ([]string, error) {
	names, err := s.repo.GetDistinctPlayers(ctx, userID)
	if err != nil {
		return []string{}, err
	}

	sort.Strings(names)

	if names == nil {
		return []string{}, nil
	}

	return names, nil
}

func (s *UDiscService) GetDistinctCoursesForUser(ctx context.Context, userID string) ([]udisc.CourseInfo, error) {
	courses, err := s.repo.GetDistinctCourses(ctx, userID)
	if err != nil {
		return []udisc.CourseInfo{}, err
	}

	if courses == nil {
		return []udisc.CourseInfo{}, nil
	}

	return courses, nil
}

func extractDistinctPlayers(rounds []udisc.Round) []string {
	seen := make(map[string]struct{})
	for _, r := range rounds {
		for _, p := range r.Players {
			name := strings.TrimSpace(p.PlayerName)
			if name != "" && p.IsComplete {
				seen[name] = struct{}{}
			}
		}
	}

	players := make([]string, 0, len(seen))
	for name := range seen {
		players = append(players, name)
	}
	sort.Strings(players)

	return players
}

func extractDistinctCourses(rounds []udisc.Round) []udisc.CourseInfo {
	type courseKey struct {
		courseName string
		layoutName string
	}

	seen := make(map[courseKey]struct{})
	for _, r := range rounds {
		hasCompleted := false
		for _, p := range r.Players {
			if p.IsComplete {
				hasCompleted = true
				break
			}
		}
		if !hasCompleted {
			continue
		}

		key := courseKey{
			courseName: strings.TrimSpace(r.CourseName),
			layoutName: strings.TrimSpace(r.LayoutName),
		}
		if key.courseName != "" {
			seen[key] = struct{}{}
		}
	}

	courses := make([]udisc.CourseInfo, 0, len(seen))
	for key := range seen {
		courses = append(courses, udisc.CourseInfo{
			CourseName: key.courseName,
			LayoutName: key.layoutName,
		})
	}

	sort.Slice(courses, func(i, j int) bool {
		if courses[i].CourseName != courses[j].CourseName {
			return courses[i].CourseName < courses[j].CourseName
		}
		return courses[i].LayoutName < courses[j].LayoutName
	})

	return courses
}
