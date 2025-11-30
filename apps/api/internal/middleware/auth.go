package middleware

import (
	"net/http"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/requestmeta"
	"github.com/Tidwell32/zack/apps/api/internal/services"
)

func AuthMiddleware(cfg *config.Config, authService *services.AuthService, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, isAuthenticated := getUserFromRequest(r, authService)
		timezone := getTimezoneFromRequest(r)

		var meta requestmeta.Meta

		if isAuthenticated {
			isOwner := userID == cfg.OwnerUserID

			meta = requestmeta.Meta{
				User: &requestmeta.User{
					ID:      userID,
					IsOwner: isOwner,
				},
				Timezone: timezone,
			}
		} else {
			meta = requestmeta.Meta{
				User:     nil,
				Timezone: timezone,
			}
		}

		ctx := requestmeta.WithMeta(r.Context(), &meta)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getUserFromRequest(r *http.Request, authService *services.AuthService) (string, bool) {
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		return "", false
	}

	return authService.ValidateToken(cookie.Value)
}

func getTimezoneFromRequest(r *http.Request) *time.Location {
	tzHeader := r.Header.Get("X-Timezone")

	if tzHeader != "" {
		if loc, err := time.LoadLocation(tzHeader); err == nil {
			return loc
		}
	}

	// Default to America/Chicago (CST/CDT)
	loc, err := time.LoadLocation("America/Chicago")
	if err != nil {
		return time.UTC
	}

	return loc
}
