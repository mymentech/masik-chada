# SRE Readiness Plan: First Deploy (`subscription.mymentech.com`)

## Purpose

Define operational readiness for first production deployment on single-host Docker Compose, including healthchecks, runtime validation, cutover/rollback guidance, and minimum observability checks.

## Deployment Assumptions

- Single host with Docker Compose.
- Public entrypoint is Nginx.
- `/` routes to frontend; `/graphql` routes to backend.
- MongoDB remains private on the internal Compose network.
- First deploy includes one-time SQL-to-Mongo seed/import path.

## Service Healthcheck And Readiness Design

### MongoDB

Readiness criteria:
- Container is `healthy`.
- Authenticated ping succeeds.
- Primary write/read path available.

Suggested healthcheck command:
- `mongosh --quiet --eval "db.adminCommand({ ping: 1 }).ok" | grep 1`

Operational gate:
- Backend must not be marked ready until MongoDB healthcheck is passing.

### Backend (Express + Apollo)

Readiness criteria:
- Process accepts connections.
- GraphQL endpoint responds at `/graphql`.
- DB dependency check succeeds.
- Startup tasks that must be complete before serving traffic are complete.

Recommended endpoints:
- `GET /health/live`: process liveness only.
- `GET /health/ready`: dependency-aware readiness (`db`, config, key runtime preconditions).

Operational gate:
- Nginx should route to backend only when `ready` succeeds.

### Frontend (React static app)

Readiness criteria:
- Nginx serves index content for `/`.
- Static assets are served without 5xx.

Suggested check:
- `curl -fsS http://frontend/ | grep -i "<html"`

Operational gate:
- External cutover only after frontend returns 200 and backend `/health/ready` is passing through Nginx routing.

### Nginx Reverse Proxy

Readiness criteria:
- Config test passes (`nginx -t`).
- Internal upstream checks succeed.
- Public host routes:
  - `/` -> frontend
  - `/graphql` -> backend

Suggested check:
- `curl -fsS http://localhost/graphql -H 'Content-Type: application/json' -d '{"query":"{__typename}"}'`

Operational gate:
- Nginx is the final readiness gate before DNS/traffic cutover.

## Runtime Validation Checklist

### A. Pre-Deploy (No Traffic Shift)

- Verify `.env` completeness and secrets presence.
- Confirm image digests/tags and compose file version locked for release.
- Confirm MongoDB data volume mount path exists and backup path is writable.
- Confirm seed/import artifact checksum and row count expectations.
- Confirm rollback artifact exists for previous release (or baseline snapshot for first release).

### B. First Deploy Sequence

1. Start MongoDB only; wait for healthy status.
2. Start backend with readiness endpoint enabled; verify `/health/live` then `/health/ready`.
3. Run seed/import task once; capture summary (inserted, skipped, failed rows).
4. Start frontend and Nginx.
5. Validate routing via localhost and host header for `subscription.mymentech.com`.
6. Execute GraphQL smoke tests:
   - login mutation (known admin account)
   - donor query
   - payment mutation on test donor (or controlled dry-run account)
7. Validate Bengali text rendering on landing/login/dashboard.
8. Validate cron registration is single-instance and not duplicated across restarts.

### C. Post-Deploy Runtime Checks

- Container status: all required services `running` and `healthy`.
- App-level checks:
  - `/health/ready` latency remains stable.
  - GraphQL success ratio healthy for core operations.
- Data checks:
  - Seed totals reconcile with source expectations.
  - `due_from` null/default integrity preserved.
- UX checks:
  - Mobile donation workflow loads and records payment.

## Cutover Expectations For Single-Host Compose

Expected downtime class:
- Brief downtime is acceptable during restart/recreate windows on a single host.
- True zero-downtime should not be promised without blue/green or dual-host strategy.

Practical target:
- Keep user-visible interruption under 1-3 minutes for normal deploy.

