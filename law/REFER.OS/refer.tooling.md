# Law 67: refer.tooling.md - Tooling Governance (Agnostic)

Tooling is a governed executor surface. It produces derived artifacts but does not create law.

## 1. Scope

- Tooling artifacts are non-authoritative outputs (contracts, logs, reports, generated JSON, scripts).
- Tooling must not introduce new behavior; it must only reflect existing law and app state.

## 2. Directory doctrine

- Governance tooling lives under `codex/`.
- App tooling outputs are generated into app scope (for example, `refer.app/plan/` and contract or telemetry folders under app scope).
- Tooling may reference app state law, but app state law must not be stored inside `codex/`.

## 3. Creation rule

Governance tooling defines schemas and generation rules. App tooling instances are derived from those schemas and live in the app scope.

## 4. Drift guard

If a tooling artifact persists beyond its intended cycle, promote the underlying intent into app state law or the app plan register and regenerate the tooling output.

## 5. Repair emission rule (no self-repair)

Tooling must not self-repair.

On invariant/policy failure, tooling may only emit bounded repair artifacts:

- Diff proposal
- Failed invariant report
- Narrowed reproduction script
- Plan insufficiency note
- Governance gap marker

Failing paths must halt mutation and return control to Plan/Governance routing.

## 6. Tooling catalog (optional, on-demand)

Tooling artifacts are created only when an action, audit, or prompt explicitly requires them.

- **Execution Audit Report** (`refer.app/plan/*` + optional `refer.app/refer.<app>.audit.md`)
  - **Purpose:** record findings and action queue.
  - **Trigger:** `refer.audit` or "run audit".
  - **Dependency:** `REFER.OS/refer.audit.md` + app law.

- **Plan Register** (`public/assets/plan/refer.plan.json` + `refer.app/refer.<app>.plan.md`)
  - **Purpose:** intake for deferred intent, audit findings, and repairs.
  - **Trigger:** "defer", "later", "audit findings", or "repair queue".
  - **Dependency:** `REFER.OS/refer.plan.md` + app plan law.
  - **Timestamp rule:** edits are direct and do not auto-stamp by default; run `npm run plan:autostamp` (or `npm run plan:stamp -- --id <PLAN-ID>`) after mutations.

- **Send Contract / Execution Packets**
  - **Purpose:** derive bounded machine-oriented execution packets from governance and Plan.
  - **Trigger:** "emit send contract", "emit execution packet", "factory route sync".
  - **Dependency:** `REFER.OS/refer.plan.md`, `REFER.OS/inference.md`, `REFER.OS/refer.factory.md`, `REFER.OS/refer.engine.md`.

- **Compiler Logs / QC Trace** (`refer.build` log IDs in `refer.compiler.init.md`)
  - **Purpose:** record build/QC trace for compiler runs.
  - **Trigger:** `refer.build qc`, `refer.build materialize`, `refer.compiler`.
  - **Dependency:** `REFER.OS/refer.build.md`, `REFER.OS/refer.compiler*.md`, `REFER.OS/refer.qc.md`.

- **Turnstyle Guard Registry + Sentinel** (`REFER.OS/manifests/guards.registry.json`, `tools/turnstyle-guard-check.cjs`)
  - **Purpose:** enforce machine-structured guard coverage and naming discipline.
  - **Trigger:** guard framework updates, CI policy runs.
  - **Dependency:** `REFER.OS/refer.turnstyle.md`.

- **Plan/Flow Execution Controllers** (`tools/plan-readiness-check.cjs`, `tools/planner-interrogation-check.cjs`, `tools/refer-outflow-suggest.cjs`, `tools/quality-gate-runner.cjs`, `tools/auto-migration-runner.cjs`, `tools/command-sequence.cjs`, `tools/gbir-controller.cjs`, `tools/push-all-controller.cjs`)
  - **Purpose:** enforce deterministic readiness, pass sequencing, and branch-relative publish checks.
  - **Trigger:** plan execution (`execute:plan`), branch publish (`publish:branch`), full publish (`publish:all`; legacy `push all`), and QC flow requests.
  - **Dependency:** `REFER.OS/refer.plan.md`, `REFER.OS/refer.flow.md`, `REFER.OS/refer.qc.md`.

