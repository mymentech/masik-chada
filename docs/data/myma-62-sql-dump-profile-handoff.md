# MYMA-62 SQL Dump Profile Handoff (Data Engineer -> Data Lead)

Source analyzed: `u947130940_subscription.sql` (generated Apr 5, 2026)

Machine-readable profile: `docs/data/sql-dump-profile.json`
Profiler script: `backend/validation/sql_dump_profile.py`

## Executive Summary

- Legacy schema does **not** contain `donors.due_from`; migration cannot source amnesty start from donor rows.
- `payments` uses `collector_id` (not `user_id`) and all current payment records have `due_id = NULL`.
- Baseline integrity is strong for core FK relationships (`payments.donor_id` and `payments.collector_id` both fully resolvable).
- Data-quality exceptions exist and require explicit policy before migration apply.

## Verified Metrics

- Donors: `766`
- Payments: `1690`
- Users: `3`
- Dues rows: `12106`

- Donor serial duplicates: `0`
- Donor serial gaps: `14`, `224`, `713`
- Payment orphan donor refs: `0`
- Payment orphan collector refs: `0`
- Payment orphan due refs (non-null): `0`

## Schema Findings Relevant to Migration Mapping

- `donors` columns:
  - `id, serial_number, name, phone, address, monthly_amount, registration_date, created_at, updated_at`
- `payments` columns:
  - `id, donor_id, collector_id, due_id, amount, payment_date, created_at, updated_at`
- `dues` columns:
  - `id, donor_id, month_year, amount_due, paid_amount, created_at, updated_at`

Implications:

- `collector_id` must map to Mongo `payments.collector_id` through user remap dictionary.
- `due_from` cannot be directly migrated from donor table in this dump.
- `dues` appears to be a derived/monthly-tracker artifact and should remain non-authoritative for balance truth.

## Data Quality Exceptions (Action Required)

- `monthly_amount = 0` appears in 2 donor rows (IDs `384`, `751`; serials `386`, `754`).
  - Current validation matrix expects positive monthly amount.
  - Need policy: quarantine vs allow explicit `0` monthly plan.

- Dues-vs-registration mismatch for 5 donors:
  - Their `dues` rows imply charges from earlier months than `registration_date` would predict.
  - Net delta: `+43` dues rows vs registration-based expectation as of `2026-04-30`.
  - Indicates legacy manual adjustments or pre-registration carryover in `dues` snapshots.

## Migration Decisions Proposed

1. Keep `calculateDues` as canonical authority from donor + payment facts only.
2. Migrate `dues` only as optional historical/reporting artifact; do not use it as runtime balance truth.
3. Treat absence of `due_from` as `null` at import unless a separate trusted amnesty source is provided.
4. Decide and document handling for `monthly_amount = 0` before apply mode.
5. Preserve serial gaps; enforce uniqueness but do not resequence.

## Next Step for Data Lead

Approve policy for:

- `monthly_amount = 0` rows (quarantine or import).
- Any backfill strategy for `due_from` (if an external amnesty source exists).
- Whether to retain `dues` table migration in phase-1 or defer it entirely.

Once approved, importer implementation can lock deterministic rules and move from dry-run to apply.
