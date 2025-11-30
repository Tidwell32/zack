package handlers

import (
	"io"
	"net/http"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
	"github.com/Tidwell32/zack/apps/api/pkg/validation"
)

type TechDiscHandler struct {
	cfg             *config.Config
	techDiscService *services.TechDiscService
}

func NewTechDiscHandler(cfg *config.Config, techDiscService *services.TechDiscService) *TechDiscHandler {
	return &TechDiscHandler{
		cfg:             cfg,
		techDiscService: techDiscService,
	}
}

func (h *TechDiscHandler) ImportTechDiscCSV(w http.ResponseWriter, r *http.Request) {
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

	handedness := r.FormValue("handedness")

	validHandedness, err := validation.ValidateString(handedness,
		validation.StringRules{Field: "handedness"}.
			RequiredField().
			Trimmed().
			In("left", "right", "ambidextrous"),
	)
	if err != nil {
		response.Error(w, http.StatusBadRequest, validation.ToHTTPMessage(err))
		return
	}

	ctx := r.Context()

	result, err := h.techDiscService.ImportTechDiscCSV(ctx, services.ImportTechDiscCSVInput{
		CSVData:    csvData,
		UserID:     userID,
		Handedness: validHandedness,
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to import CSV")
		return
	}

	_ = response.Success(w, result)
}

// GET /techdisc/throws?date=YYYY-MM-DD or ?startDate=YYYY-MM-DD or ?endDate=YYYY-MM-DD or ?startDate=...&endDate=...
func (h *TechDiscHandler) GetThrows(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	loc := time.UTC
	if meta != nil && meta.Timezone != nil {
		loc = meta.Timezone
	}

	var dateFilter *time.Time
	var startDate, endDate *time.Time

	if dateStr := r.URL.Query().Get("date"); dateStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", dateStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD")
			return
		}
		dateFilter = &parsed
	}

	if startStr := r.URL.Query().Get("startDate"); startStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", startStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid startDate format, use YYYY-MM-DD")
			return
		}
		startDate = &parsed
	}

	if endStr := r.URL.Query().Get("endDate"); endStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", endStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid endDate format, use YYYY-MM-DD")
			return
		}
		endDate = &parsed
	}

	throws, err := h.techDiscService.GetThrowsForUser(r.Context(), userID, services.ThrowFilters{
		Date:      dateFilter,
		StartDate: startDate,
		EndDate:   endDate,
	}, loc)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch throws")
		return
	}

	_ = response.Success(w, throws)
}

// GET /techdisc/sessions?date=YYYY-MM-DD or ?startDate=YYYY-MM-DD or ?endDate=YYYY-MM-DD or ?startDate=...&endDate=...
func (h *TechDiscHandler) GetSessions(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	loc := time.UTC
	if meta != nil && meta.Timezone != nil {
		loc = meta.Timezone
	}

	var dateFilter *time.Time
	var startDate, endDate *time.Time

	if dateStr := r.URL.Query().Get("date"); dateStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", dateStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid date format, use YYYY-MM-DD")
			return
		}
		dateFilter = &parsed
	}

	if startStr := r.URL.Query().Get("startDate"); startStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", startStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid startDate format, use YYYY-MM-DD")
			return
		}
		startDate = &parsed
	}

	if endStr := r.URL.Query().Get("endDate"); endStr != "" {
		parsed, err := time.ParseInLocation("2006-01-02", endStr, loc)
		if err != nil {
			response.Error(w, http.StatusBadRequest, "invalid endDate format, use YYYY-MM-DD")
			return
		}
		endDate = &parsed
	}

	sessions, err := h.techDiscService.GetSessionSummariesForUser(r.Context(), userID, services.ThrowFilters{
		Date:      dateFilter,
		StartDate: startDate,
		EndDate:   endDate,
	}, loc)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch sessions")
		return
	}

	_ = response.Success(w, sessions)
}
