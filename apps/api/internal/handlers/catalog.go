package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Tidwell32/zack/apps/api/internal/repository"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
)

type CatalogHandler struct {
	catalogRepo repository.DiscCatalogRepository
}

func NewCatalogHandler(catalogRepo repository.DiscCatalogRepository) *CatalogHandler {
	return &CatalogHandler{
		catalogRepo: catalogRepo,
	}
}

// GET /catalog/discs/search?q=mantra
func (h *CatalogHandler) SearchDiscs(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		response.Error(w, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}

	limit := 20
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if parsedLimit, err := parseLimit(limitStr); err == nil {
			if parsedLimit > 0 && parsedLimit <= 500 {
				limit = parsedLimit
			}
		}
	}

	discs, err := h.catalogRepo.Search(r.Context(), query, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to search catalog")
		return
	}

	_ = response.Success(w, discs)
}

func parseLimit(s string) (int, error) {
	var limit int
	_, err := fmt.Sscanf(s, "%d", &limit)
	return limit, err
}

// GET /catalog/discs/suggest?minSpeed=8&maxSpeed=12&minStability=-2&maxStability=2
func (h *CatalogHandler) SuggestDiscs(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	minSpeed, err := parseFloat(query.Get("minSpeed"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "minSpeed must be a valid number")
		return
	}

	maxSpeed, err := parseFloat(query.Get("maxSpeed"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "maxSpeed must be a valid number")
		return
	}

	minStability, err := parseFloat(query.Get("minStability"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "minStability must be a valid number")
		return
	}

	maxStability, err := parseFloat(query.Get("maxStability"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "maxStability must be a valid number")
		return
	}

	if minSpeed > maxSpeed {
		response.Error(w, http.StatusBadRequest, "minSpeed cannot be greater than maxSpeed")
		return
	}

	if minStability > maxStability {
		response.Error(w, http.StatusBadRequest, "minStability cannot be greater than maxStability")
		return
	}

	limit := 20
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsedLimit, err := parseLimit(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
			if limit > 50 {
				limit = 50
			}
		}
	}

	criteria := repository.SuggestCriteria{
		MinSpeed:     minSpeed,
		MaxSpeed:     maxSpeed,
		MinStability: minStability,
		MaxStability: maxStability,
		Limit:        limit,
	}

	discs, err := h.catalogRepo.Suggest(r.Context(), criteria)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to suggest discs")
		return
	}

	_ = response.Success(w, discs)
}

func parseFloat(s string) (float64, error) {
	if s == "" {
		return 0, fmt.Errorf("empty string")
	}
	return strconv.ParseFloat(s, 64)
}
