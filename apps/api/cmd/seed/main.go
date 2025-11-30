package main

import (
	"context"
	"log"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/database"
	"github.com/Tidwell32/zack/apps/api/internal/seeding"
)

func main() {
	log.Println("🌱 Starting database seed...")

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to MongoDB
	ctx := context.Background()
	mongoDB, err := database.NewMongoDB(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoDB.Close(ctx)

	// Seed disc catalog (never force reseed in manual seed command)
	if err := seeding.SeedDiscCatalog(ctx, mongoDB.Database, false); err != nil {
		log.Fatalf("Failed to seed disc catalog: %v", err)
	}

	log.Println("✅ Database seeding complete!")
}
