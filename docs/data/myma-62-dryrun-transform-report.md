# MYMA-62 Dry-Run Transform Report

Run timestamp (UTC): `2026-04-13T08:44:46.749408+00:00`
Source: `u947130940_subscription.sql`
Execution path: `./scripts/run-migration-dryrun.sh`

Implementation:
- `scripts/run-migration-dryrun.sh`
- `backend/validation/sql_dump_profile.py`
- `backend/validation/sql_to_mongo_dryrun.py`

Output artifacts:
- `docs/data/sql-dump-profile.json`
- `backend/validation/out/users.transformed.jsonl`
- `backend/validation/out/donors.transformed.jsonl`
- `backend/validation/out/payments.transformed.jsonl`
- `backend/validation/out/quarantine.jsonl`
- `backend/validation/out/id-maps.json`
- `backend/validation/out/golden-records.json`
- `backend/validation/out/bengali-fidelity-report.json`
- `backend/validation/out/dryrun-report.json`

## Dry-Run Summary

Input rows:
- Users: `3`
- Donors: `766`
- Payments: `1690`

Transformed rows:
- Users: `3`
- Donors: `764`
- Payments: `1684`

Parity:
- Users: `3 = 3 transformed + 0 quarantined`
- Donors: `766 = 764 transformed + 2 quarantined`
- Payments: `1690 = 1684 transformed + 6 quarantined`

Quarantine:
- Total: `8`
- `invalid_monthly_amount`: `2`
- `orphan_payment_missing_donor`: `6`

Bengali fidelity:
- Checked fields: `1463`
- Failures: `0`
- Status: `pass`

## Quarantine Details

Invalid donors (monthly amount `0`):
- Donor legacy IDs: `384`, `751`

Downstream orphan payments caused by those donor quarantines:
- Payment legacy IDs: `548`, `1350`, `1351`, `1352`, `1353`, `1596`

## Mapping and Validation Notes

- `users.email` is normalized to lowercase+trim for the upsert key.
- Bengali `name` and `address` fields are preserved verbatim in transformed output; they are no longer trimmed during migration.
- `donors.serial_number` is the canonical donor upsert key.
- `payments` use `legacy_payment_id` as the preferred upsert key with composite fallback (`donor_id`, `collector_id`, `amount`, `payment_date`).
- Deterministic synthetic `_id` values are generated from `(entity, legacy_id)` hash for dry-run portability.
- `donors.due_from` is set to `null` because the source dump has no donor-side `due_from` column.
- `payments.due_id` is ignored because the target payment schema does not store it.

## Architectural Critique

- The dry-run remains correctly split into transform output plus separate validation artifacts. That separation should be kept for apply-mode; collapsing write and validation into one opaque pass would make data defects harder to diagnose and reruns riskier.
- The remaining execution risk is policy, not parser mechanics: strict quarantine currently removes two zero-monthly-amount donors and six dependent payments. That is safer than silently importing ambiguous records, but the product/data owners still need to decide whether those rows are true exceptions or corrupted source data.

## Next Decision

Choose one policy for `monthly_amount = 0` donors:

1. Keep strict validation: quarantine donor and dependent payments.
2. Allow import with an explicit zero-amount exception policy.

After that policy is locked, the same command path can be extended from dry-run to apply-mode import execution.
