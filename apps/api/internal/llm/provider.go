package llm

import (
	"context"

	"github.com/Tidwell32/zack/apps/api/internal/cooking"
)

// Abstraction for any LLM
type Provider interface {
	ParseRecipe(ctx context.Context, html string, sourceURL string) (*cooking.ParsedRecipe, error)
	MergeRecipes(ctx context.Context, recipes []*cooking.ParsedRecipe, request *cooking.MergeRecipeRequest) (*cooking.MergedRecipe, []cooking.AllergenSubstitution, []cooking.VariationSuggestion, error)
	RankRecipeCandidates(ctx context.Context, dishName string, request *cooking.MergeRecipeRequest, candidates []cooking.RecipeCandidate, max int) ([]string, error)
}
