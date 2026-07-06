package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/config"
	"github.com/Tidwell32/zack/apps/api/internal/cooking"
	cookingservices "github.com/Tidwell32/zack/apps/api/internal/services/cooking"
	"github.com/Tidwell32/zack/apps/api/pkg/response"
)

type CookingHandler struct {
	cfg          *config.Config
	recipeMerger *cookingservices.RecipeMergerService
	jobStore     *cookingservices.JobStore
}

func NewCookingHandler(cfg *config.Config, recipeMerger *cookingservices.RecipeMergerService, jobStore *cookingservices.JobStore) *CookingHandler {
	return &CookingHandler{
		cfg:          cfg,
		recipeMerger: recipeMerger,
		jobStore:     jobStore,
	}
}

// POST /cooking/whats-for-dinner/merge
func (h *CookingHandler) MergeRecipe(w http.ResponseWriter, r *http.Request) {
	var req cooking.MergeRecipeRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if errMsg := req.Validate(); errMsg != "" {
		response.Error(w, http.StatusBadRequest, errMsg)
		return
	}

	log.Printf("=== Recipe Merge Request ===")
	log.Printf("Dish: %s", req.DishName)
	if len(req.Allergens) > 0 {
		log.Printf("Dietary Restrictions: %v", req.Allergens)
	}

	job := h.jobStore.CreateJob(&req)
	log.Printf("Created job: %s", job.ID)

	go h.processJob(job.ID, &req)

	// Return job ID immediately
	_ = response.Success(w, map[string]string{"jobId": job.ID})
}

// GET /cooking/whats-for-dinner/merge/:jobId/status
func (h *CookingHandler) GetJobStatus(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("jobId")
	if jobID == "" {
		response.Error(w, http.StatusBadRequest, "jobId is required")
		return
	}

	job, exists := h.jobStore.GetJob(jobID)
	if !exists {
		response.Error(w, http.StatusNotFound, "job not found")
		return
	}

	_ = response.Success(w, job)
}

func (h *CookingHandler) processJob(jobID string, req *cooking.MergeRecipeRequest) {
	// 10 minute timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	// This updates the job store
	progressCallback := func(event cooking.ProgressEvent) {
		h.jobStore.UpdateJobStatus(jobID, cooking.JobStatus(event.Stage), event.Message, event.Data)
	}

	result, err := h.recipeMerger.MergeRecipesWithProgress(ctx, req, progressCallback)
	if err != nil {
		log.Printf("Job %s failed: %v", jobID, err)
		h.jobStore.FailJob(jobID, err)
		return
	}

	log.Printf("Job %s completed successfully", jobID)
	h.jobStore.CompleteJob(jobID, result)
}
