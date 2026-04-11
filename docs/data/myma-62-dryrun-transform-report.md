# MYMA-62 Dry-Run Transform Report (Data Engineer -> Data Lead)

Run timestamp (UTC): `2026-04-11T21:12:56.278564+00:00`
Source: `u947130940_subscription.sql`

Transformer:
- `backend/validation/sql_to_mongo_dryrun.py`

Output artifacts:
- `backend/validation/out/users.transformed.jsonl`
- `backend/validation/out/donors.transformed.jsonl`
- `backend/validation/out/payments.transformed.jsonl`
- `backend/validation/out/quarantine.jsonl`
- `backend/validation/out/id-maps.json`
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

Quarantine:
- Total: `8`
- `invalid_monthly_amount`: `2`
- `orphan_payment_missing_donor`: `6`

## Quarantine Details

Invalid donors (monthly amount `0`):
- Donor legacy IDs: `384`, `751`

Downstream orphan payments caused by those donor quarantines:
- Payment legacy IDs: `548`, `1350`, `1351`, `1352`, `1353`, `1596`

## Mapping/Transformation Rules Applied

- `users.email` normalized to lowercase+trim and used as upsert key.
- `donors.serial_number` used as upsert key.
- `payments` upsert key uses `legacy_payment_id` with composite fallback (`donor_id`, `collector_id`, `amount`, `payment_date`).
- Deterministic synthetic `_id` values are generated from `(entity, legacy_id)` hash for dry-run portability.
- `donors.due_from` set to `null` because source dump has no `due_from` column.
- `payments.due_id` ignored because target payment schema does not store it.

## Data Lead Decision Needed

Choose one policy for `monthly_amount = 0` donors:

1. Keep strict validation (current): quarantine donor + dependent payments.
2. Allow import with explicit exception for zero monthly plans.

After policy confirmation, this script can be promoted from dry-run output to apply-mode import execution.
