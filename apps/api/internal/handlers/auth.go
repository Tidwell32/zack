package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
)

type AuthHandler struct {
	cfg         *config.Config
	authService *services.AuthService
}

func NewAuthHandler(cfg *config.Config, authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		cfg:         cfg,
		authService: authService,
	}
}

type loginRequest struct {
	Code string `json:"code"`
}

type loginResponse struct {
	Token string `json:"token"`
}

// TOTP authentication (authenticator phone app)
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Code == "" {
		response.Error(w, http.StatusBadRequest, "code is required")
		return
	}

	valid, err := h.authService.ValidateTOTP(req.Code)
	if err != nil || !valid {
		response.Error(w, http.StatusUnauthorized, "invalid code")
		return
	}

	tokenResult, err := h.authService.GenerateToken(h.cfg.OwnerUserID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenResult.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cfg.Environment == "production",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(tokenResult.TokenLifetime.Seconds()),
		Expires:  tokenResult.ExpiresAt,
	})

	_ = response.Success(w, loginResponse{Token: tokenResult.Token})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cfg.Environment == "production",
		MaxAge:   -1,
	})

	_ = response.Success(w, map[string]string{"message": "logged out"})
}

type whoamiResponse struct {
	Authenticated bool   `json:"authenticated"`
	UserID        string `json:"userId,omitempty"`
	IsOwner       bool   `json:"isOwner"`
}

func (h *AuthHandler) WhoAmI(w http.ResponseWriter, r *http.Request) {
	meta := requestmeta.GetMeta(r.Context())

	resp := whoamiResponse{
		Authenticated: false,
		IsOwner:       false,
	}

	if meta != nil && meta.User != nil {
		resp.Authenticated = true
		resp.UserID = meta.User.ID
		resp.IsOwner = meta.User.IsOwner
	}

	_ = response.Success(w, resp)
}
