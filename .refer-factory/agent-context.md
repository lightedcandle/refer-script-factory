# REFER Agent Context

Generated: 2026-04-26T12:30:52.459Z
Workspace: E:\refer-script-factory

## Summary
- Files indexed: 192
- Directories indexed: 16

## Important Entrypoints
- AGENTS.md
- docs/cross-factory-orchestration.md
- docs/chat-surface-scripts.md
- docs/domain-script-registry.md
- docs/factory-system-doctrine.md
- docs/known-limits-and-constraints.md
- docs/script-legend.md
- scripts/chat-surface/token-useage.mjs
- scripts/registry/domain-script-registry.mjs
- src/chat/referOrchestratorRunner.ts
- src/chat/referParticipant.ts
- src/chat/referResolutionLoop.ts
- src/cockpit/scriptFactoryPanel.ts
- src/contracts/codebaseTree.ts
- src/contracts/referOrchestrator.ts
- src/contracts/scriptFactory.ts
- src/extension.ts
- src/server/referOrchestratorServer.ts
- src/server/referTargetRegistry.ts
- test/bootstrapApply.test.ts
- test/bootstrapDryRun.test.ts
- test/bootstrapHealth.test.ts
- test/bootstrapProcessEvents.test.ts
- test/codebaseMiles.test.ts
- test/codebases.test.ts
- test/factoryGaps.test.ts
- test/lawToc.test.ts

## Package And Extension Surface
- package.json: npm scripts

- package.json: VS Code view contributions

## Guidance
Use this file as a compact map before opening full source files. Open the specific files above only when their details are needed.

Terminology authority: .refer-factory/script-legend.md

## Cross-Factory Context

This repo is the Codex/VS Code Script Factory. The sibling Zo factory may be checked out at `refer-zo-bootstrap/`, but it is a separate Git repository.

For hive, Zo, Telechurch, bootstrap, persona/rule, dataset, dispatch, talkback, compression, contract, tandem, or parallel factory work, read `docs/cross-factory-orchestration.md` first. That file explains how to keep the root factory, `refer-zo-bootstrap`, and live Zo proving nodes in sync after fresh chat starts or context compaction.

Invariant: typed contract is authority, compression is transport, talkback is evidence, and source commit is ratification.

Chat surface telemetry: use `token useage.md` and `scripts/chat-surface/token-useage.mjs` to track current chat, spawned agents, Zo bootstrap agents, and Zo local chat. The goal is directional token savings and visibility, not exact billing precision unless measured counts are available.

Script-first law: known/repeated work should become a reusable script before it becomes a habit. When a tool or provider limit appears, update `docs/known-limits-and-constraints.md` so later agents avoid repeating the same failure.

Domain-scoped script registry: read `docs/domain-script-registry.md` and `.refer-factory/script-registry.md` before improvising. Regenerate with `npm run scripts:registry` after changing operational scripts.
