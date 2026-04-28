# Telechurch Zo Admin Build Contract

Last updated: 2026-04-22
Status: Draft operating contract with auth bridge regression notes
Instance: `telechurch`
Space: `https://telechurch.zo.space`

## Purpose

Define the boundary between Telechurch and the Telechurch Zo computer before any live tenant administration is wired.

Zo may host a ministry admin interface, coach users through setup, draft actions, and call approved Telechurch APIs. Telechurch remains the system of record for identity, tenant data, permissions, billing, contact data, messages, events, audit logs, and all mutations.

## Current POC Surface

- Page: `https://telechurch.zo.space/admin`
- Page: `https://telechurch.zo.space/console`
- API: `/api/auth/begin`
- Page: `/auth/callback`
- API: `/api/auth/exchange`
- API stub: `/api/me`
- API stub: `/api/tenants/:tenantId/summary`
- API stub: `/api/tenants/:tenantId/audit`

The auth bridge routes are live bridge routes. Other admin/tenant routes remain stubs unless explicitly verified otherwise. Stub routes must not be treated as production integration.

## Authority Flow

Browser -> Telechurch login -> Telechurch scoped operator context -> Zo Space page -> Zo API BFF -> approved Telechurch APIs -> Telechurch auth, DB, billing, audit, and message systems.

## Auth Bridge Regression Contract

This section is durable guidance for future Codex/Zo chats. It was added after a real browser regression where curl checks passed but the Zo login click still failed.

### Route split

- Zo `/api/auth/begin` is an API route. It must:
  - generate `state`
  - generate PKCE verifier/challenge
  - store short-lived HttpOnly/Secure cookies for `state`, `return_to`, and verifier
  - return a top-level `302` to `https://telechurchlive.com/auth/authorize`
- Telechurch `/auth/authorize` is a Cloudflare Pages Function, not an Angular route. It validates:
  - `response_type=code`
  - `client_id=telechurch-zo-space`
  - `redirect_uri=https://telechurch.zo.space/auth/callback`
  - `state`
  - `code_challenge`
  - `code_challenge_method=S256`
- If no Telechurch session exists, `/auth/authorize` redirects to `/login?redirect=<encoded /auth/authorize?...>`.
- Telechurch login post-auth must browser-navigate back to `/auth/authorize?...`; it must not use Angular `router.navigateByUrl(...)` for that target.
- Zo `/auth/callback` is a public page route. It reads `code/state`, calls `/api/auth/exchange`, and displays retry/error UI on failure.
- Zo `/api/auth/exchange` is an API route. It validates state/PKCE cookies, calls Telechurch `/auth/token` server-to-server, and sets a Zo-safe HttpOnly/Secure session cookie. It must never expose a Telechurch access token to browser code.

### Required verification

Do not approve Telechurch Zo auth changes using only curl, HEAD, or direct requests to `telechurchlive.com`. Those checks only prove edge behavior and can miss client-router failures.

Required regression test:

1. Use Playwright or equivalent real browser automation.
2. Open `https://telechurch.zo.space/login`.
3. Click the visible `Continue with Telechurch` link.
4. Log top-level navigation requests/responses.
5. Logged-out expected stop: `https://telechurchlive.com/login?redirect=%2Fauth%2Fauthorize...`.
6. Failure signature: final URL `https://telechurchlive.com/?response_type=code&client_id=telechurch-zo-space...`.

### Known pitfall

Angular SPA routing can swallow `/auth/authorize` if code calls `router.navigateByUrl('/auth/authorize?...')`. That changes the user-visible URL without executing the Cloudflare Pages Function. Use `window.location.assign('/auth/authorize?...')` for this server route.

## Non-Negotiable Boundaries

- No direct Telechurch database access from Zo.
- No shared master admin token in Zo.
- No privileged Telechurch token in browser storage.
- No secrets in Zo route code, public assets, files, logs, or docs.
- No live billing, email, contact import, invite sending, user disabling, public publishing, or tenant mutation without explicit confirmation.
- Every live request must carry actor, tenant, role, scope, and audit context.
- Every mutation must be performed through approved Telechurch APIs only.
- Zo must label stub, sandbox, and production behavior clearly.

## Required Telechurch APIs

### Auth Exchange

Purpose: exchange a Telechurch-authenticated browser session or one-time handoff code for a Zo-safe, tenant-scoped operator context.

Current bridge shape:

- begin route: Zo `/api/auth/begin`
- provider authorization endpoint: Telechurch `/auth/authorize`
- callback page: Zo `/auth/callback`
- exchange route: Zo `/api/auth/exchange`
- token endpoint: Telechurch `/auth/token`

Expected input:

- handoff code or signed session assertion
- target tenant id, if user has multiple tenants
- requested scopes

Expected output:

- actor id
- tenant id
- role
- allowed scopes
- short-lived access token or server-side session reference
- expiration
- audit correlation id

### Current Operator

Purpose: let Zo render the active user and capabilities.

Expected output:

- display name
- tenant name
- role
- allowed actions
- plan/trial summary
- profile readiness
- assistant capability flags

### Tenant Summary

Purpose: read-only setup dashboard.

Expected output:

- profile readiness
- plan/free-vs-paid state
- first service readiness
- contacts readiness
- welcome email readiness
- recent safe audit summary
- next recommended action

### Draft Action

Purpose: allow Zo to prepare a proposed action without executing it.

Examples:

- draft welcome email
- draft contact import mapping
- draft first service schedule
- draft plan upgrade explanation

Expected output:

- draft id
- human-readable summary
- exact proposed mutation
- required permission
- risk level
- confirmation text

### Confirm Action

Purpose: execute a previously drafted action after explicit user confirmation.

Expected input:

- draft id
- actor id
- tenant id
- confirmation acknowledgement
- audit correlation id

Expected output:

- result status
- changed resource ids
- audit event id
- rollback/reversal guidance if applicable

### Audit Trail

Purpose: display what Zo suggested, what the user confirmed, and what Telechurch executed.

Expected output:

- events
- actor
- tenant
- action
- status
- source
- timestamp
- correlation id

## Build Sequence

1. Keep current Zo POC stubbed and safe.
2. Define Telechurch-side API contracts and required scopes.
3. Implement read-only auth/context bridge first.
4. Implement read-only tenant summary next.
5. Add draft-only actions.
6. Add explicit confirmation action execution.
7. Add audit display and operational validation.
8. Run Figma/mobile-first interface pass before treating the UI as production.

## Overnight Work Boundary

Safe unattended work:

- improve route copy and information architecture
- create docs, route maps, and validation reports
- inspect stubs and route source
- prepare API contracts
- validate public pages and stub responses

Unsafe unattended work:

- connecting production auth
- deploying Telechurch Edge Functions
- reading or mutating tenant data
- sending email/SMS/invites
- importing contacts
- creating Stripe/billing flows
- publishing production changes

## Next Human Checkpoint

Approve which Telechurch API should be built first:

1. Auth exchange and current operator context.
2. Tenant summary read-only dashboard.
3. Draft welcome email with no sending.
4. Draft first service setup with no publishing.
