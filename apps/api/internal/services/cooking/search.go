package cooking

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/cooking"
)

const googleSearchAPIBaseURL = "https://www.googleapis.com/customsearch/v1"

type SearchService struct {
	apiKey         string
	searchEngineID string
	httpClient     *http.Client
}

func NewSearchService(apiKey, searchEngineID string) *SearchService {
	return &SearchService{
		apiKey:         apiKey,
		searchEngineID: searchEngineID,
		httpClient:     &http.Client{Timeout: 10 * time.Second},
	}
}

// SearchRecipeCandidates does two searches:
// 1. Broad search across all domains allowed in our google search config
// 2. Targeted search on preferred recipe sites
func (s *SearchService) SearchRecipeCandidates(ctx context.Context, dishName string, limit int) ([]cooking.RecipeCandidate, error) {
	mainQuery := dishName + " recipe"

	primary, err := s.searchWithPagination(ctx, mainQuery, limit/2)
	if err != nil {
		return nil, fmt.Errorf("primary search failed: %w", err)
	}

	log.Printf("Primary search returned %d results", len(primary))
	for i, c := range primary {
		log.Printf("  Primary[%d]: %s (%s)", i+1, c.Title, c.Domain)
	}

	highQualityQuery := buildPreferredSitesQuery(dishName)

	secondary, err := s.searchWithPagination(ctx, highQualityQuery, limit/2)
	if err != nil {
		log.Printf("Secondary search failed: %v", err)
		secondary = nil
	}

	if secondary != nil {
		log.Printf("Secondary search returned %d results", len(secondary))
		for i, c := range secondary {
			log.Printf("  Secondary[%d]: %s (%s)", i+1, c.Title, c.Domain)
		}
	}

	all := combineCandidates(primary, secondary, limit)
	log.Printf("Combined %d unique candidates (LLM will rank)", len(all))
	for i, c := range all {
		log.Printf("  Final[%d]: %s (%s)", i+1, c.Title, c.Domain)
	}

	return all, nil
}

// Google search api grabs ten at a time, we might want more than that.
func (s *SearchService) searchWithPagination(ctx context.Context, query string, limit int) ([]cooking.RecipeCandidate, error) {
	remaining := limit
	start := 1
	out := make([]cooking.RecipeCandidate, 0, limit)
	seen := map[string]bool{}

	for remaining > 0 {
		batchSize := min(remaining, 10)
		params := url.Values{}
		params.Add("key", s.apiKey)
		params.Add("cx", s.searchEngineID)
		params.Add("q", query)
		params.Add("num", strconv.Itoa(batchSize))
		params.Add("start", strconv.Itoa(start))

		fullURL := fmt.Sprintf("%s?%s", googleSearchAPIBaseURL, params.Encode())
		req, err := http.NewRequestWithContext(ctx, "GET", fullURL, nil)
		if err != nil {
			return nil, fmt.Errorf("creating request: %w", err)
		}

		resp, err := s.httpClient.Do(req)
		if err != nil {
			return nil, err
		}

		if resp.StatusCode != http.StatusOK {
			resp.Body.Close()
			return nil, fmt.Errorf("search API returned status %d", resp.StatusCode)
		}

		var result struct {
			Items []struct {
				Link    string `json:"link"`
				Title   string `json:"title"`
				Snippet string `json:"snippet"`
			} `json:"items"`
		}

		decodeErr := json.NewDecoder(resp.Body).Decode(&result)
		resp.Body.Close()

		if decodeErr != nil {
			return nil, fmt.Errorf("decoding search response: %w", decodeErr)
		}

		if len(result.Items) == 0 {
			break
		}

		for _, item := range result.Items {
			if seen[item.Link] {
				continue
			}
			seen[item.Link] = true

			parsed, err := url.Parse(item.Link)
			if err != nil {
				continue
			}

			domain := strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")

			out = append(out, cooking.RecipeCandidate{
				URL:         item.Link,
				Title:       item.Title,
				Description: item.Snippet,
				Domain:      domain,
			})

			remaining--
			if remaining == 0 {
				break
			}
		}

		start += batchSize
	}

	return out, nil
}

func combineCandidates(primary, secondary []cooking.RecipeCandidate, limit int) []cooking.RecipeCandidate {
	seen := map[string]bool{}
	out := make([]cooking.RecipeCandidate, 0, limit)

	for _, c := range primary {
		if !seen[c.URL] {
			seen[c.URL] = true
			out = append(out, c)
		}
	}

	for _, c := range secondary {
		if !seen[c.URL] {
			seen[c.URL] = true
			out = append(out, c)
		}
	}

	return out
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func buildPreferredSitesQuery(dishName string) string {
	var siteQueries []string
	for _, site := range cooking.PreferredRecipeSites {
		siteQueries = append(siteQueries, "site:"+site)
	}
	return dishName + " recipe " + strings.Join(siteQueries, " OR ")
}
