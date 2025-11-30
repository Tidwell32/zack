package handlers

import (
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
)

type UDiscHandler struct {
	cfg          *config.Config
	udiscService *services.UDiscService
}

func NewUDiscHandler(cfg *config.Config, udiscService *services.UDiscService) *UDiscHandler {
	return &UDiscHandler{
		cfg:          cfg,
		udiscService: udiscService,
	}
}

// POST /udisc/rounds/import
func (h *UDiscHandler) ImportUDiscCSV(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	var userID *string
	if meta != nil && meta.User != nil {
		userID = &meta.User.ID
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.Error(w, http.StatusBadRequest, "failed to parse form")
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		response.Error(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	csvData, err := io.ReadAll(file)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to read csv file")
		return
	}

	ctx := r.Context()

	var timezone *time.Location
	if meta != nil && meta.Timezone != nil {
		timezone = meta.Timezone
	}

	result, err := h.udiscService.ImportUDiscCSV(ctx, services.ImportUDiscCSVInput{
		CSVData:  csvData,
		UserID:   userID,
		Timezone: timezone,
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to import UDisc CSV")
		return
	}

	_ = response.Success(w, result)
}

// GET /udisc/rounds
// Query params:
//   - startDate=YYYY-MM-DD (optional)
//   - endDate=YYYY-MM-DD   (optional)
//   - player=Name          (optional)
func (h *UDiscHandler) GetRounds(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	q := r.URL.Query()
	var filters services.RoundFilters

	loc := time.UTC
	if meta != nil && meta.Timezone != nil {
		loc = meta.Timezone
	}

	if startStr := strings.TrimSpace(q.Get("startDate")); startStr != "" {
		startDate, err := time.ParseInLocation("2006-01-02", startStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid startDate, expected YYYY-MM-DD")
			return
		}
		filters.StartDate = &startDate
	}

	if endStr := strings.TrimSpace(q.Get("endDate")); endStr != "" {
		endDate, err := time.ParseInLocation("2006-01-02", endStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid endDate, expected YYYY-MM-DD")
			return
		}
		filters.EndDate = &endDate
	}

	if player := strings.TrimSpace(q.Get("player")); player != "" {
		filters.PlayerName = player
	}

	ctx := r.Context()

	rounds, err := h.udiscService.GetRoundsForUser(ctx, userID, filters, loc)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch rounds")
		return
	}

	_ = response.Success(w, rounds)
}

// GET /udisc/players
func (h *UDiscHandler) GetPlayers(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	ctx := r.Context()

	names, err := h.udiscService.GetDistinctPlayersForUser(ctx, userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch players")
		return
	}

	_ = response.Success(w, names)
}

// GET /udisc/courses
func (h *UDiscHandler) GetCourses(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	ctx := r.Context()

	courses, err := h.udiscService.GetDistinctCoursesForUser(ctx, userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch courses")
		return
	}

	_ = response.Success(w, courses)
}
