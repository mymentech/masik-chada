# MYMA-80 QA Quality Gate Review

## Scope and Evidence Window

- Issue: [MYMA-80](/MYMA/issues/MYMA-80)
- Parent: [MYMA-76](/MYMA/issues/MYMA-76)
- Reviewed surface: `backend/src`, `frontend/src`, `docs/validation`, `docs/myma-57-qa-test-design.md`
- Evidence run completed:
  - `python3 backend/validation/dues_oracle.py` -> `VALIDATION PASSED (9 cases)`
  - `./scripts/run-qa-regression.sh` -> backend `PASS (12/12)`, frontend unit `PASS (4/4)`, frontend E2E `FAIL` due missing `libglib-2.0.so.0`

## Release Gate (Current Wave)

| Gate | Requirement | Evidence Required | Current Status | Decision |
| --- | --- | --- | --- | --- |
| G1 | Dues logic correctness and parity across surfaces | Dues oracle pass + API parity checks | Oracle exists and passes; parity checks across dashboard/donations/reports not automated | Conditional pass |
| G2 | Donor CRUD + amnesty (`due_from`) flow | Executable donor create/edit/delete UI/API tests | Backend API exists; frontend donor management page is placeholder | Fail |
| G3 | Mobile-first donations flow | Mobile donor list, one-tap payment flow, success/error UX evidence | Donations page is placeholder; no flow implemented | Fail |
| G4 | Reports + PDF readiness | Monthly totals, collector breakdown, PDF generation evidence | Reports UI placeholder; backend monthly aggregation has defects | Fail |
| G5 | Auth/access controls | Login, protected routes, invalid-token redirect evidence | Backend login/public route and protected guard present; frontend private route and 401 handling present | Pass (manual) |
| G6 | Migration data and i18n integrity | Count parity, golden records, Bengali fidelity checks | Validation design docs exist, but no executed migration validation output in repo | Fail |
| G7 | Automated regression in CI | Unit/integration/E2E suites and pass artifacts | Unit suites execute via runner and pass; E2E still blocked by missing OS library for Playwright Chromium (`libglib-2.0.so.0`) | Fail |

### Gate Outcome

- **Release recommendation: NO-GO** for production deployment.
- Blocking gates: `G2`, `G3`, `G4`, `G6`, `G7`.

## Requirement Traceability (Refresh of MYMA-58 Scope)

| Requirement | Source Expectation | Implementation Evidence | Status |
| --- | --- | --- | --- |
| FR-01 | Donor dues use `due_from` when present, else `registration_date`, with inclusive month counting | `calculateTotalDue` implements `due_from` precedence and inclusive month count in [calculate-dues.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/utils/calculate-dues.ts:22) | Implemented |
| FR-02 | Donor payments reduce outstanding balance consistently | Donor balance uses `total_due - total_paid` in [donors.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/donors/donors.service.ts:187) | Partially verified |
| FR-03 | Sequential `serial_number` allocation | Counter bootstraps to max donor serial via `$max` then allocates with atomic `$inc` in [donors.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/donors/donors.service.ts:219) | Implemented |
| FR-04 | Donor delete cascades payment delete | `deleteMany` before donor delete in [donors.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/donors/donors.service.ts:97) | Implemented |
| FR-05 | Protected GraphQL operations with public `login` | `@Public()` on login in [app.resolver.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/app.resolver.ts:87), guard in [gql-auth.guard.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/common/guards/gql-auth.guard.ts:8) | Implemented |
| FR-06 | Frontend redirects unauthenticated users to `/login` | Route guard in [PrivateRoute.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/components/PrivateRoute.jsx:8), Apollo unauth redirect in [apolloClient.js](/workspace/mymentech-agency/masik-chada-src/frontend/src/api/apolloClient.js:20) | Implemented |
| FR-07 | Mobile-first donations one-tap collection workflow | Placeholder content only in [Donations.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Donations.jsx:1) | Missing |
| FR-08 | Donor management UI for add/edit/delete and amnesty | Placeholder content only in [Donors.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Donors.jsx:1) | Missing |
| FR-09 | Monthly report totals, collector breakdown, PDF capability | Report page placeholder in [Reports.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Reports.jsx:1); backend aggregation mapping corrected in [reports.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/reports/reports.service.ts:22) with regression test in [reports.service.spec.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/reports/reports.service.spec.ts:1) | Backend fixed; frontend missing |
| FR-10 | Monthly cron recalculation resilience | In-process scheduler added in [monthly-snapshot.scheduler.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/jobs/monthly-snapshot.scheduler.ts:1) with unit coverage in [monthly-snapshot.scheduler.spec.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/jobs/monthly-snapshot.scheduler.spec.ts:1) | Implemented |

