# Law 35: refer.identity.md -- Identity Registry for REFER.OS

This is the canonical identity registry for REFER.OS. Before any action (`refer.build`, `refer.repair`, `refer.expand`, etc.) proceeds, the router must be able to name the identities involved (feature/workflow/broadcast/system/provider) and point to their authoritative locations.

## Article 35.1: 1. What belongs here

- **Identity names**: canonical names for workflows, features, broadcasts, providers, and systems.
- **Identity anchors**: where each identity lives in the repo (paths and entry points).
- **Identity invariants**: constraints that must remain true (view-only components, no IO in views, signal/store boundaries).

## Article 35.2: 2. Living identity recognizers

These are vocabulary (identity), not procedure (implementation).

- **Mind (workflow)**: ASEDAWSI (Action -> Service -> Guard -> Edge/Signal -> UI), anchored under `src/app/workflows/**`.
- **Spirit (broadcast)**: EWCPSI (Event -> WebSocket -> Channel -> Policy/Guard -> Signal -> Insight), anchored under `src/app/core/realtime/**`.
- **Body (UI)**: IMSCE (Intent -> Model (signal) -> Structure -> Components -> Experience), anchored under `src/app/features/**`.
- **Spirit Runtime Authority**: front-end service runtime contract for Worker/DO/Supabase Edge boundaries, anchored at `REFER.OS/refer.spirit-runtime.md` and coupled to `REFER.OS/refer.spirit.md`.

## Article 35.3: 3. Identity-bearing artifacts

Keep pointers to the artifacts that define or constrain identities:

- Workflow/structure maps used by governance and tooling.
- Lineage & QC logs that prove RETURN -> COMMIT -> PUBLISH coherence.
- Guard/policy surfaces that enforce boundaries (workflow guards, security contexts).

If a refer action depends on one of these artifacts, it must cite it and this registry must point to its canonical location.

## Article 35.4: 4. How it is used

- `refer.md` consults this registry to confirm the request is anchored to known identities before it consults `refer.structure.md` (structure) and `inference.md` (unfolding).
- When new work introduces a new identity (feature/workflow/broadcast/provider/system), add it here first, then update `refer.structure.md` and `inference.md` as needed.

## Article 35.5: 5. Cross-links

- Router: `refer.md`
- Structure map: `refer.structure.md`
- Unfolding map: `inference.md`
- Law/QC: `refer.law.md`, `refer.qc.md`

## Article 35.6: 6. Registered identities

- Feature: Floorplan Output Lab (UI)
- Anchor: `src/app/features/floorplan`
- Entry: `src/app/features/floorplan/floorplan.component.ts`
- Invariant: view renders selectors and dispatches intents; renderer + export logic lives outside the component.
- Feature: Events (UI)
- Anchor: `src/app/features/events`
- Entry: `src/app/features/events/events.component.ts`
- Invariant: view renders selectors and dispatches intents; IO stays in store/effects.
- Feature: Bible Journey landing (UI)
- Anchor: `src/app/features/biblejourney`
- Entry: `src/app/features/biblejourney/bible-journey.page.ts`
- Invariant: renders selectors from `InstantChurchBibleStore`, reuses the shared Bible card, and keeps all IO inside the store/repository layer while the template binds to derived state and dispatches UI intents only.
- Feature: Ordination / Ministry Training (UI)
- Anchor: `src/app/features/ordination`
- Entry: `src/app/features/ordination/ordination-training.component.ts`
- Invariant: view renders selectors and dispatches intents only; training IO and guard logic live in store/effects or workflow services.
- Feature: DevNotes Floatie (UI)
- Anchor: `src/app/features/devnotes`
- Entry: `src/app/features/devnotes/devnotes-floatie.component.ts`
- Invariant: floatie view renders selectors and dispatches intents only; logging IO and permissions live in store/effects and core repositories.
- Feature: Org Media Library (UI)
- Anchor: `src/app/features/ichurch`
- Entry: `src/app/features/ichurch/ichurch-dashboard.component.ts`
- Invariant: media library UI renders selectors and dispatches intents only; all upload, storage, and reuse IO stays in store/effects + core assets pipeline.
- Feature: Meeting Segments (UI)
- Anchor: `src/app/plans/meeting-segments`, `src/app/features/ichurch/B-IC1S1.component.ts`
- Entry: `src/app/plans/meeting-segments/store.ts`
- Invariant: segment views render selectors and dispatch intents only; persistence and guard checks live in effects + core repository + edge.
- System: Canonical Asset Resolver (Edge)
- Anchor: `supabase/functions/img-resolver`, `wrangler/src/index.ts`
- Entry: `supabase/functions/img-resolver/index.ts`
- Invariant: resolver maps UUID -> bucket/path -> signed URL; canonical host is `file.telechurchlive.com`; resolver IO stays in edge/worker, not UI.
- System: Org Segments Persistence (Edge)
- Anchor: `supabase/functions/org-segments`
- Entry: `supabase/functions/org-segments/index.ts`
- Invariant: edge function enforces org ownership for writes, strips host-only details for non-editors, and returns canonical segment state.
- System: Central Upload Pipeline (Workflow)
- Anchor: `src/app/core/assets`
- Entry: `src/app/core/assets/*`
- Invariant: shared helper performs upload -> registry -> canonical URL; governed by `refer.file.md`; per-surface code calls helper and does not embed storage/public URL logic.
