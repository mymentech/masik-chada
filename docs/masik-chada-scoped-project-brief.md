# Masik Chada Scoping Brief

## Scope Summary

This engagement covers a full rewrite of the existing Laravel/MySQL subscription management system into a MERN application for `subscription.mymentech.com`. The product serves Bengali-speaking collectors during live mahfil events, so the primary product requirement is fast, mobile-first collection workflows without changing the current Bengali language experience.

This brief is based on the source specification in [masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:1). The project has not started implementation yet. Items below define what engineering should treat as the agreed product scope unless clarified further.

## Business Outcome

- Preserve current donor/payment operations while modernizing the stack to React, Express, GraphQL, and MongoDB.
- Fix the current dues calculation defect so balances are reliable everywhere in the product.
- Improve donation collection speed on mobile during live events.
- Add an amnesty/grace-date workflow so forgiven dues are reflected correctly.
- Prepare the API surface for later Android client reuse.

## In Scope

- New React frontend with Bengali UI and Hind Siliguri typography.
- New Express + Apollo GraphQL backend with JWT authentication.
- MongoDB data model and one-time migration from existing SQL backup.
- Donations, donors, dashboard, reports, login, landing page, and navigation.
- Correct monthly dues and balance calculation logic, reused across all screens.
- Amnesty `due_from` field in donor create/edit flows and calculations.
- Monthly dues recalculation cron job.
- Docker Compose and Nginx deployment for `subscription.mymentech.com`.

## Out Of Scope For This Phase

- Android app implementation.
- New business workflows beyond those defined in the source spec.
- Major redesign or English localization.
- Breaking GraphQL schema changes after downstream Android work begins.

## Target Users

- Collectors using phones during crowded live events.
- Admin users managing donors, reports, and balances.
- Future Android client consuming the same GraphQL API.

## Product Requirements

### Functional Requirements

- When an authenticated user opens the donations page, the system shall present a mobile-first donor list optimized for one-tap payment collection.
- When a donor has `due_from` set, the system shall calculate total due from `due_from` instead of `registration_date`.
- When a donor has no `due_from`, the system shall calculate total due from `registration_date`.
- When calculating dues, the system shall include both the start month and the current month in the month count.
- When a payment is recorded, the system shall immediately refresh the donor balance shown in the donations workflow.
- When an admin creates a donor, the system shall assign the next available sequential `serial_number`.
- When an admin deletes a donor, the system shall also remove that donor's payment history.
- When a user is unauthenticated or their token is invalid, the system shall block protected routes and redirect to `/login`.
- When the monthly cron schedule runs, the system shall recalculate monthly dues without crashing the server if individual donor processing fails.
- Where the interface shows product labels, actions, or messages, the system shall preserve Bengali wording and Hind Siliguri rendering.
- Where reports are requested for a selected month, the system shall show monthly totals and allow PDF download.
- Where donor search or filtering is used on the donations page, the system shall support search by name or serial number and filtering by address.
- Where GraphQL operations are exposed, the system shall serve them through a single `/graphql` endpoint protected by JWT bearer authentication.

### Non-Functional Requirements

- The donations experience must be mobile-first with tap targets of at least 48px.
- Search interactions on the donations page must feel immediate and use debounced input around 300ms.
- Bengali text fidelity is mandatory across UI, migrated data, and user-visible messages.
- MongoDB must remain internal-only and not be exposed publicly.
- The platform must deploy through Docker Compose behind Nginx on `subscription.mymentech.com`.
- Authentication must use JWT with a 7-day expiry.
- The GraphQL API should remain stable enough for Android reuse.

## Core User Stories

1. As a collector using a phone during a live event, I want to find a donor and record payment in one quick flow so I can collect donations in a crowded environment without delay.
2. As an admin, I want balances to reflect inclusive month counting so I can trust what the system says a donor owes.
3. As an admin, I want to set an amnesty date for a donor so previous dues can be forgiven without manual recalculation.
4. As an admin, I want to add, edit, and delete donors so the donor list stays accurate.
5. As a collector, I want payment success feedback immediately so I know the transaction was recorded.
6. As an admin, I want dashboard totals and monthly reports so I can review collections and outstanding balances.
7. As the organization, we want all existing donor, payment, and user data migrated correctly so the new system can replace the old one without losing records.

## Acceptance Criteria

### Donations Workflow

