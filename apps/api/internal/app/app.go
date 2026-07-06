package app

import (
	"net/http"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/database"
	"github.com/Tidwell32/zack/apps/api/internal/handlers"
	"github.com/Tidwell32/zack/apps/api/internal/llm"
	"github.com/Tidwell32/zack/apps/api/internal/middleware"
	"github.com/Tidwell32/zack/apps/api/internal/repository"
	"github.com/Tidwell32/zack/apps/api/internal/services"
	cooking "github.com/Tidwell32/zack/apps/api/internal/services/cooking"
)

type App struct {
	Config   *config.Config
	DB       *database.MongoDB
	jobStore *cooking.JobStore
}

func New(cfg *config.Config, db *database.MongoDB) *App {
	return &App{
		Config:   cfg,
		DB:       db,
		jobStore: cooking.NewJobStore(),
	}
}

// Gracefully shuts down background services
func (a *App) Shutdown() {
	if a.jobStore != nil {
		a.jobStore.Shutdown()
	}
}
func (a *App) Routes() http.Handler {
	mux := http.NewServeMux()

	authService := services.NewAuthService(a.Config)

	catalogCollection := a.DB.Collection("disc_catalog")
	catalogRepo := repository.NewMongoDiscCatalogRepository(catalogCollection)

	discCollection := a.DB.Collection("discs")
	discRepo := repository.NewMongoDiscRepository(discCollection)
	discService := services.NewDiscService(discRepo, catalogRepo)

	bagCollection := a.DB.Collection("bags")
	bagRepo := repository.NewMongoBagRepository(bagCollection)
	bagService := services.NewBagService(bagRepo, discRepo)

	techDiscCollection := a.DB.Collection("techdisc_throws")
	techDiscRepo := repository.NewMongoTechDiscRepository(techDiscCollection)
	techDiscService := services.NewTechDiscService(techDiscRepo)

	udiscRoundsCollection := a.DB.Collection("udisc_rounds")
	udiscRepo := repository.NewMongoUDiscRepository(udiscRoundsCollection)
	udiscService := services.NewUDiscService(udiscRepo)

	searchService := cooking.NewSearchService(
		a.Config.GoogleSearchAPIKey,
		a.Config.GoogleSearchEngineID,
	)
	scraperService := cooking.NewScraperService()
	llmProvider := llm.NewOpenAIProvider(a.Config.OpenAIAPIKey)
	recipeMergerService := cooking.NewRecipeMergerService(
		llmProvider,
		searchService,
		scraperService,
	)

	health := handlers.NewHealthHandler()
	auth := handlers.NewAuthHandler(a.Config, authService)
	bags := handlers.NewBagHandler(a.Config, bagService)
	discs := handlers.NewDiscHandler(a.Config, discService)
	catalog := handlers.NewCatalogHandler(catalogRepo)
	techDisc := handlers.NewTechDiscHandler(a.Config, techDiscService)
	udisc := handlers.NewUDiscHandler(a.Config, udiscService)
	cookingHandler := handlers.NewCookingHandler(a.Config, recipeMergerService, a.jobStore)

	mux.HandleFunc("GET /health", health.Handle)

	mux.HandleFunc("POST /auth/login", auth.Login)
	mux.HandleFunc("POST /auth/logout", auth.Logout)
	mux.HandleFunc("GET /auth/whoami", auth.WhoAmI)

	mux.HandleFunc("POST /bags", bags.CreateBag)
	mux.HandleFunc("GET /bags", bags.GetBagsForCurrentUser)
	mux.HandleFunc("GET /bags/{id}", bags.GetBag)
	mux.HandleFunc("PATCH /bags/{id}", bags.UpdateBag)
	mux.HandleFunc("DELETE /bags/{id}", bags.DeleteBag)

	mux.HandleFunc("POST /bags/{id}/discs", discs.AddDiscToBag)
	mux.HandleFunc("GET /bags/{id}/discs", discs.GetDiscsForBag)
	mux.HandleFunc("PATCH /discs/{id}", discs.UpdateDisc)
	mux.HandleFunc("DELETE /discs/{id}", discs.DeleteDisc)

	mux.HandleFunc("GET /catalog/discs/search", catalog.SearchDiscs)
	mux.HandleFunc("GET /catalog/discs/suggest", catalog.SuggestDiscs)

	mux.HandleFunc("POST /techdisc/import", techDisc.ImportTechDiscCSV)
	mux.HandleFunc("GET /techdisc/throws", techDisc.GetThrows)
	mux.HandleFunc("GET /techdisc/sessions", techDisc.GetSessions)

	mux.HandleFunc("POST /udisc/import", udisc.ImportUDiscCSV)
	mux.HandleFunc("GET /udisc/rounds", udisc.GetRounds)
	mux.HandleFunc("GET /udisc/players", udisc.GetPlayers)
	mux.HandleFunc("GET /udisc/courses", udisc.GetCourses)

	mux.HandleFunc("POST /cooking/whats-for-dinner/merge", cookingHandler.MergeRecipe)
	mux.HandleFunc("GET /cooking/whats-for-dinner/merge/{jobId}/status", cookingHandler.GetJobStatus)

	handler := middleware.AuthMiddleware(a.Config, authService, mux)
	handler = middleware.CORSMiddleware(a.Config, handler)
	return handler
}
