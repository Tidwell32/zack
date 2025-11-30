package migrations

import (
	"context"
	"log"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Migration struct {
	Name string
	Up   func(ctx context.Context, db *mongo.Database) error
}

var migrations = []Migration{
	{
		Name: "001_create_disc_catalog_collection",
		Up:   migration001CreateDiscCatalogCollection,
	},
	{
		Name: "002_create_bags_collection",
		Up:   migration002CreateBagsCollection,
	},
	{
		Name: "003_create_discs_collection",
		Up:   migration003CreateDiscsCollection,
	},
	{
		Name: "004_create_gym_exercises_collection",
		Up:   migration004CreateGymExercisesCollection,
	},
	{
		Name: "005_create_gym_sessions_collection",
		Up:   migration005CreateGymSessionsCollection,
	},
	{
		Name: "006_create_gym_sets_collection",
		Up:   migration006CreateGymSetsCollection,
	},
	{
		Name: "007_create_techdisc_throws_collection",
		Up:   migration007TechDiscThrowsCollection,
	},
	{
		Name: "008_create_udisc_rounds_collection",
		Up:   migration008UDiscRoundsCollection,
	},
}

func Run(ctx context.Context, db *mongo.Database) error {
	applied, err := loadAppliedMigrations(ctx, db)
	if err != nil {
		return err
	}

	appliedSet := make(map[string]struct{}, len(applied))
	for _, name := range applied {
		appliedSet[name] = struct{}{}
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Name < migrations[j].Name
	})

	for _, m := range migrations {
		if _, ok := appliedSet[m.Name]; ok {
			continue
		}

		log.Printf("applying migration: %s", m.Name)
		if err := m.Up(ctx, db); err != nil {
			return err
		}

		if err := recordMigration(ctx, db, m.Name); err != nil {
			return err
		}
		log.Printf("migration applied: %s", m.Name)
	}

	return nil
}

type migrationRecord struct {
	Name      string    `bson:"name"`
	AppliedAt time.Time `bson:"appliedAt"`
}

const migrationsCollection = "schema_migrations"

func loadAppliedMigrations(ctx context.Context, db *mongo.Database) ([]string, error) {
	col := db.Collection(migrationsCollection)

	cur, err := col.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var res []migrationRecord
	if err := cur.All(ctx, &res); err != nil {
		return nil, err
	}

	names := make([]string, 0, len(res))
	for _, r := range res {
		names = append(names, r.Name)
	}
	return names, nil
}

func recordMigration(ctx context.Context, db *mongo.Database, name string) error {
	col := db.Collection(migrationsCollection)

	_, err := col.InsertOne(ctx, migrationRecord{
		Name:      name,
		AppliedAt: time.Now().UTC(),
	})
	return err
}