- Given an authenticated collector on `/donations`, when they search by donor name or serial, then matching results are updated within the expected debounced interaction window.
- Given a donor row on `/donations`, when the collector taps the row, then a payment bottom sheet opens with donor details, current balance, default amount, and payment date.
- Given valid payment details, when the collector submits payment, then the system stores the payment, closes the form, shows a Bengali success toast, and refreshes the donor balance immediately.

### Dues Calculation

- Given a donor registered in January 2025 with monthly amount 100 BDT and no payments, when balance is calculated for April 2026, then total due is 1,600 BDT.
- Given a donor with `due_from` later than `registration_date`, when total due is calculated, then only months from `due_from` through the current month are counted.
- Given a donor with total payments recorded, when outstanding balance is shown, then the UI displays `total due - total paid` consistently across dashboard, donor details, and donation views.

### Donor Management

- Given an admin creates a donor with valid required fields, when the record is saved, then the system assigns the next sequential serial number automatically.
- Given an admin sets the optional amnesty date in donor create or edit, when the donor is saved, then the date persists and is used in all future balance calculations.
- Given an admin deletes a donor, when deletion is confirmed, then the donor and related payment history are removed.

### Authentication And Access

- Given a user submits valid login credentials, when the login mutation succeeds, then the frontend stores the JWT and redirects to `/dashboard`.
- Given a request is made to a protected query or mutation without a valid bearer token, when the backend checks auth, then access is denied and the frontend returns the user to `/login`.

### Reports And Deployment

- Given an authenticated user selects a month on `/reports`, when data loads, then the page shows monthly collected totals, outstanding balance totals, and collector-wise totals in Bengali UI.
- Given the product is deployed, when traffic reaches `subscription.mymentech.com`, then Nginx routes `/` to the frontend and `/graphql` to the backend.
- Given the SQL backup is imported during first deploy, when the seed script finishes, then donors, users, and payments exist in MongoDB with Bengali data preserved and `due_from` set to `null` by default.

## Error Handling Expectations

| Scenario | Expected Product Behavior |
| --- | --- |
| Invalid login | Show Bengali error message and keep user on login screen |
| Missing or expired token | Clear auth state and redirect to `/login` |
| Failed payment mutation | Keep modal open, show clear Bengali error, do not show success toast |
| Duplicate monthly cron work | Use upsert behavior to avoid duplicate dues records |
| Migration row issue | Log the failed record and report migration summary for review |
| Empty monthly report | Show Bengali empty-state message indicating no collection for the month |

## Risks And Assumptions

- The spec references exact UI preservation from the existing Laravel app, but no screenshots or reference flows were provided in this workspace.
- The cron description implies dues records, but the data model section does not define a separate dues collection; CTO should resolve whether balances are computed on the fly, materialized monthly, or both.
- The SQL backup file and current Laravel codebase were not reviewed in this scoping pass, so migration edge cases and legacy business rules may still surface.
- PDF formatting expectations are defined only at a high level.
- Bengali copy is treated as fixed source-of-truth from the spec; any missing labels will need stakeholder confirmation.

## Open Questions For Stakeholder

- Please confirm whether existing UI screenshots or the current Laravel branch should be treated as the visual source of truth for the rewrite.
- Please confirm whether there are any non-admin user roles beyond the three existing users/collectors referenced in the spec.
- Please confirm whether historical dues records must be persisted as auditable rows or whether balance can remain derived from donor and payment data.
- Please confirm whether there is a required go-live or event deadline for the mobile donations workflow.

## Recommended Team Assignment

- `CTO`: Own technical planning, architecture decisions, and execution sequencing.
- `Backend Lead`: Break backend work into auth, GraphQL, calculations, cron, and migration tracks.
- `Frontend Lead`: Own UI delivery quality, Bengali UX fidelity, and mobile-first donation workflow.
- `Node Backend Engineer`: Implement Express/Apollo app, auth, and core business logic.
- `API Engineer`: Own GraphQL schema, resolver contract, and Android-facing API stability.
- `Database Engineer`: Own MongoDB schema design and SQL-to-Mongo migration validation.
- `React Engineer`: Build the React app, donation flow, donor CRUD, and reporting UI.
- `DevOps Engineer`: Own Dockerfiles, Compose, Nginx, deployment hardening, and environment setup.
- `Test Engineer`: Verify dues calculations, migration integrity, auth flows, and mobile interaction quality.

## CEO Handoff To CTO

The project is now scoped at the product-requirements level. CTO should use this brief plus the source spec to:

- lock the technical approach,
- confirm any unresolved assumptions,
- break execution into department-level tasks,
- prioritize the donations workflow, dues logic, and migration path first.
