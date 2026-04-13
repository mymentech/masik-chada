# MYMA-78 QA Automation Execution Report

Related tickets: [MYMA-78](/MYMA/issues/MYMA-78), [MYMA-76](/MYMA/issues/MYMA-76), [MYMA-72](/MYMA/issues/MYMA-72), [MYMA-73](/MYMA/issues/MYMA-73), [MYMA-57](/MYMA/issues/MYMA-57)

## Latest Execution Snapshot (2026-04-12T12:15:34Z)

- Canonical regression runner:
  - Command: `./scripts/run-qa-regression.sh`
  - Artifact: `docs/operations/test-artifacts/qa-regression-20260412T121534Z.log`
  - Exit: `1` (blocked by E2E runtime dependency)

- Backend unit regression:
  - Command: `cd backend && npm test` (via runner)
  - Result: **PASS** (`14/14` tests)
- Frontend unit/integration:
  - Command: `cd frontend && npm ci --include=dev && npm test` (via runner)
  - Result: **PASS** (`11/11` tests)
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
  - `frontend/src/pages/Donations.test.jsx`
  - `frontend/src/pages/Donors.test.jsx`
  - `frontend/src/pages/Reports.test.jsx`
- Coverage:
  - Protected route redirects unauthenticated users to `/login`
  - Protected route allows authenticated users
  - Expired auth handling clears token and redirects to `/login`
  - No redirect loop while already on `/login`
  - Donations payment success and failure behavior
  - Donor create/update/delete flow behavior
  - Reports month-change query behavior
- Command: `cd frontend && npm test`
- Result: **PASS** (11/11 tests)

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

### D-001 (Resolved) — Donations payment flow and component-level automation are now implemented
- Owner: Frontend execution lane ([MYMA-72](/MYMA/issues/MYMA-72))
- Evidence:
  - `frontend/src/pages/Donations.jsx` implements donor search/select and payment submission mutation flow.
  - `frontend/src/pages/Donations.test.jsx` covers required flow hooks from [MYMA-57](/MYMA/issues/MYMA-57): donor select, payment input, submit mutation, success feedback, error feedback, selection reset after successful submit.
- Impact:
  - Feature-level regression coverage is available via React/Vitest tests.
  - End-to-end execution remains blocked only by runtime dependency issue tracked as D-002.

### D-004 (Resolved) — Donor CRUD automation gap closed at component level
- Owner: Frontend execution lane ([MYMA-72](/MYMA/issues/MYMA-72))
- Evidence:
  - `frontend/src/pages/Donors.test.jsx` now covers create, update, and delete flows with mutation/refetch assertions and confirmation handling.
- Impact:
  - CRUD acceptance is now covered in executable frontend automation pending E2E runtime availability.

### D-002 (Medium) — Playwright browser launch blocked in this runtime
- Owner: QA/DevOps runtime provisioning
- Evidence:
  - Latest canonical runner (`2026-04-12T12:15:34Z`) fails on browser startup:
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
  - `frontend/src/pages/Donations.test.jsx` (payment-flow automation for MYMA-57 hooks)
  - `frontend/src/pages/Donors.test.jsx` (create/update/delete donor automation)
  - `frontend/src/pages/Reports.test.jsx` (monthly report query/render automation)
- QA Operations:
  - `scripts/run-qa-regression.sh` consolidated regression runner with timestamped artifact logs under `docs/operations/test-artifacts/`
