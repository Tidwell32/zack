package validation

import "fmt"

type IntError struct {
	Field   string
	Message string
}

func (e *IntError) Error() string {
	return e.Message
}

type IntRules struct {
	Field string
	Min   *int
	Max   *int
}

func (r IntRules) MinValue(n int) IntRules {
	r.Min = &n
	return r
}

func (r IntRules) MaxValue(n int) IntRules {
	r.Max = &n
	return r
}

func ValidateInt(value int, rules IntRules) (int, error) {
	if rules.Min != nil && value < *rules.Min {
		return 0, &IntError{
			Field:   rules.Field,
			Message: fmt.Sprintf("%s must be at least %d", rules.Field, *rules.Min),
		}
	}

	if rules.Max != nil && value > *rules.Max {
		return 0, &IntError{
			Field:   rules.Field,
			Message: fmt.Sprintf("%s must be at most %d", rules.Field, *rules.Max),
		}
	}

	return value, nil
}
