# Code Quality Review Report

## Scope

- Reviewed: `masik-chada-project-spec.txt`
- Reviewed: `docs/masik-chada-scoped-project-brief.md`
- Review mode: pre-implementation specification and quality risk assessment

## Findings (Prioritized)

### 1. [High] `serial_number` allocation is race-prone and can create duplicates

- Evidence: source spec requires `createDonor` to assign `serial_number` as `max + 1` ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:349), [docs/masik-chada-scoped-project-brief.md](/workspace/mymentech-agency/masik-chada-src/docs/masik-chada-scoped-project-brief.md:50)).
- Risk: concurrent donor creation can read the same max and attempt duplicate writes, causing either write errors or inconsistent numbering depending on index enforcement.
- Recommendation: define an atomic counter strategy (e.g., dedicated counters collection + `findOneAndUpdate` with `$inc` and `upsert`) and enforce unique index on `serial_number`.

### 2. [High] Dues-cron writes to an undefined data model

- Evidence: cron section mandates monthly upserted dues records ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:670)) while the declared models only include Donor/Payment/User ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:160)).
- Risk: implementation divergence between teams (materialized dues vs on-the-fly computation) and potential report/dashboard inconsistencies.
- Recommendation: add an explicit `Dues` schema (or remove cron record persistence and compute dynamically) and align API/report requirements to one source of truth.

### 3. [Medium] Authentication requirement is ambiguous for `login` operation

- Evidence: brief states `/graphql` is protected by JWT bearer auth ([docs/masik-chada-scoped-project-brief.md](/workspace/mymentech-agency/masik-chada-src/docs/masik-chada-scoped-project-brief.md:57)); source spec says all operations are through `/graphql`, but only "all other" operations require token ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:381)).
- Risk: implementers may accidentally protect `login` mutation and block authentication.
- Recommendation: clarify wording to explicitly exempt `login` from auth middleware checks.

### 4. [Medium] CORS policy is overly permissive for production

- Evidence: spec says CORS must allow all origins ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:385), [masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:805)).
- Risk: broad origin allowance increases attack surface and makes abuse harder to constrain.
- Recommendation: allowlist known web origins plus explicit Android client behavior; keep wildcard only for short-lived development modes.

### 5. [Medium] Production URL config uses `http` instead of `https`

- Evidence: `FRONTEND_URL=http://subscription.mymentech.com` in production env example ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:616)).
- Risk: mixed-content/cookie/security-header misconfiguration during deployment hardening.
- Recommendation: set production URL examples to `https://subscription.mymentech.com` and document TLS termination assumptions.

### 6. [Low] Dockerfile pattern bakes `.env` into runtime image

- Evidence: backend Dockerfile copies `.env` into image ([masik-chada-project-spec.txt](/workspace/mymentech-agency/masik-chada-src/masik-chada-project-spec.txt:643)).
- Risk: secrets become part of image layers and are harder to rotate safely.
- Recommendation: inject runtime env via Compose/environment variables/secrets; avoid copying `.env` into image.

## Open Questions Blocking Clean Implementation

- Should dues be persisted monthly (`dues` collection) or derived at query time from donor + payment history?
- What is the exact CORS policy for Android consumption (origin rules, token transport expectations)?
- Is strict sequential numbering legally required, or is unique non-contiguous numbering acceptable after retries/rollbacks?

## QA Lead Handoff

- Status: Review complete for current artifacts.
- Primary blockers before implementation: Findings 1 and 2.
- Recommendation: convert Findings 1-3 into mandatory pre-build clarifications, and treat Findings 4-6 as deployment/security hardening gates.
