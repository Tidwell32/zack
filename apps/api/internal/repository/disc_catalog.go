package repository

import (
	"context"

	"github.com/Tidwell32/zack/apps/api/internal/catalog"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type SuggestCriteria struct {
	MinSpeed     float64
	MaxSpeed     float64
	MinStability float64 // stability = fade + turn
	MaxStability float64
	Limit        int
}

type DiscCatalogRepository interface {
	FindByID(ctx context.Context, id string) (*catalog.CatalogDisc, error)
	FindBySlug(ctx context.Context, brandSlug, nameSlug string) (*catalog.CatalogDisc, error)
	Search(ctx context.Context, query string, limit int) ([]*catalog.CatalogDisc, error)
	FindByCategory(ctx context.Context, categorySlug string) ([]*catalog.CatalogDisc, error)
	Suggest(ctx context.Context, criteria SuggestCriteria) ([]*catalog.CatalogDisc, error)
}

type MongoDiscCatalogRepository struct {
	collection *mongo.Collection
}

func NewMongoDiscCatalogRepository(collection *mongo.Collection) DiscCatalogRepository {
	return &MongoDiscCatalogRepository{
		collection: collection,
	}
}

func (r *MongoDiscCatalogRepository) FindByID(ctx context.Context, id string) (*catalog.CatalogDisc, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var disc catalog.CatalogDisc
	err = r.collection.FindOne(ctx, bson.M{"_id": oid}).Decode(&disc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &disc, nil
}

func (r *MongoDiscCatalogRepository) FindBySlug(ctx context.Context, brandSlug, nameSlug string) (*catalog.CatalogDisc, error) {
	var disc catalog.CatalogDisc
	err := r.collection.FindOne(ctx, bson.M{
		"brand_slug": brandSlug,
		"name_slug":  nameSlug,
	}).Decode(&disc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &disc, nil
}

func (r *MongoDiscCatalogRepository) Search(ctx context.Context, query string, limit int) ([]*catalog.CatalogDisc, error) {
	if limit <= 0 {
		limit = 20
	}

	filter := bson.M{
		"name": bson.M{
			"$regex":   query,
			"$options": "i",
		},
	}

	opts := options.Find().SetLimit(int64(limit))
	cur, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var discs []*catalog.CatalogDisc
	for cur.Next(ctx) {
		var disc catalog.CatalogDisc
		if err := cur.Decode(&disc); err != nil {
			return nil, err
		}
		discs = append(discs, &disc)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return discs, nil
}

func (r *MongoDiscCatalogRepository) FindByCategory(ctx context.Context, categorySlug string) ([]*catalog.CatalogDisc, error) {
	cur, err := r.collection.Find(ctx, bson.M{"category_slug": categorySlug})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var discs []*catalog.CatalogDisc
	for cur.Next(ctx) {
		var disc catalog.CatalogDisc
		if err := cur.Decode(&disc); err != nil {
			return nil, err
		}
		discs = append(discs, &disc)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return discs, nil
}

func (r *MongoDiscCatalogRepository) Suggest(ctx context.Context, criteria SuggestCriteria) ([]*catalog.CatalogDisc, error) {
	if criteria.Limit <= 0 {
		criteria.Limit = 10
	}

	// My favorite brands :)
	preferredBrands := []string{"mvp", "axiom discs", "mint discs", "kastaplast", "innova", "thought space athletics", "latitude 64", "discraft", "westside discs"}

	// Some crazy aggregation that Claude wrote :)
	pipeline := bson.A{
		// Stage 1: Add computed fields
		bson.M{
			"$addFields": bson.M{
				"stability": bson.M{"$add": bson.A{"$fade", "$turn"}},
			},
		},
		// Stage 2: Match criteria
		bson.M{
			"$match": bson.M{
				"speed": bson.M{
					"$gte": criteria.MinSpeed,
					"$lte": criteria.MaxSpeed,
				},
				"stability": bson.M{
					"$gte": criteria.MinStability,
					"$lte": criteria.MaxStability,
				},
			},
		},
		// Stage 3: Add distance from midpoint, brand priority, and preferred flag
		bson.M{
			"$addFields": bson.M{
				"distanceFromMid": bson.M{
					"$sqrt": bson.M{
						"$add": bson.A{
							bson.M{"$pow": bson.A{bson.M{"$subtract": bson.A{"$speed", (criteria.MinSpeed + criteria.MaxSpeed) / 2}}, 2}},
							bson.M{"$pow": bson.A{bson.M{"$subtract": bson.A{"$stability", (criteria.MinStability + criteria.MaxStability) / 2}}, 2}},
						},
					},
				},
				"isPreferredBrand": bson.M{
					"$in": bson.A{bson.M{"$toLower": "$brand"}, preferredBrands},
				},
				"brandPriority": bson.M{
					"$switch": bson.M{
						"branches": buildBrandPriorityBranches(preferredBrands),
						"default":  len(preferredBrands), // Non-preferred brands get lowest priority
					},
				},
			},
		},
		// Stage 4: Sort by distance (closest to middle first), then prefer preferred brands, then by brand rank
		bson.M{
			"$sort": bson.D{
				{Key: "distanceFromMid", Value: 1},
				{Key: "isPreferredBrand", Value: -1}, // true (preferred) sorts before false
				{Key: "brandPriority", Value: 1},
			},
		},
		// Stage 5: Limit results
		bson.M{"$limit": int64(criteria.Limit)},
		// Stage 6: Remove computed fields from output
		bson.M{
			"$project": bson.M{
				"stability":        0,
				"distanceFromMid":  0,
				"isPreferredBrand": 0,
				"brandPriority":    0,
			},
		},
	}

	cur, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var discs []*catalog.CatalogDisc
	for cur.Next(ctx) {
		var disc catalog.CatalogDisc
		if err := cur.Decode(&disc); err != nil {
			return nil, err
		}
		discs = append(discs, &disc)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return discs, nil
}

func buildBrandPriorityBranches(brands []string) bson.A {
	branches := bson.A{}
	for i, brand := range brands {
		branches = append(branches, bson.M{
			"case": bson.M{"$eq": bson.A{bson.M{"$toLower": "$brand"}, brand}},
			"then": i,
		})
	}
	return branches
}
