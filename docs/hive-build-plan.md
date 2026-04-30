# Hive Build Plan

## Purpose

The hive is a network of factory nodes that can receive governed work, execute or ratify it through scripts, and return evidence without letting chat become the primary transport.

This repo is the Codex-side director and doctrine factory. The nested `refer-zo-bootstrap` repo owns Zo-specific deployment and runtime behavior. Telechurch Zo is the first live proving node.

## Current Capabilities

The first build-out capabilities are the Hive Node Registry and Hive Director backlog.

Authoritative local artifacts:

```text
.refer-factory/hive-node-registry.json
.refer-factory/hive-node-registry.md
.refer-factory/hive-backlog.json
.refer-factory/hive-backlog.md
.refer-factory/hive-contracts/outbox/
.refer-factory/hive-deployment-packs/
```

Scripts:

```text
scripts/hive/hive-node-registry.mjs
scripts/hive/hive-director.mjs
scripts/hive/hive-node-deployment-pack.mjs
scripts/hive/hive-build-intake.mjs
scripts/hive/hive-route-ratifier.mjs
```

The hive domain is also registered in:

```text
.refer-factory/script-registry.json
.refer-factory/script-registry.md
```

Regenerate after changing hive scripts:

```powershell
npm run scripts:registry
```

Commands:

```powershell
npm run hive:registry:init
npm run hive:registry
npm run hive:registry:upsert -- --id alliance --name "Alliance Zo" --account zo:alliance --role "application build node"
npm run hive:registry:heartbeat -- --id telechurch --status ratifying --evidence "dispatch verified"
npm run hive:backlog
npm run hive:backlog:add -- --title "Verify Telechurch talkback" --summary "Run a non-mutating ratification test" --acceptance "talkback returned;registry updated"
npm run hive:contract -- --id <item-id>
npm run hive:dispatch -- --id <item-id> --dry-run
npm run hive:validate-talkback -- --id <item-id>
npm run hive:build-intake -- emit --id <item-id> --routes "/,/organizations,/people"
npm run hive:build-intake -- dispatch --id <item-id> --routes "/,/organizations,/people" --dry-run
npm run hive:deployment-pack -- --id alliance
npm run hive:ratify-routes -- --instance alliance --id <item-id> --expected "/,/organizations,/people"
```

## Node Registry Fields

- `id`: stable machine identifier.
- `name`: human-readable node name.
- `kind`: `codex_factory`, `zo_computer`, or another governed node type.
- `role`: what this node is responsible for in the hive.
- `account`: token/account scope, such as `lightedcandle2018@gmail.com` or `zo:telechurch`.
- `instance`: local script/MCP instance name.
- `status`: `planned`, `active`, `ratifying`, `blocked`, or `retired`.
- `transport`: preferred lane, such as `local_scripts` or `file_api_tandem`.
- `persona` and `rules`: installed state or authority pointer.
- `datasets`: durable datasets this node owns or mirrors.
- `scripts`: scripts expected to exist on the node.
- `heartbeat`: adaptive pulse policy, current mode, interval, max interval, and next due time.
- `evidence`: recent ratification notes.
- `notes`: operational notes.

## Node Self-Scoping

The registry role is an identity hint, not a permanent build boundary. A hive node may be used for one purpose or several purposes. Scope should be declared or inferred by the node from local user intent, local work, local datasets, and ratified contracts.

Zo nodes record local scopes in:

```text
refer-zo-bootstrap/datasets/node-scope/records/
```

Root may use node scope records to route work, but should not prescribe a fixed contextual domain for the computer. The root asks for scope evidence; the node owns the scope declaration.

Users do not need to ask for scoping explicitly. A Zo node's contract runner should inspect local node-scope records on every contract, attach the matched scope to talkback, and only surface a scope gap when no active scope fits the request.

## Build Sequence

1. Keep the registry current with every Zo computer and factory node.
2. For each new node, record identity, account scope, role, transport, datasets, scripts, persona, and rules.
3. Add planned work to the Hive Director backlog before dispatch.
4. Emit a typed contract from the backlog item.
5. Use `refer-zo-bootstrap` tandem scripts to deploy or verify Zo-specific scripts.
6. Record talkback, heartbeat, and ratification evidence after successful live checks.
7. Promote provider-neutral lessons back into this repo.

## Node Deployment Pack

Every fresh hive node must have a generated deployment pack before live staging:

```powershell
npm run hive:deployment-pack -- --id alliance
```

Deployment packs are written to:

```text
.refer-factory/hive-deployment-packs/
```

