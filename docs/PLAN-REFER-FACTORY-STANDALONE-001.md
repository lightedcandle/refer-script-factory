# PLAN-REFER-FACTORY-STANDALONE-001

Title: Establish the Host-Independent Script Factory Identity and Language
Status: Implemented, verified, committed on the standalone lineage, and reconciled by `PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001`
Date: 2026-07-15
Target: `E:\refer-script-factory`
Primary owner: `governance-agent` on the architecture-sensitive route
Model route: Sol requested; GPT-5 Codex used as the disclosed host substitution
Mutation: Local source and documentation only
Publish: Not authorized

## Objective

Establish this canonical identity:

The Script Factory is the provider-neutral system that converts ratified REFER
Execution Contracts and verified methods into bounded script plans, artifacts,
verification evidence, and reusable registrations.

VS Code, CLI, HTTP, MCP, and future hosts are adapters and operator surfaces.
The current Script Factory VS Code adapter remains functional, but it is not the
product identity or canonical runtime.

## Scope

- Define provider-neutral factory identity and host/adapter vocabulary.
- Reserve `Execution Contract` for ratified REFER execution authority.
- Separate intake, planning, authorization, and runtime-session language.
- Reword core doctrine, source registries, generated terminology, package
  descriptions, and operator-facing labels without changing runtime behavior.
- Preserve accurate VS Code language on current VS Code adapter entries.
- Reconcile the older deterministic evolution plan without erasing provenance.
- Add focused terminology and source/generated-consistency checks.

## Non-Scope

- TypeScript core extraction or folder rearchitecture.
- Standalone CLI implementation.
- HTTP or MCP security repair.
- Authority-resolver behavior changes.
- Alliance Hub, Android, Zo bootstrap, live Zo, Sovereign Node runtime, or any
  consumer-app implementation.
- Dependency upgrades, release-version changes, package publication, staging,
  commit, merge, push, deployment, credential access, or provider mutation.

## Ownership And Boundaries

- The provider-neutral Script Factory owns core vocabulary, packets, doctrine,
  script plans, artifacts, evidence, and reusable registrations.
- A host adapter translates host input, model access, workspace access, events,
  and output rendering into provider-neutral core packets.
- The current VS Code implementation is the `Script Factory VS Code adapter`.
- Alliance, Zo, Sovereign Node, and other consumers retain their app-specific or
  provider-specific implementation authority.
- This plan changes language and contracts only. It does not claim the current
  source tree already satisfies the future dependency boundary.

## Dependency Law

The intended dependency direction is one-way:

```text
VS Code / CLI / HTTP / MCP / future host adapters
                     -> provider-neutral core
```

The provider-neutral core imports no VS Code APIs. Adapters depend on the core;
the core does not depend on adapters. Implementing this law belongs to
`PLAN-REFER-FACTORY-CORE-EXTRACTION-001`.

## Canonical Host And Adapter Glossary

- `interactive host`: the chat, terminal, editor, or other environment where an operator begins work.
- `host command`: an explicit action exposed by an interactive host.
- `operator interface`: the human-facing view of factory state and controls.
- `target workspace`: the repository or filesystem boundary named by active authority.
- `host-provided model`: a model selected or supplied by the current host.
- `event/output sink`: the destination for process events, evidence, artifacts, or user-visible output.
- `host adapter`: the boundary translating host inputs and outputs into provider-neutral core packets.

## Authority And Packet Glossary

- `intake record`: preserved raw user intent and intake metadata; never execution authority.
- `intake envelope`: normalized, compact intake data for routing or clarification; never execution authority.
- `planning artifact`: a plan, Send Contract draft, Script Blueprint, or similar description of possible work; never execution authority.
- `Execution Contract`: a ratified REFER instruction packet naming scope, governing references, constraints, acceptance criteria, and verification.
- `execution authorization`: the authority conferred only by a ratified Execution Contract and bounded by its independent permission gates.
- `runtime session`: one host interaction and its transient or persisted state; never execution authority.

