package repository

import (
	"context"
	"errors"

	"github.com/Tidwell32/zack/apps/api/internal/udisc"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type UDiscRepository interface {
	UpsertRounds(ctx context.Context, rounds []udisc.Round) error
	GetRoundsForUser(ctx context.Context, userID string) ([]udisc.Round, error)
	GetRoundByID(ctx context.Context, _id bson.ObjectID, userID string) (*udisc.Round, error)
	GetDistinctPlayers(ctx context.Context, userID string) ([]string, error)
	GetDistinctCourses(ctx context.Context, userID string) ([]udisc.CourseInfo, error)
}

type MongoUDiscRepository struct {
	collection *mongo.Collection
}

func NewMongoUDiscRepository(collection *mongo.Collection) *MongoUDiscRepository {
	return &MongoUDiscRepository{
		collection: collection,
	}
}

func (r *MongoUDiscRepository) UpsertRounds(ctx context.Context, rounds []udisc.Round) error {
	if len(rounds) == 0 {
		return nil
	}

	var operations []mongo.WriteModel

	for _, round := range rounds {
		filter := bson.M{
			"userId":     round.UserID,
			"courseName": round.CourseName,
			"layoutName": round.LayoutName,
			"startTime":  round.StartTime,
		}

		update := bson.M{
			"$set": bson.M{
				"userId":     round.UserID,
				"courseName": round.CourseName,
				"layoutName": round.LayoutName,
				"startTime":  round.StartTime,
				"endTime":    round.EndTime,
				"holeCount":  round.HoleCount,
				"pars":       round.Pars,
				"totalPar":   round.TotalPar,
				"players":    round.Players,

				"updatedAt": round.UpdatedAt,
			},
			"$setOnInsert": bson.M{
				"createdAt": round.CreatedAt,
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

func (r *MongoUDiscRepository) GetRoundsForUser(ctx context.Context, userID string) ([]udisc.Round, error) {
	filter := bson.M{"userId": userID}
	opts := options.Find().SetSort(bson.D{{Key: "startTime", Value: 1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return []udisc.Round{}, err
	}
	defer cursor.Close(ctx)

	var rounds []udisc.Round
	if err := cursor.All(ctx, &rounds); err != nil {
		return []udisc.Round{}, err
	}

	if rounds == nil {
		return []udisc.Round{}, nil
	}

	return rounds, nil
}

func (r *MongoUDiscRepository) GetRoundByID(ctx context.Context, _id bson.ObjectID, userID string) (*udisc.Round, error) {
	filter := bson.M{
		"_id":    _id,
		"userId": userID,
	}

	var round udisc.Round
	err := r.collection.FindOne(ctx, filter).Decode(&round)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &round, nil
}

func (r *MongoUDiscRepository) GetDistinctPlayers(ctx context.Context, userID string) ([]string, error) {
	filter := bson.M{"userId": userID}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: filter}},
		{{Key: "$unwind", Value: "$players"}},
		{{Key: "$match", Value: bson.M{"players.isComplete": true}}},
		{{Key: "$group", Value: bson.M{
			"_id": "$players.playerName",
		}}},
		{{Key: "$sort", Value: bson.M{"_id": 1}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return []string{}, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		Name string `bson:"_id"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		return []string{}, err
	}

	if len(results) == 0 {
		return []string{}, nil
	}

	names := make([]string, len(results))
	for i, res := range results {
		names[i] = res.Name
	}

	return names, nil
}

func (r *MongoUDiscRepository) GetDistinctCourses(ctx context.Context, userID string) ([]udisc.CourseInfo, error) {
	filter := bson.M{"userId": userID}

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: filter}},
		{{Key: "$match", Value: bson.M{"players.isComplete": true}}},
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"courseName": "$courseName",
				"layoutName": "$layoutName",
			},
		}}},
		{{Key: "$sort", Value: bson.M{"_id.courseName": 1, "_id.layoutName": 1}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return []udisc.CourseInfo{}, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		ID struct {
			CourseName string `bson:"courseName"`
			LayoutName string `bson:"layoutName"`
		} `bson:"_id"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		return []udisc.CourseInfo{}, err
	}

	if len(results) == 0 {
		return []udisc.CourseInfo{}, nil
	}

	courses := make([]udisc.CourseInfo, len(results))
	for i, res := range results {
		courses[i] = udisc.CourseInfo{
			CourseName: res.ID.CourseName,
			LayoutName: res.ID.LayoutName,
		}
	}

	return courses, nil
}
