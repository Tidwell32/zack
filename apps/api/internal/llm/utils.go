package llm

import (
	"encoding/json"
	"fmt"
	"strings"
)

// CleanJSON tries to extract a valid JSON object/array from LLM output.
// It handles things like ```json fences and trailing text.
func CleanJSON(raw string) ([]byte, error) {
	s := strings.TrimSpace(raw)

	if strings.HasPrefix(s, "```") {
		s = strings.TrimPrefix(s, "```json")
		s = strings.TrimPrefix(s, "```JSON")
		s = strings.TrimPrefix(s, "```")
		s = strings.TrimSpace(s)

		if idx := strings.LastIndex(s, "```"); idx != -1 {
			s = s[:idx]
			s = strings.TrimSpace(s)
		}
	}

	start := strings.IndexAny(s, "{[")
	if start == -1 {
		return nil, fmt.Errorf("cleanJSON: no JSON object/array start found")
	}

	end := strings.LastIndexAny(s, "}]")
	if end == -1 || end <= start {
		return nil, fmt.Errorf("cleanJSON: no JSON object/array end found")
	}

	core := strings.TrimSpace(s[start : end+1])
	return []byte(core), nil
}

// UnmarshalLLMJSON attempts direct unmarshal, then a cleaned retry.
func UnmarshalLLMJSON(raw string, v any) error {
	if err := json.Unmarshal([]byte(raw), v); err == nil {
		return nil
	}

	cleaned, err := CleanJSON(raw)
	if err != nil {
		return fmt.Errorf("UnmarshalLLMJSON: cleaning failed: %w", err)
	}

	if err := json.Unmarshal(cleaned, v); err != nil {
		return fmt.Errorf("UnmarshalLLMJSON: unmarshal cleaned JSON failed: %w", err)
	}

	return nil
}
