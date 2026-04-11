# API Contract v1 (API Engineer)

## Purpose

Define the concrete API contract for phase-1 implementation so backend, frontend, Android, and architecture can execute against a stable interface.

## API Surfaces

- GraphQL business API: `POST /graphql`
- REST operational API: `GET /health/live`, `GET /health/ready`

## Versioning Strategy

- GraphQL contract name: `v1`
- Evolution rule after Android integration starts: additive only.
- Breaking changes require:
  - explicit architecture sign-off,
  - a new versioned field/type path, or
  - full client migration plan with sunset timeline.

## Authentication Rules

- `login` mutation is public.
- All other GraphQL operations require `Authorization: Bearer <jwt>`.
- JWT TTL: 7 days (`expiresInSeconds = 604800`).
- Auth identity is inferred from server context, not mutation inputs.

## Error Contract

Resolvers must emit stable GraphQL `extensions.code` values:

- `UNAUTHENTICATED`: missing/invalid/expired token.
- `FORBIDDEN`: authenticated but not allowed for operation.
- `BAD_USER_INPUT`: validation failure.
- `NOT_FOUND`: target entity missing.
- `CONFLICT`: duplicate or race-sensitive resource conflicts (e.g., serial number).
- `INTERNAL_SERVER_ERROR`: unexpected server-side failure.

Recommended extension shape:

```json
{
  "message": "Invalid donor id",
  "extensions": {
    "code": "BAD_USER_INPUT",
    "requestId": "req_01H...",
    "details": {
      "field": "donorId"
    }
  }
}
```

## Pagination Contract

- `donors` uses cursor pagination (`first`, `after`).
- Default page size: `20`.
- Max page size: `100` (enforce in resolver validation).
- Cursor format: opaque base64-encoded stable sort tuple.
- `search` applies to `fullName`, `serialNumber`, and `address`.

## Monetary And Date Rules

- Monetary amounts use integer BDT in smallest whole unit (no floating-point decimals).
- Month string uses `YYYY-MM`.
- Dues computation authority:
  - start date: `dueFrom` if present, else `registrationDate`
  - month counting: inclusive of start month and current month.
- `outstandingBalance = totalDue - totalPaid`.

## DataLoader And N+1 Controls

- Required DataLoaders:
  - `donorById`
  - `userById`
  - `paymentsByDonorId` (only where needed)
- Resolver policy:
  - list resolvers must not perform per-row direct DB fetches.
  - nested `recordedBy` in `Payment` must be batched via `userById`.

## Mutation Response Design

- Mutations return refreshed entities needed for immediate UI cache updates.
- `recordPayment` returns:
  - created payment,
  - refreshed donor balance fields,
  - refreshed dashboard summary.

## Frontend Dependency Contract (MYMA-67)

This section is the explicit proposal for React execution dependencies.

### 1. Donor list/search query shape

- Query: `donors(input: DonorsQueryInput!): DonorConnection!`
- Row fields for donations list:
  - `id`
  - `serialNumber`
  - `fullName`
  - `phone`
  - `address`
  - `monthlyAmount`
  - `dueFrom`
  - `totalDue`
  - `totalPaid`
  - `outstandingBalance`
- Supported filters in one operation:
  - `search`: single input that matches `fullName`, `serialNumber`, and `address`
  - `status`
  - `address` (optional exact/narrow filter when needed)
  - pagination (`first`, `after`)
  - sorting (`sort.field`, `sort.direction`)

Example:

```graphql
query DonorsList($input: DonorsQueryInput!) {
  donors(input: $input) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      cursor
      node {
        id
        serialNumber
        fullName
        phone
        address
        monthlyAmount
        dueFrom
        totalDue
        totalPaid
        outstandingBalance
      }
    }
  }
}
```

### 2. `recordPayment` payload contract

- Mutation must return refreshed donor balance state in the same success response.
- SPA must not require a full list reload after successful payment.

Example:

```graphql
mutation RecordPayment($input: RecordPaymentInput!) {
  recordPayment(input: $input) {
    payment {
      id
      donorId
      amount
      paymentDate
      createdAt
    }
    donor {
      id
      totalDue
      totalPaid
      outstandingBalance
      updatedAt
    }
    dashboardSummary {
      month
      totalCollected
      totalOutstanding
      paymentCount
    }
  }
}
```

### 3. Auth failure/error semantics

SPA handling contract:

- Treat as session-expired (force logout + redirect `/login`):
  - `extensions.code = UNAUTHENTICATED`
- Treat as inline form/business error (no forced logout):
  - `BAD_USER_INPUT`
  - `NOT_FOUND`
  - `CONFLICT`
  - `FORBIDDEN`
- Treat as retry/system error toast:
  - `INTERNAL_SERVER_ERROR`

Recommended auth extension details:

```json
{
  "extensions": {
    "code": "UNAUTHENTICATED",
    "authReason": "TOKEN_EXPIRED"
  }
}
```

Accepted `authReason` values:
- `TOKEN_MISSING`
- `TOKEN_INVALID`
- `TOKEN_EXPIRED`

### 4. Dashboard/report minimal fields

Minimum dashboard card shape:

```graphql
query DashboardSummary {
  dashboardSummary {
    month
    totalCollected
    totalOutstanding
    activeDonorCount
    paymentCount
  }
}
```

Minimum monthly report shape:

```graphql
query MonthlyReport($month: String!) {
  monthlyReport(month: $month) {
    month
    totalCollected
    totalOutstanding
    paymentCount
    donorCount
    collectorTotals {
      collector { id displayName }
      collectedAmount
      paymentCount
    }
    generatedAt
  }
}
```

## Consistency Rules

- Payment write and post-write balance read must come from committed state.
- If payment persistence fails, return error and no success payload.
- `deleteDonor` must cascade delete donor payments.

## Security Constraints

- Keep GraphQL introspection off by default in production (enable via controlled flag for trusted environments).
- Apply request size limits and depth/complexity limits.
- CORS should be explicit allowlist in production.

## Open Decisions For Architecture Lead

1. Confirm whether `dashboardSummary` and `monthlyReport` should be query-time derived only, or may read derived snapshot collection with fallback-to-derived behavior.
2. Confirm final policy for serial number allocation:
   - strict contiguous sequence with transactional counter, or
   - unique non-contiguous allowed after failed attempts.
3. Confirm whether role-based access requires collector/admin separation for donor mutation operations in v1.
