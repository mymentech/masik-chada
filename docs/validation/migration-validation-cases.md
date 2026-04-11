# Migration Validation Cases

This artifact defines SQL-to-Mongo validation checks for [MYMA-65] so migrated rows feed dues calculations correctly.

## Mapping Rules To Validate

- `donors.registration_date` must map to Mongo `registration_date` as ISO date.
- Legacy grace/amnesty source must map to Mongo `due_from`; empty values map to `null`.
- `monthly_amount` must be numeric and positive after normalization.
- Payment rows must map to donor ObjectId using deterministic donor identity mapping.
- Invalid rows should be quarantined with a reason; they must not silently mutate balances.

## Donor Mapping Cases

| Case ID | Legacy Input | Expected Canonical Output | Expected Action |
| --- | --- | --- | --- |
| MIG-DONOR-001 | `registration_date='2025-01-15'`, `due_from=NULL`, `monthly_amount='100.00'` | `registration_date='2025-01-15'`, `due_from=null`, `monthly_amount=100` | Import |
| MIG-DONOR-002 | `registration_date='2024-11-01'`, `due_from='2025-03-01'`, `monthly_amount='250'` | `registration_date='2024-11-01'`, `due_from='2025-03-01'`, `monthly_amount=250` | Import |
| MIG-DONOR-003 | `due_from=''` or `'0000-00-00'` | `due_from=null` | Import with normalization |
| MIG-DONOR-004 | `monthly_amount=' 300.50 '` | `monthly_amount=300.5` | Import with trim/parse |
| MIG-DONOR-005 | `monthly_amount='abc'` | N/A | Quarantine: `invalid_monthly_amount` |
| MIG-DONOR-006 | Duplicate `serial_number` | N/A | Quarantine duplicate(s), report collision |
| MIG-DONOR-007 | `registration_date` missing/invalid | N/A | Quarantine: `invalid_registration_date` |
| MIG-DONOR-008 | `due_from < registration_date` | Keep both values unchanged | Import; business-allowed amnesty rollback |
| MIG-DONOR-009 | `due_from > now` | Keep value unchanged | Import + warning (policy decision pending) |

## Payment Mapping Cases

| Case ID | Legacy Input | Expected Canonical Output | Expected Action |
| --- | --- | --- | --- |
| MIG-PAY-001 | Valid donor foreign key, amount `100`, date `2026-04-10` | donor ObjectId resolved, amount `100`, payment_date `2026-04-10` | Import |
| MIG-PAY-002 | Amount `'50.00'` string | amount `50` number | Import with parse |
| MIG-PAY-003 | Donor FK missing in migrated donors | N/A | Quarantine: `orphan_payment` |
| MIG-PAY-004 | Negative amount `-100` | N/A | Quarantine: `invalid_payment_amount` |
| MIG-PAY-005 | Invalid date text | N/A | Quarantine: `invalid_payment_date` |

## Post-Migration Cross-Checks

- Count parity:
- `legacy_donor_rows = imported_donors + quarantined_donors`
- `legacy_payment_rows = imported_payments + quarantined_payments`
- Deterministic parity sample:
- Run all cases in `backend/validation/dues_cases.json` against migrated sample donors/payments and verify totals match the expected matrix exactly.
- Referential integrity:
- 100% of imported payments must resolve to an existing donor ObjectId.

## Clarifications Needed (Data Lead / CTO)

- Canonical source field name for legacy amnesty date is not confirmed; migration script must lock this mapping before execution.
- Policy for future-dated `due_from` after migration is not finalized (allow vs normalize vs reject).

