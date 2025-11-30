package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const discsCollection = "discs"

func migration003CreateDiscsCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(discsCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "bagId", Value: 1},
			},
			Options: options.Index().
				SetName("idx_user_discs_user_bag"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "catalogDiscId", Value: 1},
			},
			Options: options.Index().
				SetName("idx_user_discs_user_catalog"),
		},
		{
			Keys: bson.D{{Key: "bagId", Value: 1}},
			Options: options.Index().
				SetName("idx_user_discs_bag"),
		},
	})

	return err
}
