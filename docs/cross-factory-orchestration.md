# Cross-Factory Orchestration

## Purpose

`refer-script-factory`, `refer-zo-bootstrap`, and live Zo hive computers must evolve together. A chat instance should not let one repo learn a pattern while the other repo remains unaware of it.

Use this document after context compaction, in a fresh chat, or whenever work mentions hive, Zo bootstrap, factory parallelism, tandem work, contract routing, compression, dispatch, talkback, or Telechurch ratification.

## Active Surfaces

1. `refer-script-factory`
   - Path: `e:\refer-script-factory`
   - Scope: Codex/VS Code Script Factory, typed intake, provider-neutral doctrine, registry, scan/context assets, local process events.
   - Authority for: general Script Factory concepts that are not Zo-specific.

2. `refer-zo-bootstrap`
   - Path: `e:\refer-script-factory\refer-zo-bootstrap`
   - Scope: Zo computers, bootstrap, hive nodes, Zo Files, personas/rules, datasets, dispatch, talkback, heartbeat, compression transport, Telechurch ratification capture.
   - Authority for: Zo-specific implementation and deployable hive packages.

3. Telechurch Zo
   - Runtime: live Zo computer.
   - Scope: proving-ground behavior for Zo-native personas, rules, files, automation, datasets, and chat readback.
   - Authority for: live evidence only. Source is not ratified until captured, verified, committed, and deployable from the repos.
   - Preferred lane: Zo Files/MCP API for contract and talkback transfer, with Zo chat minimized to tiny activation or persona/rule judgment only when needed.

## Recovery Rule

When a chat is condensed, restart from durable files instead of memory:

1. Read this file.
2. Read root `AGENTS.md`.
3. Read `refer-zo-bootstrap/AGENTS.md`.
4. For Zo lanes, read:
   - `refer-zo-bootstrap/docs/factory-topology.md`
   - `refer-zo-bootstrap/docs/parallel-factory-orchestration.md`
   - `refer-zo-bootstrap/docs/machine-compression.md`
5. Use repo-specific contract/context assets before broad scans:
   - root: `.refer-factory/agent-context.md`, `.refer-factory/codebase-tree.json`, `.refer-factory/script-legend.md`
   - Zo bootstrap: `datasets/**`, `scripts/factory/**`, `skills/**`, `docs/**`

## Conversation Detection

Treat the following as signals for cross-factory orchestration:

- the user mentions hive, Zo, Telechurch, bootstrap, alliance Zo, personas/rules, datasets, dispatch, talkback, heartbeat, compression, intake, contracts, tandem, bilateral, parallel agents, or factories learning together;
- a change touches both repos or could apply to both repos;
- a root Script Factory improvement came from Zo development;
- a Zo bootstrap improvement exposes a provider-neutral Script Factory rule;
- a task would otherwise be solved only in chat without leaving durable factory learning.

When detected, do not rely only on prose. Produce or update a contract, doc, dataset row, script, schema, registry entry, or verification path.

## Lane Rule

The build director should use parallel lanes for substantial work:

```text
user request
-> intake contract
-> Codex Script Factory lane
-> Zo Bootstrap lane
-> Telechurch Zo lane when live behavior matters
-> talkback / evidence
-> source ratification
-> verification
```

If the environment allows subagents and the user has authorized parallel/delegated work, spawn bounded agents with explicit repo ownership. If spawning is unavailable or not authorized, simulate the same lanes with typed contracts and local scripts.

Do not duplicate work across lanes. Each lane should answer a different question:

- Root lane: what belongs in provider-neutral Script Factory doctrine, contracts, commands, registry, or tests?
- Zo bootstrap lane: what belongs in Zo bootstrap, hive packaging, datasets, compression, dispatch, talkback, or deployment?
- Telechurch lane: what does the live Zo runtime prove or reject?

## Contract Rule

The invariant is:

```text
typed contract is authority
compression is transport
talkback is evidence
source commit is ratification
```

For missing scripts, add one more invariant:

```text
AI exploration is allowed inside an approved intent
build trace is the memory
script replay is determinism
registry/source update is canonicalization
```

A script gap should not strand work in draft state. If the intent is valid and
authorized, the Zo or Codex AI lane may build the first working result directly,
capture the build trace, and then distill the trace into a replayable script.
Ratification applies to the replayable script and evidence, not to the mere fact
that AI was involved in the first build.

For machine-facing work, create inspectable typed packets first. Compress only after the packet exists and can round-trip.

Current Zo-side codec:

```powershell
cd e:\refer-script-factory\refer-zo-bootstrap
npm run codec:self-test
node scripts/factory/compression-codec.mjs encode --domain zo_task --file task.json
node scripts/factory/compression-codec.mjs decode --payload "sx1:zo_task:..."
```

Known compression domains:

- `codex_task`: root Script Factory task packets.
- `zo_task`: Zo Bootstrap task packets.
- `talkback`: worker/runtime return packets.
- `factory_sim`: bilateral simulation packets.

## Required Pointers

Root repo authority:

- `docs/factory-system-doctrine.md`
- `docs/script-legend.md`
- `src/contracts/referIntake.ts`
- `src/contracts/scriptFactory.ts`
- `src/contracts/scriptLegend.ts`
- `src/chat/referOrchestratorRunner.ts`
- `src/chat/referResolutionLoop.ts`
- `.refer-factory/`

Zo repo authority:

- `refer-zo-bootstrap/docs/factory-topology.md`
- `refer-zo-bootstrap/docs/parallel-factory-orchestration.md`
- `refer-zo-bootstrap/docs/machine-compression.md`
- `refer-zo-bootstrap/docs/file-transport-tandem.md`
- `refer-zo-bootstrap/scripts/factory/compression-codec.mjs`
- `refer-zo-bootstrap/scripts/factory/bilateral-sim.mjs`
- `refer-zo-bootstrap/scripts/factory/ship-contract-to-zo.mjs`
- `refer-zo-bootstrap/scripts/factory/contract-inbox-runner.mjs`
- `refer-zo-bootstrap/scripts/factory/fetch-zo-talkback.mjs`
- `refer-zo-bootstrap/scripts/factory/dispatch-contract.mjs`
- `refer-zo-bootstrap/scripts/factory/token-log-bridge.mjs`
- `refer-zo-bootstrap/datasets/`
- `refer-zo-bootstrap/tools/vipc-bootstrap.mjs`
- `refer-zo-bootstrap/tools/zo-mcp.mjs`

## Drift Control

Before finishing a cross-factory task, check for drift:

1. Did the root repo learn a provider-neutral rule that Zo bootstrap should also know?
2. Did Zo bootstrap learn a Zo-specific implementation that root should reference as a sibling example?
3. Did live Telechurch evidence need to become a ratification note?
4. Did a new packet shape need schema/docs in both repos?
5. Did compression aliases or domains change?
6. Did verification commands change?
7. Did any workflow use Zo chat where file/API transport would have been cheaper?

If any answer is yes, update the relevant docs/contracts before final response.

## Verification

Root:

```powershell
cd e:\refer-script-factory
npm run compile
```

Zo bootstrap:

```powershell
cd e:\refer-script-factory\refer-zo-bootstrap
npm run check
npm run codec:self-test
npm run simulate -- --prompt "<request summary>"
```

Telechurch live verification is non-mutating unless explicitly approved:

```powershell
cd e:\refer-script-factory\refer-zo-bootstrap
node tools/vipc-bootstrap.mjs --profile telechurch --instance telechurch --mode verify
```
