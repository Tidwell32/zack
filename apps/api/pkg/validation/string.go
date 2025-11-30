package validation

import (
	"fmt"
	"strings"
)

type StringError struct {
	Field   string
	Message string
}

func (e *StringError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

func ToHTTPMessage(err error) string {
	if e, ok := err.(*StringError); ok {
		return fmt.Sprintf("%s %s", e.Field, e.Message)
	}
	return err.Error()
}

type StringRules struct {
	Field        string
	Required     bool
	MinLen       int
	MaxLen       int
	Trim         bool
	AllowedValues []string
}

func (r StringRules) RequiredField() StringRules {
	r.Required = true
	return r
}

func (r StringRules) Min(n int) StringRules {
	r.MinLen = n
	return r
}

func (r StringRules) Max(n int) StringRules {
	r.MaxLen = n
	return r
}

func (r StringRules) Trimmed() StringRules {
	r.Trim = true
	return r
}

func (r StringRules) In(values ...string) StringRules {
	r.AllowedValues = values
	return r
}

func ValidateString(value string, rules StringRules) (string, error) {
	processed := value

	if rules.Trim {
		processed = strings.TrimSpace(processed)
	}

	if rules.Required && processed == "" {
		return "", &StringError{
			Field:   rules.Field,
			Message: "is required",
		}
	}

	if rules.MinLen > 0 && len(processed) < rules.MinLen {
		return "", &StringError{
			Field:   rules.Field,
			Message: fmt.Sprintf("must be at least %d characters", rules.MinLen),
		}
	}

	if rules.MaxLen > 0 && len(processed) > rules.MaxLen {
		return "", &StringError{
			Field:   rules.Field,
			Message: fmt.Sprintf("must be at most %d characters", rules.MaxLen),
		}
	}

	if len(rules.AllowedValues) > 0 {
		allowed := false
		for _, v := range rules.AllowedValues {
			if processed == v {
				allowed = true
				break
			}
		}
		if !allowed {
			return "", &StringError{
				Field:   rules.Field,
				Message: fmt.Sprintf("must be one of: %s", strings.Join(rules.AllowedValues, ", ")),
			}
		}
	}

	return processed, nil
}
