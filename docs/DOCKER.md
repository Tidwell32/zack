# Docker Setup Guide

This monorepo uses Docker and Docker Compose for local development with MongoDB.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- Go 1.23+ installed (for local API development)
- Your actual `.env` files configured (see below)

---

## Development Workflows

You have **two approaches** for local development:

### Approach 1: Hybrid (Recommended for Development) ⭐

Run MongoDB in Docker, everything else locally.

**Best for:**
- Fast iteration
- Easy debugging
- Instant reload

**Start MongoDB:**
```bash
docker compose up mongo
```

**In separate terminals:**
```bash
# Terminal 1: Run API locally
cd apps/api
go run main.go

# Terminal 2: Run frontend locally
pnpm dev:web
```

**Accessing services:**
- MongoDB: `mongodb://localhost:27017/zack`
- API: `http://localhost:8080`
- Frontend: `http://localhost:5173`

---

### Approach 2: Full Docker

Run everything in Docker.

**Best for:**
- Testing production-like environment
- Consistent team setup
- Deployment validation

**Start all services:**
```bash
docker compose up --build
```

This will:
- ✅ Start MongoDB
- ✅ Build and start API
- ✅ Keep containers running

**View logs:**
```bash
docker compose logs -f api
```

**Note:** For code changes, you'll need to rebuild:
```bash
docker compose up --build
```

---

## Environment Setup

### Option A: Use .env.docker file (Recommended)

```bash
# Copy the example
cp .env.docker.example .env.docker

# Edit .env.docker and add your actual secrets:
# - AUTH_TOTP_SECRET
# - AUTH_JWT_SECRET
# - OWNER_USER_ID

# Load it before running docker compose
source .env.docker
```

### Option B: Copy from existing .env

```bash
# If you already have apps/api/.env configured
cp apps/api/.env .env.docker
source .env.docker
```

---

## What's Running

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| MongoDB | 27017 | mongodb://localhost:27017 | Always in Docker |
| API (Docker) | 8080 | http://localhost:8080 | With/without hot reload |
| API (Local) | 8080 | http://localhost:8080 | Run with `go run main.go` |
| Web | 5173 | http://localhost:5173 | Run with `pnpm dev:web` |

---

## Common Commands

### Docker Compose

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (clears database!)
docker compose down -v

# Rebuild after dependency changes
docker compose up --build

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api
docker compose logs -f mongo

# Restart a service
docker compose restart api

# Execute command in running container
docker compose exec api sh
docker compose exec mongo mongosh
```

### Local Development

```bash
# Run API locally
cd apps/api
go run main.go

# Run frontend
pnpm dev:web

# Start just MongoDB in Docker
docker compose up mongo
```

---

## MongoDB Access

### Using MongoDB Compass (GUI)

**Connection String:**
```
mongodb://localhost:27017/zack
```

Or use individual fields:
- **Host:** `localhost`
- **Port:** `27017`
- **Database:** `zack`
- **Authentication:** None

### Using mongosh (CLI)

```bash
# Connect from your machine
mongosh mongodb://localhost:27017/zack

# Or from inside the container
docker compose exec mongo mongosh zack

# List collections
show collections

# Query data
db.bags.find()
db.discs.find()
db.rounds.find()
```

### Data Persistence

The MongoDB data persists in a Docker volume named `mongo_data`:
- ✅ Data survives container restarts
- ✅ Data survives `docker compose down`
- ❌ Data is deleted with `docker compose down -v`

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8080  # For API
lsof -i :27017 # For MongoDB

# Kill the process or stop your local instances
# Then try docker compose up again
```

### Can't Connect to MongoDB

1. Check container is running:
   ```bash
   docker compose ps
   ```

2. Check logs:
   ```bash
   docker compose logs mongo
   ```

3. Verify port 27017 is available:
   ```bash
   lsof -i :27017
   ```

### API Won't Start

Check environment variables:
```bash
# In Docker
docker compose exec api env | grep AUTH
docker compose exec api env | grep MONGODB

# Locally
cd apps/api
cat .env
```

### Go Module Issues in Docker

If you get "go mod download" errors:

1. Check `apps/api/go.mod` has valid Go version (1.23)
2. Run locally first:
   ```bash
   cd apps/api
   go mod tidy
   ```
3. Rebuild Docker:
   ```bash
   docker compose down
   docker compose up --build
   ```

### Need to Reset Everything

```bash
# Nuclear option: delete everything and start fresh
docker compose down -v
docker compose up --build
```

This will:
- Stop all containers
- Delete all volumes (including database data)
- Rebuild images
- Start fresh

---

## Recommended Development Setup

For the best local development experience:

**Terminal 1 - MongoDB:**
```bash
docker compose up mongo
```

**Terminal 2 - API:**
```bash
cd apps/api
go run main.go
```

**Terminal 3 - Frontend:**
```bash
pnpm dev:web
```

**MongoDB Compass:**
- Open and connect to `mongodb://localhost:27017/zack`
- View your data in real-time

---

## Production Deployment

For production (Railway, etc.):

1. Use managed MongoDB (MongoDB Atlas)
2. Set environment variables in your platform
3. Use the production Dockerfile (not docker-compose)

Railway automatically detects `apps/api/Dockerfile` and builds it.

---

## File Reference

- **`apps/api/Dockerfile`** - Production build (multi-stage, optimized)
- **`apps/api/Dockerfile.dev`** - Development build
- **`docker-compose.yml`** - Base configuration (MongoDB + API)
- **`.env.docker.example`** - Example environment variables
