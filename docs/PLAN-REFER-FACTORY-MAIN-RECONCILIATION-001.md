# PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001

Title: Reconcile the Standalone Script Factory Line with Local Main
Status: Execution record; lifecycle truth is owned by the Git-common queue and durable receipt
Date: 2026-07-18
Contract: `CONTRACT-REFER-FACTORY-MAIN-RECONCILIATION-001`
Target: `E:\refer-script-factory`
Branch: `codex/PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001--agent--assimilation`
Branch mode: `PARALLEL`
Primary owner: `governance-agent` / assimilation coordinator
Model route: GPT-5.6 Sol
Method lineage: `refer.branch.methodology` -> Branch Assimilation Method
Classification: `refer-script-factory` is a Sovereign Node consumer; Node is authoritative and read-only

## Exact Lineage

- Receiving local main: `8b5f1628fb2f8eacb00b68b05016919b59a647a9`
- Standalone source: `21f9807ca31f43b00a8a8a6862b72767067e3897`
- Merge base: `36b30c7594ad95a922cb7df6aa174c348526b7a7`
- Divergence at preflight: five main-only commits and 36 source-only commits
- Required merge: normal forward two-parent merge, with no squash, rebase, cherry-pick reconstruction, amend, force, reset, or history rewrite
- Merge result: `3f5d9e87f46d3f4a76d1c731688cfe661ce0d709`, with the exact receiving and source heads as parents

## Reconciliation Precedence

1. Current universal REFER law.
2. Current Factory law.
3. Main-only branching governance, Harmony binding semantics, and deterministic test isolation.
4. Standalone provider-neutral identity, core boundary, CLI, and read-only Node consumer architecture.
5. Mechanical preservation of both histories.

Behavioral, authority, or architectural ambiguity is a hard stop. Mechanical
conflicts are resolved only inside the effective target set. The merged source
record must end at exact live universal freshness through the governed Harmony
path; stale main binding values are not final truth.

## Scope Formula

The authorized reconciliation universe is:

```text
git diff --name-only 36b30c7594ad95a922cb7df6aa174c348526b7a7..8b5f1628fb2f8eacb00b68b05016919b59a647a9
UNION
git diff --name-only 36b30c7594ad95a922cb7df6aa174c348526b7a7..21f9807ca31f43b00a8a8a6862b72767067e3897
UNION
docs/PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001.md
```

The resulting effective target set contains 169 paths:

