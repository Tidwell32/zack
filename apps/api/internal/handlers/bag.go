package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Tidwell32/zack/apps/api/internal/bag"
	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
	"github.com/Tidwell32/zack/apps/api/pkg/validation"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type BagHandler struct {
	cfg        *config.Config
	bagService *services.BagService
}

func NewBagHandler(cfg *config.Config, bagService *services.BagService) *BagHandler {
	return &BagHandler{
		cfg:        cfg,
		bagService: bagService,
	}
}

type createBagRequest struct {
	Name string `json:"name"`
}

// POST /bags
func (h *BagHandler) CreateBag(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	var userID *string
	if meta != nil && meta.User != nil {
		userID = &meta.User.ID
	}

	var req createBagRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	name, err := validation.ValidateString(req.Name,
		validation.StringRules{Field: "name"}.
			RequiredField().
			Trimmed().
			Min(2).
			Max(50),
	)
	if err != nil {
		response.Error(w, http.StatusBadRequest, validation.ToHTTPMessage(err))
		return
	}

	b, _, err := h.bagService.CreateBag(
		r.Context(),
		userID,
		bag.CreateBagInput{Name: name},
	)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create bag")
		return
	}

	_ = response.Success(w, b)
}

// GET /bags
func (h *BagHandler) GetBagsForCurrentUser(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	userID := h.cfg.OwnerUserID
	if meta != nil && meta.User != nil {
		userID = meta.User.ID
	}

	bags, err := h.bagService.GetBagsForUser(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch bags")
		return
	}

	_ = response.Success(w, bags)
}

// GET /bags/{id}
func (h *BagHandler) GetBag(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		response.Error(w, http.StatusBadRequest, "id is required")
		return
	}

	oid, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid id")
		return
	}

	bagWithDiscs, err := h.bagService.GetBagWithDiscs(r.Context(), oid)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Error(w, http.StatusNotFound, "bag not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch bag")
		return
	}

	_ = response.Success(w, bagWithDiscs)
}

type updateBagRequest struct {
	Name *string `json:"name"`
}

// PATCH /bags/{id}
func (h *BagHandler) UpdateBag(w http.ResponseWriter, r *http.Request) {
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

	var req updateBagRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if userID == nil {
		var name string
		if req.Name != nil {
			validatedName, err := validation.ValidateString(*req.Name,
				validation.StringRules{Field: "name"}.
					RequiredField().
					Trimmed().
					Min(2).
					Max(50),
			)
			if err != nil {
				response.Error(w, http.StatusBadRequest, validation.ToHTTPMessage(err))
				return
			}
			name = validatedName
		} else {
			response.Error(w, http.StatusBadRequest, "name is required")
			return
		}

		b, _, err := h.bagService.UpdateBag(
			r.Context(),
			userID,
			bagID,
			bag.UpdateBagInput{Name: name},
		)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to update bag")
			return
		}

		_ = response.Success(w, b)
		return
	}

	existing, err := h.bagService.GetBagByID(r.Context(), bagID)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Error(w, http.StatusNotFound, "bag not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch bag")
		return
	}

	if existing.UserID != *userID {
		response.Error(w, http.StatusForbidden, "not authorized to update this bag")
		return
	}

	name := existing.Name
	if req.Name != nil {
		validatedName, err := validation.ValidateString(*req.Name,
			validation.StringRules{Field: "name"}.
				RequiredField().
				Trimmed().
				Min(2).
				Max(50),
		)
		if err != nil {
			response.Error(w, http.StatusBadRequest, validation.ToHTTPMessage(err))
			return
		}
		name = validatedName
	}

	b, _, err := h.bagService.UpdateBag(
		r.Context(),
		userID,
		bagID,
		bag.UpdateBagInput{Name: name},
	)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Error(w, http.StatusNotFound, "bag not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to update bag")
		return
	}

	_ = response.Success(w, b)
}

// DELETE /bags/{id}
func (h *BagHandler) DeleteBag(w http.ResponseWriter, r *http.Request) {
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

	if userID == nil {
		_, err := h.bagService.DeleteBag(r.Context(), userID, bagID)
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "failed to delete bag")
			return
		}

		_ = response.Success(w, map[string]string{"message": "bag deleted successfully"})
		return
	}

	existing, err := h.bagService.GetBagByID(r.Context(), bagID)
	if err != nil {
		if errors.Is(err, services.ErrNotFound) {
			response.Error(w, http.StatusNotFound, "bag not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, "failed to fetch bag")
		return
	}

	if existing.UserID != *userID {
		response.Error(w, http.StatusForbidden, "not authorized to delete this bag")
		return
	}

	_, err = h.bagService.DeleteBag(r.Context(), userID, bagID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete bag")
		return
	}

	_ = response.Success(w, map[string]string{"message": "bag deleted successfully"})
}
