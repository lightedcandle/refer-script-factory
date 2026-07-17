# Domain Script Registry

Updated: 2026-07-17T11:38:21.906Z

Before direct work, identify the domain and check that domain's registry/check_first surfaces for an existing script.

## Domain Routing

| Domain | Scope | Authority | Check First |
|---|---|---|---|
| REFER Script Factory | Provider-neutral TypeScript source and doctrine, plus current host-adapter registrations. | `src/core/contracts/scriptFactory.ts` | `src/core/contracts/scriptFactory.ts`<br>`docs/script-legend.md`<br>`package.json` |
| Current Chat Surface | Token tracking, script-use logging, current-context reset, and chat-surface self-observation. | `.refer-factory/script-registry.json` | `docs/chat-surface-scripts.md`<br>`scripts/chat-surface/`<br>`package.json` |
| Hive Director | Cross-node identity, hive build plan, node heartbeat, and ratification status. | `.refer-factory/hive-node-registry.json` | `docs/hive-build-plan.md`<br>`.refer-factory/hive-node-registry.md`<br>`scripts/hive/` |
| Alliance Hub | Telechurchlive Alliance app source, Cloudflare Pages/Functions, Supabase migrations, SMS routing, formula/retrieval flows. | `alliance-hub/AGENTS.md` | `alliance-hub/AGENTS.md`<br>`alliance-hub/package.json`<br>`alliance-hub/tools/`<br>`alliance-hub/scripts/sms/`<br>`alliance-hub/supabase/migrations/`<br>`alliance-hub/docs/records-split-sequence.md` |
| REFER Zo Bootstrap | Zo computer bootstrap, file/API tandem, compression, dispatch, talkback, datasets, and live ratification. | `refer-zo-bootstrap/scripts/factory/script-registry.json` | `refer-zo-bootstrap/AGENTS.md`<br>`refer-zo-bootstrap/docs/file-transport-tandem.md`<br>`refer-zo-bootstrap/scripts/factory/script-registry.json`<br>`refer-zo-bootstrap/package.json` |

## Scripts

### REFER Script Factory

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `refer.extension.script-registry` | `source registry` | `src/core/contracts/scriptFactory.ts` | Authoritative provider-neutral script contract registry with accurately labeled current host-adapter entries. | active |

Package scripts discovered in this domain:

- `compile`: `tsc -p ./`
- `compile:core`: `tsc -p tsconfig.core.json --noEmit`
- `verify:core-boundary`: `node scripts/verify/core-boundary.mjs`
- `verify:core`: `npm run compile:core && npm run verify:core-boundary`
- `test`: `npm run compile && node dist/test/metrics.test.js && node dist/test/processEvents.test.js && node dist/test/bootstrapDryRun.test.js && node dist/test/bootstrapApply.test.js && node dist/test/bootstrapProcessEvents.test.js && node dist/test/bootstrapHealth.test.js && node dist/test/codebaseMiles.test.js && node dist/test/codebases.test.js && node dist/test/scriptBlueprint.test.js && node dist/test/scriptDna.test.js && node dist/test/scriptographer.test.js && node dist/test/referIntake.test.js && node dist/test/referOrchestrator.test.js && node dist/test/referProcessEvents.test.js && node dist/test/referChatSession.test.js && node dist/test/referChatMode.test.js && node dist/test/referOrchestratorRunner.test.js && node dist/test/referTargetRegistry.test.js && node dist/test/referCoach.test.js && node dist/test/orchestratorRoadmap.test.js && node dist/test/factoryGaps.test.js && node dist/test/schemaValidation.test.js && node dist/test/lawToc.test.js && node dist/test/updateSync.test.js && node dist/test/factoryRegistries.test.js && node dist/test/standaloneLanguage.test.js && node dist/test/authorityResolver.test.js && node dist/test/doctrineCompiler.test.js && node dist/test/scriptionaryTerm.test.js && node dist/test/modificationLoop.test.js && node dist/test/coreApi.test.js && node dist/test/coreBoundary.test.js && node dist/test/vscodeAdapterCompatibility.test.js && node dist/test/cliAdapter.test.js && node dist/test/sovereignNodeMcpClient.test.js && node dist/test/sovereignNodeCli.test.js`
- `test:cli`: `npm run compile && node dist/test/cliAdapter.test.js`
- `test:node`: `npm run compile && node dist/test/sovereignNodeMcpClient.test.js && node dist/test/sovereignNodeCli.test.js`
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
- `scripts:legend`: `npm run compile && node scripts/registry/script-legend.mjs`
- `scripts:codebase`: `npm run compile && node scripts/registry/codebase-context.mjs`
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
- `alliance:hub-check`: `npm --prefix alliance-hub run check`
- `alliance:hub-deploy`: `npm --prefix alliance-hub run deploy`
- `alliance:forms-check`: `npm --prefix alliance-hub run check`
- `alliance:forms-deploy`: `npm --prefix alliance-hub run deploy`

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
| `hive.build-intake` | `npm run hive:build-intake` | `scripts/hive/hive-build-intake.mjs` | Emit and dispatch governed build-intake envelopes so Zo route changes originate from typed intake evidence. | active |
| `hive.deployment-pack` | `npm run hive:deployment-pack` | `scripts/hive/hive-node-deployment-pack.mjs` | Build a non-mutating deployment checklist for staging and ratifying a hive node. | active |
| `hive.ratify-routes` | `npm run hive:ratify-routes` | `scripts/hive/hive-route-ratifier.mjs` | Capture live zo.space route state for a hive node and record upstream ratification evidence. | active |

