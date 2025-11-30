package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MongoURI      string
	MongoDatabase string
	Environment   string

	AuthTOTPSecret   string
	AuthJWTSecret    string
	AuthBypassCode   string
	OwnerUserID      string

	AllowedOrigin string

	// Seeding
	ForceReseed bool
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGODB_URI", ""),
		MongoDatabase: getEnv("MONGODB_DATABASE", "zack"),
		Environment:   getEnv("ENV", "development"),

		AuthTOTPSecret: getEnv("AUTH_TOTP_SECRET", ""),
		AuthJWTSecret:  getEnv("AUTH_JWT_SECRET", ""),
		AuthBypassCode: getEnv("AUTH_BYPASS_CODE", ""),
		OwnerUserID:    getEnv("OWNER_USER_ID", "owner"),

		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:5173"),

		ForceReseed: getEnv("FORCE_RESEED", "") == "true",
	}

	if cfg.MongoURI == "" {
		return nil, fmt.Errorf("MONGODB_URI is required")
	}
	if cfg.AuthTOTPSecret == "" {
		return nil, fmt.Errorf("AUTH_TOTP_SECRET is required")
	}
	if cfg.AuthJWTSecret == "" {
		return nil, fmt.Errorf("AUTH_JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
