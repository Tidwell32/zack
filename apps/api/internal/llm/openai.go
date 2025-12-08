package llm

import (
	"context"
	"fmt"
	"strings"

	"github.com/Tidwell32/zack/apps/api/internal/cooking"
	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
)

type OpenAIProvider struct {
	client *openai.Client
}

func NewOpenAIProvider(apiKey string) *OpenAIProvider {
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	return &OpenAIProvider{
		client: &client,
	}
}

// ParseRecipe extracts structured recipe data from HTML using GPT-5-mini
func (p *OpenAIProvider) ParseRecipe(ctx context.Context, html string, sourceURL string) (*cooking.ParsedRecipe, error) {
	prompt := buildParsePrompt(html)

	chatCompletion, err := p.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		},
		Model: openai.ChatModelGPT5Mini,
	})
	if err != nil {
		return nil, fmt.Errorf("OpenAI API call failed: %w", err)
	}

	if len(chatCompletion.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	responseText := chatCompletion.Choices[0].Message.Content

	// Parse JSON response using consistent LLM JSON handling
	var parsed cooking.ParsedRecipe
	if err := UnmarshalLLMJSON(responseText, &parsed); err != nil {
		return nil, fmt.Errorf("failed to parse LLM response as JSON: %w", err)
	}

	parsed.SourceURL = sourceURL
	return &parsed, nil
}

// MergeRecipes intelligently merges multiple recipes using culinary AI expertise
func (p *OpenAIProvider) MergeRecipes(
	ctx context.Context,
	recipes []*cooking.ParsedRecipe,
	request *cooking.MergeRecipeRequest,
) (*cooking.MergedRecipe, []cooking.AllergenSubstitution, []cooking.VariationSuggestion, error) {
	prompt := buildMergePrompt(recipes, request)

	chatCompletion, err := p.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		},
		Model: openai.ChatModelGPT5Mini,
	})
	if err != nil {
		return nil, nil, nil, fmt.Errorf("OpenAI API call failed: %w", err)
	}

	if len(chatCompletion.Choices) == 0 {
		return nil, nil, nil, fmt.Errorf("no response from OpenAI")
	}

	responseText := chatCompletion.Choices[0].Message.Content

	var result struct {
		MergedRecipe          cooking.MergedRecipe           `json:"mergedRecipe"`
		AllergenSubstitutions []cooking.AllergenSubstitution `json:"allergenSubstitutions"`
		VariationSuggestions  []cooking.VariationSuggestion  `json:"variationSuggestions"`
	}

	if err := UnmarshalLLMJSON(responseText, &result); err != nil {
		return nil, nil, nil, fmt.Errorf("failed to parse LLM merge response: %w", err)
	}

	return &result.MergedRecipe, result.AllergenSubstitutions, result.VariationSuggestions, nil
}

// Ask our AI to choose the most accurate recipes.
// This is so something like "pepperoni pizza casserole" doesn't sneak into a "pepperoni pizza" query
func (p *OpenAIProvider) RankRecipeCandidates(
	ctx context.Context,
	dishName string,
	request *cooking.MergeRecipeRequest,
	candidates []cooking.RecipeCandidate,
	max int,
) ([]string, error) {
	prompt := buildRankingPrompt(dishName, request, candidates, max)

	resp, err := p.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Messages: []openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(prompt),
		},
		Model: openai.ChatModelGPT5Mini,
	})
	if err != nil {
		return nil, fmt.Errorf("OpenAI ranking call failed: %w", err)
	}

	content := resp.Choices[0].Message.Content

	var out struct {
		SelectedURLs []string `json:"selectedUrls"`
	}

	if err := UnmarshalLLMJSON(content, &out); err != nil {
		return nil, fmt.Errorf("failed to parse ranking JSON: %w", err)
	}

	if len(out.SelectedURLs) > max {
		out.SelectedURLs = out.SelectedURLs[:max]
	}

	return out.SelectedURLs, nil
}

