package services

import (
	"context"
	"fmt"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/catalog"
	"github.com/Tidwell32/zack/apps/api/internal/disc"
	"github.com/Tidwell32/zack/apps/api/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CatalogDiscProvider interface {
	FindByID(ctx context.Context, id string) (*catalog.CatalogDisc, error)
}

type DiscService struct {
	discRepo   repository.DiscRepository
	catalogSvc CatalogDiscProvider
}

func NewDiscService(
	discRepo repository.DiscRepository,
	catalogSvc CatalogDiscProvider,
) *DiscService {
	return &DiscService{
		discRepo:   discRepo,
		catalogSvc: catalogSvc,
	}
}

func (s *DiscService) AddDiscToBag(
	ctx context.Context,
	userID *string,
	bagID bson.ObjectID,
	input disc.CreateDiscInput,
) (*disc.Disc, bool, error) {
	catalogDisc, err := s.catalogSvc.FindByID(ctx, input.CatalogDiscID)
	if err != nil {
		return nil, false, fmt.Errorf("failed to load catalog disc: %w", err)
	}
	if catalogDisc == nil {
		return nil, false, fmt.Errorf("catalog disc not found")
	}

	now := time.Now().UTC()

	stockFlight := disc.FlightNumbers{
		Speed: catalogDisc.Speed,
		Glide: catalogDisc.Glide,
		Turn:  catalogDisc.Turn,
		Fade:  catalogDisc.Fade,
	}

	d := &disc.Disc{
		ID:            bson.NewObjectID(),
		BagID:         bagID,
		CatalogDiscID: input.CatalogDiscID,

		Name:         catalogDisc.Name,
		Brand:        catalogDisc.Brand,
		Category:     catalogDisc.Category,
		NameSlug:     catalogDisc.NameSlug,
		BrandSlug:    catalogDisc.BrandSlug,
		CategorySlug: catalogDisc.CategorySlug,
		StockFlight:  stockFlight,

		Plastic:        input.Plastic,
		Weight:         input.Weight,
		ColorHex:       input.ColorHex,
		Notes:          input.Notes,
		AdjustedFlight: input.AdjustedFlight,

		CreatedAt: now,
		UpdatedAt: now,
	}

	if userID != nil {
		d.UserID = *userID
		if err := s.discRepo.Create(ctx, d); err != nil {
			return nil, false, fmt.Errorf("failed to create disc: %w", err)
		}
		return d, true, nil
	}

	return d, false, nil
}

func (s *DiscService) GetDiscsForBag(ctx context.Context, bagID bson.ObjectID) ([]*disc.Disc, error) {
	return s.discRepo.FindByBagID(ctx, bagID)
}

func (s *DiscService) GetDiscByID(ctx context.Context, id bson.ObjectID) (*disc.Disc, error) {
	return s.discRepo.FindByID(ctx, id)
}

func (s *DiscService) GetDiscsForUser(ctx context.Context, userID string) ([]*disc.Disc, error) {
	return s.discRepo.FindByUserID(ctx, userID)
}

func (s *DiscService) UpdateDisc(
	ctx context.Context,
	userID *string,
	discID bson.ObjectID,
	input disc.UpdateDiscInput,
) (*disc.Disc, bool, error) {
	now := time.Now().UTC()

	if userID == nil {
		d := &disc.Disc{
			ID:             discID,
			Plastic:        input.Plastic,
			Weight:         input.Weight,
			ColorHex:       input.ColorHex,
			Notes:          input.Notes,
			AdjustedFlight: input.AdjustedFlight,
			UpdatedAt:      now,
		}
		if input.BagID != nil {
			d.BagID = *input.BagID
		}
		return d, false, nil
	}

	existing, err := s.discRepo.FindByID(ctx, discID)
	if err != nil {
		return nil, false, err
	}
	if existing == nil {
		return nil, false, ErrNotFound
	}

	if input.BagID != nil {
		existing.BagID = *input.BagID
	}
	existing.Plastic = input.Plastic
	existing.Weight = input.Weight
	existing.ColorHex = input.ColorHex
	existing.Notes = input.Notes
	existing.AdjustedFlight = input.AdjustedFlight
	existing.UpdatedAt = now

	if err := s.discRepo.Update(ctx, existing); err != nil {
		return nil, false, err
	}

	return existing, true, nil
}

func (s *DiscService) DeleteDisc(ctx context.Context, userID *string, id bson.ObjectID) (bool, error) {
	if userID != nil {
		if err := s.discRepo.Delete(ctx, id); err != nil {
			return false, err
		}
		return true, nil
	}

	return false, nil
}
