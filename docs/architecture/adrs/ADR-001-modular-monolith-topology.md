# ADR-001: Modular Monolith Topology

## Status
Accepted

## Context

Phase 1 needs fast delivery, low operational overhead, and clear ownership boundaries while replacing a Laravel application with a MERN stack. The deployment target is Docker Compose behind Nginx, and the product serves a single domain with a small set of tightly coupled workflows: auth, donors, payments, balances, reports, and migration.

## Decision

Use a modular monolith for phase 1:

- React SPA frontend
- Express + Apollo GraphQL backend
- MongoDB datastore
- Nginx reverse proxy
- `node-cron` inside the backend runtime for monthly recalculation work

Keep domain boundaries explicit inside the backend:

- `auth`
- `donors`
- `payments`
- `balances`
- `reports`
- `migration`
- `jobs`

## Alternatives Considered

- Separate frontend API gateway plus microservices
  Rejected because the system does not justify the extra deployment, observability, and consistency overhead.
- REST backend with later GraphQL adapter
  Rejected because GraphQL is already a stated product requirement and future Android reuse benefits from a single contract now.
- Split cron into a separate worker service in phase 1
  Rejected because monthly work volume is low and operational simplicity matters more than process isolation at this stage.

## Consequences

- Positive: lower delivery complexity, faster coordination, simpler local/dev deployment, and easier cross-cutting changes while the rewrite is still volatile.
- Positive: one codebase can centralize business rules such as `calculateDues`.
- Negative: backend module boundaries must be actively enforced because there is no service boundary forcing discipline.
- Negative: future horizontal scaling is coarser than a service split, though still acceptable for projected usage.

## Trade-Offs

The architecture prioritizes delivery speed, correctness, and maintainability over speculative scale isolation. If Android, reporting, or traffic patterns later create materially different scaling profiles, extraction can happen from stable domain seams rather than from an over-engineered day-one topology.
