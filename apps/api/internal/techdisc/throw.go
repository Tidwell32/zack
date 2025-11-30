package techdisc

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ThrowRaw struct {
	ID     bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID *string       `bson:"userId,omitempty" json:"userId"`

	TechDiscID int       `bson:"techDiscId" json:"techDiscId"`
	Time       time.Time `bson:"time" json:"time"`

	PrimaryThrowType string  `bson:"primaryThrowType" json:"primaryThrowType"`
	ThrowType        string  `bson:"throwType" json:"throwType"`
	Handedness       *string `bson:"handedness,omitempty" json:"handedness"`

	Tags  []string `bson:"tags" json:"tags"`
	Notes string   `bson:"notes,omitempty" json:"notes,omitempty"`

	SpeedMph       float64 `bson:"speedMph" json:"speedMph"`
	SpeedKmh       float64 `bson:"speedKmh" json:"speedKmh"`
	SpinRpm        float64 `bson:"spinRpm" json:"spinRpm"`
	DistanceFeet   float64 `bson:"distanceFeet" json:"distanceFeet"`
	DistanceMeters float64 `bson:"distanceMeters" json:"distanceMeters"`
	AdvanceRatio   float64 `bson:"advanceRatio" json:"advanceRatio"`
	LaunchAngle    float64 `bson:"launchAngle" json:"launchAngle"`
	NoseAngle      float64 `bson:"noseAngle" json:"noseAngle"`
	HyzerAngle     float64 `bson:"hyzerAngle" json:"hyzerAngle"`
	WobbleAngle    float64 `bson:"wobbleAngle" json:"wobbleAngle"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

type ThrowCSVRow struct {
	ID               int     `csv:"id"`
	Time             string  `csv:"time"`
	TimeSeconds      int64   `csv:"timeSeconds"`
	SpeedMph         float64 `csv:"speedMph"`
	SpeedKmh         float64 `csv:"speedKmh"`
	AdvanceRatio     float64 `csv:"advanceRatio"`
	SpinRpm          float64 `csv:"spinRpm"`
	LaunchAngle      float64 `csv:"launchAngle"`
	NoseAngle        float64 `csv:"noseAngle"`
	HyzerAngle       float64 `csv:"hyzerAngle"`
	WobbleAngle      float64 `csv:"wobbleAngle"`
	DistanceFeet     float64 `csv:"distanceFeet"`
	DistanceMeters   float64 `csv:"distanceMeters"`
	ThrowType        string  `csv:"throwType"`
	PrimaryThrowType string  `csv:"primaryThrowType"`
	Tags             string  `csv:"tags"`
	Notes            string  `csv:"notes"`
}

type ThrowView struct {
	ThrowRaw

	SessionDate      string `json:"sessionDate"`
	IsOutlierDefault bool   `json:"isOutlierDefault"`
	IsOutlierStrict  bool   `json:"isOutlierStrict"`
}

type SessionSummary struct {
	SessionDate      string  `json:"sessionDate"`
	Handedness       *string `json:"handedness,omitempty"`
	PrimaryThrowType string  `json:"primaryThrowType"`

	ThrowCount      int `json:"throwCount"`
	CleanThrowCount int `json:"cleanThrowCount"`

	AvgSpeedMph    float64 `json:"avgSpeedMph"`
	AvgSpinRpm     float64 `json:"avgSpinRpm"`
	AvgLaunchAngle float64 `json:"avgLaunchAngle"`
	AvgNoseAngle   float64 `json:"avgNoseAngle"`
	AvgHyzerAngle  float64 `json:"avgHyzerAngle"`
}

type ImportResponse struct {
	Throws    []ThrowRaw `json:"throws"`
	Persisted bool       `json:"persisted"`
}
