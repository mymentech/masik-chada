# SQL-to-Mongo Migration Strategy and Validation Checklist

Issue: MYMA-62
Parent: MYMA-52
Scope source: `masik-chada-project-spec.txt` and `docs/masik-chada-scoped-project-brief.md`

## 1. Migration Objectives

- Migrate legacy SQL donors, payments, and users into MongoDB collections `donors`, `payments`, and `users`.
- Preserve Bengali text exactly for donor/user-facing strings.
- Preserve existing bcrypt password hashes without rehash/reset.
- Set `due_from = null` for all migrated donors unless legacy SQL has authoritative amnesty data.
- Ensure deterministic reruns (dry-run and re-run) without creating duplicates.

## 2. Deterministic Import Order and FK Remapping

Import order must be fixed:

1. `users`
2. `donors`
3. `payments`

Reason:

- `payments.collector_id` must resolve to a migrated `users._id`.
- `payments.donor_id` must resolve to a migrated `donors._id`.

### FK remapping strategy

- During `users` import, build in-memory map: `userIdMap[legacy_user_pk] = mongo_user_object_id`.
- During `donors` import, build in-memory map: `donorIdMap[legacy_donor_pk] = mongo_donor_object_id`.
- During `payments` import, translate:
  - `legacy_payment.donor_id -> donorIdMap[...]`
  - `legacy_payment.collector_id -> userIdMap[...]`
- If either FK map lookup fails, do not insert payment; record as orphan candidate in validation output.

## 3. Source-to-Target Field Mapping

Note: SQL dump is not present in this workspace, so legacy table/column names below assume conventional names from the spec narrative.

## 3.1 Users (`users` SQL -> `users` Mongo)

| SQL source | Mongo target | Transform rule |
| --- | --- | --- |
| `users.id` | internal remap only | Store only in remap dictionary, not in Mongo schema |
| `users.name` | `users.name` | Copy as-is (preserve Bengali) |
| `users.email` | `users.email` | Normalize trim/lowercase for matching only; persist original or normalized per Backend policy |
| `users.password` | `users.password` | Copy hash exactly (bcrypt hash unchanged) |
| `users.created_at` | `users.created_at` | Parse timestamp; fallback to migration timestamp if null/invalid |

Uniqueness key for idempotent upsert:

- Primary: `email`

## 3.2 Donors (`donors` SQL -> `donors` Mongo)

| SQL source | Mongo target | Transform rule |
| --- | --- | --- |
| `donors.id` | internal remap only | Store in remap dictionary only |
| `donors.serial_number` | `donors.serial_number` | Parse integer; required unique |
| `donors.name` | `donors.name` | Copy as-is (preserve Bengali) |
| `donors.phone` | `donors.phone` | Copy; if null use default `+880` per model convention |
| `donors.address` | `donors.address` | Copy as-is (preserve Bengali) |
| `donors.monthly_amount` | `donors.monthly_amount` | Parse numeric as BDT amount |
| `donors.registration_date` | `donors.registration_date` | Parse date; required |
| `donors.due_from` (if exists) | `donors.due_from` | For migration baseline set null unless trusted legacy amnesty data is confirmed |
| `donors.created_at` | `donors.created_at` | Parse timestamp; fallback to migration timestamp |
| `donors.updated_at` | `donors.updated_at` | Parse timestamp; fallback to migration timestamp |

Uniqueness key for idempotent upsert:

- Primary: `serial_number`
- Secondary safety match (for collision diagnostics only): `name + phone + address`

## 3.3 Payments (`payments` SQL -> `payments` Mongo)

| SQL source | Mongo target | Transform rule |
| --- | --- | --- |
| `payments.id` | optional `legacy_payment_id` | Recommended to store for idempotent reruns/audit |
| `payments.donor_id` | `payments.donor_id` | Translate via `donorIdMap` |
| `payments.collector_id` | `payments.collector_id` | Translate via `userIdMap` |
| `payments.amount` | `payments.amount` | Parse numeric as BDT amount |
| `payments.payment_date` | `payments.payment_date` | Parse date; required |
| `payments.created_at` | `payments.created_at` | Parse timestamp; fallback to payment_date/migration timestamp |

Uniqueness key for idempotent upsert:

- Preferred: `legacy_payment_id` (if stored)
- Fallback composite: `donor_id + collector_id + amount + payment_date`

## 4. Idempotent Seed Behavior (Dry-runs and Re-runs)

Use deterministic bulk upsert (`updateOne(..., { upsert: true })`) instead of blind insert.

