package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/disc"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
	"github.com/Tidwell32/zack/apps/api/pkg/validation"
)

type DiscHandler struct {
	cfg         *config.Config
	discService *services.DiscService
}

func NewDiscHandler(cfg *config.Config, discService *services.DiscService) *DiscHandler {
	return &DiscHandler{
		cfg:         cfg,
		discService: discService,
	}
}

type addDiscToBagRequest struct {
	CatalogDiscID  string              `json:"catalogDiscId"`
	AdjustedFlight *disc.FlightNumbers `json:"adjustedFlight"`
	Notes          string              `json:"notes"`
	ColorHex       string              `json:"colorHex"`
	Weight         *int                `json:"weight,omitempty"`
	Plastic        string              `json:"plastic"`
}

// POST /bags/{id}/discs
func (h *DiscHandler) AddDiscToBag(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	var userID *string
	if meta != nil && meta.User != nil {
		userID = &meta.User.ID
	}

	bagIDStr := r.PathValue("id")
	bagID, err := validation.ValidateObjectID(bagIDStr, "bag id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req addDiscToBagRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	catalogDiscID, err := validation.ValidateString(
		req.CatalogDiscID,
		validation.StringRules{Field: "catalogDiscId"}.
			RequiredField().
			Trimmed().
			Min(1),
	)
	if err != nil {
		response.Error(w, http.StatusBadRequest, validation.ToHTTPMessage(err))
		return
	}

	d, _, err := h.discService.AddDiscToBag(
		r.Context(),
		userID,
		bagID,
		disc.CreateDiscInput{
			CatalogDiscID:  catalogDiscID,
			AdjustedFlight: req.AdjustedFlight,
			Notes:          req.Notes,
			ColorHex:       req.ColorHex,
			Weight:         req.Weight,
			Plastic:        req.Plastic,
		},
	)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create disc")
		return
	}

	_ = response.Success(w, d)
}

// GET /bags/{id}/discs
func (h *DiscHandler) GetDiscsForBag(w http.ResponseWriter, r *http.Request) {
	bagIDStr := r.PathValue("id")
	bagID, err := validation.ValidateObjectID(bagIDStr, "bag id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	discs, err := h.discService.GetDiscsForBag(r.Context(), bagID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch discs")
		return
	}

	_ = response.Success(w, discs)
}

type updateDiscRequest struct {
	BagID          *string             `json:"bagId"`
	AdjustedFlight *disc.FlightNumbers `json:"adjustedFlight"`
	Notes          *string             `json:"notes"`
	ColorHex       *string             `json:"colorHex"`
	Weight         *int                `json:"weight"`
	Plastic        *string             `json:"plastic"`
}

// PATCH /discs/{id}
func (h *DiscHandler) UpdateDisc(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	var userID *string
	if meta != nil && meta.User != nil {
		userID = &meta.User.ID
	}

	discIDStr := r.PathValue("id")
	discID, err := validation.ValidateObjectID(discIDStr, "disc id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var req updateDiscRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx := r.Context()

	var updateInput disc.UpdateDiscInput

	if req.BagID != nil {
		bagID, err := validation.ValidateObjectID(*req.BagID, "bag id")
		if err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		updateInput.BagID = &bagID
	}
	if req.Plastic != nil {
		updateInput.Plastic = *req.Plastic
	}
	if req.Weight != nil {
		weight, err := validation.ValidateInt(*req.Weight, validation.IntRules{Field: "weight"}.MinValue(0).MaxValue(300))
		if err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		updateInput.Weight = &weight
	}
	if req.ColorHex != nil {
		colorHex, err := validation.ValidateHexColor(*req.ColorHex, "colorHex")
		if err != nil {
			response.Error(w, http.StatusBadRequest, err.Error())
			return
		}
		updateInput.ColorHex = colorHex
	}
	if req.Notes != nil {
		updateInput.Notes = *req.Notes
	}
	if req.AdjustedFlight != nil {
		updateInput.AdjustedFlight = req.AdjustedFlight
	}

	if userID == nil {
		d, _, err := h.discService.UpdateDisc(ctx, userID, discID, updateInput)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to update disc")
			return
		}

		_ = response.Success(w, d)
		return
	}

	existingDisc, err := h.discService.GetDiscByID(ctx, discID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch disc")
		return
	}
	if existingDisc == nil {
		response.Error(w, http.StatusNotFound, "disc not found")
		return
	}

	if existingDisc.UserID != *userID {
		response.Error(w, http.StatusForbidden, "not authorized to update this disc")
		return
	}

	d, _, err := h.discService.UpdateDisc(ctx, userID, discID, updateInput)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update disc")
		return
	}

	_ = response.Success(w, d)
}

// DELETE /discs/{id}
func (h *DiscHandler) DeleteDisc(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	var userID *string
	if meta != nil && meta.User != nil {
		userID = &meta.User.ID
	}

	discIDStr := r.PathValue("id")
	discID, err := validation.ValidateObjectID(discIDStr, "disc id")
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	ctx := r.Context()

	if userID == nil {
		_, err := h.discService.DeleteDisc(ctx, userID, discID)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to delete disc")
			return
		}

		_ = response.Success(w, map[string]string{"message": "disc deleted successfully"})
		return
	}

	existingDisc, err := h.discService.GetDiscByID(ctx, discID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch disc")
		return
	}
	if existingDisc == nil {
		response.Error(w, http.StatusNotFound, "disc not found")
		return
	}

	if existingDisc.UserID != *userID {
		response.Error(w, http.StatusForbidden, "not authorized to delete this disc")
		return
	}

	_, err = h.discService.DeleteDisc(ctx, userID, discID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete disc")
		return
	}

	_ = response.Success(w, map[string]string{"message": "disc deleted successfully"})
}
