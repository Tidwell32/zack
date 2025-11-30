# Project Structure Guide

This document explains the organization of the codebase and conventions used.

---

## Directory Organization

### `/src/features/` - Feature-Based Organization

All user-facing features are organized by domain and functionality. Each feature is self-contained with all related code in one place.

```
features/
├── disc-golf/                  # Disc golf domain
│   ├── bags/                   # Bags feature
│   │   ├── components/         # Feature-specific components
│   │   ├── providers/          # Context providers
│   │   ├── Bags.page.tsx       # Page component
│   │   ├── bags.loader.ts      # React Router loader
│   │   ├── BagsSkeleton.tsx    # Loading state
│   │   └── index.ts            # Public API barrel export
│   │
│   ├── throws/                 # Throws feature
│   ├── sessions/               # Sessions feature
│   ├── rounds/                 # Rounds feature
│   ├── DiscGolfLayout.tsx      # Shared layout
│   └── index.ts                # Domain barrel export
│
├── golf/                       # Golf feature
├── gym/                        # Gym feature
├── cooking/                    # Cooking feature
└── ...
```

**Barrel Files:**

- Each feature has an `index.ts` that exports its public API (page, loader, hooks)
- Component folders have their own `index.ts` for internal imports
- Domain folders re-export all features for convenience

---

### `/src/components/` - Shared UI Components

Global, reusable components used across multiple features.

```
components/
├── ui/                         # Reusable UI primitives
│   ├── Button.tsx
│   ├── ClippedButton.tsx
│   ├── TechNoise.tsx
│   ├── charts/                 # Chart components
│   ├── skeletons/              # Base skeleton components
│   └── table/                  # Table components
│
├── forms/                      # Form components
│   ├── fields/                 # Base form fields
│   └── Form*.tsx               # Form-connected fields
│
├── icons/                      # Icon components
└── layout/                     # Global layouts
    ├── RootLayout.tsx
    ├── HomeLayout.tsx
    └── PlaygroundLayout.tsx
```

**Rule:** Only truly shared/reusable components belong here. Feature-specific components live in `/features/`.

---

### `/src/utils/` - Utility Functions

Internal utility functions and helpers, organized by prefix for clarity.

```
utils/
├── api.client.ts               # Axios API client
├── api.env.ts                  # Environment variables
├── hook.createUseQuery.ts      # Query hook factory
├── hook.createUseSuspenseQuery.ts
├── ui.accents.tsx              # UI accent configurations
├── ui.bevelUtils.ts            # Bevel border calculations
├── ui.clippedUtils.ts          # Clipped shape utilities
├── ui.designConstants.ts       # Design tokens
├── ui.renderLayeredBorder.tsx  # Layered border component
├── discGolf.discUtils.ts       # Disc-specific utilities
├── discGolf.formatting.ts      # Disc golf formatters
├── discGolf.throwMetricColors.ts
├── format.date.ts              # Date formatting
├── loaderHelpers.ts            # React Router helpers
└── utils.ts                    # Generic helpers (cn, etc.)
```

**Naming Convention:**

- `[category].[description].ts` - Prefixed by category (api, hook, ui, discGolf, format)
- No prefix = generic/shared utilities

---

### `/src/lib/` - External Library Configurations

Configuration and setup for external libraries.

```
lib/
├── chartConstants.ts           # Recharts configuration
└── queryClient.ts              # TanStack Query client
```

**Rule:** `/lib/` is for configuring external libraries, `/utils/` is for internal helper functions.

---

### `/src/data-access/` - API Layer

TanStack Query hooks and API fetch functions, organized by entity.

```
data-access/
├── bags/
│   ├── queries/
│   │   ├── useBags.ts
│   │   └── fetchBags.ts
│   ├── mutations/
│   │   ├── useCreateBag.ts
│   │   └── useDeleteBag.ts
│   └── index.ts
│
├── discs/
├── techdisc/
└── udisc/
```

---

### `/src/hooks/` - Global Hooks

Hooks that are used across multiple features.

```
hooks/
├── useClippedShape.ts
└── ...
```

**Rule:** Feature-specific hooks live in the feature folder. Only truly shared hooks belong here.

---

### `/src/types/` - Global Type Definitions

TypeScript types and interfaces, organized by domain.

```
types/
├── bags.ts
├── discs.ts
├── throws.ts
└── ...
```

---

### `/src/features/home/` - Top-Level Pages

Top-level pages are organized as features when they contain substantial logic and components. Each represents a distinct section of the application.

```
features/
├── home/
│   ├── About.page.tsx
│   ├── Projects.page.tsx
│   ├── Playground.page.tsx
│   └── components/          # Feature-specific components
│
├── disc-golf/               # Complex domain feature
│   ├── sessions/            # Sub-feature with its own route
│   │   ├── Sessions.page.tsx
│   │   ├── components/
│   │   ├── providers/
│   │   └── sessions.loader.ts
│   ├── rounds/
│   ├── throws/
│   └── bags/
│
└── ...
```

