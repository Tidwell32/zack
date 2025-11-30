package services

import (
	"fmt"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

type AuthService struct {
	cfg *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{cfg: cfg}
}

func (s *AuthService) ValidateTOTP(code string) (bool, error) {
	valid, err := totp.ValidateCustom(
		code,
		s.cfg.AuthTOTPSecret,
		time.Now().UTC(),
		totp.ValidateOpts{
			Period:    30,
			Skew:      1,
			Digits:    otp.DigitsSix,
			Algorithm: otp.AlgorithmSHA1,
		},
	)
	if err != nil {
		return false, fmt.Errorf("failed to validate TOTP: %w", err)
	}
	return valid, nil
}

type TokenResult struct {
	Token         string
	ExpiresAt     time.Time
	TokenLifetime time.Duration
}

func (s *AuthService) GenerateToken(userID string) (*TokenResult, error) {
	now := time.Now().UTC()
	tokenLifetime := 7 * 24 * time.Hour

	claims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(now.Add(tokenLifetime)),
		IssuedAt:  jwt.NewNumericDate(now),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.AuthJWTSecret))
	if err != nil {
		return nil, fmt.Errorf("failed to sign JWT: %w", err)
	}

	return &TokenResult{
		Token:         signed,
		ExpiresAt:     now.Add(tokenLifetime),
		TokenLifetime: tokenLifetime,
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (string, bool) {
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.cfg.AuthJWTSecret), nil
	})

	if err != nil || !token.Valid {
		return "", false
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || claims.Subject == "" {
		return "", false
	}

	return claims.Subject, true
}
