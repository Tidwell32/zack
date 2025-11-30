package handlers

import (
	"net/http"

	"github.com/Tidwell32/zack/apps/api/pkg/response"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Handle(w http.ResponseWriter, r *http.Request) {
	response.Success(w, map[string]string{"status": "ok"})
}
