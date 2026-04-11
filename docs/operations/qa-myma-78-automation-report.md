# MYMA-78 QA Automation Execution Report

Related tickets: [MYMA-78](/MYMA/issues/MYMA-78), [MYMA-76](/MYMA/issues/MYMA-76), [MYMA-72](/MYMA/issues/MYMA-72), [MYMA-73](/MYMA/issues/MYMA-73), [MYMA-57](/MYMA/issues/MYMA-57)

## Latest Execution Snapshot (2026-04-11T21:15:54Z)

- Canonical regression runner:
  - Command: `./scripts/run-qa-regression.sh`
  - Artifact: `docs/operations/test-artifacts/qa-regression-20260411T211554Z.log`
  - Exit: `1` (blocked by E2E runtime dependency)

- Backend unit regression:
  - Command: `cd backend && npm test` (via runner)
  - Result: **PASS** (`14/14` tests)
- Frontend unit/integration:
  - Command: `cd frontend && npm ci --include=dev && npm test` (via runner)
  - Result: **PASS** (`4/4` tests)
- Frontend E2E mobile smoke:
  - Command: `cd frontend && npm run test:e2e` (via runner)
  - Result: **FAIL**
  - Error: Playwright Chromium launch blocked by missing system library: `libglib-2.0.so.0`.

## Delivered Automation

### Backend unit regression (dues oracle)
- Harness: `vitest` in `backend/`
- Files:
  - `backend/src/utils/calculate-dues.spec.ts`
  - `backend/src/reports/reports.service.spec.ts`
  - `backend/src/donors/donors.service.spec.ts`
  - `backend/src/jobs/monthly-snapshot.scheduler.spec.ts`
- Coverage: DUES-001 through DUES-009 from `docs/validation/dues-regression-matrix.md` plus invalid-date guardrail
- Command: `cd backend && npm test`
- Result: **PASS** (14/14 tests)

### Frontend auth unit/integration checks
- Harness: `vitest` + `jsdom` + React Testing Library in `frontend/`
- Files:
  - `frontend/src/components/PrivateRoute.test.jsx`
  - `frontend/src/api/apolloClient.test.js`
- Coverage:
  - Protected route redirects unauthenticated users to `/login`
  - Protected route allows authenticated users
  - Expired auth handling clears token and redirects to `/login`
  - No redirect loop while already on `/login`
- Command: `cd frontend && npm test`
- Result: **PASS** (4/4 tests)

### Lightweight E2E mobile smoke
- Harness: Playwright in `frontend/`
- Files:
  - `frontend/playwright.config.ts`
  - `frontend/tests/e2e/mobile-donations.spec.ts`
- Coverage:
  - Mobile viewport access to `/donations` for authenticated session
  - Validates current screen rendering and Bengali heading visibility
- Command: `cd frontend && npm run test:e2e`
- Result: **BLOCKED** by runtime dependency issue (see Defect D-002)

## Defects / Gaps

### D-001 (High) — Donations payment flow is not implemented, so MYMA-57 payment-flow automation is not yet possible
- Owner: Frontend execution lane ([MYMA-72](/MYMA/issues/MYMA-72))
- Evidence:
  - `frontend/src/pages/Donations.jsx` currently renders placeholder copy only.
  - Missing test targets for required flow hooks from [MYMA-57](/MYMA/issues/MYMA-57): donor search, donor select, payment input, submit mutation, success/error feedback, immediate balance refresh.
- Impact:
  - Full mobile payment-flow regression automation cannot be executed yet; only route-level smoke is possible.

### D-002 (Medium) — Playwright browser launch blocked in this runtime
- Owner: QA/DevOps runtime provisioning
- Evidence:
  - Latest canonical runner (`2026-04-11T21:15:54Z`) fails on browser startup:
    - `chrome-headless-shell: error while loading shared libraries: libglib-2.0.so.0`
- Impact:
  - E2E suite is authored but cannot execute in current environment until runtime libraries are installed.

### D-003 (Low) — Frontend test execution requires explicit dev-dependency install in runtime
- Owner: DevOps/runtime provisioning
- Evidence:
  - `NODE_ENV=production` in runtime causes `npm ci` to omit dev dependencies unless `--include=dev` is set.
  - Regression runner now includes `npm ci --include=dev` before frontend test execution.
- Impact:
  - Without this step, frontend unit tests fail with `vitest: not found`.
  - Runner mitigates the issue for reproducible QA execution.

## Added/Updated Test Tooling
- Backend:
  - `backend/package.json` scripts for `test` / `test:watch`
  - `backend/vitest.config.ts`
- Frontend:
  - `frontend/package.json` scripts for `test`, `test:watch`, `test:e2e`
  - `frontend/vitest.config.js`
  - `frontend/src/test/setup.js`
  - `frontend/src/api/apolloClient.js` (exported auth-error helper for deterministic tests)
- QA Operations:
  - `scripts/run-qa-regression.sh` consolidated regression runner with timestamped artifact logs under `docs/operations/test-artifacts/`
