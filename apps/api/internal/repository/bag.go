package repository

import (
	"context"

	"github.com/Tidwell32/zack/apps/api/internal/bag"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type BagRepository interface {
	Create(ctx context.Context, bag *bag.Bag) error
	FindByID(ctx context.Context, _id bson.ObjectID) (*bag.Bag, error)
	FindByUserID(ctx context.Context, userID string) ([]*bag.Bag, error)
	Update(ctx context.Context, bag *bag.Bag) error
	Delete(ctx context.Context, _id bson.ObjectID) error
}

type MongoBagRepository struct {
	collection *mongo.Collection
}

func NewMongoBagRepository(collection *mongo.Collection) BagRepository {
	return &MongoBagRepository{
		collection: collection,
	}
}

func (r *MongoBagRepository) Create(ctx context.Context, bag *bag.Bag) error {
	res, err := r.collection.InsertOne(ctx, bag)
	if err != nil {
		return err
	}

	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		bag.ID = oid
	}

	return nil
}

func (r *MongoBagRepository) FindByID(ctx context.Context, _id bson.ObjectID) (*bag.Bag, error) {
	var result bag.Bag
	err := r.collection.FindOne(ctx, bson.M{"_id": _id}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &result, nil
}

func (r *MongoBagRepository) FindByUserID(ctx context.Context, userID string) ([]*bag.Bag, error) {
	cur, err := r.collection.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	bags := []*bag.Bag{}
	for cur.Next(ctx) {
		var b bag.Bag
		if err := cur.Decode(&b); err != nil {
			return nil, err
		}
		bags = append(bags, &b)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return bags, nil
}

func (r *MongoBagRepository) Update(ctx context.Context, bag *bag.Bag) error {
	filter := bson.M{"_id": bag.ID}
	update := bson.M{
		"$set": bson.M{
			"name":      bag.Name,
			"updatedAt": bag.UpdatedAt,
		},
	}

	_, err := r.collection.UpdateOne(ctx, filter, update)
	return err
}

func (r *MongoBagRepository) Delete(ctx context.Context, _id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": _id})
	return err
}
