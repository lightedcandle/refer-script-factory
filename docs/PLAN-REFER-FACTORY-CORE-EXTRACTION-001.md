# PLAN-REFER-FACTORY-CORE-EXTRACTION-001

Title: Extract the Provider-Neutral Script Factory Core
Status: Implemented, verified, committed, and reconciled by `PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001`
Date: 2026-07-15
Contract: `CONTRACT-REFER-FACTORY-CORE-EXTRACTION-001`
Target: `E:\refer-script-factory`
Execution branch: `codex/PLAN-REFER-FACTORY-CORE-EXTRACTION-001--agent--core-extraction`

> **Historical record. The VS Code adapter this plan extracted was retired on
> 2026-09-12**, along with `src/extension.ts` and the `src/cockpit/` and
> `src/commands/` wrappers. Paths below no longer exist and the plan is left
> unedited on purpose.
>
> This plan is the reason the retirement was cheap: it put the host behind a
> one-way dependency law, and removing the host afterwards required no change to
> `src/core/**` at all. That is the plan's result, not a contradiction of it.
Base: `codex/governed-model-routing` at `b9ff5961240b47ea5cae588cb5012fe5916ed714`
Primary owner: `governance-agent`, with bounded `mind-agent` implementation
Model route: Terra/Mini role routing requested; GPT-5 Codex used as the nearest host-exposed substitution
Method lineage: Construct Method plus Branching Method; no assimilation or publish method

## Objective

Physically establish the Script Factory as a provider-neutral TypeScript core
with a mechanically enforced dependency boundary, while preserving the current
VS Code extension as a behavior-compatible host adapter.

The canonical identity remains:

> The Script Factory is the provider-neutral system that converts ratified REFER
> Execution Contracts and verified methods into bounded script plans, artifacts,
> verification evidence, and reusable registrations.

## Baseline Dependency Map

The pre-extraction source tree has four relevant classes:

| Classification | Current surfaces | Baseline dependency shape |
| --- | --- | --- |
| Pure core | `src/contracts/referOrchestrator.ts`, `scriptBlueprint.ts`, `scriptDna.ts`, `scriptFactory.ts`, `scriptInoculation.ts`, `sendContract.ts`, `orchestratorRoadmap.ts`, `referCoach.ts`; pure portions of `referIntake.ts` and `scriptLegend.ts`; `src/chat/referPromptModel.ts`, `referResolutionLoop.ts`, and `referProcessEvents.ts` | TypeScript data and deterministic transforms; no VS Code API is required. |
| Port | Prompt model, target-workspace/runtime storage, process-event delivery, and progress/output delivery | The prompt model is already interface-shaped. Workspace persistence and event delivery are directly coupled to filesystem helpers in the legacy runner and need explicit ports. |
| VS Code adapter | `src/extension.ts`, `src/chat/referParticipant.ts`, `src/chat/referModelProvider.ts`, `src/commands/**`, and `src/cockpit/**` | Direct `vscode` imports plus calls into provider-neutral contracts, orchestration, bootstrap, telemetry, and update logic. |
| Compatibility wrapper | Existing import paths under `src/contracts/**`, `src/chat/**`, `src/commands/**`, `src/cockpit/**`, and `src/extension.ts` | These paths are used by existing tests or extension wiring and can forward to the new owner without changing legacy IDs or the package entrypoint. |
| Deferred surface | Filesystem scanners and generators not needed by the first public core API (`codebaseTree`, `factoryGaps`, `scriptographer`), bootstrap/update implementations, the current HTTP adapter/server, target registry, legacy storage schemas, authority resolver semantics, and framework target adapters | Provider-neutral or Node-based in places, but moving or redesigning them is not required to prove the first coherent boundary and would expand migration risk. |

Baseline import direction was captured before mutation. Direct `vscode` imports
were present in extension wiring, the native chat participant/model provider,
all VS Code commands, and all cockpit panels. The provider-neutral contract
modules did not import `vscode`, but no independently compiled `src/core/**`
boundary existed.

## Chosen Moves

1. Establish `src/core/contracts/**` for the pure intake envelope, resolution
   envelope, script blueprint/DNA/registry/legend, inoculation registry, Send
   Contract draft, roadmap, and coach transforms.
2. Establish `src/core/orchestration/**` for the model port, bounded resolution
   loop, provider-neutral runner, and chat-event creation.
3. Establish `src/core/ports/**` for target-workspace/runtime storage,
   process-event delivery, and progress/output delivery.
4. Establish `src/core/evidence/**` for provider-neutral process-event types.
5. Expose the intentional public API from `src/core/index.ts`.
6. Keep filesystem-backed intake/session/mode/event persistence behind the
   legacy runner as a Node runtime-port implementation.
7. Move VS Code extension wiring, model selection, participant, commands,
   panels, and HTML into `src/adapters/vscode/**`.
8. Keep the manifest entrypoint at `dist/src/extension.js` through a thin
   `src/extension.ts` forwarding module. Preserve legacy source import paths
   through thin re-export wrappers where they reduce compatibility risk.

## Implemented Result

- `src/core/**` now contains 17 provider-neutral TypeScript modules covering
  the intentional API, pure contracts/registries/legend, bounded orchestration,
  process-event types, and explicit runtime ports.
- `src/adapters/vscode/**` now owns extension activation, the native participant,
  VS Code model selection, every contributed command implementation, and every
  cockpit/webview implementation.
