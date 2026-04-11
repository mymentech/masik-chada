# ADR-004: Monthly Cron Uses Derived Snapshots Only

## Status
Accepted

## Context

The spec requires a monthly cron job on the first day of the month and mentions creating dues records, but the scoped brief correctly flags that persisting monthly dues as authoritative would conflict with the canonical donor/payment calculation model. The system still needs a predictable monthly process for reporting support and operational reconciliation.

## Decision

Keep the monthly cron job, but constrain it to derived work only.

Allowed cron responsibilities:

- Recompute monthly donor due state from canonical donor and payment data
- Persist optional monthly reporting snapshots or caches
- Produce logs or summaries for operational review
- Be idempotent and safe to rerun

Disallowed cron responsibilities:

- Mutating an authoritative donor balance field
- Creating a second source of truth that overrides runtime calculations
- Making reports depend on stale data when canonical donor/payment data disagrees

If a snapshot collection is introduced, each row should be explicitly marked as derived and reproducible, keyed by donor and month, and written with upsert semantics.

## Implementation Guardrails

The execution guardrails for this decision are captured in:

- [Monthly Dues Cron Idempotency And Snapshot Guardrails](../runbooks/monthly-dues-cron-guardrails.md)

That runbook defines:

- Compute-only baseline and when optional snapshots are justified
- Snapshot unique key and upsert contract for rerun safety
- Per-donor failure isolation so one bad record cannot fail the full run
- Donor-delete cascade behavior for derived rows
- UTC month-boundary and schedule rules to avoid off-by-one errors

## Alternatives Considered

- No cron at all
  Rejected because the product spec explicitly requires monthly processing and reporting support.
- Cron as the primary balance writer
  Rejected because it creates drift, rerun complexity, and reconciliation failures.
- Separate queue/worker infrastructure for phase 1
  Rejected because job volume is low and the system does not yet need extra moving parts.

## Consequences

- Positive: cron supports reporting and observability without undermining balance correctness.
- Positive: reruns and recovery are simpler because outputs are reproducible from canonical inputs.
- Negative: runtime calculations still need to exist even if snapshots are present.
- Negative: engineering must resist using snapshots as shortcuts in user-facing balance reads.

## Trade-Offs

This keeps the operational requirement from the spec while preventing the most likely failure mode: a hidden second balance system that slowly diverges from payment reality.
