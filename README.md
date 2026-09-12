# Refer Script Factory

This repository is the **factory root**. Two things live here, and they are not
the same kind of thing. Read this section before the rest of the file, because
for a long time the file described only the second one.

## `machines/` — the Living Factory machine layer, and the part that is running

One copy of each machine, shared by every repo that runs a factory. The machine
is universal; the cadence is local, declared by each consuming repo in its own
`*.trigger.json`.

**There is no build and no deploy step. Saving a file is deploying it.** A
scheduler reads `machines/<name>.cjs` off disk at the moment it fires — every
five minutes, against a live board — so the moment a machine is saved, that is
the version that runs. Main is production and the only rollback is another
commit.

Run `npm run gate:machines` **before the save**, not after the push. The full
law, the guard's behaviour and the branch policy are in `AGENTS.md` under
*Machines: there is no deploy step, so saving is deploying*; `machines/README.md`
is the working doc, and `machines/kind.cjs` is the belt's only vocabulary.

Two things that are easy to get wrong here:

- **The machines do not run from this repo.** A consuming repo's scheduler
  invokes them as `factory:<name>` with `cwd` set to that repo. Every machine
  resolves its subject from `process.cwd()` and never from `__dirname`. One run
  from this directory reports on *this* repo while looking exactly like a report
  on the intended one.
- **The belt (`.claude/agent-context/findings.jsonl`) is per consuming repo and
  never in this one.** Findings are about a repo; a shared belt would merge
  several repos' work into one unreadable stream.

## `src/` — the Script Factory

The Script Factory is the provider-neutral system that converts ratified REFER
Execution Contracts and verified methods into bounded script plans, artifacts,
verification evidence, and reusable registrations.

CLI, HTTP, MCP, and future hosts are adapters and operator surfaces; none of
them is the product identity or canonical runtime.

**The VS Code adapter was retired on 2026-09-12.** The operator no longer uses
VS Code, so the adapter, the extension manifest, the cockpit webviews and the
`@refer` chat participant are gone, and this is a plain Node package with a CLI
bin. It is worth recording what that cost: **nothing under `src/core/**` changed
to remove it.** The one-way dependency law was written so a host could be
outlived, and it was.

Telechurch is the pilot consumer, not a product dependency.

