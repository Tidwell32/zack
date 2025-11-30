package auth

import (
	"context"
	"net/http"
)

type ctxKey string

const userIDContextKey ctxKey = "userId"

func StoreUserID(r *http.Request, userID string) *http.Request {
	ctx := context.WithValue(r.Context(), userIDContextKey, userID)
	return r.WithContext(ctx)
}

func GetUserID(r *http.Request) (string, bool) {
	v := r.Context().Value(userIDContextKey)
	if v == nil {
		return "", false
	}

	userID, ok := v.(string)
	if !ok || userID == "" {
		return "", false
	}

	return userID, true
}
