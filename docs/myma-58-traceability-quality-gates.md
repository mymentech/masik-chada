# MYMA-58 Requirement Traceability and Quality Gates

## Scope

This document captures pre-implementation QA expectations for the Masik Chada rewrite, aligned to:

- [masik-chada-scoped-project-brief.md](/workspace/mymentech-agency/masik-chada-src/docs/masik-chada-scoped-project-brief.md)
- [masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt)

## Requirement-to-Test Traceability Baseline

| Requirement Area | Key Requirement | Minimum Test Evidence | Gate |
| --- | --- | --- | --- |
| Dues Logic | `due_from` override, inclusive month counting, shared balance formula | Unit dues matrix + integration parity across donor/dashboard/report surfaces | Must pass |
| Migration Data | SQL-to-Mongo count parity and field mapping correctness | Import summary with source/imported/quarantined counts + golden record checks | Must pass |
| Migration I18N | Bengali text fidelity through migration and UI rendering | UTF-8 golden snapshot comparisons and manual UI spot-check log | Must pass |
| Mobile Collection UX | One-tap donor selection, fast debounced search, payment success/error behavior | Mobile viewport E2E with latency and interaction assertions | Must pass |
| Auth and Access | Protected operations require JWT; invalid/expired token redirects to `/login` | Backend auth integration tests + frontend route/auth redirect E2E | Must pass |
| Reporting | Monthly totals, collector breakdown, outstanding parity, PDF availability | Integration tests for report totals + UI smoke for report rendering/PDF action | Must pass |

## Quality Ambiguities to Clarify Before Final Sign-Off

1. Should overpayment remain as negative balance or be normalized to zero with a separate credit field?
2. Should future-dated `due_from` be allowed or validation-rejected during donor create/edit?
3. For monthly reporting totals, should payment inclusion always be bounded by report month end (`payment_date <= end`) across all surfaces?
4. What exact PDF output acceptance is required (layout fidelity, localization, downloadable file naming convention)?

## Recommended PR Quality Gates

1. Dues parity gate:
- Any PR touching dues or payments must prove parity against a single canonical dues utility and approved regression matrix.
2. Cross-surface balance gate:
- Dashboard, donor detail, donations, and reports must assert the same balance formula outcome for shared fixtures.
3. Bengali fidelity gate:
- UI strings and migrated Bengali data must pass snapshot/baseline checks before merge.
4. Auth gate:
- Protected resolver tests and frontend redirect tests must pass for unauthenticated and expired-token paths.
5. Migration gate:
- Migration PRs must attach count parity, quarantine report, and golden-record validation outputs.
6. Reporting gate:
- Report aggregation changes require fixture-backed assertions for collected totals, outstanding totals, and collector breakdown.

## Documentation Outline for Engineering Proof

- `docs/validation/dues-regression-matrix.md`
- `docs/validation/migration-validation-cases.md`
- `docs/myma-57-qa-test-design.md`

For each release candidate, include:

1. Test run outputs (unit/integration/E2E) with commit SHA.
2. Migration validation summary (counts, quarantines, golden-record results).
3. Bengali fidelity validation summary.
4. Report parity checks between API and UI snapshots.

## Handoff to QA Lead

This baseline is ready for QA execution tracking and can be used as the quality checklist for implementation and release review.
