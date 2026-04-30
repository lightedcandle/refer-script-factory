# Hive Node Deployment Pack: Alliance Zo

Created: 2026-04-29T21:23:06.589Z

## Node

- ID: `alliance`
- Instance: `alliance`
- Account: `zo:alliance`
- Status: `active`
- Role: alliance application build node
- Transport: `file_api_tandem`
- Ready to stage: `true`

## Required Datasets

- `datasets/tandem-contracts/inbox`
- `datasets/tandem-contracts/outbox`
- `datasets/tandem-talkback/inbox`
- `datasets/tandem-talkback/outbox`
- `datasets/tandem-dispatch/reports`
- `datasets/tandem-usage`

## Required Files

| Exists | Kind | Local | Remote |
|---|---|---|---|
| yes | runtime | `refer-zo-bootstrap\scripts\factory\compression-codec.mjs` | `/home/workspace/refer-zo-bootstrap/scripts/factory/compression-codec.mjs` |
| yes | runtime | `refer-zo-bootstrap\scripts\factory\token-log-bridge.mjs` | `/home/workspace/refer-zo-bootstrap/scripts/factory/token-log-bridge.mjs` |
| yes | runtime | `refer-zo-bootstrap\scripts\factory\contract-inbox-runner.mjs` | `/home/workspace/refer-zo-bootstrap/scripts/factory/contract-inbox-runner.mjs` |
| yes | runtime | `refer-zo-bootstrap\scripts\factory\backfill-zo-local-usage.mjs` | `/home/workspace/refer-zo-bootstrap/scripts/factory/backfill-zo-local-usage.mjs` |
| yes | doc | `refer-zo-bootstrap\docs\file-transport-tandem.md` | `/home/workspace/refer-zo-bootstrap/docs/file-transport-tandem.md` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-contracts\README.md` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-contracts/README.md` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-contracts\datapackage.json` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-contracts/datapackage.json` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-talkback\README.md` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-talkback/README.md` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-talkback\datapackage.json` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-talkback/datapackage.json` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-dispatch\README.md` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-dispatch/README.md` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-dispatch\datapackage.json` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-dispatch/datapackage.json` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-usage\README.md` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-usage/README.md` |
| yes | dataset-metadata | `refer-zo-bootstrap\datasets\tandem-usage\datapackage.json` | `/home/workspace/refer-zo-bootstrap/datasets/tandem-usage/datapackage.json` |
| yes | runtime | `refer-zo-bootstrap\AGENTS.md` | `/home/workspace/refer-zo-bootstrap/AGENTS.md` |
| yes | doc | `refer-zo-bootstrap\docs\known-limits-and-constraints.md` | `/home/workspace/refer-zo-bootstrap/docs/known-limits-and-constraints.md` |
| yes | doc | `refer-zo-bootstrap\docs\parallel-factory-orchestration.md` | `/home/workspace/refer-zo-bootstrap/docs/parallel-factory-orchestration.md` |
| yes | doc | `refer-zo-bootstrap\docs\factory-topology.md` | `/home/workspace/refer-zo-bootstrap/docs/factory-topology.md` |
| yes | runtime | `refer-zo-bootstrap\law\REFER.OS\refer.factory.md` | `/home/workspace/refer-zo-bootstrap/law/REFER.OS/refer.factory.md` |
| yes | runtime | `refer-zo-bootstrap\law\REFER.OS\refer.zo.md` | `/home/workspace/refer-zo-bootstrap/law/REFER.OS/refer.zo.md` |

## Remote Health Checks

- `cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/compression-codec.mjs`
- `cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/token-log-bridge.mjs`
- `cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/contract-inbox-runner.mjs`
- `cd /home/workspace/refer-zo-bootstrap && node scripts/factory/compression-codec.mjs self-test`

## Local Commands

- syntax: `npm --prefix refer-zo-bootstrap run check`
- codec: `npm --prefix refer-zo-bootstrap run codec:self-test`
- sync_runtime: `npm --prefix refer-zo-bootstrap run tandem:sync-runtime -- --instance alliance --preset all --check`
- dry_dispatch: `npm run hive:dispatch -- --id <ratification-item-id> --dry-run`
- live_dispatch: `npm run hive:dispatch -- --id <ratification-item-id> --trigger --fetch`
- validate_talkback: `npm run hive:validate-talkback -- --id <ratification-item-id>`
- heartbeat: `npm run hive:registry:heartbeat -- --id alliance --status ratifying --activity recent_activity --evidence "deployment pack ratification passed"`

## Ratification Contracts

### Ratify Alliance Zo transport

- Template: `ratification-test`
- Operation: `file_exists:/home/workspace/refer-zo-bootstrap/package.json`
- Acceptance: contract ships through file/API lane; talkback returns status done; talkback validates with root hive director

### Ratify Alliance Zo bounded execution

- Template: `ratification-test`
- Operations: `file_exists:/home/workspace/refer-zo-bootstrap/package.json`, `list_dir:/home/workspace/refer-zo-bootstrap/scripts/factory`
- Acceptance: executor:zo.bounded.v1 evidence returned; file_exists returns true; list_dir returns factory script entries

## Next

sync runtime to node, run remote checks, dispatch ratification contracts, validate talkback, then update hive registry

