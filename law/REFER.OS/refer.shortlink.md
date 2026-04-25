# Law 53: refer.shortlink.md - Shortlink System Reference (Baseline)

Status: Baseline (as-built documentation)
Scope: Shortlink URL format, resolution flow, and guardrails

This document captures how shortlinks work today. It is app-agnostic and
describes the system behavior and routing rules; app-specific mapping lives in
`refer.<app>.md`.

## Article 53.1: 1) Canonical URL shape (as-built)

- Shortlinks are top-level paths on the canonical host:
  - `https://<app-domain>/<code>` (see `refer.<app>.md`)
- There is no `/s/` prefix in production.

## Article 53.2: 2) Code format and validation (as-built)

- Edge validation accepts:
  - alphanumeric codes
  - length 4-16
- Reserved top-level paths are excluded (e.g., `events`, `orgs`, `assets`).
- UUIDs are excluded from shortlink resolution.

These are validation rules only; the naming convention for codes is defined by
the app (see `refer.<app>.md`).

## Article 53.3: 3) Resolution flow (as-built)

Shortlink resolution happens at the edge and in Pages Functions:

1) **Pages middleware** (`functions/_middleware.ts`)
   - For `GET`/`HEAD` requests, detect `/<code>` and skip known bot UAs.
   - Call Supabase Edge Function `shortlink-resolve`.
   - If resolved, return `302` to the target SPA route with `cache-control: no-store`.

2) **Pages Function** (`functions/[code].ts`)
   - For bot requests, inject OG metadata into the HTML shell.
   - For human navigation, return the SPA shell (redirect is handled by middleware).

3) **Supabase Edge Function** (`shortlink-resolve`)
   - Source of truth for resolving `code` to `{ resolved, type, id, targetPath }`.

## Article 53.4: 4) OG behavior (as-built)

- Bots receive OG HTML for `/<code>` via `functions/[code].ts`.
- Humans (non-bot UAs) are redirected by middleware to the resolved target.
- All HTML responses use `Cache-Control: no-store`.

## Article 53.5: 5) App-specific mapping

App-specific prefix mapping (org/event/profile/invite) is defined in:
- `REFER.OS/refer.<app>.md`

## Article 53.6: 6) Verification (recommended)

- `curl -I -H "Accept: text/html" https://<app-domain>/<code>`
  - Expect `302` with a `Location` header.
- For bots (OG), request with a bot UA and confirm OG tags in the HTML.
