# Law 11: refer.auth.md - Authentication Reference (Baseline)

Status: Baseline (as-built documentation)
Scope: App-agnostic authentication, providers, and persistence rules

This document captures how authentication works today and the intended method of
access control. It is app-agnostic: it describes the system and its relations
without embedding app-specific UI details.

## Article 11.1: 1. Systems and providers (as-built)

Primary auth system:
- Supabase Auth (email/password, OTP, OAuth)

OAuth providers (enabled by configuration):
- Google
- Facebook

Supporting persistence:
- Supabase Postgres (profile rows and app data tied to auth user ID)

## Article 11.2: 2. Runtime flow (as-built)

Auth repository:
- `src/app/core/repositories/auth.repository.ts` wraps Supabase Auth and handles
  sign-in, sign-up, OAuth, session resume, and sign-out.

Ignition flow:
- `src/app/workflows/front-end-workflows/auth/ignition/*` initializes auth
  state and wires auth changes into feature stores.

Redirect handling:
- Post-auth routing is owned by the SPA (see `REFER.OS/refer.cloudflare.md`).
- Redirect persistence keys: `auth:requested_url`, `auth:hint_url`,
  `auth:resolved_url`, `auth:requested_source`.

## Article 11.3: 3. Persistence model (as-built)

Auth identity:
- Supabase Auth user ID is the canonical identity for persisted data.

Profile storage:
- Profiles are stored in Supabase and keyed by auth user ID.
- The auth repository provides helpers to ensure a profile exists and to
  persist missing avatar/name data after login.

Visitor identity:
- Anonymous users may operate without a profile.
- When a user authenticates, visitor identity can be persisted onto the profile
  (without overwriting verified profile fields).

## Article 11.4: 4. Access policy (baseline philosophy)

Purpose:
- The site is broadly accessible without login to maximize participation.
- Authentication is required only when a feature must persist user data
  or enforce ownership.

Require auth when:
- Data must persist across sessions (giving history, reward tokens, bible journey,
  saved profiles, or any write that is user-scoped).
- Actions require ownership or auditing (deletes, exports, admin operations).

Allow anonymous when:
- Reading public content (events, live streams).
- Interactions that are ephemeral and do not require identity persistence.
- Realtime participation may still require auth when a feature needs a verified
  identity for attribution; prompt via auth modal and allow cancel.

## Article 11.5: 5. Environment and keys (as-built)

Canonical env source:
- `.env.master` is the authoritative location for runtime auth configuration.

Required Supabase keys (do not embed values):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/edge only)
- `SUPABASE_ACCESS_TOKEN` (CLI / automation)
- `SUPABASE_DB_PASSWORD` (DB migrations)

Provider keys (when OAuth enabled):
- Google client ID/secret (Supabase OAuth config)
- Facebook app ID/secret (Supabase OAuth config)

## Article 11.6: 6. Modals and gating (baseline)

The system supports auth gating via modal prompts. Features should:
- detect when auth is required for a specific action,
- prompt the user to log in, and
- allow cancel without blocking unrelated access.

This avoids forcing navigation or locking users out of public surfaces.
