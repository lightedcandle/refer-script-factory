# Law 21: refer.compiler.init.md

Initialization playbook for bringing the Refer compiler online. Tracks execution phases separate from the canonical blueprint.

---

## Article 21.1: 1. Scope & Goals

- Stand up the refer\_\* (UBB) schema, ingestion services, and CLI surface described in `refer.compiler.blueprint.md`.
- Pilot `/events` as the first fully compiler-backed feature (interpret + materialize).
- Keep progress visible via checklists aligned to the Milestone ladder (M1–M4).

- Use the canonical compiler coverage scorecard when reporting “how compiled” a page is: `refer.compiler.metrics.md`.

---

## Article 21.2: 2. Phase Checklist

### Section 21.2.1: Phase 0 — Foundations

| Item                                                                                                                                                      | Owner            | Status | Notes                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create Supabase migrations for `refer_primitives`, `refer_instances`, `refer_rules`, `refer_actions`, `refer_assets`, `refer_routes`, `refer_build_logs`. | Platform (Codex) | ✅     | `supabase/migrations/2025121101_create_refer_compiler_tables.sql` applied via `supabase db push` (remote schema ready).                                             |
| Update environment wiring (`REFER_SUPABASE_URL`/`KEY`) for compiler runs.                                                                                 | DevOps           | ☐ → ⏳ | Added `refer` entry to `codex/env_context_map.yaml` requesting `REFER_SUPABASE_URL` + `REFER_SUPABASE_SERVICE_ROLE_KEY`. Need to populate secrets + resolver usage. |
| Stub CLI entrypoints (`refer.build interpret/materialize`) with no-ops.                                                                                   | Tooling          | ☐ → ✅ | Added `scripts/refer_build.cjs` + `npm run refer:build` stub logging requests.                                                                                      |

### Section 21.2.2: Phase 1 — Interpret Loop (M1)

| Item | Owner | Status | Notes |
| ---- | ----- | ------ | ----- |

| Implement ingestion layer: fetch
efer\_\* tables, cache primitives, sort instances. | Platform (Codex) | ✅ | ools/refer-compiler/genome.js +
pm run refer:build interpret emit dist/refer-runtime/<feature>.json. |
| Build graph assembly + validation (parent/child). | Platform (Codex) | ✅ |
esolvedTree + Refer Runtime Viewer surface adjacency, runtime-only nodes, and warnings. |
| Angular dev shell loader: consume runtime JSON and render feature placeholder. | Platform (Codex) | ✅ | /refer-runtime dev route renders payload summary + tree preview. |
| Smoke test with sample feature (demo or /events hero skeleton). | Platform (Codex) | ✅ | /events route shows the compiler output; /refer-runtime/events matches the runtime tree. |

### Section 21.2.3: Phase 2 ??" Materialize (M2)

| Item                                                                       | Owner            | Status | Notes                                                                                                                                                                                                               |
| -------------------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map intermediate nodes + TS/HTML/SCSS templates (signals, store, effects). | Platform (Codex) | Done   | /events component, store, and effects are generated from the runtime tree, with EventsEffects delegating IO to EventsService.                                                                                       |
| File writer: output to src/app/features/<feature>/....                     | Platform (Codex) | Done   | `refer:build materialize --feature events` writes runtime JSON, primitive map, and Angular component/store trio.                                                                                                    |
| Logging hook + refer_build_logs + dist/refer-logs/<build_id>.json.         | Platform (Codex) | Done   | CLI now emits JSON logs, queues runs when Supabase creds are missing, and replays them once the service key is added.                                                                                               |
| QA loop: run lint/tests after materialize run.                             | Platform (Codex) | Done   | `refer.build qc` now shells to `npm run test`, `npm --prefix wrangler run test` (Vitest workers), then `npm run build`, so every bloom captures Angular readiness + worker guards until feature-level specs arrive. |

### Section 21.2.4: Phase 3 — /events Pilot

| Item | Owner | Status | Notes |
| ---- | ----- | ------ | ----- |

| Author /events UBB dataset (hero, list, detail, share, guards) inside
efer\_\* tables. | Platform (Codex) | ✅ | 2025121104_seed_events_refer_data.sql + friends seed hero/timeline/calendar + share/detail canvases. |
| Flag `/events` detail/share routes in `refer_instances.compiler_enabled = true`. | Platform (Codex) | ✅ | 2025121301 migration flips compiler flags so `/events`, `/events/:id`, and `/events/:id/share` materialize via refer.build. |
| Run interpret + materialize for /events; validate UI. | Platform (Codex) | ✅ | /events renders compiler-generated hero + timeline; Refer Runtime Viewer shows matching tree/runtime JSON. |
| Capture learnings + update compiler blueprint & init plan. | Platform (Codex) | ⏳ | First bloom logged here; broadcast + QC instrumentation still pending. |

### Section 21.2.5: Phase 4 ??" Hybrid/Broadcast Prep

