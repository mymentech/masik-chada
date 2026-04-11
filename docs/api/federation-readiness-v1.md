# Federation Readiness Plan (v1 -> v2)

## Objective

Keep current single Apollo GraphQL service stable for phase-1 while defining a no-break migration path to Apollo Federation when Android and scale requirements justify service decomposition.

## Current State

- Deployment model: modular monolith (`/graphql` single endpoint).
- Contract source: `docs/api/graphql-v1.schema.graphql`.
- Stability rule: additive-only schema evolution once Android integration starts.

## Proposed Subgraph Targets

### 1. `identity` subgraph

- Entities: `Viewer`, auth/session metadata.
- Responsibilities:
  - JWT validation context
  - user role metadata

### 2. `donors` subgraph

- Entities: `Donor` (primary ownership), serial allocation.
- Responsibilities:
  - donor CRUD
  - donor listing/search/pagination
  - donor balance projections (from shared calculator)

### 3. `payments` subgraph

- Entities: `Payment`.
- Responsibilities:
  - payment write path
  - monthly collector aggregates

### 4. `reporting` subgraph

- Entities: `DashboardSummary`, `MonthlyReport`.
- Responsibilities:
  - report assembly
  - optional snapshot read models (non-authoritative)

## Federation Contract Rules

- Keep existing client field names; do not force client rewrites.
- Use entity keys with opaque IDs only.
- Cross-subgraph joins must use DataLoader/batching at resolver boundary.
- Preserve `extensions.code` error semantics across subgraphs.

## Apollo Federation Draft SDL (for future split)

```graphql
extend schema
  @link(url: "https://specs.apollo.dev/federation/v2.6", import: ["@key", "@shareable"])

type Donor @key(fields: "id") {
  id: ID!
}

type Payment @key(fields: "id") {
  id: ID!
  donorId: ID!
}
```

## Router/Gateway Requirements

- Apollo Router (or Gateway) as single external GraphQL endpoint.
- Persisted query support for mobile bandwidth savings.
- Query plan observability enabled (trace IDs + operation names).
- Depth and complexity limits at gateway layer.

## Migration Steps

1. Keep v1 schema unchanged at client boundary.
2. Introduce internal subgraph modules in monolith codebase first.
3. Extract first subgraph (`identity`) behind the same schema.
4. Add router in front; verify parity via contract tests.
5. Extract donors/payments/reporting incrementally.
6. Freeze breaking changes until all clients run compatibility test suite.

## Risks

- Entity boundary mistakes can increase cross-subgraph chatty calls.
- Error-code drift between subgraphs can break frontend handling.
- Premature split adds operational complexity before clear load pressure.

## Recommendation To Architecture Lead

- Approve federation as a phase-2 path only.
- Keep phase-1 on modular monolith with strict schema governance and resolver boundaries aligned to future subgraphs.
