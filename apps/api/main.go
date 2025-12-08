package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/app"
	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/database"
	"github.com/Tidwell32/zack/apps/api/internal/migrations"
	"github.com/Tidwell32/zack/apps/api/internal/seeding"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewMongoDB(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := db.Close(ctx); err != nil {
			log.Printf("error closing database connection: %v", err)
		}
	}()

	// Run migrations
	{
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if err := migrations.Run(ctx, db.Database); err != nil {
			log.Fatalf("failed to run migrations: %v", err)
		}
	}

	// Seed disc catalog (auto-runs on startup)
	{
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		if err := seeding.SeedDiscCatalog(ctx, db.Database, cfg.ForceReseed); err != nil {
			log.Printf("warning: failed to seed disc catalog: %v", err)
			// Don't fatal - allow API to start even if seeding fails
		}
	}

	application := app.New(cfg, db)
	handler := application.Routes()

	port := ":" + cfg.Port
	server := &http.Server{
		Addr:    port,
		Handler: handler,
	}

	go func() {
		fmt.Printf("Server starting on %s\n", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	// Shutdown background services
	application.Shutdown()

	log.Println("Server exited gracefully")
}
