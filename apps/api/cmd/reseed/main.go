package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/database"
	"github.com/Tidwell32/zack/apps/api/internal/seeding"
)

func main() {
	log.Println("🔄 Starting disc catalog re-seed...")
	log.Println("⚠️  WARNING: This will delete all existing catalog data!")

	// Require explicit confirmation
	confirm := os.Getenv("CONFIRM_RESEED")
	if confirm != "yes" {
		log.Fatal("❌ Aborted. Set CONFIRM_RESEED=yes to confirm this destructive operation.")
	}

	log.Println("✅ Confirmation received, proceeding with re-seed...")

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Safety check: don't accidentally re-seed in production without extra confirmation
	if cfg.Environment == "production" {
		prodConfirm := os.Getenv("CONFIRM_PRODUCTION_RESEED")
		if prodConfirm != "yes" {
			log.Fatal("❌ This is a PRODUCTION environment. Set CONFIRM_PRODUCTION_RESEED=yes to proceed.")
		}
		log.Println("⚠️  Production re-seed confirmed...")
	}

	// Connect to MongoDB
	ctx := context.Background()
	mongoDB, err := database.NewMongoDB(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoDB.Close(ctx)

	// Show current catalog stats
	collection := mongoDB.Database.Collection("disc_catalog")
	count, err := collection.CountDocuments(ctx, map[string]interface{}{})
	if err == nil {
		log.Printf("📊 Current catalog contains %d discs", count)
	}

	// Force re-seed (deletes existing data and fetches fresh)
	log.Println("🗑️  Deleting existing catalog...")
	log.Println("📥 Fetching fresh data from DiscIt API...")

	if err := seeding.SeedDiscCatalog(ctx, mongoDB.Database, true); err != nil {
		log.Fatalf("Failed to re-seed disc catalog: %v", err)
	}

	// Show new catalog stats
	newCount, err := collection.CountDocuments(ctx, map[string]interface{}{})
	if err == nil {
		diff := int(newCount) - int(count)
		diffStr := fmt.Sprintf("%+d", diff)
		log.Printf("📊 New catalog contains %d discs (%s)", newCount, diffStr)
	}

	log.Println("✅ Disc catalog re-seed complete!")
}
