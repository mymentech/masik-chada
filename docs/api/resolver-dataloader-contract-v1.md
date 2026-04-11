# Resolver + DataLoader Contract (v1)

## Goal

Provide backend implementation constraints so GraphQL resolvers remain performant and consistent with the published API contract.

## Context Shape

```ts
type GraphQLContext = {
  requestId: string;
  auth: {
    userId: string | null;
    role: "ADMIN" | "COLLECTOR" | null;
    isAuthenticated: boolean;
  };
  loaders: {
    donorById: DataLoader<string, DonorRecord | null>;
    userById: DataLoader<string, UserRecord | null>;
    paymentsByDonorId: DataLoader<string, PaymentRecord[]>;
  };
  services: {
    donorService: DonorService;
    paymentService: PaymentService;
    reportService: ReportService;
  };
};
```

## Resolver Rules

- Never parse JWT in individual resolvers; use `context.auth`.
- Enforce role checks in resolver entry points for writes.
- Donor list resolver must query paginated data in one service call.
- Nested `Payment.recordedBy` must use `userById` loader.
- Balance fields on `Donor` must come from canonical dues calculator outputs.

## Batch Contract

- `donorById`:
  - Input: donor IDs.
  - Output order must match key order.
  - Null for missing donors.
- `userById`:
  - Batch user fetch for `recordedBy`.
- `paymentsByDonorId`:
  - Used only when explicitly requested by schema evolution; avoid eager usage in donor list.

## Mutation Consistency Contract

`recordPayment` must:

1. Validate input and permissions.
2. Persist payment.
3. Recompute donor totals from committed state.
4. Return `payment`, refreshed `donor`, and `dashboardSummary`.
5. Publish subscription event if enabled.

Any failure after step 2 must not return a false success payload.

## Error Mapping Contract

- Validation errors -> `BAD_USER_INPUT`
- Missing entity -> `NOT_FOUND`
- Unauthorized token/missing token -> `UNAUTHENTICATED`
- Permission denied -> `FORBIDDEN`
- Duplicate serial/write conflicts -> `CONFLICT`
- Unhandled failures -> `INTERNAL_SERVER_ERROR`
