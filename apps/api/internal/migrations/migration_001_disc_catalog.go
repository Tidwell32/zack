package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const discCatalogCollection = "disc_catalog"

func migration001CreateDiscCatalogCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(discCatalogCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "name", Value: 1}},
			Options: options.Index().
				SetName("idx_all_discs_name"),
		},
		{
			Keys: bson.D{{Key: "name_slug", Value: 1}},
			Options: options.Index().
				SetName("idx_all_discs_name_slug"),
		},
		{
			Keys: bson.D{
				{Key: "brand_slug", Value: 1},
				{Key: "name_slug", Value: 1},
			},
			Options: options.Index().
				SetName("ux_all_discs_brand_name_slug").
				SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "category_slug", Value: 1}},
			Options: options.Index().
				SetName("idx_all_discs_category_slug"),
		},
	})

	return err
}
