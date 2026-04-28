# JamaicaEats Zo App Bridge Contract

Last updated: 2026-04-22
Status: Draft operating contract
Instance: `jamaicaeats`
Repo: `E:\jamaicaeats`

## Purpose

Define the boundary between the JamaicaEats app and the JamaicaEats Zo VIPC before any live app integration is wired.

Zo may coach users through the priority flow, draft implementation plans, prepare action contracts, and host safe stubs. JamaicaEats remains the system of record for identity, restaurants, menus, media, orders, payments, drivers, customers, map data, audit records, and deployments.

## Required Intake and Design Chain

Every JamaicaEats Zo request should begin with `refer-zo-intake-router`.

For general JamaicaEats operator/repo work, use:

```md
Use refer-zo-intake-router, then jamaicaeats-vipc-driver.
```

For JamaicaEats UI/design work, use:

```md
Use refer-zo-intake-router, then zo-design-driver, then jamaicaeats-design-driver.
```

Design output remains advisory until Codex implements it in `E:\jamaicaeats`.

## Current POC Surface

Planned safe Zo Space routes:

- Page: `https://jamaicaeats.zo.space/operator`
- Page: `https://jamaicaeats.zo.space/console`
- API stub: `/api/repo/context`
- API stub: `/api/stores/demo/summary`

All current API routes are stubs. They must not be treated as production integration.

## Authority Flow

Browser -> JamaicaEats auth -> JamaicaEats scoped operator context -> optional Zo handoff -> Zo Space page -> Zo API BFF stub or approved JamaicaEats API -> JamaicaEats auth, DB, Cloudflare, Stripe, maps, media, and audit systems.

## Required JamaicaEats APIs Before Live Wiring

### Auth Exchange

Purpose: exchange a JamaicaEats-authenticated browser session or one-time handoff code for a Zo-safe, scoped operator context.

Expected output:

- actor id
- restaurant/store id
- role
- allowed scopes
- short-lived token or server-side session reference
- expiration
- audit correlation id

### Current Operator

Purpose: render the active operator and capabilities.

Expected output:

- display name
- store/restaurant name
- role
- allowed actions
- onboarding readiness
- payment readiness
- menu readiness
- board readiness

### Store/Menu Readiness Summary

Purpose: read-only dashboard for the current priority path.

Expected output:

- auth state
- restaurant profile readiness
- menu category/item count
- logo/media readiness
- board preview readiness
- screen assignment readiness
- Stripe/payment readiness
- next recommended action

### Draft Action

Purpose: allow Zo to prepare a proposed action without executing it.

Examples:

- draft restaurant setup checklist
- draft menu import mapping
- draft board preview checklist
- draft Stripe readiness explanation
- draft screen setup steps

Expected output:

- draft id
- human-readable summary
- exact proposed mutation
- required permission
- risk level
- confirmation text

### Confirm Action

Purpose: execute a previously drafted action after explicit user confirmation.

Expected output:

- result status
- changed resource ids
- audit event id
- reversal guidance if applicable

## Build Sequence

1. Keep Zo routes read-only and stubbed.
2. Use Codex against `E:\jamaicaeats` for repo-grounded work.
3. Build read-only auth/current operator context first.
4. Build read-only store/menu readiness next.
5. Add draft-only actions for menu import and board setup.
6. Add explicit confirmation and audit before action execution.
7. Only then consider production wiring.

## Safe Unattended Work

- improve docs, route maps, and validation reports
- inspect repo files and summarize state
- draft API contracts
- draft design contracts
- create clearly labeled stubbed Zo routes

## Unsafe Unattended Work

- connecting production auth
- deploying Cloudflare or Supabase changes
- reading or mutating live store/menu/order/payment data
- sending email/SMS/invites
- importing contacts or menus into production
- creating Stripe billing or Connect actions
- changing DNS, domains, Pages settings, or production secrets