func buildParsePrompt(html string) string {
	return fmt.Sprintf(`Extract recipe information from this HTML and return structured JSON.
		HTML Content:
		%s

		Return JSON with this exact structure:
		{
		"title": "recipe title",
		"ingredients": [
			"2 lbs chicken thighs, cut into pieces",
			"1 cup Thai basil leaves",
			...
		],
		"steps": [
			"Heat oil in wok over high heat",
			"Add chicken and cook until golden",
			...
		],
		"totalTimeMinutes": 45,
		"prepTimeMinutes": 15,
		"cookTimeMinutes": 20,
		"waitTimeMinutes": 10,
		"servings": 4
		}

		Timing rules:
		- prepTimeMinutes: knife work, measuring, mixing, active assembling before cooking.
		- cookTimeMinutes: time actively cooking on heat (stove, oven, grill, etc.).
		- waitTimeMinutes: hands-off time like marinating, dough rising, resting, chilling, or long unattended baking where the cook does not need to actively work.
		- totalTimeMinutes should approximately equal prepTimeMinutes + cookTimeMinutes + waitTimeMinutes.

		If the original recipe does not specify some timings, estimate them reasonably based on the steps.

		Return ONLY valid JSON, with no markdown, no backticks, and no extra commentary.
		Focus only on the recipe content (title, ingredients, directions, timings, servings) and ignore navigation, comments, and unrelated page content.`, html)
}

