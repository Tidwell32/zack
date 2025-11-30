package repository

import (
	"context"

	"github.com/Tidwell32/zack/apps/api/internal/techdisc"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type TechDiscRepository interface {
	UpsertThrows(ctx context.Context, throws []techdisc.ThrowRaw) error
	GetThrowsForUser(ctx context.Context, userID string) ([]techdisc.ThrowRaw, error)
}

type MongoTechDiscRepository struct {
	collection *mongo.Collection
}

func NewMongoTechDiscRepository(collection *mongo.Collection) *MongoTechDiscRepository {
	return &MongoTechDiscRepository{
		collection: collection,
	}
}

func (r *MongoTechDiscRepository) UpsertThrows(ctx context.Context, throws []techdisc.ThrowRaw) error {
	if len(throws) == 0 {
		return nil
	}

	var operations []mongo.WriteModel

	for _, throw := range throws {
		filter := bson.M{
			"userId":     throw.UserID,
			"techDiscId": throw.TechDiscID,
		}

		update := bson.M{
			"$set": bson.M{
				"userId":           throw.UserID,
				"techDiscId":       throw.TechDiscID,
				"time":             throw.Time,
				"primaryThrowType": throw.PrimaryThrowType,
				"throwType":        throw.ThrowType,
				"handedness":       throw.Handedness,
				"tags":             throw.Tags,
				"notes":            throw.Notes,
				"speedMph":         throw.SpeedMph,
				"speedKmh":         throw.SpeedKmh,
				"spinRpm":          throw.SpinRpm,
				"distanceFeet":     throw.DistanceFeet,
				"distanceMeters":   throw.DistanceMeters,
				"advanceRatio":     throw.AdvanceRatio,
				"launchAngle":      throw.LaunchAngle,
				"noseAngle":        throw.NoseAngle,
				"hyzerAngle":       throw.HyzerAngle,
				"wobbleAngle":      throw.WobbleAngle,
				"updatedAt":        throw.UpdatedAt,
			},
			"$setOnInsert": bson.M{
				"createdAt": throw.CreatedAt,
			},
		}

		operation := mongo.NewUpdateOneModel().
			SetFilter(filter).
			SetUpdate(update).
			SetUpsert(true)

		operations = append(operations, operation)
	}

	_, err := r.collection.BulkWrite(ctx, operations)
	return err
}

func (r *MongoTechDiscRepository) GetThrowsForUser(ctx context.Context, userID string) ([]techdisc.ThrowRaw, error) {
	filter := bson.M{"userId": userID}

	opts := options.Find().SetSort(bson.D{{Key: "time", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)

	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	throws := []techdisc.ThrowRaw{}
	if err := cursor.All(ctx, &throws); err != nil {
		return nil, err
	}

	return throws, nil
}
