# MYMA-67 Response Draft For Frontend Lead

Addressing dependency unblock items for `MYMA-69`/`MYMA-72`:

1. Donor list/search query shape:
   - Use `donors(input: DonorsQueryInput!)`.
   - Row fields: `id`, `serialNumber`, `fullName`, `phone`, `address`, `monthlyAmount`, `dueFrom`, `totalDue`, `totalPaid`, `outstandingBalance`.
   - One operation supports `search` over name + serial + address, with optional `address`, `status`, pagination, and sorting.

2. `recordPayment` mutation payload:
   - Contract requires immediate refreshed balance in success payload:
     - `payment`
     - `donor { totalDue totalPaid outstandingBalance }`
     - `dashboardSummary` minimal totals
   - No full page/list reload required after success.

3. Auth failure semantics for SPA:
   - `UNAUTHENTICATED` => treat as session-expired and redirect to `/login`.
   - `BAD_USER_INPUT | NOT_FOUND | CONFLICT | FORBIDDEN` => inline UI errors.
   - `INTERNAL_SERVER_ERROR` => retry/system error handling.
   - Proposed `authReason`: `TOKEN_MISSING | TOKEN_INVALID | TOKEN_EXPIRED`.

4. Dashboard/report minimal fields:
   - `dashboardSummary`: `month`, `totalCollected`, `totalOutstanding`, `activeDonorCount`, `paymentCount`.
   - `monthlyReport`: `month`, `totalCollected`, `totalOutstanding`, `paymentCount`, `donorCount`, `collectorTotals { collector { id displayName } collectedAmount paymentCount }`, `generatedAt`.

Reference: `docs/api/api-contract-v1.md` (`Frontend Dependency Contract (MYMA-67)` section).
