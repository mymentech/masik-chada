# API Engineer Handoff To Architecture Lead

## Completed

- Produced GraphQL contract artifact: `docs/api/graphql-v1.schema.graphql`
- Produced API contract decisions and guardrails: `docs/api/api-contract-v1.md`
- Produced REST operational OpenAPI spec for health endpoints: `docs/api/openapi-ops-v1.yaml`
- Produced federation migration path: `docs/api/federation-readiness-v1.md`
- Produced additive real-time subscription extension: `docs/api/subscriptions-v1-extension.graphql`
- Produced resolver/DataLoader implementation contract: `docs/api/resolver-dataloader-contract-v1.md`
- Produced Apollo Router federation baseline config: `docs/api/apollo-router-federation-baseline.yaml`

## Key Contract Outcomes

- Locked `v1` GraphQL query/mutation surface around donors, payments, dashboard, reports, and auth.
- Included explicit public `login` mutation rule to remove auth ambiguity.
- Standardized GraphQL error code contract (`extensions.code`) and cursor pagination behavior.
- Defined mutation payload shape for immediate UI cache refresh after payment creation.
- Added operational REST contract for `/health/live` and `/health/ready` aligned with SRE readiness plan.
- Defined phase-2 Apollo Federation decomposition path that preserves v1 client compatibility.
- Defined additive `Subscription` contract for payment and donor-balance real-time updates.
- Defined resolver batching and error-mapping rules to prevent N+1 and response drift.
- Added production-oriented router guardrails (limits, CORS, request propagation) for federation rollout.

## Architecture Decisions Needed

1. Final source-of-truth policy for report queries:
   - query-time derived only, or
   - read derived snapshots with canonical fallback.
2. Serial number policy:
   - strictly contiguous, or
   - unique non-contiguous acceptable under retry/race conditions.
3. Authorization boundaries for donor mutations:
   - admin-only, or
   - admin + collector with scoped constraints.
4. Subscription rollout timing:
   - include in phase-1, or
   - defer to post-launch phase-1.1 after baseline stability metrics.

## Recommended Next Owner

- `Node Backend Engineer`: implement schema/resolvers and enforce error/pagination rules.
- `Backend Lead`: approve unresolved architecture decisions above before implementation freeze.
