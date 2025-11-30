package catalog

import "go.mongodb.org/mongo-driver/v2/bson"

// Master disc catalog downloaded from DiscIt API
type CatalogDisc struct {
	ID bson.ObjectID `bson:"_id,omitempty" json:"_id"`

	DiscItID string `bson:"discit_id" json:"discit_id"`
	Name     string `bson:"name" json:"name"`
	Brand    string `bson:"brand" json:"brand"`
	Category string `bson:"category" json:"category"`

	Speed float64 `bson:"speed" json:"speed"`
	Glide float64 `bson:"glide" json:"glide"`
	Turn  float64 `bson:"turn" json:"turn"`
	Fade  float64 `bson:"fade" json:"fade"`

	Stability     string `bson:"stability" json:"stability"`
	Link          string `bson:"link" json:"link"`
	Pic           string `bson:"pic" json:"pic"`
	NameSlug      string `bson:"name_slug" json:"name_slug"`
	BrandSlug     string `bson:"brand_slug" json:"brand_slug"`
	CategorySlug  string `bson:"category_slug" json:"category_slug"`
	StabilitySlug string `bson:"stability_slug" json:"stability_slug"`
	Color         string `bson:"color" json:"color"`
	BgColor       string `bson:"background_color" json:"background_color"`
}
