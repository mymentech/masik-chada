# Dues Regression Matrix

This matrix is an implementation-independent oracle for [MYMA-65].

## Fixed Validation Rules

- `start_date = due_from` when `due_from` exists; otherwise `registration_date`.
- Month counting is inclusive on both ends.
- `months = ((as_of.year - start.year) * 12) + (as_of.month - start.month) + 1`.
- If `months < 1`, clamp to `0`.
- `total_due = months * monthly_amount`.
- `total_paid = sum(payment.amount where payment_date <= as_of)`.
- `balance = total_due - total_paid`.

## Regression Cases (Deterministic)

All amounts are BDT.

| Case ID | As Of | Registration | Due From | Monthly | Payments <= As Of | Expected Months | Expected Due | Expected Paid | Expected Balance | Coverage |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| DUES-001 | 2026-04-30 | 2025-01-15 | null | 100 | 0 | 16 | 1600 | 0 | 1600 | Inclusive month counting baseline |
| DUES-002 | 2026-04-30 | 2024-01-01 | 2026-02-10 | 100 | 100 | 3 | 300 | 100 | 200 | `due_from` override |
| DUES-003 | 2026-04-30 | 2026-04-01 | null | 250 | 0 | 1 | 250 | 0 | 250 | Current month counts immediately |
| DUES-004 | 2026-04-30 | 2026-04-01 | 2026-06-01 | 250 | 0 | 0 | 0 | 0 | 0 | Future `due_from` clamp to zero |
| DUES-005 | 2026-04-30 | 2026-01-20 | null | 200 | 450 | 4 | 800 | 450 | 350 | Partial payments |
| DUES-006 | 2026-04-30 | 2026-03-01 | null | 150 | 700 | 2 | 300 | 700 | -400 | Overpayment (negative balance) |
| DUES-007 | 2024-02-29 | 2024-02-29 | null | 100 | 0 | 1 | 100 | 0 | 100 | Leap-day registration month |
| DUES-008 | 2026-05-31 | 2026-02-10 | 2026-02-10 | 300 | 300 | 4 | 1200 | 300 | 900 | `due_from == registration_date` |
| DUES-009 | 2026-04-30 | 2025-12-01 | null | 180 | 100 | 5 | 900 | 100 | 800 | Payment after `as_of` excluded |

## Ambiguities Requiring Clarification

- Should future-dated `due_from` be accepted on create/edit, or rejected at validation time?
- Should overpayment be displayed as negative balance, or normalized to `0` + separate credit field?
- Should payment totals include only `payment_date <= as_of` in every report/screen, or all recorded payments regardless of date?