**Rationale:**
- Pages live within features, co-located with their related logic
- Complex features (like disc-golf) have sub-features with their own `.page.tsx` files
- Each `.page.tsx` is the entry point for a route, but lives alongside its components and providers
- This keeps related code together rather than separating pages from their implementation

---

## Import Conventions

### Feature Imports

```typescript
// Import from feature public API
import { Bags, bagsLoader } from "@/features/disc-golf/bags";

// Import entire domain
import {
  Bags,
  bagsLoader,
  Throws,
  throwsLoader,
  DiscGolfLayout,
} from "@/features/disc-golf";
```

### Component Imports

```typescript
// Within a feature, use relative imports
import { DiscList, DiscGrid } from "./components";

// From other features, use absolute imports
import { Button } from "@/components/ui/Button";
import { LineChart } from "@/components/ui/charts";
```

### Utility Imports

```typescript
import { cn } from "@/utils/utils";
import { formatDate } from "@/utils/format.date";
import { COLORS } from "@/utils/ui.designConstants";
```

---

## File Naming Conventions

| Type           | Convention                   | Example                              |
| -------------- | ---------------------------- | ------------------------------------ |
| **Components** | PascalCase                   | `DiscList.tsx`, `Button.tsx`         |
| **Pages**      | PascalCase + `.page` suffix  | `Bags.page.tsx`, `About.page.tsx`    |
| **Hooks**      | camelCase + `use` prefix     | `useClippedShape.ts`, `useBags.ts`   |
| **Utils**      | camelCase (with prefix)      | `ui.bevelUtils.ts`, `format.date.ts` |
| **Types**      | camelCase                    | `bags.ts`, `discs.ts`                |
| **Loaders**    | camelCase + `.loader` suffix | `bags.loader.ts`, `throws.loader.ts` |
| **Tests**      | Same as source + `.test`     | `DiscList.test.tsx`                  |
| **Folders**    | kebab-case                   | `disc-golf/`, `golf/`                |

---

## When to Create a New Feature

Create a new feature when:

- It's a distinct user-facing functionality
- It has its own route(s)
- It requires multiple components and state management
- It's likely to grow independently

**Example:** `bags`, `throws`, `sessions` are all separate sub-features within the `disc-golf` domain.

### Feature vs Sub-feature Structure

**Top-level feature** (e.g., `features/home/`, `features/disc-golf/`):
- Represents a major domain or section of the app
- May contain multiple routes/pages
- Can have sub-features for complex domains

**Sub-feature** (e.g., `disc-golf/sessions/`, `disc-golf/bags/`):
- Part of a larger domain feature
- Has its own `.page.tsx` route component
- Contains components, providers, and loaders specific to that route
- Lives within its parent feature for domain cohesion

**When to use sub-features:**
- Multiple related routes within a single domain (disc-golf: sessions, rounds, throws, bags)
- Each route has its own complexity (components, state, loaders)
- Shared domain logic exists (DiscGolfLayout, shared types)

---

## When to Create a Shared Component

Move a component to `/components/` when:

- It's used in 2+ different features
- It's a generic UI pattern (buttons, tables, forms)
- It has no feature-specific logic

**Example:** `Button`, `ClippedButton`, `LineChart` are shared. `DiscList` is feature-specific.

---

## Context Providers

**Create a provider when:**

- Multiple sibling components need shared state
- State persists across navigation within a feature
- Prop drilling exceeds 2 levels

**Don't create a provider when:**

- React Query already manages the data
- Only one component needs the state
- State should sync with URL (use loaders/search params)

**Location:** Co-located with feature in `providers/` subdirectory

---

## Quick Reference

### Finding Code

| Looking for...       | Check...                       |
| -------------------- | ------------------------------ |
| Bags sub-feature     | `src/features/disc-golf/bags/` |
| About page           | `src/features/home/`           |
| Shared button        | `src/components/ui/Button.tsx` |
| API calls for bags   | `src/data-access/bags/`        |
| Bag types            | `src/types/bags.ts`            |
| Date formatting      | `src/utils/format.date.ts`     |
| Chart config         | `src/lib/chartConstants.ts`    |

### Adding New Code

| Adding...          | Put it in...                                  |
| ------------------ | --------------------------------------------- |
| New feature        | `src/features/[domain]/[feature]/`            |
| Reusable component | `src/components/ui/`                          |
| Feature component  | `src/features/[domain]/[feature]/components/` |
| API hook           | `src/data-access/[entity]/`                   |
| Utility function   | `src/utils/[category].[name].ts`              |
| Type definition    | `src/types/[entity].ts`                       |
