package disc

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type FlightNumbers struct {
	Speed float64 `bson:"speed" json:"speed"`
	Glide float64 `bson:"glide" json:"glide"`
	Turn  float64 `bson:"turn" json:"turn"`
	Fade  float64 `bson:"fade" json:"fade"`
}

type Disc struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID        string        `bson:"userId" json:"userId"`
	BagID         bson.ObjectID `bson:"bagId" json:"bagId"`
	CatalogDiscID string        `bson:"catalogDiscId" json:"catalogDiscId"`

	Name         string `bson:"name" json:"name"`
	Brand        string `bson:"brand" json:"brand"`
	Category     string `bson:"category" json:"category"`
	NameSlug     string `bson:"nameSlug" json:"nameSlug"`
	BrandSlug    string `bson:"brandSlug" json:"brandSlug"`
	CategorySlug string `bson:"categorySlug" json:"categorySlug"`

	Plastic  string `bson:"plastic,omitempty" json:"plastic,omitempty"`
	Weight   *int   `bson:"weight,omitempty" json:"weight,omitempty"`
	ColorHex string `bson:"colorHex,omitempty" json:"colorHex,omitempty"`
	Notes    string `bson:"notes,omitempty" json:"notes,omitempty"`

	StockFlight    FlightNumbers  `bson:"stockFlight" json:"stockFlight"`
	AdjustedFlight *FlightNumbers `bson:"adjustedFlight,omitempty" json:"adjustedFlight,omitempty"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

type CreateDiscInput struct {
	CatalogDiscID  string
	AdjustedFlight *FlightNumbers
	Notes          string
	ColorHex       string
	Weight         *int
	Plastic        string
}

type UpdateDiscInput struct {
	BagID          *bson.ObjectID
	AdjustedFlight *FlightNumbers
	Notes          string
	ColorHex       string
	Weight         *int
	Plastic        string
}
