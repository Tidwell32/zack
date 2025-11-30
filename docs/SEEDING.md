# Database Seeding Guide

This guide explains database seeding for the disc catalog, including automatic seeding, manual seeding, and production re-seeding.

## Overview

The disc catalog is automatically seeded on API startup, so **you usually don't need to do anything manually**. The seeding system is smart:

- ✅ Auto-runs when API starts
- ✅ Skips if catalog already has data
- ✅ Only takes ~1 second if data exists
- ✅ Takes ~5-10 seconds on first run

## Automatic Seeding (Default Behavior)

### How It Works

Every time the API starts:

1. Connects to MongoDB
2. Runs migrations
3. **Checks if disc catalog is empty**
4. If empty: Fetches ~2000 discs from DiscIt API
5. If has data: Skips (fast)
6. Starts HTTP server

**You see this in the logs:**

```
Successfully connected to MongoDB!
Running migrations...
📚 Disc catalog already contains 2043 discs, skipping seed
Server starting on :8080
```

**Or on first run:**

```
Successfully connected to MongoDB!
Running migrations...
📥 Fetching disc catalog from DiscIt API...
🔄 Processing 2043 discs...
💾 Inserting discs into database...
✅ Inserted 2043 discs into catalog
🔍 Creating indexes...
Server starting on :8080
```

### Configuration

No configuration needed! It just works.

---

## Manual Seeding (Optional)

If you want to seed before starting the API:

```bash
# Option 1: Using pnpm script
pnpm seed

# Option 2: Direct Go command
cd apps/api
go run cmd/seed/main.go
```

**When to use:**

- Testing the seed process
- Seeding before deploying
- You prefer explicit control

---

## Re-Seeding (Updating Catalog)

To fetch fresh disc data (new discs, updated info):

### Development/Local

```bash
# Safe re-seed with confirmation
pnpm reseed
```

**What happens:**

1. Warns you it's destructive
2. Deletes existing catalog
3. Fetches fresh data from DiscIt API
4. Shows before/after stats

**Output:**

```
🔄 Starting disc catalog re-seed...
⚠️  WARNING: This will delete all existing catalog data!
✅ Confirmation received, proceeding with re-seed...
📊 Current catalog contains 2043 discs
🗑️  Deleting existing catalog...
📥 Fetching fresh data from DiscIt API...
✅ Inserted 2050 discs into catalog
📊 New catalog contains 2050 discs (+7)
✅ Disc catalog re-seed complete!
```

### Production

**⚠️ DANGER ZONE - Read carefully!**

Production re-seeding requires TWO confirmations:

```bash
# On production server (Railway)
cd apps/api
CONFIRM_RESEED=yes CONFIRM_PRODUCTION_RESEED=yes go run cmd/reseed/main.go
```

**Safety features:**

- Requires `CONFIRM_RESEED=yes`
- Requires `CONFIRM_PRODUCTION_RESEED=yes` if ENV=production
- Shows current data stats before deleting
- Shows diff after re-seeding

**Where to run this:**

```bash
# Via Railway CLI
railway run bash
cd apps/api
CONFIRM_RESEED=yes CONFIRM_PRODUCTION_RESEED=yes go run cmd/reseed/main.go

# Or via one-off container
railway run --service api CONFIRM_RESEED=yes CONFIRM_PRODUCTION_RESEED=yes go run /app/cmd/reseed/main.go
```

---

## Force Re-Seed on API Startup

To force re-seed every time the API starts (useful for staging):

```bash
# Set environment variable
export FORCE_RESEED=true

# Then start API
go run main.go
```

**Or in Docker:**

```yaml
# docker-compose.yml
environment:
  FORCE_RESEED: "true"
```

**⚠️ Warning:** Only use this in development/staging, never in production!

---

## What Gets Seeded

### Disc Catalog Structure

From DiscIt API → MongoDB:

```json
{
  "_id": "ObjectId(...)",
  "discit_id": "db324159-b3f5-5089-a213-141e2e7fee54",
  "name": "Lobster",
  "brand": "Mint Discs",
  "category": "Midrange",
  "speed": 5,
  "glide": 5,
  "turn": -3,
  "fade": 1,
  "stability": "Understable",
  "link": "https://www.marshallstreetdiscgolf.com/?s=lobster&post_type=product",
  "pic": "https://s3.amazonaws.com/media.marshallstreetdiscgolf.com/inbounds/0000233.webp",
  "name_slug": "lobster",
  "brand_slug": "mint-discs",
  "category_slug": "midrange",
  "stability_slug": "understable",
  "color": "#FFFFFF",
  "background_color": "#F4933E"
}
```

