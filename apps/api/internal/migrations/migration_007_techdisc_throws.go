package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func migration007TechDiscThrowsCollection(ctx context.Context, db *mongo.Database) error {
	collection := db.Collection("techdisc_throws")

	_, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "userId", Value: 1},
			{Key: "techDiscId", Value: 1},
		},
		Options: options.Index().
			SetName("ux_techdisc_throws_user_techdisc").
			SetUnique(true),
	})

	return err
}
