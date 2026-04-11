# ADR-003: Stable GraphQL Contract For Web And Android

## Status
Accepted

## Context

The frontend will ship first, but the API must later support Android without schema churn. The system is a single GraphQL endpoint protected by JWT, and the most latency-sensitive workflow is mobile donation collection. Contract instability would create downstream client breakage and slow future platform work.

## Decision

Treat the phase-1 GraphQL schema as a contract-first `v1` surface with additive evolution rules.

Contract rules:

- Prefer additive changes only once Android work begins.
- Avoid renaming or removing fields from published types without explicit versioning.
- Return stable domain-oriented shapes, not page-specific UI payloads.
- Keep identifiers opaque and stable across clients.
- Make mutation responses include enough refreshed state for optimistic or immediate client updates.
- Put auth identity in server context rather than mutation inputs.
- Normalize error semantics through GraphQL `extensions.code`.

Recommended initial domain shape:

- Queries for `viewer`, `donors`, `donor`, `dashboardSummary`, `monthlyReport`
- Mutations for `login`, `createDonor`, `updateDonor`, `deleteDonor`, `recordPayment`
- Shared balance fields returned from donor/report types rather than recomputed client-side

## Alternatives Considered

- Frontend-driven schema that mirrors page layouts
  Rejected because it hard-couples the API to the first client and makes Android reuse fragile.
- Delay contract discipline until Android starts
  Rejected because retrofitting stability after web launch usually causes avoidable breaking changes.
- REST for writes and GraphQL for reads
  Rejected because it adds complexity without a clear benefit in this workflow.

## Consequences

- Positive: client teams can build against stable domain concepts instead of transient UI-specific endpoints.
- Positive: the donation flow can stay low-latency because mutation payloads return refreshed donor balance data directly.
- Negative: some frontend convenience shortcuts should be avoided early even if they appear faster in the moment.
- Negative: schema review discipline becomes part of normal backend work.

## Trade-Offs

The architecture chooses stricter API discipline now to avoid paying a much larger compatibility cost later. That is justified because Android reuse is an explicit product goal, not a speculative future idea.
