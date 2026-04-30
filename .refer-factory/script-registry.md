# Domain Script Registry

Updated: 2026-04-29T22:18:20.888Z

Before direct work, identify the domain and check that domain's registry/check_first surfaces for an existing script.

## Domain Routing

| Domain | Scope | Authority | Check First |
|---|---|---|---|
| REFER Script Factory | Codex/VS Code source, provider-neutral doctrine, extension scripts. | `src/contracts/scriptFactory.ts` | `src/contracts/scriptFactory.ts`<br>`docs/script-legend.md`<br>`package.json` |
| Current Chat Surface | Token tracking, script-use logging, current-context reset, and chat-surface self-observation. | `.refer-factory/script-registry.json` | `docs/chat-surface-scripts.md`<br>`scripts/chat-surface/`<br>`package.json` |
| Hive Director | Cross-node identity, hive build plan, node heartbeat, and ratification status. | `.refer-factory/hive-node-registry.json` | `docs/hive-build-plan.md`<br>`.refer-factory/hive-node-registry.md`<br>`scripts/hive/` |
| REFER Zo Bootstrap | Zo computer bootstrap, file/API tandem, compression, dispatch, talkback, datasets, and live ratification. | `refer-zo-bootstrap/scripts/factory/script-registry.json` | `refer-zo-bootstrap/AGENTS.md`<br>`refer-zo-bootstrap/docs/file-transport-tandem.md`<br>`refer-zo-bootstrap/scripts/factory/script-registry.json`<br>`refer-zo-bootstrap/package.json` |

## Scripts

### REFER Script Factory

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `refer.extension.script-registry` | `source registry` | `src/contracts/scriptFactory.ts` | Authoritative VS Code extension and provider-neutral script contract registry. | active |

Package scripts discovered in this domain:

- `compile`: `tsc -p ./`
- `test`: `npm run compile && node dist/test/metrics.test.js && node dist/test/processEvents.test.js && node dist/test/bootstrapDryRun.test.js && node dist/test/bootstrapApply.test.js && node dist/test/bootstrapProcessEvents.test.js && node dist/test/bootstrapHealth.test.js && node dist/test/codebaseMiles.test.js && node dist/test/codebases.test.js && node dist/test/scriptBlueprint.test.js && node dist/test/scriptDna.test.js && node dist/test/scriptographer.test.js && node dist/test/referIntake.test.js && node dist/test/referOrchestrator.test.js && node dist/test/referProcessEvents.test.js && node dist/test/referChatSession.test.js && node dist/test/referChatMode.test.js && node dist/test/referOrchestratorRunner.test.js && node dist/test/referTargetRegistry.test.js && node dist/test/referCoach.test.js && node dist/test/orchestratorRoadmap.test.js && node dist/test/factoryGaps.test.js && node dist/test/schemaValidation.test.js && node dist/test/lawToc.test.js && node dist/test/updateSync.test.js`
- `verify`: `npm run test`
- `refer:server`: `npm run compile && node dist/src/server/referOrchestratorServer.js`
- `tokens:log`: `node scripts/chat-surface/token-useage.mjs log`
- `tokens:chat`: `node scripts/chat-surface/token-useage.mjs chat`
- `tokens:reset-chat`: `node scripts/chat-surface/token-useage.mjs reset-chat`
- `tokens:zo-chat`: `node scripts/chat-surface/token-useage.mjs zo-chat`
- `tokens:script`: `node scripts/chat-surface/token-useage.mjs script`
- `tokens:backfill-zo`: `node scripts/chat-surface/token-useage.mjs backfill-zo`
- `tokens:backfill-chat`: `node scripts/chat-surface/token-useage.mjs backfill-chat`
- `tokens:summary`: `node scripts/chat-surface/token-useage.mjs summary`
- `tokens:lanes`: `node scripts/chat-surface/token-useage.mjs lanes`
- `tokens:audit-chat`: `node scripts/chat-surface/token-useage.mjs audit-chat`
- `scripts:registry`: `node scripts/registry/domain-script-registry.mjs build`
- `hive:registry`: `node scripts/hive/hive-node-registry.mjs report`
- `hive:registry:init`: `node scripts/hive/hive-node-registry.mjs init`
- `hive:registry:upsert`: `node scripts/hive/hive-node-registry.mjs upsert`
- `hive:registry:heartbeat`: `node scripts/hive/hive-node-registry.mjs heartbeat`
- `hive:backlog`: `node scripts/hive/hive-director.mjs report`
- `hive:backlog:init`: `node scripts/hive/hive-director.mjs init`
- `hive:backlog:add`: `node scripts/hive/hive-director.mjs add`
- `hive:contract`: `node scripts/hive/hive-director.mjs contract`
- `hive:dispatch`: `node scripts/hive/hive-director.mjs dispatch`
- `hive:validate-talkback`: `node scripts/hive/hive-director.mjs validate-talkback`
- `hive:record`: `node scripts/hive/hive-director.mjs record`
- `hive:build-intake`: `node scripts/hive/hive-build-intake.mjs`
- `hive:deployment-pack`: `node scripts/hive/hive-node-deployment-pack.mjs build`
- `hive:ratify-routes`: `node scripts/hive/hive-route-ratifier.mjs`