## QA Defect Ledger (Execution Taxonomy)

| Defect ID | Taxonomy | Severity | Status | Finding | Evidence |
| --- | --- | --- | --- | --- | --- |
| QA-001 | MOBILE-UX | Critical | Open | Donations mobile collection flow is not implemented; current page is informational placeholder only. | [Donations.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Donations.jsx:1) |
| QA-002 | AUTH-ACCESS | Medium | At risk | Auth controls exist, but no automated regression suite verifies expired-token, invalid-token, and protected-route redirect behavior end-to-end. | [PrivateRoute.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/components/PrivateRoute.jsx:8), [apolloClient.js](/workspace/mymentech-agency/masik-chada-src/frontend/src/api/apolloClient.js:20) |
| QA-003 | DUES-LOGIC | High | Closed | Monthly report aggregation field mapping corrected (`totals[0].collected`, collector `_id` mapping) and regression tested. | [reports.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/reports/reports.service.ts:22), [reports.service.spec.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/reports/reports.service.spec.ts:1) |
| QA-004 | DUES-LOGIC | High | Closed | Serial allocation now aligns counter to max existing serial then atomically increments, removing first-run bootstrap race behavior. | [donors.service.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/donors/donors.service.ts:219), [donors.service.spec.ts](/workspace/mymentech-agency/masik-chada-src/backend/src/donors/donors.service.spec.ts:1) |
| QA-005 | MIGRATION-DATA | Critical | Open | Migration validation cases are documented, but no executable migration pipeline output, parity report, or quarantine report is present for current wave sign-off. | [migration-validation-cases.md](/workspace/mymentech-agency/masik-chada-src/docs/validation/migration-validation-cases.md:1) |
| QA-006 | MIGRATION-I18N | High | Open | Bengali fidelity is declared as a requirement but no committed automated checks/snapshots validate UTF-8 preservation on migrated records. | [migration-validation-cases.md](/workspace/mymentech-agency/masik-chada-src/docs/validation/migration-validation-cases.md:1) |
| QA-007 | MOBILE-UX | High | Open | Donor management and reports frontends are placeholders, so acceptance criteria for tap-first workflows and reporting cannot be executed. | [Donors.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Donors.jsx:1), [Reports.jsx](/workspace/mymentech-agency/masik-chada-src/frontend/src/pages/Reports.jsx:1) |
| QA-008 | QA-INFRA | Medium | Open | Playwright E2E cannot launch Chromium in current runtime because required shared library `libglib-2.0.so.0` is missing. | [qa-myma-78-automation-report.md](/workspace/mymentech-agency/masik-chada-src/docs/operations/qa-myma-78-automation-report.md:1) |

## Missing Test and Observability Hooks That Weaken Sign-Off

- Playwright runtime dependencies are incomplete on current host (missing `libglib-2.0.so.0`), blocking E2E execution.
- No CI evidence artifact paths for unit/integration/E2E pass-fail status.
- No migration run summary artifact committed (count parity, quarantine counts, Bengali fidelity checks).
- No explicit telemetry hooks around auth failures and payment mutation failure rates for release monitoring.

## Required Closure Criteria Before Re-Review

1. Implement the missing frontend workflows for donations, donors, and reports (including PDF behavior).
2. Add executable automated suites for dues logic, auth/access, and mobile donation flow.
3. Produce migration validation outputs (count parity + golden record + Bengali fidelity) as artifacts.
4. Re-run gate evidence and update this document with pass results.

## QA Lead Handoff

- Deliverable prepared for [MYMA-80](/MYMA/issues/MYMA-80).
- Recommendation to QA Lead: keep parent [MYMA-76](/MYMA/issues/MYMA-76) in execution with blockers tracked against defects `QA-001` through `QA-008`.