Legacy runtime command IDs containing `contractMode` may remain for compatibility
in this phase. Operator-facing language must identify them as legacy
intake-session state. Behavioral and API migration requires a successor contract.

## Target Paths

Primary:

- `AGENTS.md`
- `README.md`
- `package.json` descriptions and labels, excluding release version
- `docs/PLAN-REFER-FACTORY-STANDALONE-001.md`
- `docs/factory-system-doctrine.md`
- `docs/script-legend.md`
- `docs/domain-script-registry.md`
- `docs/refer-orchestrator-roadmap.md`
- `docs/script-factory-deterministic-evolution-plan.md`
- `src/contracts/scriptLegend.ts`
- `src/contracts/scriptFactory.ts`

Closely coupled:

- terminology consumers required to keep legend lookup behavior unchanged;
- focused tests;
- directly affected generated factory legend and registry artifacts;
- the domain-registry generator text that owns those artifacts.

## Preservation Path

- Preserve the authorized `.gitmodules` recovery diff unchanged.
- Preserve the repaired `alliance-hub/.git/config` unchanged.
- Preserve the recovery intent and history of `.refer/source.json`; only exact
  live freshness values may advance under the ratified amendment.
- Keep all changes unstaged and preserve unrelated work.

## Acceptance Criteria

- README identity stands without presenting VS Code as the product.
- AGENTS defines the provider-neutral core and names VS Code as an adapter.
- Core doctrine and legend use the canonical host-neutral vocabulary.
- VS Code-specific wording remains only on adapter or compatibility surfaces.
- `Execution Contract` is never conflated with intake state, a planning packet,
  runtime session, or UI mode.
- The language phase is separated from core extraction and CLI implementation.
- The older deterministic plan remains readable and explicitly reconciled.
- Source and directly affected generated terminology agree.
- Focused terminology/registry checks and `npx tsc -p . --noEmit` pass.
- Recovery predecessor changes remain intact and separately identifiable.
- No unrelated or prohibited path changes.

## Verification

1. Capture native Git status before and after.
2. Compare every changed path with this plan and its ratified contract.
3. Search core docs and registry text for `VS Code`, `Command Palette`,
   `webview`, `cockpit`, `workspace folder`, `temporary contract`,
   `persistent contract`, and `intake contract`.
4. Classify every remaining occurrence as adapter-specific,
   compatibility-specific, historical, or a defect.
5. Regenerate only directly affected artifacts whose existing path is
   deterministic and within scope.
6. Run the focused standalone-language check.
7. Run `npx tsc -p . --noEmit`.
8. Inspect `git diff`, `git diff --check`, and `git diff --cached`; stage nothing.
9. Report exact commands and exit codes.

## Dependencies

- Live `E:\refer.os\AGENTS.md` and `E:\refer.os\REFER.OS\refer.agent.md`.
- `E:\refer.os\REFER.OS\manifests\reference.registry.json`.
- `E:\refer.os\REFER.OS\refer.factory.md` and `refer.plan.md`.
- Repo `AGENTS.md`, domain script registry, factory doctrine, script legend,
  current registry sources, historical factory plan, and closest tests.
- Exact `.refer/source.json` freshness.

## Successor Contracts

- `PLAN-REFER-FACTORY-CORE-EXTRACTION-001`: implement the provider-neutral core and adapter dependency boundary.
- `PLAN-REFER-FACTORY-CLI-001`: implement the standalone CLI adapter.
- `PLAN-REFER-FACTORY-NODE-INTEGRATION-001`: integrate the core with the governed node control plane.
- `PLAN-REFER-FACTORY-RELEASE-001`: perform governed release readiness and publication work.
- A separate legacy-intake-session migration contract: rename runtime APIs, storage fields, command IDs, and UI state without compatibility ambiguity.
