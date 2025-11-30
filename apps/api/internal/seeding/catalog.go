package seeding

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/catalog"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// DiscItDisc matches the DiscIt API response structure
type DiscItDisc struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Brand         string `json:"brand"`
	Category      string `json:"category"`
	Speed         string `json:"speed"`
	Glide         string `json:"glide"`
	Turn          string `json:"turn"`
	Fade          string `json:"fade"`
	Stability     string `json:"stability"`
	Link          string `json:"link"`
	Pic           string `json:"pic"`
	NameSlug      string `json:"name_slug"`
	BrandSlug     string `json:"brand_slug"`
	CategorySlug  string `json:"category_slug"`
	StabilitySlug string `json:"stability_slug"`
	Color         string `json:"color"`
	BgColor       string `json:"background_color"`
}

// SeedDiscCatalog seeds the disc catalog from DiscIt API
// If forceReseed is true, it will delete existing data and re-fetch
func SeedDiscCatalog(ctx context.Context, db *mongo.Database, forceReseed bool) error {
	collection := db.Collection("disc_catalog")

	// Check if already seeded
	count, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("count documents: %w", err)
	}

	if count > 0 && !forceReseed {
		log.Printf("📚 Disc catalog already contains %d discs, skipping seed", count)
		return nil
	}

	if forceReseed && count > 0 {
		log.Printf("🔄 Force re-seed enabled, deleting %d existing discs...", count)
		if _, err := collection.DeleteMany(ctx, bson.M{}); err != nil {
			return fmt.Errorf("delete existing discs: %w", err)
		}
		log.Println("✅ Existing catalog cleared")
	}

	log.Println("📥 Fetching disc catalog from DiscIt API...")

	// Fetch from DiscIt API
	discs, err := fetchDiscItCatalog()
	if err != nil {
		return fmt.Errorf("fetch catalog: %w", err)
	}

	log.Printf("🔄 Processing %d discs...", len(discs))

	// Convert to catalog format
	catalogDiscs := make([]interface{}, 0, len(discs))
	for _, d := range discs {
		catalogDisc := catalog.CatalogDisc{
			DiscItID:      d.ID,
			Name:          d.Name,
			Brand:         d.Brand,
			Category:      d.Category,
			Speed:         parseFloat(d.Speed),
			Glide:         parseFloat(d.Glide),
			Turn:          parseFloat(d.Turn),
			Fade:          parseFloat(d.Fade),
			Stability:     d.Stability,
			Link:          d.Link,
			Pic:           d.Pic,
			NameSlug:      d.NameSlug,
			BrandSlug:     d.BrandSlug,
			CategorySlug:  d.CategorySlug,
			StabilitySlug: d.StabilitySlug,
			Color:         d.Color,
			BgColor:       d.BgColor,
		}
		catalogDiscs = append(catalogDiscs, catalogDisc)
	}

	// Insert into MongoDB
	log.Println("💾 Inserting discs into database...")
	result, err := collection.InsertMany(ctx, catalogDiscs)
	if err != nil {
		return fmt.Errorf("insert many: %w", err)
	}

	log.Printf("✅ Inserted %d discs into catalog", len(result.InsertedIDs))

	// Create indexes
	log.Println("🔍 Creating indexes...")
	if err := createIndexes(ctx, collection); err != nil {
		return fmt.Errorf("create indexes: %w", err)
	}

	return nil
}

func fetchDiscItCatalog() ([]DiscItDisc, error) {
	url := "https://discit-api.fly.dev/disc"

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("http get: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("api returned status %d: %s", resp.StatusCode, string(body))
	}

	var discs []DiscItDisc
	if err := json.NewDecoder(resp.Body).Decode(&discs); err != nil {
		return nil, fmt.Errorf("decode json: %w", err)
	}

	return discs, nil
}

func parseFloat(s string) float64 {
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return f
}

func createIndexes(ctx context.Context, collection *mongo.Collection) error {
	indexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "discit_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "name_slug", Value: 1}, {Key: "brand_slug", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "category_slug", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "brand", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "stability_slug", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "name", Value: "text"}, {Key: "brand", Value: "text"}},
		},
	}

	_, err := collection.Indexes().CreateMany(ctx, indexes)
	return err
}