Mitigations:
- Pull images before restart window.
- Stage migrations/import before opening traffic where possible.
- Restart in dependency order (DB -> backend -> frontend -> Nginx).
- Use explicit health gates before progressing to next service.

## Rollback Strategy And Failure Modes

### Rollback Triggers

- Repeated backend readiness failures beyond timeout budget.
- GraphQL core smoke tests fail after deploy.
- Misrouting (`/graphql` or `/` incorrect upstream behavior).
- Data import failure crosses accepted error threshold.

### Rollback Procedure

1. Freeze new deploy actions and record current failure state.
2. Re-point stack to previous known-good image tags/compose config.
3. Restart services in dependency order and validate readiness.
4. If first deploy import corrupted target DB state, restore from pre-import MongoDB backup/snapshot.
5. Re-run smoke checks and restore public traffic.
6. Preserve failure logs and import summaries for postmortem.

### Key Failure Modes And Mitigations

- Seed job starts before backend/DB dependencies are stable.
  - Mitigation: run seed only after DB healthy and backend dependency checks pass.
- Partial startup: frontend reachable but API unavailable.
  - Mitigation: readiness-gated startup and smoke checks before cutover.
- Misrouted Nginx paths.
  - Mitigation: explicit route smoke tests for `/` and `/graphql` before opening traffic.
- Duplicate cron registration after restart.
  - Mitigation: startup log assertion for single scheduler registration.
- Data drift after import retries.
  - Mitigation: idempotent import behavior, unique keys, and reconciliation report.

## Minimum Observability To Declare Healthy

### Structured Logs (Required)

Log format: JSON, UTC timestamps, request correlation id.

Mandatory log fields:
- `timestamp`, `level`, `service`, `environment`, `version`, `message`
- Request logs: `request_id`, `method`, `path`, `status_code`, `duration_ms`, `client_ip`
- GraphQL logs: `operation_name`, `operation_type`, `error_code`
- Job logs: `job_name`, `run_id`, `result`, `duration_ms`

### Metrics (Required)

- Availability:
  - HTTP success/error counts by service.
  - GraphQL operation success/failure counts.
- Latency:
  - P50/P95 request latency for backend.
  - `/health/ready` latency.
- Saturation:
  - CPU/memory for all containers.
  - Restart counts.
- Data pipeline:
  - Seed/import inserted/skipped/failed counters.

### Alerting Minimums (Initial)

- Critical:
  - Backend readiness failing continuously for 5m.
  - Nginx 5xx rate > 5% for 5m.
  - MongoDB unavailable for 2m.
- Warning:
  - Container restarts > 3 in 15m.
  - GraphQL error rate > 2% for 10m.
  - P95 backend latency above threshold (set from baseline).

## Go-Live Acceptance Gates

All must pass:
- All service healthchecks green.
- Routing smoke tests green for `/` and `/graphql`.
- Core GraphQL smoke tests pass.
- Seed reconciliation report reviewed with acceptable error threshold.
- Alerts configured and test-fired at least once.
- Rollback command sequence tested in staging or dry run.

## Chaos And Resilience Drills (Post-Go-Live Week 1)

1. Kill backend container during live traffic simulation.
   - Expected: automatic restart, temporary error spike, recovery without manual DB repair.
2. Simulate MongoDB unavailability for 60 seconds.
   - Expected: backend readiness flips to not-ready, requests fail fast, recovery restores service.
3. Misroute `/graphql` in Nginx test config.
   - Expected: synthetic checks detect within 1 minute; rollback procedure restores route.
4. Re-run seed in dry-run/idempotency mode.
   - Expected: no duplicate donor/payment insertion.

Success criteria:
- Detection via monitoring within SLA.
- Runbook execution time recorded.
- No unrecoverable data corruption.

## Handoff Summary For DevOps Lead

- Reliability baseline is readiness-gated startup with explicit dependency ordering.
- First deploy risk is concentrated in seed timing, route correctness, and partial startup visibility.
- Downtime expectations must be framed as brief interruption on single-host Compose, with rollback optimized for speed and clarity.
