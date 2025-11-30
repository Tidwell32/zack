package validation

import (
	"regexp"
	"strings"
)

var hexColorRegex = regexp.MustCompile(`^#?([A-Fa-f0-9]{6})$`)

type HexColorError struct {
	Field   string
	Message string
}

func (e *HexColorError) Error() string {
	return e.Message
}

func ValidateHexColor(color string, fieldName string) (string, error) {
	if color == "" {
		return "", nil
	}

	color = strings.TrimSpace(color)

	matches := hexColorRegex.FindStringSubmatch(color)
	if matches == nil {
		return "", &HexColorError{
			Field:   fieldName,
			Message: fieldName + " must be a valid hex color (e.g., #FF5733 or FF5733)",
		}
	}

	return "#" + strings.ToUpper(matches[1]), nil
}
