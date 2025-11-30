package repository

import (
	"context"

	"github.com/Tidwell32/zack/apps/api/internal/disc"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type DiscRepository interface {
	Create(ctx context.Context, disc *disc.Disc) error
	FindByID(ctx context.Context, _id bson.ObjectID) (*disc.Disc, error)
	FindByBagID(ctx context.Context, bagID bson.ObjectID) ([]*disc.Disc, error)
	FindByUserID(ctx context.Context, userID string) ([]*disc.Disc, error)
	Update(ctx context.Context, disc *disc.Disc) error
	Delete(ctx context.Context, _id bson.ObjectID) error
}

type MongoDiscRepository struct {
	collection *mongo.Collection
}

func NewMongoDiscRepository(collection *mongo.Collection) DiscRepository {
	return &MongoDiscRepository{
		collection: collection,
	}
}

func (r *MongoDiscRepository) Create(ctx context.Context, d *disc.Disc) error {
	res, err := r.collection.InsertOne(ctx, d)
	if err != nil {
		return err
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		d.ID = oid
	}

	return nil
}

func (r *MongoDiscRepository) FindByID(ctx context.Context, _id bson.ObjectID) (*disc.Disc, error) {
	var result disc.Disc
	err := r.collection.FindOne(ctx, bson.M{"_id": _id}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &result, nil
}

func (r *MongoDiscRepository) FindByBagID(ctx context.Context, bagID bson.ObjectID) ([]*disc.Disc, error) {
	cur, err := r.collection.Find(ctx, bson.M{"bagId": bagID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	discs := make([]*disc.Disc, 0)
	for cur.Next(ctx) {
		var d disc.Disc
		if err := cur.Decode(&d); err != nil {
			return nil, err
		}
		discs = append(discs, &d)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return discs, nil
}

func (r *MongoDiscRepository) FindByUserID(ctx context.Context, userID string) ([]*disc.Disc, error) {
	cur, err := r.collection.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var discs []*disc.Disc
	for cur.Next(ctx) {
		var d disc.Disc
		if err := cur.Decode(&d); err != nil {
			return nil, err
		}
		discs = append(discs, &d)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return discs, nil
}

func (r *MongoDiscRepository) Update(ctx context.Context, d *disc.Disc) error {
	filter := bson.M{"_id": d.ID}
	update := bson.M{
		"$set": bson.M{
			"bagId":          d.BagID,
			"plastic":        d.Plastic,
			"weight":         d.Weight,
			"colorHex":       d.ColorHex,
			"notes":          d.Notes,
			"adjustedFlight": d.AdjustedFlight,
			"updatedAt":      d.UpdatedAt,
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoDiscRepository) Delete(ctx context.Context, _id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": _id})
	return err
}
