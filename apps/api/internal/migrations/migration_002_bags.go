package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const bagsCollection = "bags"

func migration002CreateBagsCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(bagsCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "name", Value: 1},
			},
			Options: options.Index().
				SetName("ux_user_bags_user_name").
				SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "userId", Value: 1}},
			Options: options.Index().
				SetName("idx_user_bags_user"),
		},
	})

	return err
}
