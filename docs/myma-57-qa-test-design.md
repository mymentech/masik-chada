# MYMA-57 QA Test Design

## Objective
Define executable test coverage for dues correctness, migration integrity, mobile donations, and auth access control for the Masik Chada rewrite, based on:
- [masik-chada-scoped-project-brief.md](/workspace/mymentech-agency/masik-chada-src/docs/masik-chada-scoped-project-brief.md)
- [masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt)

## Risk-First Regression Priorities
1. Incorrect dues logic (inclusive month and `due_from` precedence) causing wrong balances platform-wide.
2. Inconsistent outstanding balances across dashboard, donor details, donations, and reports.
3. Donation collection friction on mobile (tap targets, search lag, modal flow failures).
4. Migration data loss/corruption (counts, sample records, Bengali text fidelity).
5. Expired/invalid auth handling that leaks protected route access.

## Test Architecture Split
- Unit tests (backend and frontend utility level):
  - `calculateTotalDue`, `calculateBalance`, month math edge cases.
  - Serial number sequencing helper.
  - Search debounce behavior and filter predicates.
  - Auth token parsing/expiry guard utility.
- Integration tests (API + DB + resolver):
  - GraphQL auth gating and protected operation denial.
  - Donor create/edit/delete with cascading payment deletion.
  - Payment mutation updates derived balance correctly.
  - Reports totals match underlying donor/payment data.
  - Monthly cron recalculation handles bad records without process crash.
- Lightweight E2E (Playwright, mobile-first viewport):
  - Login -> donations search -> payment submit -> success/error behavior.
  - Protected route redirect on invalid/expired token.
  - Donor management happy path and delete confirmation.
  - Report month selection and PDF action availability.

## Acceptance Matrix

| Area | Scenario | Test Type | Data Setup | Expected Result |
| --- | --- | --- | --- | --- |
| Dues | No `due_from`, inclusive month counting | Unit + Integration | Donor reg: `2025-01-10`, monthly `100`, today `2026-04-01`, paid `0` | Total due `1600`, balance `1600` |
| Dues | `due_from` overrides `registration_date` | Unit + Integration | Reg: `2024-01-01`, `due_from: 2025-11-01`, monthly `200`, today `2026-04-01` | Due months counted from Nov 2025 inclusive -> 6 months -> total due `1200` |
| Dues | Future `due_from` should not create negative months | Unit | `due_from` later than current month | Total due `0`, no negative balance math |
| Dues | Partial payments reduce outstanding only | Integration | Total due known, paid sum `x` | Balance = `totalDue - x` |
| Balance Consistency | Dashboard and donor detail parity | Integration + E2E | Seed donor with 3 payments | Same outstanding value on both surfaces |
| Balance Consistency | Donations list and report parity | Integration + E2E | Seed month with payments | Outstanding and collected totals match API truth |
| Donations UX | Tap targets meet mobile requirement | E2E + Visual checks | Viewport 390x844 | Primary actions >= 48px hit area |
| Donations UX | Debounced search/filter behavior | Unit + E2E | 300ms debounce fixture | No query spam, results refresh after debounce window |
| Donations UX | Payment success flow | E2E | Valid payment mutation | Bengali success toast shown, modal closes, balance refreshes immediately |
| Donations UX | Payment failure flow | E2E | Force mutation error | Modal remains open, Bengali error shown, no success toast |
| Migration | Record count parity (users/donors/payments) | Integration (migration validation suite) | SQL snapshot and migrated Mongo | Counts match expected source totals |
| Migration | Sample-record field fidelity | Integration | Golden records with edge values | Critical fields map correctly, `due_from` default `null` when absent |
| Migration | Bengali text fidelity | Integration + snapshot | Known Bengali donor/user rows | UTF-8 content unchanged round-trip |
| Auth | Expired JWT blocks API and routes | Integration + E2E | Token expired by time travel | GraphQL returns auth error; UI clears auth and redirects `/login` |
| Auth | Missing bearer token blocked | Integration | Protected operation without token | Request denied consistently |

