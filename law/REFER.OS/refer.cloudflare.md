# Law 18: refer.cloudflare.md Cloudflare System Relation

This reference captures the Cloudflare deployment and edge behavior from `codex/governance/domains/Cloudflare.md` and explains how REFER.OS treats Cloudflare as a critical relation.

## Article 18.1: 1. Cloudflare Roles

- Cloudflare hosts the canonical front-end, proxy, API edge functions, and the app’s resolver domains (defined in `refer.<app>.md`). Whenever remote management tasks target these assets, the router routes through `refer.systems.security.md` so `.env.master` credentials are used safely.
- Deployments must follow the RETURN+'COMMIT+'PUBLISH sequence; PUBLISH includes pushing the worker release, purging caches, and noting the state in `refer.qc.md` so the publish integrity checks pass.

### Section 18.1.1: 1.1 App-specific media ingest rules

Media ingest rules and stream key handling are app-specific and must be documented in `refer.<app>.md` or the app’s Cloudflare runbook.

## Article 18.2: 2. Referential alignment

- Whenever `refer.build`, `refer.migrate`, or `refer.repair` touches Cloudflare routes, workers, or caching headers, mention this document so the router knows which systems relation to call.
- Canonical short URLs (per `refer.supabase.md`) rely on the Cloudflare resolver to translate `{uuid}` into the Supabase path; document the resolver endpoint, TTL, and caching strategy here before any edge change.
- Use the design lab (`refer.designlab.md`) to prototype new surface shaders or tokens before deploying them through Cloudflare so the visual alignment is tested without breaking production caches.

## Article 18.3: App Cloudflare runbook

- App-specific Cloudflare routing and DNS details live in `apps/<app>/refer.<app>.cloudflare.md`. Refer there before editing the worker, binding routes, or documenting a publish, so we keep the app-specific rules separate from the general systems relation.

## Article 18.4: 3. System compliance

- Any Cloudflare configuration change that touches routing, caching, or authentication must be referenced in this relation and, if it alters law-level behavior, trigger `refer.governance` for review.

## Article 18.5: 4. Deployment guidance

- `refer.systems.security.md` governs the remote management path, so align every publish with its credential protocol (look up `.env.master` and hydrate `CLOUDFLARE_API_TOKEN` or the legacy `CLOUDFLARE_API_KEY`/`CLOUDFLARE_EMAIL` pair before invoking Wrangler). The router needs this link so the return/commit/publish loop knows when the work crossed the remote-domain boundary.
- Authorization: when a request is routed through `refer.cloudflare`, Codex is authorized to use `.env.master` credentials for Cloudflare deploy/purge without a separate permission step; RETURN remains mandatory.
- Prefer a scoped API token with Worker + Pages permissions; when a token lacks `User Details +' Read`, `wrangler deploy`/`wrangler pages deploy` will report `Authentication error [code: 10000]`, so fall back to the API key/email combo that is already stored in `.env.master`.
- App-specific publish commands, output directories, project names, and cache purge targets must be documented in the app Cloudflare runbook (`apps/<app>/refer.<app>.cloudflare.md`).
- `wrangler` is the canonical operational control surface for Cloudflare mutation and inspection when the task is CLI-supported.

### Section 18.5.1: 4.1 Guardrails (required for OG reliability)

Cloudflare Pages deploys can succeed while silently dropping the **Pages Functions bundle** (everything under `functions/`). When that happens, the SPA may still load, but OG injection + deep-link behavior breaks.

Required guardrails:

- **Deploy from repo root** so `functions/` is included in the deploy context.
- **Deploy to the Pages project's configured production branch** (do not invent branch names).
- **Assert functions bundle is active**: the latest production deployment must report `uses_functions=true`.
- **Smoke test after deploy (with retries)**: verify `200` + OG tags for the app-defined share routes and at least one canonical share link (see the app Cloudflare runbook).
- **Bot detection must win over "browser navigation" heuristics**: some scrapers send `Accept-Language`, so only treat `isBrowserNavigation(...)` as human when `!isBot`.

Canonical commands:

- App-scoped deploy and OG smoke commands must be documented in `apps/<app>/refer.<app>.cloudflare.md`.

## Article 18.6: 5. Document caching doctrine (SPA + OG routes)

When a Cloudflare Pages site serves an SPA plus OG-enabled share endpoints, caching must treat **documents** (HTML) differently from **assets** (JS/CSS/images). If you don't, in-app browsers (WhatsApp/IG/Facebook) can cache an OG shell or stale SPA shell and "hang" until a manual refresh.

### Section 18.6.1: 5.1 Non-negotiable rules

- **Never cache HTML documents**: Any response whose `content-type` is `text/html` must be `Cache-Control: no-store` (or, at minimum, `no-cache`). Prefer `no-store` for SPAs with edge-generated HTML.
- **Aggressively cache assets**: Hashed `*.js`, `*.css`, and static media should be `public, max-age=31536000, immutable`.
- **Avoid global `/* -> no-store` rules in `_headers`**: Cloudflare Pages merges headers from matching rules. A global `/*` rule can accidentally combine with `/*.js` and produce invalid/contradictory caching like `Cache-Control: no-store, immutable` (disabling asset caching).

