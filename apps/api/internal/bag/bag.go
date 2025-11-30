package bag

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Bag struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID    string        `bson:"userId" json:"userId"`
	Name      string        `bson:"name" json:"name"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time     `bson:"updatedAt" json:"updatedAt"`
}

type CreateBagInput struct {
	Name string `json:"name"`
}

type UpdateBagInput struct {
	Name string `json:"name"`
}

type BagWithDiscs struct {
	Bag   *Bag          `json:"bag"`
	Discs []interface{} `json:"discs"`
}