### Alliance Hub

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `alliance.hub.check` | `npm --prefix alliance-hub run check` | `alliance-hub/tools/check.mjs` | Verify required app files, SMS registry, inbound route behavior, form intake, and conversation routing. | active |
| `alliance.hub.sms.validate` | `npm --prefix alliance-hub run sms:validate` | `alliance-hub/tools/sms-script-factory.mjs` | Validate the Alliance SMS script registry before changing SMS routing behavior. | active |
| `alliance.hub.sms.route` | `npm --prefix alliance-hub run sms:route -- --registered --text "profile"` | `alliance-hub/tools/sms-script-factory.mjs` | Run focused SMS router probes against scripts/sms/router.mjs and registry.json. | active |
| `alliance.hub.deploy.dry` | `npm --prefix alliance-hub run deploy:dry` | `alliance-hub/tools/deploy.mjs` | Build the Cloudflare Pages deploy packet from .env.alliance without deploying production. | active |
| `alliance.hub.deploy.cloudflare` | `npm --prefix alliance-hub run deploy` | `alliance-hub/tools/deploy.mjs` | Deploy Alliance Hub to Cloudflare Pages only after explicit 'push to Cloudflare' or 'push all' approval. | guarded |
| `alliance.hub.records.split` | `source migrations` | `alliance-hub/supabase/migrations/20260528164951_wave1_records_split.sql` | Record the verified alliance_records split method: keyed table first, legacy STI fallback during verification, mirror/backfill where needed. | active |

### REFER Zo Bootstrap

| Script | Command | Entrypoint | Purpose | Status |
|---|---|---|---|---|
| `zo.dispatch-contract` | `npm --prefix refer-zo-bootstrap run dispatch:contract` | `refer-zo-bootstrap/scripts/factory/dispatch-contract.mjs` | Ship a contract to Zo, optionally trigger the runner, and fetch talkback. | active |
| `zo.sync-tandem-runtime` | `npm --prefix refer-zo-bootstrap run tandem:sync-runtime` | `refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs` | Sync known tandem runtime files to a Zo computer through MCP/file API. | active |
| `zo.codec-self-test` | `npm --prefix refer-zo-bootstrap run codec:self-test` | `refer-zo-bootstrap/scripts/factory/compression-codec.mjs` | Verify bidirectional machine compression/decompression before transport use. | active |
| `zo.contract-runner` | `npm --prefix refer-zo-bootstrap run contract:run-once` | `refer-zo-bootstrap/scripts/factory/contract-inbox-runner.mjs` | Run one Zo-side inbox contract and emit talkback. | active |
| `zo.adaptive-heartbeat` | `node refer-zo-bootstrap/scripts/factory/heartbeat.mjs --status` | `refer-zo-bootstrap/scripts/factory/heartbeat.mjs` | Run/status the Zo node-local adaptive heartbeat, tightening during work and relaxing up to a 24-hour dormant pulse. | active |

## Files

- JSON: `.refer-factory\script-registry.json`
- Markdown: `.refer-factory\script-registry.md`