- **Tool Candidate Detector (TCD)** (`tools/tcd-candidate-detector.cjs`, `reports/tcd-candidates.json`)
  - **Purpose:** detect deterministic automation candidates during plan/build/execution/verification foreground passes and emit traceable candidate artifacts.
  - **Trigger:** explicit foreground invocation in plan/build/execution/verification flow (not runtime/watch mode).
  - **Dependency:** `REFER.OS/refer.plan.md`, `REFER.OS/refer.tooling.md`, `REFER.OS/refer.forge.md`.

- **Spirit Parity Harness** (`tools/spirit-parity-harness.cjs`, `reports/spirit-parity-harness.json`)
  - **Purpose:** validate Spirit execution contract artifacts (inventory, header contract, route classes, parity gates) before phase advancement.
  - **Trigger:** Spirit architecture phase checks and parity evidence runs.
  - **Dependency:** `REFER.OS/refer.spirit.md`, `REFER.OS/refer.plan.md`, `REFER.OS/refer.tooling.md`.

- **Spirit Golden Parity Checker** (`tools/spirit-golden-parity.cjs`, `reports/spirit-golden-parity.json`)
  - **Purpose:** validate golden request distribution and optional legacy/spirit response parity comparisons.
  - **Trigger:** Spirit dual-path parity verification and release gate reviews.
  - **Dependency:** `REFER.OS/refer.spirit.md`, `refer.app/spirit/spirit-golden-requests.json`, `refer.app/spirit/spirit-parity-gates.json`.

- **Spirit Dual-Path Parity Runner** (`tools/spirit-dual-path-parity.cjs`, `reports/spirit-dual-path-parity.json`)
  - **Purpose:** execute live legacy-vs-spirit endpoint pairs, compare status/key fields, and compute parity gate budgets (p95/error-rate) with explicit block reasons.
  - **Trigger:** dual-path phase execution and promotion gate decisions.
  - **Dependency:** `REFER.OS/refer.spirit.md`, `refer.app/spirit/spirit-parity-route-map.json`, `refer.app/spirit/spirit-parity-gates.json`.
  - **Note:** retired-mode invocation (`npm run spirit:dual-parity:retired`) is lawful only when rollout state is already `spirit-default` across all slices and legacy endpoint parity is no longer comparable.

- **Spirit Rollout Checklist Reporter** (`tools/spirit-rollout-checklist.cjs`, `reports/spirit-rollout-checklist.json`)
  - **Purpose:** produce ordered phase promotion guidance, gate outcomes, and rollback action per Spirit capability slice.
  - **Trigger:** Spirit rollout decisions before promotion/publish.
  - **Dependency:** `REFER.OS/refer.spirit.md`, parity reports under `reports/spirit-*.json`.

- **Spirit Concurrency Metrics Collector** (`tools/spirit-concurrency-metrics.cjs`, `reports/spirit-concurrency-metrics.json`)
  - **Purpose:** enforce DO/RT numeric gates from load-window evidence (DO mutation p95, broadcast latency p95, loop duration, socket ceiling).
  - **Trigger:** Concurrency Hardening verification and promotion gate checks.
  - **Dependency:** `refer.app/spirit/spirit-parity-gates.json`, `reports/spirit-rt-load-window.json`.

- **Spirit RT Load Window Collector** (`tools/spirit-rt-load-window.cjs`, `reports/spirit-rt-load-window.json`)
  - **Purpose:** collect realtime load-window evidence for DO mutation/broadcast/loop metrics feeding concurrency gates.
  - **Trigger:** MaxSpirit Concurrency Hardening runs and `spirit:auto-govern`.
  - **Dependency:** live Spirit RT surface (`/rt/*`) and route-class gate thresholds.

- **Spirit Control Surface Sync** (`tools/spirit-control-surface-sync.cjs`, `reports/spirit-control-surface.json`)
  - **Purpose:** auto-generate unified MaxSpirit control surface from parity, rollout, and concurrency evidence.
  - **Trigger:** after every Spirit governance run; required before phase promotion.
  - **Dependency:** `reports/spirit-parity-harness.json`, `reports/spirit-golden-parity.json`, `reports/spirit-dual-path-parity.json`, `reports/spirit-rollout-checklist.json`, `reports/spirit-concurrency-metrics.json`.

