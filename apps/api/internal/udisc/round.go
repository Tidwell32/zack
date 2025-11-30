package udisc

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type PlayerScore struct {
	PlayerName string `bson:"playerName" json:"playerName"`

	Total         *int   `bson:"total,omitempty" json:"total,omitempty"`
	PlusMinus     string `bson:"plusMinus,omitempty" json:"plusMinus,omitempty"`
	PlusMinusInt  int    `bson:"plusMinusInt" json:"plusMinusInt"`
	RoundRating   *int   `bson:"roundRating,omitempty" json:"roundRating,omitempty"`

	Scores     []int `bson:"scores" json:"scores"`
	HoleCount  int   `bson:"holeCount" json:"holeCount"`
	IsComplete bool  `bson:"isComplete" json:"isComplete"`
}

type Round struct {
	ID     bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID string        `bson:"userId" json:"userId"`

	CourseName string `bson:"courseName" json:"courseName"`
	LayoutName string `bson:"layoutName" json:"layoutName"`

	StartTime time.Time `bson:"startTime" json:"startTime"`
	EndTime   time.Time `bson:"endTime" json:"endTime"`

	HoleCount int   `bson:"holeCount" json:"holeCount"`
	Pars      []int `bson:"pars,omitempty" json:"pars,omitempty"`
	TotalPar  int   `bson:"totalPar" json:"totalPar"`

	Players []PlayerScore `bson:"players" json:"players"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

type RoundCSVRow struct {
	PlayerName   string `csv:"PlayerName"`
	CourseName   string `csv:"CourseName"`
	LayoutName   string `csv:"LayoutName"`
	StartDateStr string `csv:"StartDate"`
	EndDateStr   string `csv:"EndDate"`

	TotalStr    string `csv:"Total"`
	PlusMinus   string `csv:"+/-"`
	RoundRating string `csv:"RoundRating"`

	Hole1  string `csv:"Hole1"`
	Hole2  string `csv:"Hole2"`
	Hole3  string `csv:"Hole3"`
	Hole4  string `csv:"Hole4"`
	Hole5  string `csv:"Hole5"`
	Hole6  string `csv:"Hole6"`
	Hole7  string `csv:"Hole7"`
	Hole8  string `csv:"Hole8"`
	Hole9  string `csv:"Hole9"`
	Hole10 string `csv:"Hole10"`
	Hole11 string `csv:"Hole11"`
	Hole12 string `csv:"Hole12"`
	Hole13 string `csv:"Hole13"`
	Hole14 string `csv:"Hole14"`
	Hole15 string `csv:"Hole15"`
	Hole16 string `csv:"Hole16"`
	Hole17 string `csv:"Hole17"`
	Hole18 string `csv:"Hole18"`
	Hole19 string `csv:"Hole19"`
	Hole20 string `csv:"Hole20"`
	Hole21 string `csv:"Hole21"`
}

type RoundsResponse struct {
	Rounds        []RoundView `json:"rounds"`
	PrimaryPlayer string      `json:"primaryPlayer"`
}

type ImportResponse struct {
	Rounds        []RoundView  `json:"rounds"`
	Persisted     bool         `json:"persisted"`
	PrimaryPlayer string       `json:"primaryPlayer"`
	Players       []string     `json:"players"`
	Courses       []CourseInfo `json:"courses"`
}

type RoundView struct {
	Round
	NormalizedCourseId   string `json:"normalizedCourseId"`
	NormalizedCourseName string `json:"normalizedCourseName"`
}

type CourseInfo struct {
	CourseName string `json:"courseName"`
	LayoutName string `json:"layoutName"`
}