The two halves have **no overlap in verification**: `npm run test` compiles and
runs the TypeScript suite and touches no machine; the `gate:*` scripts check the
machines and touch no TypeScript. `npm run verify` runs both — see
[Verify](#verify).

## Repository Identity

This is the canonical repository for the provider-neutral Script Factory
language, contracts, doctrine, registries, and current host-adapter
implementation. It is intentionally opinionated, script-driven, and governed by
the repo-local `AGENTS.md` and the live REFER.OS authority recorded in
`.refer/source.json`.

The dependency law is one-way: the provider-neutral core under `src/core/**`
imports no host adapters, and host adapters depend on the core.
`src/core/index.ts` is the intentional public API. The surviving adapters are
`src/adapters/cli/**`, `src/adapters/ollama/**` and `src/server/**`.

The rule is machine-checked rather than honour-system: `scripts/verify/core-boundary.mjs`
walks every import, export, `require` and dynamic import in the AST under
`src/core` and fails on `vscode` or on any relative path escaping the directory.

`src/chat/` and `src/contracts/` are **mixed, and this is the trap.** Some files
are one-line `export * from "../core/..."` re-exports. Others re-export the core
contract *and* add the `node:fs` side the provider-neutral core is not allowed to
have — `referIntake.ts` adds `writeReferIntakeRecord`, `scriptLegend.ts` adds
`writeScriptLegend`, and `codebaseTree.ts`, `factoryGaps.ts` and
`scriptographer.ts` are hundreds of lines of real implementation.

Open the file before assuming which it is. Editing a re-export is lost work;
moving a filesystem function down into `src/core/**` breaks the boundary check.

Focused boundary verification is available through:

```powershell
npm run verify:core
```

## What survived the adapter

The panels, the activity container and the `REFER: *` command palette entries are
gone. What the adapter was a front end *for* is still here and still tested:

- Bootstrap dry-run and apply, with agent governance through `AGENTS.md` and `.refer-factory/agent-profile.json`
- The codebase/subspace registry and the treefile scanner
- Intake records, the orchestrator and the bounded resolution loop
- Script Blueprint, Script DNA, Send Contract planning drafts
- Script class, forge, lineage, authority, doctrine and scriptionary registries
- JSON schemas for packets, metrics, process events, adapters, and bootstrap
- Portable JSON script packets with Angular, React, Node, and generic adapters
- The dormant REFER.OS reference library under `unscripted-laws/REFER.OS`

Most of it is reachable today only from the npm scripts below, the HTTP endpoint,
or by importing the module. **Several capabilities now have no caller at all** —
the update machinery is the clearest case. That is the honest state of it, and
naming it is cheaper than letting someone discover it as a bug.

## Standalone CLI And Sovereign Node Reads

The `refer-script-factory` executable preserves the standalone `resolve`
command and adds a read-only local Sovereign Node consumer:

```powershell
refer-script-factory node discover --node-root E:\SovereignNode
refer-script-factory node validate --node-root E:\SovereignNode
refer-script-factory node workflows --node-root E:\SovereignNode
refer-script-factory node workflow node.discover --node-root E:\SovereignNode
refer-script-factory node methods --node-root E:\SovereignNode
refer-script-factory node method "branching methodology" --node-root E:\SovereignNode
```

Add `--json` to emit one machine-readable packet on stdout. Diagnostics remain
on stderr. Node commands require an explicit local root, use bounded MCP stdio,
and expose only `discover_node`, `validate_workflow_ledger`, `list_workflows`,
`get_workflow`, `list_methods`, and `get_method`. They do not expose Node
mutation, credentials, providers, remote transport, or orchestration. Node-local
absolute source paths are removed from CLI output.

## Verify

```powershell
npm install
npm run verify
```

`verify` covers both halves of the repo, live layer first so a broken machine
fails in seconds rather than after a full TypeScript compile:

```text
gate:machines    every machine parses, no literal U+FEFF in any parsed file,
                 every declared read-only path returns what it should
gate:pulse-belt  a card actually moves incoming -> belt -> resolved on a real
                 clock, and a tick that did not happen still shows as a hole
test             compile, then ~37 dist/test/*.test.js in sequence
verify:core      src/core type-checks standalone, and imports nothing outside
                 itself or from vscode
```

Until 2026-09-12 `verify` was `npm run test` alone — which runs no machine at
all. The repo's named verification entrypoint did not check the only layer that
was actually running, and a green check that checks nothing is worse than no
check, because it is trusted.

`npm run gate:prove` is deliberately **not** in `verify`. It breaks the gate five
ways to prove it still bites, which means editing live machines for a second at a
time; it refuses to run outside a linked worktree for that reason, and forcing it
in a routine verify would reproduce the exact incident recorded in `AGENTS.md`.
CI runs it on a checkout no scheduler is reading.

To run one test, compile once and invoke the file directly — there is no runner,
no watch mode and no `--filter`. PowerShell 5.1 has no `&&`:

```powershell
npm run compile; node dist/test/coreApi.test.js
```

## Bootstrap

`src/bootstrap/dryRun.ts` produces the report and `src/bootstrap/apply.ts` writes
the files, and apply is deliberately a separate call so nothing lands without an
explicit second act. The `REFER: Initialize Repo` command that paired them behind
a modal went with the VS Code adapter; the two-step shape is the part that
mattered and it is unchanged.

Bootstrap installs REFER as a layer inside an existing repo. If `AGENTS.md`
already exists, REFER preserves the existing instructions and adds or refreshes
only the bounded block between:

```md
<!-- REFER GOVERNANCE START -->
<!-- REFER GOVERNANCE END -->
```

Bootstrap installs/updates these REFER-owned files:

- `AGENTS.md`
- `REFER.OS/refer.md`
- `REFER.OS/refer.plan.md`
- `REFER.OS/refer.factory.md`
- `REFER.OS/refer.engine.md`
- `REFER.OS/refer.efficiency.md`
- the rest of the dormant `REFER.OS/*.md` reference library
- `.refer-factory/agent-profile.json`
- `.refer-factory/adapter.json`
- `.refer-factory/codebases.json`
- `.refer-factory/metrics.json`
- `.refer-factory/plan/refer.plan.json`

These define intake-first prompt handling with Execution Contract gating, safe
script rules, secret-file exclusions, local tracking paths, and the
machine-readable discovery schema
other agents can follow before searching. Installed `REFER.OS/*.md` documents are
reference material until a doctrine compiler or authorized user action converts
them into registered scripts, validators, or rule packs.

REFER bootstrap state is kept under `.refer-factory/` instead of `public/` so
web application production builds do not expose the plan by default.

## Telemetry Storage

Bootstrap process events collapse into `.refer-factory/process-state.json`, which
is ignored by git. The file keeps one stable current value set, a bounded recent
event list, and daily history so refreshes do not depend on an append-only log.
The dashboard reads local workspace metrics and bootstrap health state from
REFER-owned files.

## Codebase Registry

REFER tracks one governed repo by default, even when that repo is a monorepo.
Lines of code, process state, updates, and governance remain repo-level.

Bootstrap writes `.refer-factory/codebases.json` as a derived subspace registry.
It records internal codebases such as `apps/*`, `packages/*`, `services/*`, and
`workers/*` so plans can target the right paths without creating separate REFER
installs. `REFER: Refresh Codebases` and the `refer.autoRefreshCodebases` setting
that kept it current on activation both went with the VS Code adapter, so the
registry is now refreshed only when something calls `refreshCodebaseRegistry`.
New folders are added as `discovered`; removed folders are marked `missing` so
manual aliases and overrides are not lost.

## Script Blueprint

The removed first-slice chat panel only displayed a Send Contract draft. The
current factory model keeps chat in the prevailing assistant and emits a script
blueprint instead. `REFER: Emit Script Blueprint` opens a JSON graph showing how
user chat intent becomes an intake envelope and planning artifact, how the
factory selects existing scripts or interpreter routes, how missing routes emit
correction records, and how
artifacts flow through verification and registration.

## Script DNA

`REFER: Emit Script DNA Seed` creates the normalized starting spec for custom
scripts. It gives every script common ports, guards, stations, assembly-like
opcodes, verification, and registry metadata so specialized factories can grow
without each AI session inventing a different script shape.

Script DNA is intentionally framework-neutral at the center. Planning forges may
consume a non-executing planning packet; any script that executes or mutates
requires a ratified Execution Contract. The bounded input also names target
paths and `workspace_context` JSON, and the factory emits portable JSON packets
such as `framework_operations` and `artifact_manifest`. Adapters translate those
packets into the local repo shape for Angular, React, Node, or a generic codebase.

A Send Contract draft is a planning artifact. It records work intent for review
but does not authorize execution. Only a ratified REFER Execution Contract is
execution authorization.

## Classification And Lineage

The Script Factory now has an executable first slice of the deterministic build
plan:

```powershell
npm run scripts:class-registry
npm run scripts:forge-registry
npm run lineage:create
npm run lineage:report
npm run authority:resolve -- --intent "Build Stripe checkout" --domain stripe
npm run authority:report
npm run doctrine:compile -- --rule "Stripe checkout must use official Stripe docs before script generation." --domain stripe
npm run doctrine:report
npm run scriptionary:candidate -- --term "New Effect" --plain "New Reusable Effect" --meaning "..." --use "..."
npm run scriptionary:promote -- --term "New Effect" --plain "New Reusable Effect" --meaning "..." --use "..."
npm run scriptionary:report
```

These write:

- `.refer-factory/script-class-registry.json`
- `.refer-factory/script-class-registry.md`
- `.refer-factory/forge-registry.json`
- `.refer-factory/forge-registry.md`
- `.refer-factory/lineage/*.json`
- `.refer-factory/authority/latest.json`
- `.refer-factory/authority/latest.md`
- `.refer-factory/doctrine-candidates/latest.json`
- `.refer-factory/doctrine-candidates/latest.md`
- `.refer-factory/scriptionary/term-candidates/latest.json`
- `.refer-factory/scriptionary/term-candidates/latest.md`

The class registry assigns each script a governed class, execution sequence
rank, forge owner, read/write surfaces, lock surfaces, and intended effect. The
forge registry groups scripts by production pattern. Lineage packets preserve
the chain from intent and authority to script, run, evidence, repair, and
promotion. Authority packets resolve known domain work to official or local
references before generation, and create an experimental authority path when no
known authority exists. Doctrine candidates turn natural rule input into
classified, authority-backed candidate scripts or validators with fixtures; they
remain inactive until future verification and promotion steps pass. Scriptionary
term candidates capture new words, methods, strategies, sequence ranks, chain
actions, artifacts, statuses, rules, or reusable system effects; promotion can
insert a vetted term into the Script Legend source.

## Intake

A prompt enters REFER before the model sees it: raw input is stored as an intake
record under `.refer-factory/intake/`, a compact intake envelope is sent to the
model, and the response is driven through a bounded resolution loop. Neither
record is execution authority. Every loop terminates as `resolved_as_is`,
`needs_more_info`, `needs_script`, `blocked_by_policy_or_scope`, or
`failed_with_reason`.

The `@refer` chat participant was the VS Code entry into this and is gone. **The
pipeline itself is host-neutral and intact** — the HTTP endpoint below drives the
same intake, the same orchestrator and the same loop, and writes the same
`.refer-factory/intake/` and `.refer-factory/chat/sessions/` artifacts.

Session records under `.refer-factory/chat/sessions/` keep raw intake, the compact
envelope, resolution state, output and progress. The Contract Reader panel that
displayed them was a read-only view and went with the adapter; the records are
still written and are plain JSON. Nothing in them ever created, ratified or
authorized a REFER Execution Contract.

The orchestrator backlog is tracked in `docs/refer-orchestrator-roadmap.md` and
mirrored by `createOrchestratorRoadmap()` so new capabilities can be marked
available and integrated without losing the intended sequence.

REFER Coach is scaffolded for helping users set up local LLMs, provider routing,
workspace readiness, and efficient REFER usage. It has no host to be invoked from
yet.

## REFER Orchestrator Endpoint

The HTTP adapter is a developer/simulation surface for pushing prompts into
the same REFER intake and bounded orchestrator used by `@refer`, without typing
through the VS Code Chat composer.

Start it from this repo:

```powershell
$env:REFER_WORKSPACE_ROOT = "e:\refer-script-factory"
$env:REFER_OLLAMA_MODEL = "qwen3:0.6b"
npm run refer:server
```

Default base URL:

```text
http://127.0.0.1:39741
```

Routes:

```text
GET  /health
GET  /refer/targets
POST /refer/chat
```

`GET /refer/targets` returns the target ids the endpoint can write to. By
default, the server exposes local targets that exist beside this repo, including
`refer-script-factory`, `jamaicaeats`, and `telechurch-e2e-v2` when present.
For explicit control, create `.refer-factory/orchestrator-targets.json`:

```json
{
  "targets": [
    {
      "id": "jamaicaeats",
      "workspaceRoot": "e:\\jamaicaeats",
      "label": "JamaicaEats"
    }
  ]
}
```

Send a simulated chat prompt:

```powershell
$body = @{
  target = "jamaicaeats"
  prompt = "explain this workspace in one sentence"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://127.0.0.1:39741/refer/chat `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

`POST /refer/chat` accepts `target` as the preferred workspace selector.
`workspaceRoot` is still accepted as a development fallback, but target ids are
the stable selector for simulations. Successful calls write the same
`.refer-factory/intake/`, `.refer-factory/chat/sessions/`, and
`.refer-factory/process-state.json` artifacts the retired Contract Reader used to
display. They are plain JSON and are still written.

## Unscripted Law Library

The historical REFER.OS markdown library lives in
`unscripted-laws/REFER.OS`. These documents are dormant references, not active
shipped governance. The always-on shipped rules should be limited to how Smart
Intake and the Script Factory work: intake records, Execution Contract gating, deterministic
resolution, registry use, effect checks, and safe script execution.

Users can add rules by prompt or document. The intended path is natural to the
system: intake captures the rule source, the doctrine compiler classifies it,
generates candidate scripts or validators, runs fixtures and modification loops,
then registers only verified output as active governance. Users do not need to
know there is a rule-to-script generator.

Refer Library ordering is controlled by `src/bootstrap/lawToc.ts`. Each document
has a sequence number, group, status, and summary so the view renders as an
intentional table of contents instead of raw filename order.

The expansion model is documented in `docs/user-law-expansion.md`.

## Updates

The update machinery in `src/updates/**` is driven by a manifest, filtered by an
update channel, and applies only after explicit confirmation. Before replacement,
existing targets are backed up under `.refer-factory/updates/backup-*`, state is
tracked in `.refer-factory/updates/state.json`, and check/apply events are
collapsed into the process state file.

**It currently has no caller**, and — correcting an earlier version of this
paragraph — **do not wire one up without reading this first.** The VS Code
adapter invoked it on activation and was retired on 2026-09-12. An earlier draft
of this README called wiring it to the CLI "a small job". That was wrong, and
following it would have activated three defects at once:

- **The verification is a gate that only looks like one.** `applyReferUpdate`
  checks `if (artifact.sha256 && sha256(content) !== artifact.sha256)`, and
  `createPackagedLawManifest` sets no `sha256` on any artifact. Every law file
  installs unverified, and the check reads as if it verified them.
- **It stamps REFER.OS with this repo's version.** `updateSync.ts:168` passes
  `packagedVersion(extensionRoot)`, read from this `package.json`, so REFER.OS
  installs as `0.0.1` — while upstream `E:/refer.os` declares
  `release_id: refer-os-1.0.0` with its own bundle and content-hashed
  distribution manifest.
- **One filename means two different documents.** Vendored
  `unscripted-laws/REFER.OS/refer.library.md` is 265,765 bytes of generated
  concatenation titled "Refer Library". Live `E:/refer.os/REFER.OS/refer.library.md`
  is 2,029 bytes titled "Reference Intelligence Doctrine". The copy path targets
  `REFER.OS/<fileName>`, so applying the packaged manifest would overwrite live
  doctrine with an unrelated document.

The vendored library is 86 files; the live one is 118. This machinery predates
the upstream packaging and now competes with it. Reconciling the two installers
is the job — not calling this one.

## Packaging

There is nothing to package. This is a private Node package with a CLI bin; the
`vsce` step went with the extension manifest.

## Scope Guard

This repo must not import Telechurch app code. Use Telechurch only as a pilot
target workspace through an adapter; app-specific implementation remains outside
the provider-neutral core.

**The guard is currently not satisfied, and saying so is the point of a guard.**
`alliance-android-sms-bridge/` and `The Alliance Story/` are Alliance product
material sitting in this tree. Nothing imports them, so the dependency law holds
and `verify:core` stays green — but a guard that reads as met while two app
directories sit in the root is the kind of check that gets trusted and should not
be. The move to `alliance-hub` is ruled on and recorded as an open thread in
`.claude/agent-context/shelf.md`, with what unblocks it.

**This repository is public.** `.gitignore` is the only thing standing between an
editor's autosave and a published file, and on 2026-06-17 it lost: VS Code Local
History was tracked rather than ignored and pushed two `alliance-hub/.dev.vars`
snapshots. Before adding a directory here, check what writes into it on a timer.
