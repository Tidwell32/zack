package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const gymSessionsCollection = "gym_sessions"

func migration005CreateGymSessionsCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(gymSessionsCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "startedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sessions_user_startedAt"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "location", Value: 1},
				{Key: "startedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sessions_user_location_startedAt"),
		},
	})

	return err
}
