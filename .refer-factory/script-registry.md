# Domain Script Registry

Updated: 2026-05-01T15:31:18.478Z

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
- `test`: `npm run compile && node dist/test/metrics.test.js && node dist/test/processEvents.test.js && node dist/test/bootstrapDryRun.test.js && node dist/test/bootstrapApply.test.js && node dist/test/bootstrapProcessEvents.test.js && node dist/test/bootstrapHealth.test.js && node dist/test/codebaseMiles.test.js && node dist/test/codebases.test.js && node dist/test/scriptBlueprint.test.js && node dist/test/scriptDna.test.js && node dist/test/scriptographer.test.js && node dist/test/referIntake.test.js && node dist/test/referOrchestrator.test.js && node dist/test/referProcessEvents.test.js && node dist/test/referChatSession.test.js && node dist/test/referChatMode.test.js && node dist/test/referOrchestratorRunner.test.js && node dist/test/referTargetRegistry.test.js && node dist/test/referCoach.test.js && node dist/test/orchestratorRoadmap.test.js && node dist/test/factoryGaps.test.js && node dist/test/schemaValidation.test.js && node dist/test/lawToc.test.js && node dist/test/updateSync.test.js && node dist/test/factoryRegistries.test.js && node dist/test/authorityResolver.test.js && node dist/test/doctrineCompiler.test.js && node dist/test/scriptionaryTerm.test.js && node dist/test/modificationLoop.test.js`
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
- `scripts:class-registry`: `node scripts/registry/script-class-registry.mjs build`
- `scripts:forge-registry`: `node scripts/registry/forge-registry.mjs build`
- `lineage:create`: `node scripts/lineage/lineage-packet.mjs create`
- `lineage:report`: `node scripts/lineage/lineage-packet.mjs report`
- `failure:detect`: `node scripts/repair/modification-loop.mjs`
- `repair:modification-loop`: `node scripts/repair/modification-loop.mjs`
- `authority:resolve`: `node scripts/reference/authority-resolver.mjs resolve`
- `authority:report`: `node scripts/reference/authority-resolver.mjs report`
- `doctrine:compile`: `node scripts/doctrine/doctrine-compiler.mjs compile`
- `doctrine:report`: `node scripts/doctrine/doctrine-compiler.mjs report`
- `scriptionary:candidate`: `node scripts/scriptionary/scriptionary-term.mjs candidate`
- `scriptionary:promote`: `node scripts/scriptionary/scriptionary-term.mjs promote`
- `scriptionary:report`: `node scripts/scriptionary/scriptionary-term.mjs report`
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
- `alliance:forms-check`: `npm --prefix alliance-cloudflare-forms run check`
- `alliance:forms-deploy`: `npm --prefix alliance-cloudflare-forms run deploy`

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

