package cooking

import "strings"

type AuthenticityMode string

const (
	AuthenticityClassic    AuthenticityMode = "classic"
	AuthenticitySimplified AuthenticityMode = "simplified"
	AuthenticityHealthy    AuthenticityMode = "healthy"
)

var validAuthenticityModes = map[AuthenticityMode]bool{
	AuthenticityClassic:    true,
	AuthenticitySimplified: true,
	AuthenticityHealthy:    true,
}

func (m AuthenticityMode) IsValid() bool {
	return validAuthenticityModes[m]
}

// Growing list of my favorite/most trusted website.
// The google search api is enabled for a few more, but we prioritize these.
var PreferredRecipeSites = []string{
	"seriouseats.com",
	"recipetineats.com",
	"smittenkitchen.com",
	"americastestkitchen.com",
	"rainbowplantlife.com",
	"notanothercookingshow.tv",
	"saltandlavender.com",
	"budgetbytes.com",
}

// MergeRecipeRequest is the input DTO for recipe merging
type MergeRecipeRequest struct {
	DishName       string           `json:"dishName"`
	Authenticity   AuthenticityMode `json:"authenticity"`        // "classic" | "simplified" | "healthy"
	Allergens      []string         `json:"allergens,omitempty"` // ["dairy", "coconut"]
	Servings       int              `json:"servings,omitempty"`
	MaxTimeMinutes *int             `json:"maxTimeMinutes,omitempty"`
}

func (r *MergeRecipeRequest) Validate() string {
	r.DishName = strings.TrimSpace(r.DishName)
	if r.DishName == "" {
		return "dishName is required"
	}
	if len(r.DishName) < 2 || len(r.DishName) > 100 {
		return "dishName must be between 2 and 100 characters"
	}

	if r.Authenticity == "" {
		r.Authenticity = AuthenticitySimplified
	}
	if !r.Authenticity.IsValid() {
		return "authenticity must be one of: classic, simplified, healthy"
	}

	if r.Servings < 0 {
		return "servings must be a positive number"
	}

	if r.MaxTimeMinutes != nil && *r.MaxTimeMinutes <= 0 {
		return "maxTimeMinutes must be a positive number"
	}

	if len(r.Allergens) > 10 {
		return "too many dietary restrictions (max 10)"
	}

	return ""
}

type MergeRecipeResponse struct {
	MergedRecipe          *MergedRecipe          `json:"mergedRecipe"`
	SourceURLs            []string               `json:"sourceUrls"`
	AllergenSubstitutions []AllergenSubstitution `json:"allergenSubstitutions"`
	VariationSuggestions  []VariationSuggestion  `json:"variationSuggestions"`
}

type MergedRecipe struct {
	Title            string                 `json:"title"`
	Description      string                 `json:"description"`
	Servings         int                    `json:"servings"`
	TotalTimeMinutes int                    `json:"totalTimeMinutes"`
	PrepTimeMinutes  int                    `json:"prepTimeMinutes"`
	CookTimeMinutes  int                    `json:"cookTimeMinutes"`
	WaitTimeMinutes  int                    `json:"waitTimeMinutes"`
	Ingredients      []StructuredIngredient `json:"ingredients"`
	Steps            []StructuredStep       `json:"steps"`
	Cuisine          string                 `json:"cuisine"`
	DifficultyLevel  string                 `json:"difficultyLevel"`
}

type StructuredIngredient struct {
	Quantity         string  `json:"quantity"`
	Unit             string  `json:"unit"`
	Ingredient       string  `json:"ingredient"`
	Preparation      string  `json:"preparation"`
	SubstitutionNote *string `json:"substitutionNote"`
}

type StructuredStep struct {
	StepNumber  int    `json:"stepNumber"`
	Instruction string `json:"instruction"`
	TimeMinutes int    `json:"timeMinutes"`
	Technique   string `json:"technique"`
	Tips        string `json:"tips"`
}

type AllergenSubstitution struct {
	Original           string   `json:"original"`
	Replacement        string   `json:"replacement"`
	AllergensAddressed []string `json:"allergensAddressed"`
	Notes              string   `json:"notes,omitempty"`
}

type VariationSuggestion struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	ChangeType  string   `json:"changeType"`
	Changes     []string `json:"changes"`
}

// ParsedRecipe is the raw extracted recipe from HTML before merging
type ParsedRecipe struct {
	Title            string   `json:"title"`
	SourceURL        string   `json:"sourceUrl"`
	Ingredients      []string `json:"ingredients"`
	Steps            []string `json:"steps"`
	TotalTimeMinutes int      `json:"totalTimeMinutes"`
	PrepTimeMinutes  int      `json:"prepTimeMinutes"`
	CookTimeMinutes  int      `json:"cookTimeMinutes"`
	WaitTimeMinutes  int      `json:"waitTimeMinutes"`
	Servings         int      `json:"servings"`
}

type RecipeCandidate struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Domain      string `json:"domain"`
}

type ProgressEvent struct {
	Stage   string `json:"stage"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

type ProgressCallback func(event ProgressEvent)

type JobStatus string

const (
	JobStatusPending   JobStatus = "pending"
	JobStatusSearching JobStatus = "searching"
	JobStatusRanking   JobStatus = "ranking"
	JobStatusFetching  JobStatus = "fetching"
	JobStatusParsing   JobStatus = "parsing"
	JobStatusMerging   JobStatus = "merging"
	JobStatusComplete  JobStatus = "complete"
	JobStatusFailed    JobStatus = "failed"
)

type MergeJob struct {
	ID              string               `json:"id"`
	Status          JobStatus            `json:"status"`
	Progress        []ProgressEvent      `json:"progress"`
	Result          *MergeRecipeResponse `json:"result,omitempty"`
	Error           string               `json:"error,omitempty"`
	Request         *MergeRecipeRequest  `json:"request"`
	CreatedAt       int64                `json:"createdAt"`
	UpdatedAt       int64                `json:"updatedAt"`
	DurationSeconds int64                `json:"durationSeconds"`
}