- `src/chat/referOrchestratorRunner.ts` is the filesystem compatibility adapter:
  it implements core runtime ports with the existing intake, mode, session, and
  process-state storage functions and preserves the existing server call shape.
- Legacy contract, chat, command, cockpit, and extension source paths are thin
  forwarding modules where compatibility is useful.
- `tsconfig.core.json` compiles only `src/core/**` with explicit Node types.
- `scripts/verify/core-boundary.mjs` parses TypeScript imports and rejects any
  core-relative import that leaves `src/core/**` or imports `vscode`.
- Focused core API, boundary, and VS Code source/manifest compatibility tests are
  part of the normal regression suite.
- Reusable registry/legend/codebase-context generators now rebuild the tracked
  mirrors from the new authoritative paths.

## Public Core API

`src/core/index.ts` intentionally exports:

- intake record/envelope types and the pure intake-record creator;
- resolution envelope types, prompt creation/parsing, and next-action logic;
- script blueprint, Script DNA, Script Factory registry, Script Legend,
  inoculation registry, Send Contract draft, roadmap, and coach APIs;
- the prompt-model and cancellation ports;
- runtime workspace, process-event, and output ports;
- provider-neutral process-event types and chat-event creation;
- the bounded resolution loop and provider-neutral orchestrator runner;
- stable helpers for never-cancelled execution and terminal output rendering.

Filesystem writers, VS Code types, command registration, panels, provider
selection, HTTP listeners, and extension activation are not public core API.

## Dependency Law

The allowed direction is:

```text
VS Code adapter / current HTTP adapter / compatibility entrypoints
                              -> src/core/**
```

The enforced rules are:

- every relative import from `src/core/**` resolves back into `src/core/**`;
- `src/core/**` may not import `vscode`, `src/adapters/**`, `src/extension.ts`,
  cockpit panels, host commands, or legacy host modules;
- the core-only TypeScript configuration loads Node types explicitly and does
  not load `@types/vscode`;
- model access, target-workspace/runtime storage, process-event delivery, and
  progress/output delivery cross declared ports;
- command/UI interaction remains entirely in host adapters;
- adapters and compatibility layers may depend on core, never the reverse.

Stable Node/TypeScript primitives may be used for deterministic core transforms.
Target-workspace I/O is not performed directly by the provider-neutral runner.

## Compatibility Strategy

- Keep `package.json.main` unchanged at `./dist/src/extension.js`.
- Keep activation events, contributed command IDs, participant ID, settings,
  configuration keys, view IDs, labels, package version, and storage field names
  unchanged.
- Keep `src/extension.ts` as the compatibility entrypoint.
- Keep prior contract/chat/command/cockpit module paths as forwarding wrappers
  where they are already observable to tests or internal imports.
- Retain the existing filesystem locations and JSON shapes for intake, mode,
  session, and process-state storage.
- Do not rename legacy `contractMode` identifiers in this phase.
- Keep the current HTTP adapter functional through the compatibility runner;
  moving it is deferred.

## Acceptance And Verification Matrix

| Requirement | Evidence |
| --- | --- |
| Coherent provider-neutral core | `src/core/index.ts` plus focused core API regression test |
| Core does not depend on VS Code or adapters | deterministic boundary checker and `rg` import audit |
| Core compiles without VS Code ambient types | `tsconfig.core.json` with explicit non-VS Code types and `tsc --noEmit` |
| Model/workspace/event/output host interaction uses ports | core port declarations plus runner regression tests with in-memory ports |
| VS Code behavior remains compatible | unchanged manifest IDs/settings/main path plus source compatibility test |
| Legacy import/storage compatibility remains | forwarding wrappers and existing regression suite |
| Registry and generated mirrors remain consistent | registry generator plus focused registry/language tests |
| Full TypeScript and extension build remain green | root `tsc --noEmit` and `npm run compile` |
| Scoped commit is clean | pre/post-stage diff checks, committed path audit, clean final status |

## Explicit Non-Scope

- standalone CLI implementation;
- HTTP/MCP expansion, server security repair, or target-registry policy changes;
- Sovereign Node integration, workflow-ledger mutation, or method-bank mutation;
- Alliance Hub, Zo/bootstrap/hive, Telechurch, or any consumer repo;
- dependency upgrades, package version changes, packaging, publication, or release;
- legacy command, storage, API, participant, view, or configuration identifier migration;
- authority-resolver semantic changes;
- merge, assimilation, push, publish, deploy, remote/provider mutation,
  credential access, history rewriting, force operations, or cleanup outside
  this isolated worktree.

## Successor Boundaries

- `PLAN-REFER-FACTORY-CLI-001`: implement a standalone CLI adapter against the
  public core and its ports.
- `PLAN-REFER-FACTORY-NODE-INTEGRATION-001`: integrate the core with Sovereign
  Node under separate cross-repo and provider authority.
- `PLAN-REFER-FACTORY-RELEASE-001`: perform package/release readiness and any
  publication work.
- A separate legacy-identifier migration plan: rename `contractMode`, storage
  fields, source APIs, command IDs, or other compatibility identifiers only
  with explicit migration and rollback evidence.
- A later boundary-expansion plan: move remaining scanners, bootstrap/update
  logic, HTTP adapter, and target-workspace services only after the first core
  API is stable and their ports are ratified.
