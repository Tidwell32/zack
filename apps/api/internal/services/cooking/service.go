package cooking

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/Tidwell32/zack/apps/api/internal/cooking"
	"github.com/Tidwell32/zack/apps/api/internal/llm"
)

const (
	maxConcurrentScrapes = 3
	maxConcurrentParses  = 3
	targetRecipesToMerge = 5
	maxURLsToRequest     = 8
)

type RecipeMergerService struct {
	llm     llm.Provider
	search  *SearchService
	scraper *ScraperService
}

func NewRecipeMergerService(
	llmProvider llm.Provider,
	search *SearchService,
	scraper *ScraperService,
) *RecipeMergerService {
	return &RecipeMergerService{
		llm:     llmProvider,
		search:  search,
		scraper: scraper,
	}
}

func (s *RecipeMergerService) MergeRecipes(
	ctx context.Context,
	request *cooking.MergeRecipeRequest,
) (*cooking.MergeRecipeResponse, error) {
	return s.MergeRecipesWithProgress(ctx, request, nil)
}

// This allows for hitting a /status endpoint with a job number to keep track of progress
func (s *RecipeMergerService) MergeRecipesWithProgress(
	ctx context.Context,
	request *cooking.MergeRecipeRequest,
	progressCallback cooking.ProgressCallback,
) (*cooking.MergeRecipeResponse, error) {
	log.Printf("=== Merging recipes for: %s ===", request.DishName)

	sendProgress := func(stage cooking.JobStatus, message string, data any) {
		if progressCallback != nil {
			progressCallback(cooking.ProgressEvent{
				Stage:   string(stage),
				Message: message,
				Data:    data,
			})
		}
	}

	// Step 1: Search for recipe candidates
	sendProgress(cooking.JobStatusSearching, "Searching for recipes...", nil)
	candidates, err := s.search.SearchRecipeCandidates(ctx, request.DishName, 30)
	if err != nil {
		return nil, fmt.Errorf("search failed: %w", err)
	}

	log.Printf("Found %d recipe candidates for LLM ranking", len(candidates))
	sendProgress(cooking.JobStatusSearching, fmt.Sprintf("Found %d recipes", len(candidates)), map[string]int{"count": len(candidates)})

	// Step 2: Let the ai rank and choose the best candidate URLs, with a few fallbacks
	sendProgress(cooking.JobStatusRanking, "Sifting through the recipes...", nil)
	selectedURLs, err := s.llm.RankRecipeCandidates(ctx, request.DishName, request, candidates, maxURLsToRequest)
	if err != nil {
		return nil, fmt.Errorf("ranking recipe candidates: %w", err)
	}
	if len(selectedURLs) == 0 {
		return nil, fmt.Errorf("LLM did not select any recipe URLs")
	}

	log.Printf("LLM selected %d recipe URLs (will use up to %d)", len(selectedURLs), targetRecipesToMerge)
	sendProgress(cooking.JobStatusRanking, fmt.Sprintf("Chose the %d best recipes", len(selectedURLs)), map[string]int{"count": len(selectedURLs)})

	// Step 3: Fetch and parse the full recipes
	sendProgress(cooking.JobStatusFetching, "Fetching recipe details...", nil)
	parsedRecipes, err := s.fetchAndParseRecipes(ctx, selectedURLs)
	if err != nil {
		return nil, fmt.Errorf("fetching and parsing recipes: %w", err)
	}

	if len(parsedRecipes) < 2 {
		return nil, fmt.Errorf("need at least 2 successfully parsed recipes, got %d", len(parsedRecipes))
	}

	if len(parsedRecipes) > targetRecipesToMerge {
		log.Printf("Capping from %d to %d recipes for merging", len(parsedRecipes), targetRecipesToMerge)
		parsedRecipes = parsedRecipes[:targetRecipesToMerge]
	}
	log.Printf("Successfully parsed %d recipes", len(parsedRecipes))

	// Step 4: Let our ai merge the recipes into one condensed recipe
	sendProgress(cooking.JobStatusMerging, "Merging recipes into one...", nil)
	log.Printf("Merging %d recipes with LLM...", len(parsedRecipes))

	mergedRecipe, allergenSubs, variations, err := s.llm.MergeRecipes(ctx, parsedRecipes, request)
	if err != nil {
		return nil, fmt.Errorf("merging recipes: %w", err)
	}
	log.Printf("Successfully merged into: %s", mergedRecipe.Title)

	response := &cooking.MergeRecipeResponse{
		MergedRecipe:          mergedRecipe,
		SourceURLs:            selectedURLs,
		AllergenSubstitutions: allergenSubs,
		VariationSuggestions:  variations,
	}

	sendProgress(cooking.JobStatusComplete, "Recipe merged successfully", nil)
	return response, nil
}

func (s *RecipeMergerService) fetchAndParseRecipes(ctx context.Context, urls []string) ([]*cooking.ParsedRecipe, error) {
	type indexedResult struct {
		index  int
		recipe *cooking.ParsedRecipe
		err    error
	}

	results := make(chan indexedResult, len(urls))
	var wg sync.WaitGroup

	// Semaphores to limit concurrency
	scrapeSem := make(chan struct{}, maxConcurrentScrapes)
	parseSem := make(chan struct{}, maxConcurrentParses)

	for i, url := range urls {
		wg.Add(1)
		go func(idx int, recipeURL string) {
			defer wg.Done()

			select {
			case <-ctx.Done():
				results <- indexedResult{index: idx, err: ctx.Err()}
				return
			default:
			}

			log.Printf("Fetching recipe from: %s", recipeURL)

			select {
			case <-ctx.Done():
				results <- indexedResult{index: idx, err: ctx.Err()}
				return
			case scrapeSem <- struct{}{}:
			}

			html, err := s.scraper.ScrapeRecipe(ctx, recipeURL)
			<-scrapeSem

			if err != nil {
				log.Printf("Failed to scrape %s: %v", recipeURL, err)
				results <- indexedResult{index: idx, err: err}
				return
			}

			recipeHTML, err := s.scraper.ExtractRecipeHTML(html)
			if err != nil {
				log.Printf("Failed to extract recipe from %s: %v", recipeURL, err)
				results <- indexedResult{index: idx, err: err}
				return
			}

			select {
			case <-ctx.Done():
				results <- indexedResult{index: idx, err: ctx.Err()}
				return
			case parseSem <- struct{}{}:
			}

			log.Printf("Parsing recipe with LLM: %s", recipeURL)
			parsed, err := s.llm.ParseRecipe(ctx, recipeHTML, recipeURL)
			<-parseSem

			if err != nil {
				log.Printf("Failed to parse %s: %v", recipeURL, err)
				results <- indexedResult{index: idx, err: err}
				return
			}

			log.Printf("Successfully parsed: %s (Title: %s)", recipeURL, parsed.Title)
			results <- indexedResult{index: idx, recipe: parsed}
		}(i, url)
	}

	wg.Wait()
	close(results)

	ordered := make([]*cooking.ParsedRecipe, len(urls))
	for r := range results {
		if r.recipe != nil {
			ordered[r.index] = r.recipe
		}
	}

	// Filter out failed parses
	var recipes []*cooking.ParsedRecipe
	for _, r := range ordered {
		if r != nil {
			recipes = append(recipes, r)
		}
	}

	if len(recipes) == 0 {
		return nil, fmt.Errorf("all recipe fetches/parses failed")
	}

	return recipes, nil
}
