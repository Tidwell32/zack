package requestmeta

import (
	"context"
	"time"
)

type User struct {
	ID      string
	IsOwner bool
}

type Meta struct {
	User     *User
	Timezone *time.Location
}

type ctxKey string

const metaKey ctxKey = "request-meta"

func WithMeta(ctx context.Context, m *Meta) context.Context {
	return context.WithValue(ctx, metaKey, m)
}

func GetMeta(ctx context.Context) *Meta {
	meta, _ := ctx.Value(metaKey).(*Meta)
	return meta
}

func FromContext(ctx context.Context) *Meta {
	if v := ctx.Value(metaKey); v != nil {
		if m, ok := v.(*Meta); ok {
			return m
		}
	}
	return nil
}