| Item                                                               | Owner            | Status      | Notes                                                                                                                              |
| ------------------------------------------------------------------ | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Define `refer_actions` rows mapping `/events` intents to services. | Platform (Codex) | Done        | `supabase/migrations/2025121105_seed_events_actions_rules.sql` seeds EventsIntent.Load/Ok/Err with EventsService + store handlers. |
| Guard injection rules (`refer_rules trigger=UBB.Route`) validated. | Platform (Codex) | Done        | The same migration auto-attaches `IgnitionGuard` to the compiler-backed `/events` route during ingest.                             |
| Document readiness in `refer.plan.json` & Codex QC logs.           | Platform (Codex) | In Progress | Blueprint + todo now reflect the logging queue + EventsService wiring; QC interrogation still needs linked build IDs.              |

### Section 21.2.6: Phase 5 — Theming & OG Prep

| Item                                                            | Owner            | Status | Notes                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Define shared palette storage (`refer_theme_tokens`).           | Platform (Codex) | ✅     | `2025121302_create_refer_theme_tokens.sql` seeds surface/accent/text/shadow/font tokens for IMSCE use.                                                                                                                                                           |
| Expose tokens in compiler payloads.                             | Platform (Codex) | ✅     | `refer.build` now loads `refer_theme_tokens` and includes them as `themeTokens` for every interpret/materialize run.                                                                                                                                             |
| Map primitives to shared tokens + emit CSS vars.                | Platform (Codex) | ƒo.    | `2025121303_update_refer_primitives_style_tokens.sql` rewires primitive `style_tokens` to semantic hooks and the materializer now maps them to role-scoped CSS vars fed by `refer_theme_tokens` (events/detail/share regenerated via `refer.build materialize`). |
| Expose ShareIdentity data in runtime payload.                   | Platform (Codex) | ƒo.    | `2025121304_create_refer_share_identity.sql` adds the canonical view, `refer.build` loads it into `shareIdentities`, and events/share blooms were regenerated so OG wiring can bind real data.                                                                   |
| Inject OG meta tags for share routes (client bridge).           | Platform (Codex) | ƒo.    | `refer.build` now injects share preview UI + Angular Meta/Title wiring for `/events/:id/share`, so ShareIdentity payloads emit OG/Twitter tags and render visible summaries ahead of full SSR head orchestration.                                                |
| Emit static ShareIdentity head fragments.                       | Platform (Codex) | ƒo.    | Materializer writes `dist/refer-head/events-share/*.html` fragments (generated from ShareIdentity rows or fallback) so SSR/static hosts can inline OG/Twitter tags before HTML returns.                                                                          |
| Author ShareIdentity expansion plan (orgs/startchurch/landing). | Platform (Codex) | ?o.    | `refer.app/plan/refer.shareidentity.expansion.md` lists target routes, data sources, and compiler tasks for extending OG coverage beyond `/events`.                                                                                                              |

### Section 21.2.7: Phase 6 ??" Start Church Bloom (Planning)

### Section 21.2.8: Phase 7 ??" Refer Design Lab Bloom (Planning)

| Item                                                                   | Owner            | Status  | Notes                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document referdesign compiler scope + UBB tree.                        | Platform (Codex) | ?o.     | `refer.app/plan/refer.designlab.compiler.md` describes primitives, runtime data, and palette sourcing.                                                                            |
| Decide palette data source (extend `refer_theme_tokens` vs new table). | Platform (Codex) | Pending | Need migration plan for design lab palettes + sample copy.                                                                                                                        |
| Seed `/designlab` route + instances in refer\_\* tables.               | Platform (Codex) | Pending | Insert Root/Shell/Sections/Cards/Modal with `compiler_enabled=true` under labs guard.                                                                                             |
| Materialize referdesign feature via `refer.build`.                     | Platform (Codex) | Pending | Generate Angular blossom + runtime; wire labs route to new component.                                                                                                             |
| Retire legacy `design-lab.component.ts` after parity check.            | Platform (Codex) | Pending | Remove old component + JSON once compiler bloom verified.                                                                                                                         |
| Item                                                                   | Owner            | Status  | Notes                                                                                                                                                                             |
| ---                                                                    | ---              | ---     | ---                                                                                                                                                                               |
| Document `/startchurch` compiler scope + UBB tree.                     | Platform (Codex) | ?o.     | `refer.app/plan/refer.compiler.startchurch.md` captures the primitive tree, runtime content, and intent/service requirements.                                                     |
| Author refer data migration for `/startchurch`.                        | Platform (Codex) | Pending | Seed `refer_routes` + `refer_instances` (Root ? Shell ? Sections/Cards/Modal) with `compiler_enabled=true`.                                                                       |
| Capture runtime content assets (pillars, CTA, modal copy).             | Platform (Codex) | Pending | Represent copy (Simple/Affordable/Trusted pillars, Telechurch handles everything, CTA text) as structured JSON/`refer_assets` derived from `refer.app/plan/start_your_church.md`. |
| Generate Start Church bloom via `refer.build`.                         | Platform (Codex) | Pending | Interpret/materialize once data lands; outputs Angular component/runtime + primitive map.                                                                                         |
| Hook Start Church intents/services.                                    | Platform (Codex) | Pending | Add `refer_actions` rows + store/effects plumbing so CTA/donate/modal flows stay governed.                                                                                        |

