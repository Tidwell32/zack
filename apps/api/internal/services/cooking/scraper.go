package cooking

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gocolly/colly/v2"
)

// Prevent giant html strings being sent to our AI, it's expensive.
const maxExtractedHTMLSize = 100000

type ScraperService struct {
	collector *colly.Collector
}

func NewScraperService() *ScraperService {
	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (compatible; RecipeBot/1.0; +https://github.com/Tidwell32/zack)"),
		colly.AllowURLRevisit(),
	)

	c.SetRequestTimeout(15 * time.Second)

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 3,
		Delay:       1 * time.Second,
	})

	return &ScraperService{
		collector: c,
	}
}

func (s *ScraperService) ScrapeRecipe(ctx context.Context, recipeURL string) (string, error) {
	var htmlContent string
	var scrapingError error

	c := s.collector.Clone()

	c.OnHTML("html", func(e *colly.HTMLElement) {
		htmlContent = string(e.Response.Body)
	})

	c.OnError(func(r *colly.Response, err error) {
		if r != nil {
			scrapingError = fmt.Errorf("scraping error (status %d): %w", r.StatusCode, err)
		} else {
			scrapingError = fmt.Errorf("scraping error: %w", err)
		}
	})

	err := c.Visit(recipeURL)
	if err != nil {
		return "", fmt.Errorf("visiting URL: %w", err)
	}

	c.Wait()

	if scrapingError != nil {
		return "", scrapingError
	}

	if htmlContent == "" {
		return "", fmt.Errorf("no content extracted from %s", recipeURL)
	}

	return htmlContent, nil
}

func (s *ScraperService) ExtractRecipeHTML(fullHTML string) (string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(fullHTML))
	if err != nil {
		return "", fmt.Errorf("failed to parse HTML")
	}

	var recipeHTML string
	usedStructuredData := false

	// First, look for JSON-LD schema
	doc.Find(`script[type="application/ld+json"]`).Each(func(i int, sel *goquery.Selection) {
		text := sel.Text()
		if strings.Contains(text, `"@type":"Recipe"`) || strings.Contains(text, `"@type": "Recipe"`) {
			recipeHTML += text + "\n"
			usedStructuredData = true
		}
	})

	// Then try schema.org Recipe markup
	if recipeHTML == "" {
		doc.Find(`[itemtype*="schema.org/Recipe"]`).Each(func(i int, sel *goquery.Selection) {
			if i == 0 {
				html, _ := sel.Html()
				recipeHTML = html
				usedStructuredData = true
			}
		})
	}

	// Finally try common recipe container class names
	if recipeHTML == "" {
		selectors := []string{
			".recipe",
			".recipe-content",
			".recipe-container",
			"#recipe",
			"article.recipe",
			"[class*='recipe']",
			"article",
		}

		for _, selector := range selectors {
			doc.Find(selector).Each(func(i int, sel *goquery.Selection) {
				if i == 0 && recipeHTML == "" {
					html, _ := sel.Html()
					recipeHTML = html
				}
			})
			if recipeHTML != "" {
				break
			}
		}
	}

	if recipeHTML != "" {
		cleanDoc, err := goquery.NewDocumentFromReader(strings.NewReader(recipeHTML))
		if err == nil {
			cleanDoc.Find("script, style, noscript, iframe").Remove()
			cleanHTML, _ := cleanDoc.Html()
			// Structured data (JSON-LD) is usually small, allow it through
			if !usedStructuredData && len(cleanHTML) > maxExtractedHTMLSize {
				return "", fmt.Errorf("extracted recipe HTML too large (%d bytes)", len(cleanHTML))
			}
			return cleanHTML, nil
		}
		return recipeHTML, nil
	}

	// Fall back to full HTML but remove common noise
	doc.Find("script, style, noscript, iframe, header, footer, nav, aside, .advertisement, .ads, .social-share").Remove()
	cleanHTML, err := doc.Html()
	if err != nil {
		cleanHTML = fullHTML
	}

	if len(cleanHTML) > maxExtractedHTMLSize {
		return "", fmt.Errorf("page too large for recipe extraction (%d bytes), no structured data found", len(cleanHTML))
	}

	return cleanHTML, nil
}