### Current Chat Surface

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `chat.tokens` | `npm run tokens:chat` | `scripts/chat-surface/token-useage.mjs` | Log current Codex chat usage with 4 characters = 1 token estimates. | active |
| `chat.tokens.reset` | `npm run tokens:reset-chat` | `scripts/chat-surface/token-useage.mjs` | Log a context ceiling marker and start the current context total fresh. | active |
| `chat.tokens.script` | `npm run tokens:script` | `scripts/chat-surface/token-useage.mjs` | Record reusable script execution in the same usage ledger. | active |
| `chat.tokens.backfill` | `npm run tokens:backfill-chat` | `scripts/chat-surface/token-useage.mjs` | Backfill zero-count current-chat ledger records with manual estimates. | active |
| `chat.tokens.audit` | `npm run tokens:audit-chat` | `scripts/chat-surface/token-useage.mjs` | Report zero-count current-chat records that need measured or manual usage. | active |

### Hive Director

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `hive.node-registry` | `npm run hive:registry` | `scripts/hive/hive-node-registry.mjs` | Render the current hive node map from the JSON registry. | active |
| `hive.node-upsert` | `npm run hive:registry:upsert` | `scripts/hive/hive-node-registry.mjs` | Add or update a hive/factory node with role, account, datasets, scripts, and state. | active |
| `hive.node-heartbeat` | `npm run hive:registry:heartbeat` | `scripts/hive/hive-node-registry.mjs` | Record node liveness, status, and ratification evidence. | active |
| `hive.backlog` | `npm run hive:backlog` | `scripts/hive/hive-director.mjs` | Render the typed hive backlog and contract queue. | active |
| `hive.contract` | `npm run hive:contract` | `scripts/hive/hive-director.mjs` | Emit a root-authoritative hive contract from a backlog item. | active |
| `hive.dispatch` | `npm run hive:dispatch` | `scripts/hive/hive-director.mjs` | Dispatch a typed hive contract through the appropriate node lane and record evidence. | active |
| `hive.validate-talkback` | `npm run hive:validate-talkback` | `scripts/hive/hive-director.mjs` | Validate decoded talkback against the typed hive contract before ratification. | active |
| `hive.build-intake` | `npm run hive:build-intake` | `scripts/hive/hive-build-intake.mjs` | Emit and dispatch governed build-intake contracts so Zo route changes originate from typed intake. | active |
| `hive.deployment-pack` | `npm run hive:deployment-pack` | `scripts/hive/hive-node-deployment-pack.mjs` | Build a non-mutating deployment checklist for staging and ratifying a hive node. | active |
| `hive.ratify-routes` | `npm run hive:ratify-routes` | `scripts/hive/hive-route-ratifier.mjs` | Capture live zo.space route state for a hive node and record upstream ratification evidence. | active |

### REFER Zo Bootstrap

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `zo.dispatch-contract` | `npm --prefix refer-zo-bootstrap run dispatch:contract` | `refer-zo-bootstrap/scripts/factory/dispatch-contract.mjs` | Ship a contract to Zo, optionally trigger the runner, and fetch talkback. | active |
| `zo.sync-tandem-runtime` | `npm --prefix refer-zo-bootstrap run tandem:sync-runtime` | `refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs` | Sync known tandem runtime files to a Zo computer through MCP/file API. | active |
| `zo.codec-self-test` | `npm --prefix refer-zo-bootstrap run codec:self-test` | `refer-zo-bootstrap/scripts/factory/compression-codec.mjs` | Verify bidirectional machine compression/decompression before transport use. | active |
| `zo.contract-runner` | `npm --prefix refer-zo-bootstrap run contract:run-once` | `refer-zo-bootstrap/scripts/factory/contract-inbox-runner.mjs` | Run one Zo-side inbox contract and emit talkback. | active |
| `zo.adaptive-heartbeat` | `node refer-zo-bootstrap/scripts/factory/heartbeat.mjs --status` | `refer-zo-bootstrap/scripts/factory/heartbeat.mjs` | Run/status the Zo node-local adaptive heartbeat, tightening during work and relaxing up to a 24-hour dormant pulse. | active |

Package scripts discovered in this domain:

- `check`: `node --check tools/vipc-bootstrap.mjs && node --check tools/zo-mcp.mjs && node --check scripts/factory/compression-codec.mjs && node --check scripts/factory/bilateral-sim.mjs && node --check scripts/factory/token-log-bridge.mjs && node --check scripts/factory/dataset-store.mjs && node --check scripts/factory/heartbeat.mjs && node --check scripts/factory/contract-inbox-runner.mjs && node --check scripts/factory/backfill-zo-local-usage.mjs && node --check scripts/factory/ship-contract-to-zo.mjs && node --check scripts/factory/fetch-zo-talkback.mjs && node --check scripts/factory/dispatch-contract.mjs && node --check scripts/factory/sync-tandem-runtime-to-zo.mjs`
- `bootstrap`: `node tools/vipc-bootstrap.mjs`
- `verify`: `node tools/vipc-bootstrap.mjs --mode verify`
- `simulate`: `node scripts/factory/bilateral-sim.mjs`
- `codec:self-test`: `node scripts/factory/compression-codec.mjs self-test`
- `contract:run-once`: `node scripts/factory/contract-inbox-runner.mjs --once`
- `tandem:ship`: `node scripts/factory/ship-contract-to-zo.mjs`
- `tandem:fetch`: `node scripts/factory/fetch-zo-talkback.mjs`
- `dispatch:contract`: `node scripts/factory/dispatch-contract.mjs`
- `tandem:sync-runtime`: `node scripts/factory/sync-tandem-runtime-to-zo.mjs`
- `tandem:backfill-usage`: `node scripts/factory/backfill-zo-local-usage.mjs`

## Files

- JSON: `.refer-factory\script-registry.json`
- Markdown: `.refer-factory\script-registry.md`