### Indexes Created

1. **Unique**: `discit_id` (prevents duplicates)
2. **Compound**: `name_slug + brand_slug`
3. **Single**: `category_slug`
4. **Single**: `brand`
5. **Single**: `stability_slug`
6. **Text search**: `name` and `brand`

---

## Troubleshooting

### API Won't Start - Seeding Failed

**Error:**

```
warning: failed to seed disc catalog: http get: context deadline exceeded
Server starting on :8080
```

**Cause:** DiscIt API is down or slow

**Solution:** API still starts! Seeding is non-fatal. Try manual seed later:

```bash
pnpm seed
```

### Duplicate Key Error

**Error:**

```
Failed to seed: E11000 duplicate key error collection: zack.disc_catalog index: discit_id_1
```

**Cause:** Data already exists

**Solution:** This is expected! Seeding skips if data exists. To force refresh:

```bash
pnpm reseed
```

### Production Re-Seed Safety Check Failed

**Error:**

```
❌ This is a PRODUCTION environment. Set CONFIRM_PRODUCTION_RESEED=yes to proceed.
```

**Solution:** This is intentional safety! Add both confirmations:

```bash
CONFIRM_RESEED=yes CONFIRM_PRODUCTION_RESEED=yes go run cmd/reseed/main.go
```

### Slow API Startup

**Issue:** API takes 10+ seconds to start

**Possible causes:**

1. First-time seed (normal, only happens once)
2. `FORCE_RESEED=true` is set (remove it)
3. Slow network to DiscIt API

**Check logs:**

- If you see "already contains X discs, skipping" → Not the seed
- If you see "Fetching disc catalog" → Seeding is running

---

## Advanced Usage

### Custom Seed Data

To extend seeding with your own data:

```go
// apps/api/internal/seeding/custom.go
package seeding

func SeedCustomData(ctx context.Context, db *mongo.Database) error {
    // Your custom seeding logic
    return nil
}
```

Then add to main.go:

```go
if err := seeding.SeedCustomData(ctx, db.Database); err != nil {
    log.Printf("warning: failed to seed custom data: %v", err)
}
```

### Seeding in Tests

```go
func TestSomething(t *testing.T) {
    db := setupTestDB(t)

    // Seed test data
    if err := seeding.SeedDiscCatalog(context.Background(), db, false); err != nil {
        t.Fatal(err)
    }

    // Your test...
}
```

---

## Scripts Reference

| Command                            | Purpose                            | Safe?             |
| ---------------------------------- | ---------------------------------- | ----------------- |
| `pnpm seed`                        | Manual seed (skips if data exists) | ✅ Yes            |
| `pnpm reseed`                      | Delete & re-fetch (local only)     | ⚠️ Destructive    |
| `go run main.go`                   | Auto-seeds on startup              | ✅ Yes            |
| `FORCE_RESEED=true go run main.go` | Force re-seed on every start       | ⚠️ Staging only   |
| Production re-seed                 | Manual production update           | ❌ Very dangerous |

---

## FAQ

**Q: Do I need to run `pnpm seed` manually?**
A: No! Seeding happens automatically when you start the API.

**Q: How often should I re-seed?**
A: Only when you need new discs from DiscIt. Maybe monthly or quarterly.

**Q: Will seeding delete my bags/discs?**
A: No, only the `disc_catalog` collection is affected. Your user data is safe.

**Q: What if DiscIt API is down?**
A: The API will still start (seeding is non-fatal). You can manually seed later.

**Q: Can I use a different data source?**
A: Yes! Edit `apps/api/internal/seeding/catalog.go` and change the `fetchDiscItCatalog()` function.

**Q: How do I seed in Docker?**
A: It auto-seeds when the API container starts. No action needed.

**Q: Is there a way to preview changes before re-seeding production?**
A: Run `pnpm reseed` locally first, check the diff, then apply to production.
