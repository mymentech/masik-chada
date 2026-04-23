# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masik Chada (মাসিক চাঁদা — "monthly subscription") is a donor/subscription management system for tracking donations, payments, and balances. The UI is in Bengali.

## Common Commands

### Development
```bash
# Backend (NestJS, port 5000)
cd backend && npm run start:dev

# Frontend (Vite/React, port 5173)
cd frontend && npm run dev
```

### Build (both sub-projects, used by Vercel)
```bash
npm run build
```

### Tests
```bash
# Backend unit tests
cd backend && npm test

# Backend — run a single test file
cd backend && npx vitest run src/donors/donors.service.spec.ts

# Frontend unit tests
cd frontend && npm test

# Frontend E2E (Playwright)
cd frontend && npm run test:e2e
```

### Jobs & Migrations
```bash
# Run the monthly snapshot job (dev)
cd backend && npm run jobs:monthly-snapshot:dev

# Sync donor serial counter after data migration
cd backend && npm run migration:sync-donor-serial-counter:dev
```

## Architecture

### Monorepo layout
- `backend/` — NestJS API (TypeScript)
- `frontend/` — React SPA (JavaScript/JSX, Vite)
- `api/index.js` — Vercel serverless entry point (thin wrapper over `backend/dist/serverless.js`)
- `nginx/` — reverse proxy config for Docker/VPS deployment
- `docker-compose.yml` — VPS deployment stack

### Backend (NestJS + Apollo GraphQL + TypeORM + PostgreSQL)

All GraphQL resolvers are protected by `GqlAuthGuard` registered as a global `APP_GUARD`. To make a resolver public, annotate it with the `@Public()` decorator (`src/common/decorators/public.decorator.ts`).

TypeORM `synchronize` is **`false`** — schema changes must be handled manually via SQL migrations against Supabase.

The `Donor` serial number comes from a PostgreSQL sequence `donor_serial_seq`. If donors are imported directly (bypassing the API), run `migration:sync-donor-serial-counter` to resync it.

Key modules:
| Module | Purpose |
|--------|---------|
| `AuthModule` | JWT login with in-memory brute-force throttling |
| `DonorsModule` | Donor CRUD + balance calculation |
| `PaymentsModule` | Payment records per donor |
| `DashboardModule` | Aggregate summary stats |
| `ReportsModule` | Monthly reports by collector |
| `JobsModule` | Monthly snapshot job + run-history entities |
| `HealthModule` | `/health` endpoint (public) |

Balance logic lives in `src/utils/calculate-dues.ts`. `total_due` is computed from `monthly_amount` and `due_from`/`registration_date`; `balance = total_due - total_paid`.

### Dual deployment entry points

| Environment | Entry point | How it boots |
|-------------|-------------|--------------|
| Docker/VPS | `backend/src/main.ts` | `NestFactory.create` + `app.listen` |
| Vercel serverless | `backend/src/serverless.ts` → `api/index.js` | Express adapter, lazy-initialised singleton |

The pool size is capped at 1 when `VERCEL` env var is set.

### Frontend (React + Apollo Client)

- All GraphQL operations are in `src/graphql/queries.js` and `src/graphql/mutations.js`.
- Auth token is stored in `localStorage` under the key `auth_token` and provided via `AuthContext` (`src/context/AuthContext.jsx`).
- `PrivateRoute` redirects unauthenticated users; `AppLayout` wraps all protected pages with the `Navbar`.

### Environment variables

Required at runtime (backend):
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `JWT_SECRET`

Optional with defaults:
- `DATABASE_SSL` (default `true`)
- `NODE_ENV` (default `production` in Docker)
- `CORS_ALLOWED_ORIGINS` — comma-separated list; empty = allow all in non-production
- `GRAPHQL_INTROSPECTION` / `GRAPHQL_PLAYGROUND` — default off in production
- `AUTH_LOGIN_MAX_ATTEMPTS` / `AUTH_LOGIN_WINDOW_MS` / `AUTH_LOGIN_LOCK_MS`
