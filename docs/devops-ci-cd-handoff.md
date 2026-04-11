# DevOps CI/CD Handoff

This CI baseline introduces GitHub Actions checks aligned to QA acceptance gates.

## Added

- `.github/workflows/ci.yml`

## Pipeline Lanes

- `backend-tests`
  - Node 20 setup
  - `npm ci`
  - `npm run lint --if-present`
  - `npm run test:unit` (required)
  - `npm run test:integration` (required)

- `frontend-tests`
  - Node 20 setup
  - `npm ci`
  - `npm run lint --if-present`
  - `npm run test:unit` (required)
  - `npm run test:e2e:smoke` (required mobile smoke gate)

- `migration-gate`
  - Runs `scripts/ci/migration-gate.sh` when present/executable.
  - Intended to enforce: count parity, golden records, Bengali fidelity.

- `docker-build`
  - Validates backend/frontend Docker image builds when both Dockerfile and package metadata exist.

## Notes For DevOps Lead

- Current workflow is intentionally conditional for this pre-implementation repository state.
- Once backend/frontend code is committed, ensure required scripts exist:
  - `test:unit`
  - `test:integration` (backend)
  - `test:e2e:smoke` (frontend)
- Add `scripts/ci/migration-gate.sh` to activate the production cutover migration gate.