- `check`: `node --check tools/vipc-bootstrap.mjs && node --check tools/zo-mcp.mjs && node --check scripts/factory.mjs && node --check scripts/bootstrap.mjs && node --check scripts/hive/api.mjs && node --check scripts/hive/dispatcher.mjs && node --check scripts/hive/receive.mjs && node --check scripts/hive/talkback.mjs && node --check scripts/factory/factory.mjs && node --check scripts/factory/bootstrap.mjs && node --check scripts/factory/compression-codec.mjs && node --check scripts/factory/bilateral-sim.mjs && node --check scripts/factory/token-log-bridge.mjs && node --check scripts/factory/dataset-store.mjs && node --check scripts/factory/heartbeat.mjs && node --check scripts/factory/train-cars/01-dashboard.mjs && node --check scripts/factory/train-cars/02-spawn-worker.mjs && node --check scripts/factory/train-cars/03-scan-workspace.mjs && node --check scripts/factory/train-cars/04-hive-sync.mjs && node --check scripts/factory/contract-inbox-runner.mjs && node --check scripts/factory/backfill-zo-local-usage.mjs && node --check scripts/factory/ship-contract-to-zo.mjs && node --check scripts/factory/fetch-zo-talkback.mjs && node --check scripts/factory/dispatch-contract.mjs && node --check scripts/factory/sync-tandem-runtime-to-zo.mjs && node --check scripts/factory/node-scope.mjs && node --check scripts/factory/local-script-registry.mjs && node --check scripts/factory/draft-promotion-runner.mjs && node --check scripts/factory/local-intake-runner.mjs && node --check scripts/factory/inbox-automation.mjs && node --check scripts/factory/registry-doctor.mjs && node --check scripts/factory/evolution-loop.mjs && node --check scripts/factory/route-manifest-bridge.mjs && node --check scripts/factory/script-dictionary.mjs && node --check scripts/factory/hive/api.mjs && node --check scripts/factory/hive/dispatcher.mjs && node --check scripts/factory/hive/receive.mjs && node --check scripts/factory/hive/talkback.mjs && node -e "JSON.parse(require('fs').readFileSync('scripts/factory/scriptionary.json','utf8')); JSON.parse(require('fs').readFileSync('scopes/alliance/site-manifest.json','utf8')); JSON.parse(require('fs').readFileSync('scopes/alliance/phase2-data-contract.json','utf8'));" && node --check scripts/factory/artifacts/atomic-common.mjs && node --check scripts/factory/artifacts/page-add.mjs && node --check scripts/factory/artifacts/section-add.mjs && node --check scripts/factory/artifacts/card-add.mjs && node --check scripts/factory/artifacts/button-add.mjs && node --check scripts/factory/artifacts/field-add.mjs && node --check scripts/factory/artifacts/text-add.mjs && node --check scripts/factory/artifacts/form-add.mjs && node --check scripts/factory/artifacts/scan-workspace.mjs && node --check scopes/alliance/site/server.ts && node --check scopes/alliance/supabase-apply.mjs && node --check scopes/alliance/supabase-edge-deploy.mjs && node --check scopes/alliance/sms-relay-deploy.mjs && node --check scopes/alliance/supabase-probe.mjs && node --check scopes/alliance/sync-supabase-env-to-zo.mjs && node --check scopes/alliance/story-scope.mjs && node --check scopes/alliance/alliance-vocabulary.mjs && node --check scopes/alliance/sync-story-to-zo.mjs && node --check scopes/alliance/phase3-manifest.mjs && node --check scopes/alliance/build-site-from-manifest.mjs && node --check scopes/alliance/phase1-status.mjs && node --check scopes/alliance/phase1-next.mjs && node --check scopes/alliance/phase2-status.mjs && node --check scopes/alliance/phase2-next.mjs && node --check scopes/alliance/phase3-status.mjs && node --check scopes/alliance/phase3-next.mjs && node --check scopes/alliance/phase4-status.mjs && node --check scopes/alliance/phase4-next.mjs && node --check scopes/alliance/phase5-status.mjs && node --check scopes/alliance/phase5-next.mjs && node --check scopes/alliance/phase5-persistence-probe.mjs && node --check scopes/alliance/sync-site-to-zo.mjs && node --check scopes/alliance/sync-phase2-to-zo.mjs`
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
- `scope:record`: `node scripts/factory/node-scope.mjs record`
- `scope:report`: `node scripts/factory/node-scope.mjs report`
- `factory:registry`: `node scripts/factory/local-script-registry.mjs`
- `factory:promote-drafts`: `node scripts/factory/draft-promotion-runner.mjs --all`
- `factory:intake`: `node scripts/factory/local-intake-runner.mjs`
- `factory:automation-once`: `node scripts/factory/inbox-automation.mjs --once`
- `factory:automation-status`: `node scripts/factory/inbox-automation.mjs --status`
- `factory:registry-doctor`: `node scripts/factory/registry-doctor.mjs`
- `factory:evolve`: `node scripts/factory/evolution-loop.mjs`
- `route:manifest-bridge`: `node scripts/factory/route-manifest-bridge.mjs`
- `alliance:site-build`: `node scopes/alliance/build-site-from-manifest.mjs`
- `alliance:phase1-status`: `node scopes/alliance/phase1-status.mjs`
- `alliance:phase1-next`: `node scopes/alliance/phase1-next.mjs`
- `alliance:phase2-status`: `node scopes/alliance/phase2-status.mjs`
- `alliance:phase2-next`: `node scopes/alliance/phase2-next.mjs`
- `alliance:phase3-status`: `node scopes/alliance/phase3-status.mjs`
- `alliance:phase3-next`: `node scopes/alliance/phase3-next.mjs`
- `alliance:phase4-status`: `node scopes/alliance/phase4-status.mjs`
- `alliance:phase4-next`: `node scopes/alliance/phase4-next.mjs`
- `alliance:phase5-status`: `node scopes/alliance/phase5-status.mjs`
- `alliance:phase5-next`: `node scopes/alliance/phase5-next.mjs`
- `alliance:phase5-probe`: `node scopes/alliance/phase5-persistence-probe.mjs`
- `alliance:supabase-apply`: `node scopes/alliance/supabase-apply.mjs`
- `alliance:supabase-edge-deploy`: `node scopes/alliance/supabase-edge-deploy.mjs`
- `alliance:sms-relay-deploy`: `node scopes/alliance/sms-relay-deploy.mjs`
- `alliance:sms-relay-maintenance`: `node scopes/alliance/sms-relay-maintenance.mjs`
- `alliance:supabase-env-sync`: `node scopes/alliance/sync-supabase-env-to-zo.mjs`
- `alliance:supabase-probe`: `node scopes/alliance/supabase-probe.mjs`
- `alliance:story-scope`: `node scopes/alliance/story-scope.mjs`
- `alliance:vocabulary`: `node scopes/alliance/alliance-vocabulary.mjs`
- `alliance:story-sync`: `node scopes/alliance/sync-story-to-zo.mjs`
- `alliance:phase3-manifest`: `node scopes/alliance/phase3-manifest.mjs`
- `alliance:phase2-sync`: `node scopes/alliance/sync-phase2-to-zo.mjs`
- `alliance:site-sync`: `node scopes/alliance/sync-site-to-zo.mjs`

## Files

- JSON: `.refer-factory\script-registry.json`
- Markdown: `.refer-factory\script-registry.md`