The pack is non-mutating. It records:

- node identity from `.refer-factory/hive-node-registry.json`;
- required tandem datasets;
- required runtime, dataset metadata, governance, and doctrine files from `refer-zo-bootstrap`;
- remote syntax and codec health checks;
- local sync, dispatch, validation, and heartbeat commands;
- ratification contract templates for transport and bounded execution.

Alliance staging sequence:

1. Generate `.refer-factory/hive-deployment-packs/alliance.json`.
2. Confirm `ready_to_stage` is `true`.
3. Sync the tandem runtime to `--instance alliance`.
4. Run remote checks from the pack.
5. Create and dispatch the two ratification contracts.
6. Validate talkback with `npm run hive:validate-talkback`.
7. Mark Alliance `ratifying` or `active` in the hive registry with evidence.

## Hive Director Backlog

The director backlog is the root queue for governed hive work. It keeps chat from becoming the authority for cross-node tasks.

Authoritative files:

```text
.refer-factory/hive-backlog.json
.refer-factory/hive-backlog.md
.refer-factory/hive-contracts/outbox/
```

Templates:

| Template | Use |
|---|---|
| `hive-feature` | Build provider-neutral hive capability in the root Script Factory. |
| `zo-runtime-fix` | Verify or repair Zo-specific runtime behavior. |
| `factory-doctrine-promotion` | Promote a general lesson from Zo work into root doctrine. |
| `ratification-test` | Ask a node to prove behavior and return talkback evidence. |

Director invariant:

```text
backlog item -> typed hive contract -> transport dispatch -> talkback evidence -> talkback validation -> source verification
```

Route-build rectification invariant:

```text
direct/live route work -> route ratification report -> backlog evidence -> source/script fix -> Telechurch cross-ratification
```

Use route ratification when a live Zo build has created or changed zo.space routes before the full intake runner exists:

```powershell
npm run hive:ratify-routes -- --instance alliance --id hive.task.alliance.app-shell.20260429 --expected "/,/organizations,/people,/calendar,/initiatives,/documents,/governance,/compliance,/communications,/profiles,/settings"
```

This does not claim the direct build was governed. It captures current route evidence, marks missing routes as blockers, and records the result so the missing automation can be rectified upstream.

Use dry-run dispatch before live node mutation:

```powershell
npm run hive:dispatch -- --id <item-id> --dry-run
```

For live Telechurch ratification, dispatch through the nested Zo lane:

```powershell
npm run hive:dispatch -- --id <item-id> --trigger --fetch
```

Current ratification evidence:

- `hive.task.20260429T192457244Z.edb26d473e` reached `ratified` on 2026-04-29 after live Telechurch dispatch returned compressed talkback.
- The talkback proved `read_contract`, `decoded_transport:zo_task`, and `runner:contract-inbox-runner`.
- This ratifies the file/API transport and minimal activation runner. Full remote task execution is intentionally a later hive capability.
- `hive.task.20260429T193810865Z.d738ee3912` reached `ratified` on 2026-04-29 after live Telechurch bounded execution returned compressed talkback.
- The bounded execution talkback proved `executor:zo.bounded.v1`, `file_exists` for `/home/workspace/refer-zo-bootstrap/package.json`, and `list_dir` for `/home/workspace/refer-zo-bootstrap/scripts/factory`.

## Bounded Remote Execution

Hive contracts may request guarded non-mutating execution through:

```json
{
  "execution": {
    "executor": "zo.bounded.v1",
    "mode": "non_mutating",
    "operations": [
      { "op": "file_exists", "path": "/home/workspace/refer-zo-bootstrap/package.json" },
      { "op": "list_dir", "path": "/home/workspace/refer-zo-bootstrap/scripts/factory" }
    ]
  }
}
```

The current allowed operation set is intentionally small: `echo`, `file_exists`, `list_dir`, and `read_json`. The Zo runner refuses paths outside `/home/workspace`, sensitive path names, unsupported executors, unsupported modes, and large JSON reads.

## Governed Build Intake

Route or app changes for a hive node should start from a build-intake contract before direct route mutation.

Root command:

```powershell
npm run hive:build-intake -- emit --id hive.task.alliance.intake-automation.20260429 --routes "/,/organizations,/people,/calendar,/initiatives,/documents,/governance,/compliance,/communications,/profiles,/settings"
npm run hive:build-intake -- dispatch --id hive.task.alliance.intake-automation.20260429 --routes "/,/organizations,/people,/calendar,/initiatives,/documents,/governance,/compliance,/communications,/profiles,/settings" --trigger --fetch
```