- **Spirit Auto Govern Controller** (`tools/spirit-auto-govern.cjs`, `reports/spirit-auto-govern.json`)
  - **Purpose:** run Spirit governance suite end-to-end and always emit the control surface even when gates fail.
  - **Trigger:** default Spirit verification run (`npm run spirit:auto-govern`).
  - **Dependency:** Spirit parity + checklist + concurrency + control-surface toolchain.

- **Spirit Phase Controller** (`tools/spirit-phase-controller.cjs`, `reports/spirit-phase-controller.json`)
  - **Purpose:** advance Spirit rollout slices in strict order and persist auditable rollout state.
  - **Trigger:** explicit phase promotion requests after parity gates are green.
  - **Dependency:** `refer.app/spirit/spirit-rollout-state.json`, `reports/spirit-rollout-checklist.json`.

- **Spirit Direct Call Audit** (`tools/spirit-direct-call-audit.cjs`, `reports/spirit-direct-call-audit.json`)
  - **Purpose:** detect direct Supabase call sites that bypass Spirit surfaces and produce migration queue evidence.
  - **Trigger:** caller migration planning and legacy retirement readiness checks.
  - **Dependency:** `refer.app/spirit/spirit-direct-call-allowlist.json`, app source roots.

- **DO Contract Check** (`tools/do-contract-check.cjs`, `reports/do-contract-check.json`)
  - **Purpose:** enforce Durable Object route contract invariants (room/action decode, presence action support, header projection points).
  - **Trigger:** any change touching `/rt/*`, DO routing, or websocket coordinator behavior.
  - **Dependency:** `wrangler/src/index.ts`, `REFER.OS/refer.spirit-runtime.md`.

- **DO Smoke Runner** (`tools/do-smoke.cjs`, `reports/do-smoke.json`)
  - **Purpose:** verify runtime roundtrip (`presence-set -> state`) through Spirit `/rt/*` surface.
  - **Trigger:** pre-publish and post-deploy realtime verification.
  - **Dependency:** live or local Spirit API base and DO coordinator availability.

- **DO Deploy Verify Controller** (`tools/do-deploy-verify.cjs`, `reports/do-deploy-verify.json`)
  - **Purpose:** run DO contract check, deploy Worker, then execute DO smoke as a single blocking chain.
  - **Trigger:** production-bound DO/runtime changes.
  - **Dependency:** Wrangler deploy path and DO smoke tooling.

- **Reminder Diag Probe** (`scripts/check-reminder-diag.mjs`, `npm run reminder:diag`)
  - **Purpose:** read internal reminder DO health markers (`alarm_iso`, alarm lifecycle, dispatch lifecycle) through guarded diagnostics endpoint.
  - **Trigger:** reminder incident triage, post-reseed verification, post-deploy reminder smoke checks.
  - **Dependency:** `REFER.OS/refer.cloudflare.md`, `REFER.OS/refer.build.md`, internal secret auth header contract.

## 7. On-demand creation rules

- If an audit is requested, create an audit report and push findings to plan.
- If a defect/repair is requested, create a plan entry before or alongside the repair.
- If a build request lacks scope, sharpen the Plan and emit or refresh the Send Contract / execution packet.
- If a compiler run occurs, log the run ID in the compiler init log and/or plan.

## 8. Execution enforcement binding

- When `REFER.OS/refer.plan.md` marks a tool or controller as mandatory for a DESM state or `push all` chain, Codex must invoke that tool path.
- Tool usage by intuition alone is non-authoritative; enforcement comes from explicit law bindings in Plan/Flow docs.
- If a mandatory tool is unavailable or fails in a non-lawful way, tooling must emit a bounded repair artifact and return control to Plan/Governance routing.

## 9. Tooling reset rule

When tooling is reset, all non-authoritative artifacts may be removed. Recreate only when prompted by law-driven triggers above.