func buildMergePrompt(recipes []*cooking.ParsedRecipe, request *cooking.MergeRecipeRequest) string {
	var sb strings.Builder

	auth := string(request.Authenticity)
	if auth == "" {
		auth = string(cooking.AuthenticitySimplified)
	}

	allergensText := "None"
	if len(request.Allergens) > 0 {
		allergensText = strings.Join(request.Allergens, ", ")
	}

	sb.WriteString("You are a professional chef and recipe developer. Your task is to merge multiple recipe sources into ONE authoritative, excellent recipe using your culinary expertise.\n\n")

	sb.WriteString(fmt.Sprintf("User's dish request: %s\n", request.DishName))
	sb.WriteString(fmt.Sprintf("Authenticity mode: %s\n", auth)) // classic | simplified | healthy
	sb.WriteString(fmt.Sprintf("Declared allergens to avoid (if possible): %s\n", allergensText))
	if request.Servings > 0 {
		sb.WriteString(fmt.Sprintf("Target servings: %d\n", request.Servings))
	}
	if request.MaxTimeMinutes != nil {
		sb.WriteString(fmt.Sprintf("Preferred total cooking time (soft constraint): %d minutes\n", *request.MaxTimeMinutes))
	}
	sb.WriteString("\n")

	sb.WriteString("Source recipes:\n")
	for _, recipe := range recipes {
		sb.WriteString("---\n")
		sb.WriteString(fmt.Sprintf("Recipe from %s:\n", recipe.SourceURL))
		sb.WriteString(fmt.Sprintf("Title: %s\n", recipe.Title))
		sb.WriteString(fmt.Sprintf("Servings: %d | Time: %d min\n\n", recipe.Servings, recipe.TotalTimeMinutes))

		sb.WriteString("Ingredients:\n")
		for _, ing := range recipe.Ingredients {
			sb.WriteString(fmt.Sprintf("- %s\n", ing))
		}

		sb.WriteString("\nSteps:\n")
		for i, step := range recipe.Steps {
			sb.WriteString(fmt.Sprintf("%d. %s\n", i+1, step))
		}
		sb.WriteString("---\n\n")
	}

	sb.WriteString(`YOUR TASK: Merge these recipes using culinary expertise.

AUTHENTICITY MODES:
- "classic": aim for traditional ingredients and techniques; prefer authentic methods and flavor profile.
- "simplified": preserve the core flavor profile but favor fewer, easier-to-find ingredients and simpler steps suitable for a weeknight home cook.
- "healthy": may reduce sugar and oil, increase vegetables or whole grains, or otherwise make the dish lighter while preserving its recognizable character.

Handle allergens as follows:
- The "allergens" list contains labels like "shellfish", "peanuts", "coconut", "garlic", etc.
- If the list is empty, do NOT remove ingredients just for allergens; instead, provide a few useful allergen substitutions for common allergens in a separate array.
- If the list is non-empty, avoid those allergens in the merged recipe when a reasonable substitution exists.
- If an allergen-bearing ingredient is structurally essential and cannot be reasonably removed (e.g., eggs in a custard), keep it but provide a substitution option and note that texture or flavor may change.

ANALYSIS APPROACH:
1. Identify the core technique that defines this dish.
2. Compare ingredient variations (e.g., butter vs oil vs ghee).
3. Evaluate which variations enhance flavor, texture, authenticity, or simplicity depending on the chosen authenticity mode.
4. Note where recipes agree (use those elements).
5. Where recipes differ, choose the better approach based on:
   - Traditional preparation methods (for classic),
   - Flavor balance,
   - Texture outcomes,
   - Practical home cooking (especially for simplified/healthy),
   - The user's declared allergens.

MERGING RULES:
1. Create ONE cohesive recipe, not a combination of alternatives.
2. Choose a sensible serving size; if the user requested a serving count, target that.
3. Aim for a total time that is realistic; if the user provided a max time, treat it as a soft constraint.
4. Simplify steps - be clear and concise.
5. Normalize ingredient formats: "quantity | unit | ingredient | preparation".
   - Use "unit" only for real measurement units such as "tbsp", "tsp", "cup", "cups", "oz", "lb", "g", "ml", or "whole".
   - Never repeat the ingredient name in "unit".
   - If you need a range like "1 to 1 1/4 cups", put the entire numeric range in "quantity" and only the measurement in "unit":
     - e.g. "quantity": "1 to 1 1/4", "unit": "cups".
   - The "unit" field must never contain numbers, fractions, or words like "to" or "–" (only the unit name).
   - For "to taste", "pinch", "for garnish", or "to finish" amounts, put that phrase in "quantity" and leave "unit" as an empty string.
   - You may combine multi-use ingredients (e.g. lemons used for zest, juice, and slices) into a single ingredient line with a detailed "preparation" field.
6. Do NOT include "reserved pasta water" as a separate ingredient; mention it only in steps.
7. Extract timing for steps where it makes sense.
8. Preserve the dish's recognizable character for its cuisine and respect the chosen authenticity mode.

TIMING RULES:
- prepTimeMinutes: active prep work (chopping, measuring, mixing).
- cookTimeMinutes: active cooking over heat (stove, oven, grill, etc.).
- waitTimeMinutes: hands-off time (marinating, dough rising, resting, chilling, long unattended baking or braising).
- totalTimeMinutes should roughly equal prepTimeMinutes + cookTimeMinutes + waitTimeMinutes.
- If multiple marinating/rising/resting periods exist, sum them into waitTimeMinutes.


SUBSTITUTIONS & VARIATIONS:
You must produce TWO separate lists:
1) allergenSubstitutions:
   - Only substitutions whose primary purpose is to avoid allergens.
   - Every item MUST have a non-empty "allergensAddressed" array (e.g., ["dairy"], ["gluten"], ["shellfish"], ["peanuts"], ["citrus"], ["celery"]).
   - If a substitution is mainly about preference (e.g., less spicy, richer, lighter) instead of allergens, it does NOT belong here.
2) variationSuggestions:
   - Fun, optional ways to tweak the dish for flavor, texture, nutrition, or presentation.
   - Includes things like extra vegetables, more or less spice, breadcrumb toppings, seafood add-ins, herb variations, etc.

Return ONLY valid JSON matching this schema:
{
  "mergedRecipe": {
    "title": "string",
    "description": "string (1-2 sentences about the dish)",
    "servings": number,
    "totalTimeMinutes": number,
    "prepTimeMinutes": number,
    "cookTimeMinutes": number,
    "waitTimeMinutes": number,
    "ingredients": [
      {
        "quantity": "1.5",
        "unit": "lbs",
        "ingredient": "chicken thighs",
        "preparation": "cut into 1-inch pieces",
        "substitutionNote": null
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "string",
        "timeMinutes": number,
        "technique": "sauté|simmer|bake|etc",
        "tips": "string with helpful tip"
      }
    ],
    "cuisine": "string",
    "difficultyLevel": "easy|medium|hard"
  },
  "allergenSubstitutions": [
    {
      "original": "butter",
      "replacement": "olive oil",
      "allergensAddressed": ["dairy"],
      "notes": "keeps it dairy-free but slightly changes flavor"
    }
  ],
  "variationSuggestions": [
    {
      "name": "Extra-Veggie Version",
      "description": "Adds more vegetables for color and nutrition.",
      "changeType": "nutrition",
      "changes": [
        "Add 1 cup julienned carrots with the onions.",
        "Increase bell peppers to 2 cups total."
      ]
    }
  ]
}`)

	return sb.String()
}

