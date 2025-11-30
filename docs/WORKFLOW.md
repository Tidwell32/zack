# Development Workflow

This monorepo uses a **staging → production** branching strategy.

## Branch Structure

- **`main`** - Production branch (source of truth, always deployable)
- **`staging`** - Testing/staging environment
- **`feature/*`** - Feature branches for new work

## Development Flow

### 1. Create a Feature Branch

```bash
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

### 2. Work on Your Feature

```bash
# Make changes
git add .
git commit -m "feat: your feature description"
```

### 3. Push and Create PR to Staging

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub: `feature/your-feature-name` → `staging`

- CI will run (lint, typecheck, build, tests)
- Once green, merge into `staging`

### 4. Test in Staging

After merging to `staging`:
- Staging environment auto-deploys (once configured)
- Test your changes thoroughly
- Fix any issues by repeating steps 1-3

### 5. Promote to Production

When `staging` is stable and ready:

```bash
# Open PR on GitHub: staging → main
```

- CI will run again
- Once approved and green, merge to `main`
- Production environment auto-deploys

## Quick Commands

```bash
# Start new feature
git checkout staging && git pull && git checkout -b feature/my-feature

# Update your feature branch with latest staging
git checkout staging && git pull
git checkout feature/my-feature
git merge staging

# Run tests locally before pushing
pnpm --filter @zack/web lint
pnpm --filter @zack/web build
cd apps/api && go test ./...
```

## CI/CD

- **CI runs on:** All PRs, pushes to `staging` and `main`
- **What it checks:**
  - Frontend: lint, typecheck, build, tests
  - Backend: tests, build

## Environment Strategy

| Branch    | Environment | Auto-Deploy | Purpose              |
|-----------|-------------|-------------|----------------------|
| `staging` | Staging     | Yes*        | Testing & validation |
| `main`    | Production  | Yes*        | Live/stable release  |

*Auto-deploy will be configured with Docker/Railway setup