The contract includes a `build_intake` block with schema `refer.zo.build-intake.v1`. The Zo `contract-inbox-runner` records it under:

```text
refer-zo-bootstrap/datasets/build-activity/records/
```

This lane ratifies the origin of future route changes. It does not claim route mutation is complete; route changes still need talkback and route ratification.

## Alliance Script Factory Completion Boundary

Skills and automation are part of the Script Factory boundary:

- skills carry the local operating doctrine and prompt behavior;
- scripts are deterministic forges that perform repeatable work;
- automation watches or triggers the local intake lane so ordinary user requests do not depend on Codex manually routing them.

The minimum local loop for Alliance is:

```text
ordinary prompt
-> local intake
-> node-scope auto resolution
-> script registry match
-> executable script if present
-> script-gap draft if missing
-> talkback packet
```

Zo bootstrap implements that loop with:

```text
refer-zo-bootstrap/scripts/factory/local-script-registry.mjs
refer-zo-bootstrap/scripts/factory/local-intake-runner.mjs
refer-zo-bootstrap/scripts/factory/inbox-automation.mjs
refer-zo-bootstrap/datasets/local-intake/
refer-zo-bootstrap/datasets/script-registry/
```

Use:

```powershell
npm --prefix refer-zo-bootstrap run factory:intake -- --prompt "add a new church profile to alliance" --json
npm --prefix refer-zo-bootstrap run factory:automation-once -- --json
```

This is not yet a claim that Zo chat itself automatically invokes the loop. It is the ratified local executable path that a Zo-native persistent automation or chat hook should call.

Self-evolution adds one more bounded tick:

```text
queued intake
-> inbox automation
-> registry doctor
-> evolution-log event
-> talkback
```

Zo bootstrap implements that with:

```text
refer-zo-bootstrap/scripts/factory/registry-doctor.mjs
refer-zo-bootstrap/scripts/factory/evolution-loop.mjs
refer-zo-bootstrap/datasets/evolution-log/
```

Use:

```powershell
npm --prefix refer-zo-bootstrap run factory:evolve -- --json
```

This layer records and scaffolds script gaps. It does not certify that generated placeholders are complete business logic; implementation and ratification are still required before a draft forge becomes an active production script.

## Base Atomic Forge Pack

The Script Factory requirement includes shipped base atomic elements. In Zo bootstrap, the base atom pack now includes executable forges for:

- `page-add`
- `section-add`
- `card-add`
- `button-add`
- `field-add`
- `text-add`
- `form-add`
- `scan-workspace`

These scripts emit portable build artifacts in:

```text
refer-zo-bootstrap/datasets/script-artifacts/records/
```

They are intentionally adapter-neutral. They produce governed artifacts for page/section/card/element composition, and a later app adapter applies them to a specific route/component/runtime.

## Talkback Validation

The root director validates decoded talkback before ratification:

```powershell
npm run hive:validate-talkback -- --id <item-id>
```

Validation checks:

- talkback `contract_id` matches the typed contract;
- talkback status is `done`;
- blockers are empty;
- required evidence includes `decoded_transport:zo_task` and `runner:contract-inbox-runner`;
- bounded execution talkback includes `executor:zo.bounded.v1`, non-mutating mode, matching operations, and successful operation results.

Validation reports are written to:

```text
.refer-factory/hive-validations/
```

## Adaptive Heartbeat

Heartbeat rate should follow node activity instead of using a fixed high-frequency pulse:

| Mode | Interval | Use |
|---|---:|---|
| `active_build` | 5 minutes | active dispatch, build, pending tasks, or alerts |
| `ratifying` | 15 minutes | verification or live proving work |
| `watch` | 1 hour | planned/staging node with no active work |
| `idle` | 6 hours | quiet but still active node |
| `dormant` | 24 hours | max-saving pulse when nothing is needed |

The max pulse is 24 hours unless a future explicit policy lowers it. Use `--activity` on heartbeat updates to tighten or relax the next pulse:

```powershell
npm run hive:registry:heartbeat -- --id telechurch --status ratifying --activity recent_activity --evidence "dispatch verified"
npm run hive:registry:heartbeat -- --id alliance --status planned --activity watch --note "waiting for deployment"
```

## Next Capabilities

- Hive Backlog views inside the VS Code Script Factory cockpit.
- Director Build Loop hardening: dispatch retries and stricter schema validation.
- Broader remote execution runner: add more governed operation types only after each operation has explicit guards and talkback evidence.
- Live Alliance Zo staging from the generated node deployment pack.
