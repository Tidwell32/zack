package migrations

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const gymExercisesCollection = "gym_exercises"

func migration004CreateGymExercisesCollection(ctx context.Context, db *mongo.Database) error {
	col := db.Collection(gymExercisesCollection)

	_, err := col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "slug", Value: 1},
			},
			Options: options.Index().
				SetName("ux_gym_exercises_user_slug").
				SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "name", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_exercises_user_name"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "movementPattern", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_exercises_user_pattern"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "primaryMuscleGroup", Value: 1},
			},
			Options: options.Index().
				SetName("idx_gym_exercises_user_muscle"),
		},
	})

	return err
}