## Outstanding Balance Consistency Scenarios
Validate this set with shared fixtures and a single expected-balance source-of-truth assertion helper:
- Dashboard summary cards.
- Donor details modal/page.
- Donations list row balance.
- Reports monthly outstanding totals.

Each scenario must assert all rendered balances equal:
- `calculateTotalDue(donor, asOf) - sum(payments <= asOf)`

## Mobile Donations Flow Checks

### Functional checks
- One-tap donor row opens payment bottom sheet.
- Bottom sheet preloads donor details, current balance, default amount, payment date.
- Submit success path updates UI without manual refresh.
- Submit error path preserves user-entered values for retry.

### Interaction/perceived speed checks
- Search input debounce around 300ms.
- First meaningful list update under 500ms on baseline test profile.
- No double-submit on rapid tap (button disabled/spinner during mutation).

### Accessibility and usability checks
- Tap targets >= 48px for list rows, submit, close, and filters.
- Focus trap and dismissal behavior for bottom sheet.
- Readable Bengali typography with Hind Siliguri fallback chain available.

## Migration Validation Plan

### Pre-migration
- Create a migration manifest with source counts:
  - total users
  - total donors
  - total payments
- Identify 20-30 golden records across:
  - earliest/latest registration dates
  - donors with and without `due_from`
  - Bengali names/addresses with punctuation and numerals

### Post-migration automated checks
- Count parity assertion by collection.
- Referential integrity:
  - every payment has valid donor reference
  - every payment has valid collector reference
- Field mapping assertions:
  - donor `serial_number`, `monthly_amount`, `registration_date`, `due_from`
  - payment `amount`, `payment_date`
  - user `email`, hashed password presence
- Null/default behavior assertions:
  - missing amnesty source maps to `due_from: null`

### Manual sign-off checks
- Compare golden-record Bengali text fields byte-for-byte where possible.
- Open donor/report UI with migrated data and verify no mojibake.

## Auth Expiry and Protected Route Coverage
- API-level:
  - invalid signature token rejected
  - expired token rejected
  - missing token rejected
  - valid token accepted
- UI-level:
  - direct navigation to protected routes redirects to `/login`
  - auth state cleared on 401/expired response
  - post-login redirect to `/dashboard` works

## Proposed Test Fixtures
- `fixtures/donors/dues-boundary.json`: month boundaries, leap-year dates, `due_from` variants.
- `fixtures/payments/payment-ledger.json`: donor payment histories including overpayment and no-payment.
- `fixtures/migration/golden-records.json`: canonical rows from SQL mapped to expected Mongo documents.
- `fixtures/auth/tokens.ts`: valid, expired, tampered JWT builders.

## CI Acceptance Gates
1. Unit suite: dues math, debounce, auth utility (must pass 100%).
2. Integration suite: GraphQL auth + donor/payment/report + migration validation (must pass).
3. E2E smoke (mobile viewport): login, donations payment success/error, protected-route redirect.
4. Migration gate before production cutover:
   - count parity exact match
   - golden record validation pass
   - Bengali fidelity checks pass

## Defect Taxonomy For This Scope
- `DUES-LOGIC`: incorrect month math, incorrect `due_from` precedence, inconsistent balance formula.
- `MIGRATION-DATA`: count mismatch, dropped rows, wrong field mapping.
- `MIGRATION-I18N`: Bengali corruption/mojibake/normalization issues.
- `MOBILE-UX`: tap target, latency, double-submit, modal usability defects.
- `AUTH-ACCESS`: protected route leakage, token expiry handling defects.

## Handoff To QA Lead
This test design is execution-ready and split by unit/integration/E2E lanes with risk-first ordering. Engineering can begin implementing tests directly from the matrix and fixture plan during feature delivery.
