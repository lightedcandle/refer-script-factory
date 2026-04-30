# Law 3: inference.md - Unfolding Logic & Execution Cadence

Inference captures the E2E execution logic (ASEDAWSI, EWCPSI, action-service-edge-DB-signal-UI flows) as a reference-first unfolding cadence that Codex consults before building or repairing features.

## Article 3.1: 0. Modus Operandi (Refer-Lineage)

If it can be referenced, build it. If it cannot be referenced, build the reference first. Lineage must remain referential: law -> plan -> send contract -> factory -> repo -> observed reality.

## Article 3.2: 1. Duty of Efficiency (Terrain Check)

Before burning tokens on a complex task, the executor must check the terrain.

Inference should assess:

- **Fuel**: current token/context budget and how much exploratory burn remains lawful.
- **Vehicle**: the active model, tool surface, and whether it is well matched to the task.
- **Driver**: prompt clarity, governing references, and whether steering is explicit enough.
- **Terrain**: framework, codebase condition, law quality, anchors, and ambiguity.
- **Cargo**: scope weight, novelty, coupling, and unresolved design.

Required action:

1. If the task is known structure, route toward `refer.factory.md` and `refer.engine.md` rather than repeated freeform manifestation.
2. If the terrain is unclear, interrogate and clarify before building.
3. If the cargo is too heavy for one pass, split it into smaller contracts before execution.
4. If repeated retries appear likely, stop and improve the route, anchors, or references first.

Inference is not permission to burn fuel blindly. It is the law that checks whether fuel should be spent at all.

## Article 3.3: 2. Execution Cadence

- Record canonical sequences derived from `codex/archive/E2E_Build_Framework_Summary.md` and the workflow index. Common patterns include:
  - **Action -> Service -> Guard -> Edge (Signal -> UI)** for front-end builds.
  - **Event -> WebSocket -> Channel -> Policy/Guard -> Signal -> Insight** for realtime/broadcast flows (EWCPSI).
  - **Action -> Service -> Guard -> Edge -> DB/API -> Channel -> WebSocket** for backend workflows.
- Each refer action should pick the cadence that matches its domain and outline the guardrails for RETURN/COMMIT.

## Article 3.4: 3. Feature Inference Checklist

- To avoid ad hoc execution, reference this list when unfolding:
  1. Identify the intent and domain (`refer.*`).
  2. Map the required services, guards, and edges via the workflow index.
  3. Determine DB/API dependencies (lineage and identity artifacts in `refer.identity.md`).
  4. For Body/UI scopes, auto-bind `refer.seamless-ui.md` and infer its constraints into the execution map (surface continuity, sticky offset, action wiring closure, chat contrast, single-loader policy).
  5. Plan RETURN verification (no half-builds, no hanging guards).
  6. Document COMMIT requirements (branch rules in `refer.branch`).
  7. Trigger PUBLISH via existing deployment relations (Cloudflare/Supabase).

- Use this checklist when designing `refer.build.md`, `refer.expand.md`, or `refer.repair.md` so the inference logic stays consistent.

## Article 3.5: 4. Send Contract + Route Generation (Primordial)

Inference governs the pre-build contraction of Plan into Send Contract and execution route. Before any build or repair, the executor must:

- Create or update the bounded Send Contract so it reflects the governed intent.
- Derive scoped lineages (Body/Mind/Spirit and IMSCE/ASEDAWSI/EWCPSI) into the contract packet or execution route before execution.
- When Body/UI lineage is present, include seamless doctrine sourced from `REFER.OS/refer.seamless-ui.md` unless a Plan-level deviation is explicitly declared.
- Treat contracts and routes as derived artifacts: they may not introduce new law, only reflect law and scoped intent.

If a Send Contract or route cannot be generated from law and scoped intent, execution halts and governance must clarify the missing rule before proceeding.

## Article 3.6: 5. Execution Examples

- Capture known sequences such as "Add chatroom" or "Fix save button" from `refer.os.md` examples, rewriting them here with explicit service/guard/edge steps and noting what RETURN/COMMIT signals are emitted.
- Include guidance for future features; each new inference example should align with the structural map in `refer.structure.md` and the identity map in `refer.identity.md`.
- Example: Floorplan Output Lab -> Intent (LoadPlan/ExportDxf) -> Service (export builder) -> Guard (validate plan entities) -> Edge/Signal (update export status) -> UI (3D renderer + DXF download).
- Example: Asset Upload (Resumable) -> Intent (Upload media) -> Service (AssetUploadService with direct upload <=50MB or TUS resumable upload >50MB) -> Guard (auth session + bucket/path validation + size limits) -> Edge/Signal (asset registry write + canonical URL resolution) -> UI (media library upload modal updates + preview availability).

## Article 3.7: 6. Cross-Links

- Link to `REFER.OS/manifests/workflow.index.schema.json` and `src/app/workflows/workflow.index.json` so actions can pull current workflow topology.
- Reference `REFER.OS/manifests/guards.policies.ts` to remind refer actions of the guard logic that needs evaluation during inference.
- Reference `REFER.OS/refer.efficiency.md` when token burn, retry loops, or vehicle-terrain mismatch become material to the plan.
- Reference `REFER.OS/refer.factory.md` and `REFER.OS/refer.engine.md` when the work should shift from inference-heavy build behavior toward contracts, scripts, interpreters, and anchors.

## Article 3.8: 7. Alarm-System Inference Pattern (DO Reminder Pipelines)

For DO-based reminder systems, inference must model two independent truth chains:

1. **Schedule chain**: RSVP/event input -> candidate load -> due key upsert -> earliest alarm set.
2. **Dispatch chain**: alarm fire -> dispatch auth/trust check -> queue/send side effect.

Mandatory inference outputs:

- Separate checkpoints for schedule and dispatch (never a single "reminder works" checkpoint).
- Persistent DO diagnostics for alarm set/readback and alarm lifecycle.
- Internal-only diagnostics read path to inspect runtime truth without user session coupling.
- Explicit machine-to-machine trust edge for alarm-triggered dispatch.

Failure interpretation rule:

- `scheduled > 0` with no downstream send implies dispatch-chain failure, not schedule-chain failure.
- `scheduled == 0` implies candidate/query/scope failure in schedule chain.