---

## Article 21.3: 3. Reporting & Sync

- Update this file (checkmarks + notes) after each milestone deliverable.
- Reflect status in `public/assets/plan/refer.plan.json` under “Standalone /events system” and a new “Compiler Init” track if needed.
- Reference build IDs from `refer_build_logs` when posting QC results.

---

## Article 21.4: 4. QC & Build Trace

- **refer-build-2025-12-13T14-55-41-218Z-073effca-9724-43e6-813e-9ab1bba00fdf** ? `refer.build qc` (events bloom)
- **refer-build-2025-12-13T21-43-46-255Z-2ea9b4fc-155a-4960-94a7-0dcd7e518867** ? `refer.build materialize --feature events-share` (adds ShareIdentity head fragments)

- **2025-12-14** ??" Captured the Refer Design Lab compiler plan (`refer.app/plan/refer.designlab.compiler.md`), outlining palette ingestion + UBB layout (Phase 7).
- **2025-12-14** ??" Authored the ShareIdentity expansion plan (`refer.app/plan/refer.shareidentity.expansion.md`) outlining ichurch/orgs/startchurch OG targets.
- **2025-12-14** ??" Documented the `/startchurch` compiler bloom (Phase 6) in `refer.app/plan/refer.compiler.startchurch.md`, outlining primitives, runtime data, and migration steps.
- **2025-12-12** — `/events` materializes entirely from the UBB dataset (runtime JSON, Angular component, and store). Compiler outputs are now served at `/events`; effects + QC logging remain on deck.
- **2025-12-13** – Supabase logging persists JSON + pending queue locally and replays builds to `refer_build_logs` once creds exist, while `/events` effects now call `EventsService.fetchEvents` to honor the `refer_actions.service_target`.
- **2025-12-13** – `refer.build qc` shells to `npm run test`, `npm --prefix wrangler run test`, then `npm run build`, so compiler runs log both Angular+worker verifications before emitting QC artifacts.
- **2025-12-13** – Added `EventsShareService` + effects wiring so `EventsIntent.ShareEvent` flows through `refer_actions.service_target=EventsShareService.open` instead of directly touching `navigator.share` inside the store.
- **2025-12-13** – `/events/:id` (detail) and `/events/:id/share` routes are now compiler-enabled, materialized via `refer.build materialize --feature events-detail|events-share`, and registered in Angular routing (share route left public for OG scrapers per `refer.og.md`).
- **2025-12-13** – `refer_theme_tokens` seeds the shared palette; `refer.build` injects tokens into every payload and the materializer emits CSS custom properties so future blossoms (and `/referdesign`) can swap themes 1:1.
- **2025-12-13** – Primitive `style_tokens` now reference `refer_theme_tokens` via semantic keys (migration `2025121303`), and the materializer applies those semantics to role-scoped CSS vars so `/events`/detail/share blooms render compiler-driven theming while staying within the Angular build budgets logged via `refer.build qc`.
- **2025-12-13** – `refer_share_identity` view + compiler ingestion landed (migration `2025121304` + `loadGenome`), so runtime payloads expose ShareIdentity rows for `/events/:id/share` ahead of the OG head injector—QC loop reran after regenerating events/detail/share.
- **2025-12-13** – Events share blossom now emits OG/Twitter meta tags via the Angular `Meta/Title` bridge generated by `refer.build` and renders the ShareIdentity preview at the top of `/events/:id/share`, keeping crawlers + humans aligned while the full SSR/static head materializer is scoped.
- **2025-12-13** – Compiler writes static head fragments under `dist/refer-head/events-share`, derived from ShareIdentity rows (with fallback), so future SSR/static hosts can inline OG/Twitter tags without re-computing them at runtime.
- **2025-12-13** – `refer.build` now mirrors those head fragments into `wrangler/src/generated/events-share-head.generated.ts`, and the Cloudflare Worker intercepts `/events/:id/share` to stream the correct `<head>` before meta refresh/JS redirect back to Angular, so OG scrapers receive deterministic tags without waiting for hydration.
- **2025-12-13** – Introduced a compiler-managed page root (`UBB.Root`) + theme service so `/events` applies `refer_theme_tokens` from the `<body>` down; Angular components now call `ReferThemeService.applyRootTheme/clearRootTheme` and the legacy host shell relinquishes its static white backdrop.
- **2025-12-13** – Standed up the Supabase Edge Function `events-list` plus Angular service plumbing so `/events` fetches real `org_events` rows via governed Spirit API paths (Cloudflare worker -> Mind/Edge) instead of direct Supabase REST from the client; the client still falls back to the stub list if the function is unreachable.