### Section 18.6.2: 5.2 Where to enforce "no-store" for HTML

Use both layers (they serve different purposes):

- **Pages Functions** (recommended): For SPA entrypoints like `/events/:id` or `/ichurch/:id`, explicitly set `cache-control: no-store` on the HTML response returned from `context.next()` and the `index.html` fallback. This guarantees dynamic routes don't accidentally become cacheable.
- **`public/_headers`**: Ensure the core HTML and PWA control documents are not cached:
  - `/index.html` and `/404.html` -> `Cache-Control: no-store`
  - `/ngsw.json` and `/ngsw-worker.js` -> `Cache-Control: no-store`

### Section 18.6.3: 5.3 Share route guardrails (OG + in-app browsers)

- **Do not rely on UA sniffing alone** to decide "bot vs human." In-app browsers sometimes use bot-like UAs.
- If an OG HTML shell is ever served to a real user, it must include a **meta refresh + JS redirect** fallback to the SPA route, and the response should be `Cache-Control: no-store` for humans.

### Section 18.6.4: 5.4 Service worker interaction (PWA)

Service workers amplify cache issues because they can:

- cache an older HTML shell,
- pin a broken bootstrap path,
- and behave inconsistently across in-app webviews.

Mitigation patterns:

- Keep `/ngsw.json` and `/ngsw-worker.js` `no-store`.
- Consider disabling SW registration in known in-app browsers and proactively unregistering existing registrations when diagnosing "first open hangs."

### Section 18.6.5: 5.5 Quick verification commands

- Check HTML is not cached: `curl --head https://<app-domain>/<route>` -> `cache-control: no-store`
- Check assets are cached: `curl --head https://<app-domain>/<asset>` -> `cache-control: public, max-age=31536000, immutable`
- Check share route behavior:
  - Browser navigation should `302` from `/.../share` to the real SPA route.
  - Bot UA should receive OG HTML with correct tags (and optional redirect fallback).

## Article 18.7: 6. Canonical host doctrine (www vs apex)

Canonical host doctrine is app-specific and must be documented in the app Cloudflare runbook (`apps/<app>/refer.<app>.cloudflare.md`) or `refer.<app>.md`. If host canonicalization is required, prefer temporary redirects to reduce sticky-client behavior in in-app browsers and keep share URLs, canonical tags, and robots aligned to the canonical host.

## Article 18.8: 7. SPA Redirect Authority (Auth + Resume)

App-specific SPA redirect authority (routes, storage keys, and auth callback contracts) must be documented in `refer.<app>.md`.

## Article 18.9: 8. Pages Functions fallback (HEAD deep links)

Some in-app browsers probe SPA routes with `HEAD` before issuing the real `GET`. If Pages responds `404` to `HEAD` deep links, clients can surface a "hang"/ERR_FAILED before the navigation proceeds.

- **Mitigation:** Pages Functions should treat `HEAD` deep links that look like SPA routes as `200` with `Cache-Control: no-store` (bodyless), mirroring the SPA fallback behavior.

## Article 18.10: 9. Spirit Surface Routing

When Spirit architecture phases are active (`REFER.OS/refer.spirit.md`), Cloudflare must preserve the canonical surface split:

- `api.telechurchlive.com` for API and `/rt/*` realtime namespace.
- `file.telechurchlive.com` for file resolution and signed delivery.
- app host for Body routes only.

Rules:

- Prefer path/module isolation under `api` and `file` before adding new subdomains.
- Cache behavior must follow Spirit route-class policy and cache-key law.
- `Authorization` requests default to no-store unless the route-class policy explicitly allows an exception.

## Article 18.11: 10. Durable Object Alarm Reliability (Reminder Systems)

When Cloudflare Workers + Durable Objects are used for reminder scheduling, publish gates must validate both scheduling and dispatch authority. This prevents "scheduled but never sent" regressions.

Required method:

- Split verification into two lanes: `scheduling correctness` and `dispatch correctness`.
- Persist reminder diagnostics in DO storage (`diag:reminder`) so alarm state survives request boundaries.
- Always set alarm to the **earliest future due** entry across pending keys; never rely on a single first-row lookup.
- After every set, read alarm back and store `alarm_iso` + `last_set_alarm_at`.
- Record alarm lifecycle markers: `last_alarm_start_iso`, `last_alarm_ok_iso`, `last_alarm_error_iso`.
- Record dispatch markers: `last_dispatch_ok_at`, `last_dispatch_error_at`.
- Internal machine paths must use explicit trust (`x-telechurch-internal` or approved service bearer), not user-JWT-only flows.
- Expose an internal-only read endpoint for reminder diagnostics; never expose this publicly.

Publish verification checklist:

1. Reseed returns candidates (`fetched > 0`, `normalized > 0`, `scheduled > 0`).
2. Internal diag shows future `alarm_iso` immediately after reseed.
3. After due time, diag shows `last_alarm_ok_iso` (or actionable `last_alarm_error_iso`).
4. Notification side effect exists (`notification_stream` row with expected `template_key` + `intent_ref`).

Cross-reference: `REFER.OS/refer.build.md`, `REFER.OS/inference.md`, `REFER.OS/refer.repair.md`, `REFER.OS/refer.spirit-runtime.md`.
