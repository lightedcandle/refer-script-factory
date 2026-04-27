# REFER Script Factory Agent Governance

This repo is governed by REFER.

## Repo Purpose

`refer-script-factory` is the seed implementation of the REFER Script Factory. Its job is to grow from a hand-authored VS Code extension into a self-indexing, self-describing, script-driven factory that can build and maintain its own script system with minimal dependence on remote AI.

The factory should mature toward local-first operation:

- scan its own codebase;
- build and refresh its own treefile;
- maintain a script registry;
- maintain a script legend;
- package compact agent context;
- route prompts through governed scripts;
- prefer local LLM/context workflows when sufficient.

The factory doctrine is documented in `docs/factory-system-doctrine.md`: a forge is the conversion unit, the Script Factory is the governance layer that manages script forges, and the Factory System is the complete network of coordinated factories.

## Default Prompt Flow

Treat user prompts as intake for a contract-first workflow:

1. Decode the prompt into a compact `refer.intake` contract.
2. Route work through the Script Factory vocabulary in `docs/script-legend.md`.
3. Use `.refer-factory/codebase-tree.json` and `.refer-factory/agent-context.md` when present before scanning files broadly.
4. If context assets are stale or missing, prefer the `Scan Codebase` script path.
5. If enough information exists, answer plainly and briefly.
6. If repo facts are needed, propose or run a bounded script request instead of guessing.
7. Do not execute scripts automatically unless the user or governed runner explicitly allows it.

## Script Factory Self-Build Doctrine

The Script Factory is a seed that builds itself when fed information.

Each chat response should feed the factory. After resolving a request, ask what local forge, script, context asset, registry entry, prompt pattern, status event, test, or documentation update would let REFER resolve the same kind of request locally next time.

Each turn should also self-heal the factory when it exposes a gap. Look for missing terminology, ambiguous categories, weak descriptions, stale scans, missing relationships, missing tests, missing statuses, and unknown needs discovered during use.

Use this repair checklist:

1. What did we need that did not exist yet?
2. What was ambiguous?
3. What had to be manually inferred?
4. What should become a script, context asset, test, status, or doctrine rule?

Use the factory vocabulary precisely:

- `Forge`: one bounded conversion unit.
- `Script Factory`: the system that creates, manages, and runs script forges.
- `Factory System`: the complete network of coordinated factories across domains.

- The source registry lives in `src/contracts/scriptFactory.ts`.
- The script terminology authority lives in `src/contracts/scriptLegend.ts` and `docs/script-legend.md`.
- The codebase scanner lives in `src/contracts/codebaseTree.ts` and `src/commands/scanCodebase.ts`.
- The Script Factory UI lives in `src/cockpit/scriptFactoryPanel.ts`.
- The native `@refer` entrypoint lives in `src/chat/referParticipant.ts`.
- The orchestration runner lives in `src/chat/referOrchestratorRunner.ts`.
- The resolution loop lives in `src/chat/referResolutionLoop.ts`.

When adding factory capability, keep the loop deterministic:

1. Add or update the script definition.
2. Add or update the command/runner if it is executable.
3. Add status/process events when it runs.
4. Add scan/tree/context outputs if it creates artifacts.
5. Update the Script Legend when new terms or categories appear.
6. Verify with `npm run test`.

## Script Rules

- Scripts return structured packets or durable artifacts to REFER.
- Scripts must record process status when they run.
- Scripts may detect sensitive file names.
- Scripts must not read or send contents of `.env*`, keys, certificates, or private credentials.
- Repo facts should come from bounded scripts, treefiles, or direct source reads, not guessing.
- Multi Script entries must list child scripts.
- Single Script entries must represent one bounded operation.
- Request Type entries are category labels, not runnable scripts.

## Local-First Context Rules

Prefer compact local context over broad remote prompting.

- Use `.refer-factory/codebase-tree.json` as the machine-readable repository map.
- Use `.refer-factory/agent-context.md` as the compact agent briefing.
- Use `.refer-factory/script-legend.md` as terminology authority after scan generation.
- Send local/remote models a context pack, not the whole repo.
- Open full source files only when the treefile or task requires them.

## Tracking

- Process state: `.refer-factory/process-state.json`
- Codebase tree: `.refer-factory/codebase-tree.json`
- Agent context: `.refer-factory/agent-context.md`
- Script legend: `.refer-factory/script-legend.md`
- Codebase/subspace registry: `.refer-factory/codebases.json`
- Chat sessions: `.refer-factory/chat/sessions/`

## Verification

Use:

```powershell
npm run test
```

For narrow compile checks, use:

```powershell
npm run compile
```