- `.gitattributes`
- `.gitmodules`
- `.history/alliance-hub/.dev_20260501215203.vars`
- `.history/alliance-hub/.dev_20260501224328.vars`
- `.refer/consumer-binding.json`
- `.refer/generated/universal-agent.md`
- `.refer/source.json`
- `.refer-factory/agent-context.md`
- `.refer-factory/chat-surface/token-useage.jsonl`
- `.refer-factory/codebase-tree.json`
- `.refer-factory/forge-registry.json`
- `.refer-factory/forge-registry.md`
- `.refer-factory/script-class-registry.json`
- `.refer-factory/script-class-registry.md`
- `.refer-factory/script-legend.md`
- `.refer-factory/script-registry.json`
- `.refer-factory/script-registry.md`
- `AGENTS.md`
- `alliance-android-sms-bridge/app/src/main/AndroidManifest.xml`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/BridgeConfig.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/BridgeHttpServer.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/BridgeWatchdogReceiver.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/CloudRelay.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/MainActivity.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/OutboundStatusReceiver.java`
- `alliance-android-sms-bridge/app/src/main/java/org/alliance/smsbridge/SmsBridgeService.java`
- `alliance-android-sms-bridge/README.md`
- `alliance-android-sms-bridge/tools/alliance-profile-intake.mjs`
- `alliance-android-sms-bridge/tools/alliance-sms-dispatcher.mjs`
- `alliance-hub`
- `alliance-hub.worktrees/agents-stormy-guanaco`
- `CODEOWNERS`
- `CONTRIBUTING.md`
- `docs/cross-factory-orchestration.md`
- `docs/domain-script-registry.md`
- `docs/factory-system-doctrine.md`
- `docs/known-limits-and-constraints.md`
- `docs/PLAN-REFER-FACTORY-CLI-001.md`
- `docs/PLAN-REFER-FACTORY-CORE-EXTRACTION-001.md`
- `docs/PLAN-REFER-FACTORY-MAIN-RECONCILIATION-001.md`
- `docs/PLAN-REFER-FACTORY-NODE-INTEGRATION-001.md`
- `docs/PLAN-REFER-FACTORY-STANDALONE-001.md`
- `docs/Refer Script Factory.mmd`
- `docs/refer-orchestrator-roadmap.md`
- `docs/script-factory-deterministic-evolution-plan.md`
- `docs/script-factory-text-diagram.md`
- `docs/script-legend.md`
- `docs/smart-intake-build-plan.md`
- `docs/user-law-expansion.md`
- `package.json`
- `package-lock.json`
- `README.md`
- `scripts/reference/authority-resolver.mjs`
- `scripts/reference/universal-source-sync.mjs`
- `scripts/registry/codebase-context.mjs`
- `scripts/registry/domain-script-registry.mjs`
- `scripts/registry/script-class-registry.mjs`
- `scripts/registry/script-legend.mjs`
- `scripts/scriptionary/scriptionary-term.mjs`
- `scripts/verify/core-boundary.mjs`
- `src/adapters/cli/arguments.ts`
- `src/adapters/cli/cancellation.ts`
- `src/adapters/cli/execute.ts`
- `src/adapters/cli/index.ts`
- `src/adapters/cli/node.ts`
- `src/adapters/cli/runtime.ts`
- `src/adapters/ollama/referOllamaPromptModel.ts`
- `src/adapters/vscode/cockpit/contractChatPanel.ts`
- `src/adapters/vscode/cockpit/dashboardPanel.ts`
- `src/adapters/vscode/cockpit/html.ts`
- `src/adapters/vscode/cockpit/libraryPanel.ts`
- `src/adapters/vscode/cockpit/processPanel.ts`
- `src/adapters/vscode/cockpit/scriptFactoryPanel.ts`
- `src/adapters/vscode/commands/contractMode.ts`
- `src/adapters/vscode/commands/emitScriptBlueprint.ts`
- `src/adapters/vscode/commands/emitScriptDnaSeed.ts`
- `src/adapters/vscode/commands/emitSendContract.ts`
- `src/adapters/vscode/commands/initializeRepo.ts`
- `src/adapters/vscode/commands/refreshCodebases.ts`
- `src/adapters/vscode/commands/runScriptographer.ts`
- `src/adapters/vscode/commands/scanCodebase.ts`
- `src/adapters/vscode/commands/scanFactoryGaps.ts`
- `src/adapters/vscode/commands/updateSync.ts`
- `src/adapters/vscode/extension.ts`
- `src/adapters/vscode/referModelProvider.ts`
- `src/adapters/vscode/referParticipant.ts`
- `src/chat/referModelProvider.ts`
- `src/chat/referOllamaPromptModel.ts`
- `src/chat/referOrchestratorRunner.ts`
- `src/chat/referParticipant.ts`
- `src/chat/referProcessEvents.ts`
- `src/chat/referPromptModel.ts`
- `src/chat/referResolutionLoop.ts`
- `src/cockpit/contractChatPanel.ts`
- `src/cockpit/dashboardPanel.ts`
- `src/cockpit/html.ts`
- `src/cockpit/libraryPanel.ts`
- `src/cockpit/processPanel.ts`
- `src/cockpit/scriptFactoryPanel.ts`
- `src/commands/contractMode.ts`
- `src/commands/emitScriptBlueprint.ts`
- `src/commands/emitScriptDnaSeed.ts`
- `src/commands/emitSendContract.ts`
- `src/commands/initializeRepo.ts`
- `src/commands/refreshCodebases.ts`
- `src/commands/runScriptographer.ts`
- `src/commands/scanCodebase.ts`
- `src/commands/scanFactoryGaps.ts`
- `src/commands/updateSync.ts`
- `src/contracts/codebaseTree.ts`
- `src/contracts/factoryGaps.ts`
- `src/contracts/orchestratorRoadmap.ts`
- `src/contracts/referChatMode.ts`
- `src/contracts/referCoach.ts`
- `src/contracts/referIntake.ts`
- `src/contracts/referOrchestrator.ts`
- `src/contracts/scriptBlueprint.ts`
- `src/contracts/scriptDna.ts`
- `src/contracts/scriptFactory.ts`
- `src/contracts/scriptInoculation.ts`
- `src/contracts/scriptLegend.ts`
- `src/contracts/scriptographer.ts`
- `src/contracts/sendContract.ts`
- `src/core/contracts/orchestratorRoadmap.ts`
- `src/core/contracts/referCoach.ts`
- `src/core/contracts/referIntake.ts`
- `src/core/contracts/referOrchestrator.ts`
- `src/core/contracts/scriptBlueprint.ts`
- `src/core/contracts/scriptDna.ts`
- `src/core/contracts/scriptFactory.ts`
- `src/core/contracts/scriptInoculation.ts`
- `src/core/contracts/scriptLegend.ts`
- `src/core/contracts/sendContract.ts`
- `src/core/evidence/processEvent.ts`
- `src/core/index.ts`
- `src/core/orchestration/referOrchestratorRunner.ts`
- `src/core/orchestration/referProcessEvents.ts`
- `src/core/orchestration/referPromptModel.ts`
- `src/core/orchestration/referResolutionLoop.ts`
- `src/core/ports/runtime.ts`
- `src/extension.ts`
- `src/integrations/sovereign-node/client.ts`
- `src/integrations/sovereign-node/errors.ts`
- `src/integrations/sovereign-node/index.ts`
- `src/integrations/sovereign-node/types.ts`
- `src/integrations/sovereign-node/validation.ts`
- `src/telemetry/processEvents.ts`
- `test/authorityResolver.test.ts`
- `test/cliAdapter.test.ts`
- `test/coreApi.test.ts`
- `test/coreBoundary.test.ts`
- `test/doctrineCompiler.test.ts`
- `test/factoryRegistries.test.ts`
- `test/fixtures/sovereignNodeMcpServer.mjs`
- `test/helpers/isolatedScriptWorkspace.ts`
- `test/referIntake.test.ts`
- `test/referOrchestratorRunner.test.ts`
- `test/scriptionaryTerm.test.ts`
- `test/sovereignNodeCli.test.ts`
- `test/sovereignNodeMcpClient.test.ts`
- `test/standaloneLanguage.test.ts`
- `test/universalSourceSync.test.ts`
- `test/vscodeAdapterCompatibility.test.ts`
- `token useage.html`
- `token useage.md`
- `tsconfig.core.json`
- `unscripted-laws/REFER.OS/refer.plan.md`
- `unscripted-laws/REFER.OS/refer.subagents.md`
- `unscripted-laws/REFER.OS/refer.zo.md`

No path outside this set may change in the reconciliation commits or queue
admission comparison.

## Required Preservation

- Main branching-methodology authority and the universal source-sync registry entry.
- Real temporary test workspaces with no live `.refer-factory` fixture residue.
- Schema-bound Harmony consumer binding and generated universal-agent surface.
- Standalone provider-neutral identity and `src/core/**` dependency direction.
- Standalone CLI and package version `0.0.1`.
- Exactly six read-only Sovereign Node tools and pre-transport mutation rejection.
- Modular CLI expansion remains a documented future trigger only.
- `fast-uri` remains at `3.1.0`; its pre-existing high advisory is disclosed, not repaired here.

## Verification

The combined branch and then local main must pass:

1. `npm.cmd ci` from the exact committed lockfile, with no package-file drift.
2. `npx.cmd tsc -p . --noEmit`.
3. `npm.cmd run compile:core`.
4. `npm.cmd run compile`.
5. `npm.cmd run verify:core-boundary`.
6. Focused deterministic test-isolation checks.
7. `test/cliAdapter.test.ts`, `test/sovereignNodeMcpClient.test.ts`, and `test/sovereignNodeCli.test.ts`.
8. Full `npm.cmd test` twice, with identical before/after `.refer-factory` file counts and tree hashes and zero residue.
9. `npm.cmd run verify` when present.
10. Compiled help/version, package dry-run/bin/shebang, `git diff --check`, conflict-marker, exact-scope, source-freshness, ancestry, core-boundary, dependency-version, and remote-ref preservation audits.
11. Current exact Node-main validation of identity, contract, six reads, missing lookup, pre-transport mutation rejection, and path redaction without Node mutation.

## Closeout Authority

- `COMMIT_ON_GREEN: true`
- `ASSIMILATE_TO_LOCAL_MAIN: true`
- `ARCHIVE_LOCAL: true`
- `REMOVE_WORKTREE: true`
- `DELETE_LOCAL_BRANCH: true`
- `ARCHIVE_TASK: true`
- `RESUME_WITHOUT_NEW_PERMISSION: true`
- `SWITCH_CANONICAL_CHECKOUT_TO_MAIN_AFTER_MAIN_VERIFIED: true`
- `EXACT_LOCKFILE_DEPENDENCY_REFRESH_AFTER_MAIN_VERIFIED: true`
- `PUSH: false`
- `PUBLISH: false`
- `DEPLOY: false`
- `RELEASE: false`
- `REMOTE_BRANCH_DELETE: false`
- `PROVIDER_MUTATION: false`
- `CREDENTIAL_ACCESS: false`
- `FORCE_OR_HISTORY_REWRITE: false`
- `NODE_MUTATION: false`

The reconciliation task stops after a compact
`FACTORY_MAIN_RECONCILIATION_RECEIPT`; it does not begin another phase.
