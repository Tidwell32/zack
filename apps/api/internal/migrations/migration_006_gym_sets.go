package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const gymSetsCollection = "gym_sets"

func migration006CreateGymSetsCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(gymSetsCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "exerciseId", Value: 1},
				{Key: "performedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sets_user_exercise_performedAt"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "performedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sets_user_performedAt"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "sessionId", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sets_user_session"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "movementPattern", Value: 1},
				{Key: "performedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sets_user_pattern_performedAt"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "primaryMuscleGroup", Value: 1},
				{Key: "performedAt", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_sets_user_muscle_performedAt"),
		},
	})

	return err
}