func buildRankingPrompt(dishName string, request *cooking.MergeRecipeRequest, candidates []cooking.RecipeCandidate, max int) string {
	var sb strings.Builder

	sb.WriteString("You are a professional recipe editor.\n")
	sb.WriteString("Given a user's dish request and a list of search results, choose the best base recipes to use for merging.\n\n")
	sb.WriteString(fmt.Sprintf("Dish name: %s\n", dishName))
	sb.WriteString(fmt.Sprintf("Authenticity mode: %s (classic | simplified | healthy)\n", request.Authenticity))

	if len(request.Allergens) > 0 {
		sb.WriteString(fmt.Sprintf("Allergens to be cautious about: %s\n", strings.Join(request.Allergens, ", ")))
	} else {
		sb.WriteString("Allergens to be cautious about: none specified\n")
	}
	sb.WriteString("\n")

	sb.WriteString("For each candidate, you get: title, description/snippet, URL and domain.\n")
	sb.WriteString("Your job:\n")
	sb.WriteString("- Prefer recipes that are actually about this dish (not casseroles, dips, muffins, burgers, etc.)\n")
	sb.WriteString("- Prefer full main-dish recipes over side-dish or snack variants.\n")
	sb.WriteString("- Prefer clear, well-tested sources (good recipe blogs, test kitchens, reputable sites).\n")
	sb.WriteString(fmt.Sprintf("- Prioritize recipes from these high-quality sites if it makes sense: %s\n", strings.Join(cooking.PreferredRecipeSites, ", ")))
	sb.WriteString("- Allow at most one clearly 'twist' recipe (e.g. dip, casserole, mashup) if it seems helpful for variation ideas.\n")
	sb.WriteString("- If allergens are provided, slightly prefer recipes that look easier to adapt or already lean in that direction, but do NOT filter them out completely.\n")
	sb.WriteString("- Aim for diversity by choosing recipes from multiple different websites when reasonable, instead of taking many from the same domain.\n\n")

	sb.WriteString("CANDIDATES:\n")
	for i, c := range candidates {
		sb.WriteString(fmt.Sprintf("%d.\n", i+1))
		sb.WriteString(fmt.Sprintf("  URL: %s\n", c.URL))
		sb.WriteString(fmt.Sprintf("  Domain: %s\n", c.Domain))
		sb.WriteString(fmt.Sprintf("  Title: %s\n", c.Title))
		sb.WriteString(fmt.Sprintf("  Snippet: %s\n\n", c.Description))
	}

	sb.WriteString(fmt.Sprintf(`Return ONLY JSON with this structure:

{
  "selectedUrls": [
    "https://example.com/recipe1",
    "https://example.com/recipe2"
  ]
}

- Include at most `+"%d"+` URLs, ordered from best to worst.
- Every URL must be from the candidate list above.
`, max))

	return sb.String()
}
