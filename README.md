# Zack's Monorepo

A full-stack TypeScript monorepo featuring a React frontend and Go API backend, with a playground for tracking, visualizing, or simply having fun with various hobbies and passions of mine. It is meant to hone (and show off) my skills and learn new technologies. I will continually add new features that just seem fun to me, and maybe other people will enjoy them as well.

## Project Overview

The application currently includes:

- **Disc Golf Tracker** - Tracks my discs and visualizes techdisc and uDisc data. Hopefully showing a general trend of me getting better.
- **What's For Dinner** - A recipe merger that searches the web for recipes, uses AI to rank and select the best ones, then merges them into a single optimized recipe with allergen substitutions and variation suggestions.

Will definitely one day include:

- **Ball Golf Tracking** - Tracking my scores and progression through data visualization. Maybe comparing swing videos and such.
- **Gym Tracker** - A sleek UI to add specific exercises that I can then easily track as I do sets. I'll also visualize this data to show progression. If you haven't noticed, I love visualizing data.

Will maybe one day include:

- **Music** - Do something fun with the Spotify API. Maybe let people compare their music tastes to mine and each other.
- **Reading** - Something similar to the above, maybe a suggestions interface.

## Tech Stack

### Frontend (`apps/web`)

- **React 18** with TypeScript
- **React Router 7** with loaders/actions
- **TanStack Query** for server state management
- **TanStack Form** for form state management - I usually use React Hook Form but wanted to try this one
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Vite** for build tooling

### Backend (`apps/api`)

- **Go 1.23+**
- **MongoDB** for data persistence

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 9+
- Go 1.23+
- Docker Desktop (for MongoDB)

### Installation

```bash
pnpm install

docker compose up mongo

cd apps/api
# This will seed the mongo instance with some data
go run main.go

# Start frontend (in a separate terminal)
pnpm dev:web
```

### Access

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080
- **MongoDB:** mongodb://localhost:27017/zack

## Available Scripts

```bash
# Development
pnpm dev:web              # Start frontend dev server
pnpm build:web            # Build frontend for production
pnpm lint:web             # Lint frontend code

# Database
pnpm seed                 # Seed database with initial data
pnpm reseed               # Clear and re-seed database

# Backend (from apps/api)
go run main.go            # Start API server
go test ./...             # Run API tests
```

## Documentation

- **[Structure Guide](./docs/STRUCTURE.md)** - Project organization and architecture
- **[Development Workflow](./docs/WORKFLOW.md)** - Git workflow and CI/CD
- **[Docker Setup](./docs/DOCKER.md)** - Docker development environment
- **[Seeding Guide](./docs/SEEDING.md)** - Database seeding instructions

## Project Structure

```
.
├── apps/
│   ├── api/              # Go backend
│   │   ├── cmd/          # CLI commands (seed, reseed)
│   │   ├── internal/     # API implementation
│   │   └── main.go       # Entry point
│   └── web/              # React frontend
│       └── src/
│           ├── features/      # Feature-based organization
│           ├── components/    # Shared UI components
│           ├── data-access/   # TanStack Query hooks
│           ├── utils/         # Utilities
│           └── types/         # TypeScript types
├── docs/                 # Documentation
└── docker-compose.yml    # Docker configuration
```

## Key Features

### Feature-Based Architecture

Each user-facing feature is self-contained with:

- Page components and loaders
- Feature-specific components
- Context providers
- Loading states (skeletons)
- Public API exports

Example: `src/features/disc-golf/bags/`

### Data Layer

- Centralized TanStack Query hooks in `src/data-access/`
- Consistent query key management
- Separation of queries and mutations
- Type-safe API client

### Design System

- Custom clipped/beveled UI components
- Consistent color system with super cool tech noise overlays
- Responsive layouts with Tailwind
- Chart components built on Recharts

## Development Workflow

1. **Create a feature branch** from `staging`
2. **Make changes** and commit
3. **Open PR** to `staging` for review
4. **Test in staging** environment
5. **Promote to production** via `staging` → `main` PR

See [WORKFLOW.md](./docs/WORKFLOW.md) for details.

## Environment Variables

Copy `.env.example` and configure:

```bash
cd apps/api
cp .env.example .env
# Edit .env with your secrets
```

Required variables:

- `MONGODB_URI` - MongoDB connection string
- `AUTH_JWT_SECRET` - JWT signing secret
- `AUTH_TOTP_SECRET` - TOTP secret for 2FA
- `OWNER_USER_ID` - Primary user ID

## Contributing

This is a personal project, but feedback and suggestions are welcome! Please open an issue to discuss any significant changes.
