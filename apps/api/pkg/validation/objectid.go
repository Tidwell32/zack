package validation

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ObjectIDError struct {
	Field   string
	Message string
}

func (e *ObjectIDError) Error() string {
	return e.Message
}

func ValidateObjectID(hexID string, fieldName string) (bson.ObjectID, error) {
	if hexID == "" {
		return bson.ObjectID{}, &ObjectIDError{
			Field:   fieldName,
			Message: fieldName + " is required",
		}
	}

	oid, err := bson.ObjectIDFromHex(hexID)
	if err != nil {
		return bson.ObjectID{}, &ObjectIDError{
			Field:   fieldName,
			Message: "invalid " + fieldName,
		}
	}

	return oid, nil
}
