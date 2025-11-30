package services

import (
	"context"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/bag"
	"github.com/Tidwell32/zack/apps/api/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type BagService struct {
	repo     repository.BagRepository
	discRepo repository.DiscRepository
}

func NewBagService(repo repository.BagRepository, discRepo repository.DiscRepository) *BagService {
	return &BagService{
		repo:     repo,
		discRepo: discRepo,
	}
}

func (s *BagService) CreateBag(
	ctx context.Context,
	userID *string,
	input bag.CreateBagInput,
) (*bag.Bag, bool, error) {
	now := time.Now().UTC()

	b := &bag.Bag{
		ID:        bson.NewObjectID(),
		Name:      input.Name,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if userID != nil {
		b.UserID = *userID
		if err := s.repo.Create(ctx, b); err != nil {
			return nil, false, err
		}
		return b, true, nil
	}

	return b, false, nil
}

func (s *BagService) GetBagByID(ctx context.Context, id bson.ObjectID) (*bag.Bag, error) {
	b, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if b == nil {
		return nil, ErrNotFound
	}

	return b, nil
}

func (s *BagService) GetBagsForUser(ctx context.Context, userID string) ([]*bag.Bag, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *BagService) GetBagWithDiscs(ctx context.Context, id bson.ObjectID) (*bag.BagWithDiscs, error) {
	b, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if b == nil {
		return nil, ErrNotFound
	}

	discs, err := s.discRepo.FindByBagID(ctx, id)
	if err != nil {
		return nil, err
	}

	discInterfaces := make([]interface{}, len(discs))
	for i, d := range discs {
		discInterfaces[i] = d
	}

	return &bag.BagWithDiscs{
		Bag:   b,
		Discs: discInterfaces,
	}, nil
}

func (s *BagService) UpdateBag(
	ctx context.Context,
	userID *string,
	bagID bson.ObjectID,
	input bag.UpdateBagInput,
) (*bag.Bag, bool, error) {
	now := time.Now().UTC()

	if userID == nil {
		return &bag.Bag{
			ID:        bagID,
			Name:      input.Name,
			UpdatedAt: now,
			CreatedAt: now,
		}, false, nil
	}

	existing, err := s.repo.FindByID(ctx, bagID)
	if err != nil {
		return nil, false, err
	}
	if existing == nil {
		return nil, false, ErrNotFound
	}

	existing.Name = input.Name
	existing.UpdatedAt = now

	if err := s.repo.Update(ctx, existing); err != nil {
		return nil, false, err
	}

	return existing, true, nil
}

func (s *BagService) DeleteBag(
	ctx context.Context,
	userID *string,
	bagID bson.ObjectID,
) (bool, error) {
	if userID != nil {
		if err := s.repo.Delete(ctx, bagID); err != nil {
			return false, err
		}
		return true, nil
	}

	return false, nil
}
