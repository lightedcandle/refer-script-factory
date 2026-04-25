# Refer Script Factory

`Refer Script Factory` is a VS Code extension and local cockpit for governed
REFER work. The first slice proves the product container: a REFER activity bar,
dashboard Miles/MPG metrics, live process panel, Send Contract draft output,
adapter contract, and repo bootstrap dry-run/apply.

Telechurch is the pilot consumer, not a product dependency.

## First Slice

- REFER activity container
- Dashboard webview for Live/Average token MPG, Miles, road quality, and repo health
- Process panel that renders local process events
- Bootstrap Library panel that inventories REFER bootstrap source references
- Refer Library panel that browses readable REFER.OS document aliases
- `REFER: Initialize Repo` dry-run command with explicit apply confirmation
- `REFER: Emit Send Contract Draft` command
- `REFER: Emit Script Blueprint` command for chat-to-contract-to-script routing
- `REFER: Emit Script DNA Seed` command for normalized custom script specs
- `REFER: Refresh Codebases` command for derived monorepo/subspace discovery
- `REFER: Check for Updates` and `REFER: Apply Update` commands
- Agent governance bootstrap through `AGENTS.md` and `.refer-factory/agent-profile.json`
- JSON schemas for contracts, metrics, process events, adapters, and bootstrap
- Portable JSON script packets with Angular, React, Node, and generic adapters
- Universal REFER.OS law library under `law/REFER.OS`
- TypeScript tests for metrics, process events, and bootstrap dry-run

## Verify

```powershell
npm install
npm run verify
```

## Run Locally

Open this repo in VS Code and start the `Run REFER Extension` launch
configuration. In the Extension Development Host, open the REFER activity bar
container and run `REFER: Initialize Repo` from the command palette.

The released sidebar includes Dashboard, Process, Bootstrap Library, and Refer Library views.

## Bootstrap

Run `REFER: Initialize Repo` from VS Code to inspect the bootstrap dry-run
report. The command writes REFER bootstrap files only after the modal
confirmation is accepted.

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
- the rest of the universal `REFER.OS/*.md` law/reference library
- `.refer-factory/agent-profile.json`
- `.refer-factory/adapter.json`
- `.refer-factory/codebases.json`
- `.refer-factory/metrics.json`
- `.refer-factory/plan/refer.plan.json`

These define contract-first prompt handling, safe script rules, secret-file
exclusions, local tracking paths, and the machine-readable discovery contract
other agents can follow before searching.

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
installs. Operators can run `REFER: Refresh Codebases`, and
`refer.autoRefreshCodebases` keeps the registry current on extension activation.
New folders are added as `discovered`; removed folders are marked `missing` so
manual aliases and overrides are not lost.

## Script Blueprint

The removed first-slice chat panel only displayed a Send Contract draft. The
current factory model keeps chat in the prevailing assistant and emits a script
blueprint instead. `REFER: Emit Script Blueprint` opens a JSON graph showing how
user chat intent becomes a contract, how the factory selects existing scripts or
interpreter routes, how missing routes emit correction contracts, and how
artifacts flow through verification and registration.

## Script DNA

`REFER: Emit Script DNA Seed` creates the normalized starting spec for custom
scripts. It gives every script common ports, guards, stations, assembly-like
opcodes, verification, and registry metadata so specialized factories can grow
without each AI session inventing a different script shape.

Script DNA is intentionally framework-neutral at the center. Scripts consume a
Send Contract, target paths, and `workspace_context` JSON, then emit portable
JSON packets such as `framework_operations` and `artifact_manifest`. Adapters
translate those packets into the local repo shape for Angular, React, Node, or a
generic codebase.

## Law Library

The extension ships the full universal REFER.OS markdown library in
`law/REFER.OS`. The Refer Library view shows readable document aliases without
the `refer.` prefix or `.md` suffix, and each row can open the source document
directly in VS Code.

Refer Library ordering is controlled by `src/bootstrap/lawToc.ts`. Each document
has a sequence number, group, status, and summary so the view renders as an
intentional table of contents instead of raw filename order.

## Updates

REFER checks for law/script updates on activation when `refer.autoCheckUpdates`
is enabled. Operators can also run `REFER: Check for Updates` manually. Updates
are driven by a manifest, filtered by `refer.updateChannel`, previewed in a VS
Code notification, and applied only after explicit confirmation.

Before replacement, existing targets are backed up under
`.refer-factory/updates/backup-*`. Update state is tracked in
`.refer-factory/updates/state.json`, and check/apply events are collapsed into
the process state file.

## Packaging

```powershell
npm run verify
npx @vscode/vsce package
```

## Scope Guard

This repo must not import Telechurch app code. Use Telechurch only as a pilot
workspace after the extension can run independently.
