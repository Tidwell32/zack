package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func migration008UDiscRoundsCollection(ctx context.Context, db *mongo.Database) error {
	collection := db.Collection("udisc_rounds")

	_, err := collection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "userId", Value: 1},
			{Key: "name", Value: 1},
			{Key: "layoutName", Value: 1},
			{Key: "startTime", Value: 1},
		},
		Options: options.Index().
			SetName("ux_udisc_rounds_user_course_layout_time").
			SetUnique(true),
	})

	return err
}
