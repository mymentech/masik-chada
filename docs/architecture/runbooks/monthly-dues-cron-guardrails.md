# Monthly Dues Cron Idempotency And Snapshot Guardrails

## Purpose

Define execution constraints for `backend/src/jobs/recalcDues.js` so monthly cron processing remains safe, reproducible, and non-authoritative for donor balances.

## Canonical Rule

- Authoritative balance is always derived from donor + payment data using `calculateDues`.
- Cron outputs are derived artifacts only (operational summaries or optional report snapshots).
- If derived artifacts disagree with canonical runtime calculation, canonical runtime calculation wins.

## Schedule And Time Rules

- Cron schedule: `1 0 1 * *` (00:01 on the first day of each month).
- Use UTC for month boundaries and key generation.
- Compute target month as `YYYY-MM` from UTC month start.
- Never derive month keys from local server timezone.

## Idempotency Contract

- Job must be safe to rerun for the same month.
- If snapshot persistence is enabled, use a unique key:
  - `donor_id`
  - `month_key` (`YYYY-MM`)
- Writes must use upsert semantics (`setOnInsert` + deterministic derived fields).
- Re-running the job must not create duplicate rows.

## Allowed Responsibilities

- Enumerate donors and compute month-scoped derived values.
- Persist derived snapshot rows keyed by donor + month.
- Emit operational summary logs and counters.
- Continue processing when a single donor row fails.

## Forbidden Responsibilities

- Writing an authoritative donor balance field.
- Treating snapshot rows as the source of truth for dashboard/donor/payment views.
- Blocking runtime balance queries on snapshot availability.

## Failure Isolation And Recovery

- One donor failure must not fail the full run.
- Capture per-donor error with donor identifier and month key.
- Return run summary containing:
  - total donors scanned
  - successful writes
  - failed donors
  - job duration
- Persist last successful run metadata for observability.

## Data Lifecycle Rules

- On donor deletion, related derived snapshot rows must be removed or ignored by queries.
- Snapshot schema changes must be additive and backward-compatible during rollout.
- Snapshots older than retention threshold may be archived, but canonical donor/payment data must remain intact.

## Verification Checklist

- Same-month rerun produces zero duplicate rows.
- Balance returned by runtime query equals canonical formula for sampled donors.
- Cron logs include start, completion, and failure counts.
- Running cron with one malformed donor does not terminate the process.
- Month key stays stable across hosts with different local timezones.

## QA Handoff Notes

- Treat this runbook as acceptance criteria for cron-related implementation and test cases.
- Any implementation that creates or consumes a second authoritative balance source fails QA.