- Dry-run mode:
  - Parse and transform all rows.
  - Build remap dictionaries in memory.
  - Do not write to Mongo.
  - Emit full validation report with would-insert/would-update counts.
- Apply mode:
  - Upsert users first, then donors, then payments.
  - Maintain stable matching keys (above).
  - Log each rejected/orphan row with legacy primary key.

Rerun safety rules:

- Re-running must not increase row counts when source data has not changed.
- If source row changed, target row is updated in place via same deterministic match key.
- Payments must not duplicate across runs; use `legacy_payment_id` whenever possible.

## 5. Serial Number Continuity and Collision Checks

Pre-import checks:

- Verify SQL donor `serial_number` values are non-null integers.
- Detect duplicates in source serials; fail migration if duplicates exist.
- Detect gaps but do not fail on gaps (report only).

Post-import checks:

- Verify Mongo `donors.serial_number` is unique (unique index required).
- Compute `max_serial_migrated`.
- Before enabling `createDonor` in production, ensure next serial assignment starts from `max_serial_migrated + 1`.
- Collision guard on new donor create path:
  - If candidate serial already exists, increment until free (or use atomic counter strategy selected by Backend Lead).

## 6. Validation Checklist and Report Format

Generate one machine-readable report (JSON) plus one human summary (Markdown/text).

## 6.1 Required validation checks

- Row counts:
  - SQL users vs Mongo users
  - SQL donors vs Mongo donors
  - SQL payments vs Mongo payments (minus explicitly skipped invalid/orphan rows)
- Nullability mismatches:
  - Required destination fields null after transform/import
- Orphaned payments:
  - Payments where donor or collector FK could not be mapped
- Password-hash preservation:
  - Exact string equality for sampled/all user password hashes
- Bengali text fidelity spot checks:
  - Exact Unicode equality on sampled `donor.name`, `donor.address`, `user.name`
- Balance spot checks:
  - Sample donors: recompute due/paid/balance from migrated records and compare against expected SQL-derived figures

## 6.2 Recommended JSON report schema

```json
{
  "run_id": "2026-04-11T20:00:00Z",
  "mode": "dry_run|apply",
  "source_file": "masik_db_init.sql",
  "counts": {
    "users": { "sql": 0, "mongo": 0, "inserted": 0, "updated": 0, "skipped": 0 },
    "donors": { "sql": 0, "mongo": 0, "inserted": 0, "updated": 0, "skipped": 0 },
    "payments": { "sql": 0, "mongo": 0, "inserted": 0, "updated": 0, "skipped": 0 }
  },
  "mismatches": {
    "nullability": [],
    "orphans": [],
    "serial_collisions": [],
    "text_fidelity_failures": [],
    "hash_mismatch_users": [],
    "balance_check_failures": []
  },
  "status": "pass|fail"
}
```

## 7. Implementation Notes for Seed Script

- Use UTF-8 parsing end-to-end; never normalize Bengali text.
- Parse SQL dump with deterministic ordering by source primary key.
- Commit writes in ordered batches (users -> donors -> payments).
- Ensure Mongo indexes exist before import:
  - `users.email` unique
  - `donors.serial_number` unique
  - Optional: `payments.legacy_payment_id` unique (recommended)

## 8. Clarifications Status (After SQL Dump Profiling)

Source profiled: `u947130940_subscription.sql`
Detailed output:
- `docs/data/sql-dump-profile.json`
- `docs/data/myma-62-sql-dump-profile-handoff.md`

Confirmed from actual dump:
- SQL table/column names are now verified.
- `donors` has no `due_from` column in source data.
- `payments` uses `collector_id` (not `user_id`) and currently has `due_id = null` for all rows.

Still requiring Backend/Data Lead policy:
- Whether to persist `legacy_payment_id` (recommended strongly for idempotency/audit).
- How to handle donors with `monthly_amount = 0` (quarantine vs import with explicit exception).
- Canonical uniqueness fallback if `serial_number` is missing/corrupt in any future source rows.
- Expected timezone handling for `registration_date`, `payment_date`, and timestamps.
- Whether soft-deleted SQL rows (if present in future dumps) should be excluded or migrated.

## 9. Done Criteria for MYMA-62

- Mapping exists for donors/payments/users with transform rules.
- Deterministic import order and FK remap strategy is defined.
- Idempotent rerun behavior is defined with concrete unique keys.
- Serial continuity and collision checks are defined.
- Validation report format and checklist are defined.
- Clarification assumptions are explicit for Backend Lead follow-up.
