package cooking

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"github.com/Tidwell32/zack/apps/api/internal/cooking"
)

// Manages in-memory storage of merge jobs
type JobStore struct {
	mu     sync.RWMutex
	jobs   map[string]*cooking.MergeJob
	cancel context.CancelFunc
}

func NewJobStore() *JobStore {
	ctx, cancel := context.WithCancel(context.Background())

	store := &JobStore{
		jobs:   make(map[string]*cooking.MergeJob),
		cancel: cancel,
	}

	go store.cleanupOldJobs(ctx)

	return store
}

func (s *JobStore) Shutdown() {
	if s.cancel != nil {
		s.cancel()
	}
}

func (s *JobStore) CreateJob(request *cooking.MergeRecipeRequest) *cooking.MergeJob {
	s.mu.Lock()
	defer s.mu.Unlock()

	jobID := generateJobID()
	now := time.Now().Unix()

	job := &cooking.MergeJob{
		ID:        jobID,
		Status:    cooking.JobStatusPending,
		Progress:  []cooking.ProgressEvent{},
		Request:   request,
		CreatedAt: now,
		UpdatedAt: now,
	}

	s.jobs[jobID] = job

	return job
}

func (s *JobStore) GetJob(jobID string) (*cooking.MergeJob, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	job, exists := s.jobs[jobID]
	return job, exists
}

func (s *JobStore) UpdateJobStatus(jobID string, status cooking.JobStatus, message string, data any) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job, exists := s.jobs[jobID]
	if !exists {
		return
	}

	job.Status = status
	job.UpdatedAt = time.Now().Unix()

	event := cooking.ProgressEvent{
		Stage:   string(status),
		Message: message,
		Data:    data,
	}
	job.Progress = append(job.Progress, event)
}

func (s *JobStore) CompleteJob(jobID string, result *cooking.MergeRecipeResponse) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job, exists := s.jobs[jobID]
	if !exists {
		return
	}

	job.Status = cooking.JobStatusComplete
	job.Result = result
	job.UpdatedAt = time.Now().Unix()
	job.DurationSeconds = job.UpdatedAt - job.CreatedAt

	event := cooking.ProgressEvent{
		Stage:   "complete",
		Message: "Recipe merged successfully",
		Data:    result,
	}
	job.Progress = append(job.Progress, event)
}

func (s *JobStore) FailJob(jobID string, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	job, exists := s.jobs[jobID]
	if !exists {
		return
	}

	job.Status = cooking.JobStatusFailed
	job.Error = err.Error()
	job.UpdatedAt = time.Now().Unix()
	job.DurationSeconds = job.UpdatedAt - job.CreatedAt

	event := cooking.ProgressEvent{
		Stage:   "failed",
		Message: "Failed to merge recipes: " + err.Error(),
	}
	job.Progress = append(job.Progress, event)
}

// Removes jobs older than 1 hour
func (s *JobStore) cleanupOldJobs(ctx context.Context) {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.mu.Lock()
			now := time.Now().Unix()
			cutoff := now - 3600

			for jobID, job := range s.jobs {
				if job.UpdatedAt < cutoff {
					delete(s.jobs, jobID)
				}
			}
			s.mu.Unlock()
		}
	}
}

func generateJobID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// This should never happen
		panic(fmt.Sprintf("failed to generate secure random job ID: %v", err))
	}
	return hex.EncodeToString(b)
}
