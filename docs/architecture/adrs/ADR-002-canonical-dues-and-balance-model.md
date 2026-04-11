# ADR-002: Canonical Dues And Balance Model

## Status
Accepted

## Context

The source spec identifies dues calculation as the most critical defect in the legacy product. The scoped brief also highlights ambiguity around monthly dues records: the spec references cron-created dues records, but the defined data model only includes donors, payments, and users. Allowing multiple authoritative balance sources would create correctness drift across screens and reports.

## Decision

Make `backend/src/utils/calculateDues.js` the single source of truth for dues and balances.

Authoritative inputs:

- Donor start date: `due_from` when present, otherwise `registration_date`
- Donor `monthly_amount`
- Persisted payment records
- Evaluation date

Authoritative outputs:

- `totalDue`
- `totalPaid`
- `outstandingBalance`

Rules:

- Month counting is inclusive of both the start month and current month.
- Outstanding balance is always `totalDue - totalPaid`.
- No separate running balance column or dues ledger may override donor/payment-derived results.
- Any persisted monthly artifact is derived data only and may be regenerated.

## Alternatives Considered

- Store and update a running balance on each donor
  Rejected because it creates sync risk, especially during migration, manual fixes, and cron jobs.
- Maintain a first-class dues ledger as the primary balance source
  Rejected for phase 1 because the spec does not define a complete authoritative dues model and it would create two reconciliation surfaces.
- Calculate balances independently in frontend and backend
  Rejected because correctness must be centralized and consistent across all clients.

## Consequences

- Positive: one auditable business rule path for all screens, reports, and mutations.
- Positive: migration remains simpler because truth is reconstructed from donors and payments rather than imported from unreliable derived balances.
- Negative: some queries may need aggregation work at read time.
- Negative: reporting performance may require cached derived snapshots later, but those caches cannot become authoritative.

## Trade-Offs

This decision sacrifices some reporting convenience in exchange for correctness and simpler reasoning. That is the right trade for a donation system where a wrong balance is worse than a slower administrative report.
