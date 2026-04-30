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

## Sibling Zo Factory

`refer-zo-bootstrap` is the Zo-scoped sibling factory. It owns Zo computer bootstrapping, Zo Files transfer, Zo personas/rules, hive node deployment, dispatch, talkback, heartbeat, datasets, and the Telechurch Zo proving instance.

This repo, `refer-script-factory`, remains the Codex/VS Code-scoped Script Factory and the broader factory doctrine source. Do not merge Zo-specific runtime assumptions into this repo by default.

When Zo development reveals a provider-neutral Script Factory pattern, doctrine rule, packet shape, registry concept, or verification loop, it may be promoted back into this repo deliberately. Keep the direction clear:

1. Zo-specific runtime behavior lives in `refer-zo-bootstrap`.
2. General Script Factory concepts may be abstracted into `refer-script-factory`.
3. Cross-repo changes should name which repo is authoritative for the behavior being edited.

Do not treat the current repo as inert source. It is also an instantiated Codex-side factory surface. Substantial work should feed the factory through typed intake contracts, process events, docs, scripts, or registry updates rather than remaining only in chat.

## Script-First Law

Known work must become a script before it becomes a habit. When a task repeats, or when a workflow pushes files, syncs runtime, transforms contracts, counts tokens, spawns agents, fetches talkback, or works around a platform limit, create or update a reusable script and run that script instead of repeating ad hoc shell/chat steps.

Ad hoc commands are allowed for discovery. Once the action is understood, the next execution should use a script route and the docs should point to it.

When a tool, script, provider, API, packet, or shell hits a limit, record it in `docs/known-limits-and-constraints.md` before final response. Future agents should inspect that ledger before retrying a failed pattern.

Track token use and spawned-agent work for the chat surface. Use `docs/chat-surface-scripts.md`, `scripts/chat-surface/token-useage.mjs`, and `token useage.md` to record:

- Script Factory spawned agent;
- Zo Bootstrap spawned agent;
- Current Chat window;
- Zo local chat.

Exact token counts are not always exposed. Mark records as measured, estimated, or manual. Zo local chat should be minimized and visible in this ledger.

When working across the Zo sibling, compare the lanes:

- direct chat handling;
- typed local contract handling;
- compressed transport/talkback handling in `refer-zo-bootstrap`;
- live Zo ratification when explicitly needed.

The emerging invariant is: typed contract is authority, compression is transport, talkback is evidence, and source commit is ratification.

For substantial cross-factory work, operate as a build director rather than a direct code writer. Spawn or simulate parallel lanes:

- Codex Script Factory lane for `e:\refer-script-factory`;
- REFER Zo Bootstrap lane for `e:\refer-script-factory\refer-zo-bootstrap`;
- Telechurch Zo lane through Zo chat/automation when live runtime context matters.

Each lane should emit a typed contract, dataset row, talkback packet, script registry update, or ratification note. The director compares outputs, updates source, and verifies.

Fresh or compacted chat instances must recover the full parallel model from `docs/cross-factory-orchestration.md`. Use that document when the conversation mentions hive, Zo, bootstrap, Telechurch, personas/rules, datasets, dispatch, talkback, compression, contracts, tandem work, or factories learning together.

Do not let the sibling repos evolve out of sync. When a change teaches a provider-neutral Script Factory lesson, update this repo. When a change teaches a Zo-specific hive/bootstrap lesson, update `refer-zo-bootstrap`. When both are affected, update both docs/contracts before final response.

Hive node identity is tracked by the Hive Node Registry. Use `docs/hive-build-plan.md`, `scripts/hive/hive-node-registry.mjs`, `.refer-factory/hive-node-registry.json`, and `.refer-factory/hive-node-registry.md` when adding, verifying, or discussing Zo computers and factory nodes. A new Zo computer is not fully staged until the registry records its account scope, role, transport, persona/rules state, datasets, scripts, and ratification evidence.

Script registry lookup is domain-scoped. Before direct work, classify the request domain and check `docs/domain-script-registry.md` plus `.refer-factory/script-registry.json` / `.refer-factory/script-registry.md`. Use the root `src/contracts/scriptFactory.ts` registry for VS Code/provider-neutral scripts, `scripts/chat-surface/` for current-chat/token scripts, `scripts/hive/` for hive director scripts, and `refer-zo-bootstrap/scripts/factory/script-registry.json` for Zo bootstrap scripts. Regenerate the operational registry with `npm run scripts:registry` after adding or changing operational scripts.

## Zo Connection Awareness

Fresh chat instances may need to connect to a Zo computer while working from this workspace. Use the nested Zo repo's tools instead of inventing a new connection path:

- Zo bootstrap/hive work happens in `e:\refer-script-factory\refer-zo-bootstrap`.
- The low-level MCP helper is `refer-zo-bootstrap/tools/zo-mcp.mjs`.
- The bootstrap verifier is `refer-zo-bootstrap/tools/vipc-bootstrap.mjs`.
- Instance names map to environment keys such as `ZO_COMPUTER_TELECHURCH`.
- The nested repo may have an ignored `.env.local` with only the keys needed for Zo work. Never commit or print token values.

Basic Telechurch connection check from the root workspace:

```powershell
node refer-zo-bootstrap\tools\zo-mcp.mjs list-tools --instance telechurch
$args64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes('{"path":"/home/workspace"}'))
node refer-zo-bootstrap\tools\zo-mcp.mjs call list_files --instance telechurch --args64 $args64 --json
```

Non-mutating Telechurch install verification:

```powershell
node refer-zo-bootstrap\tools\vipc-bootstrap.mjs --profile telechurch --instance telechurch --mode verify
```

When a live Zo instance should ratify source direction, use the Zo `/zo/ask` API with that instance token and a non-mutating prompt. Treat the answer as evidence to capture in source, not as a replacement for local verification or commits.

Minimize Zo chat usage. Zo chat is an expensive lane and should not carry full contracts or long work results. Prefer the Zo file/API tandem in `refer-zo-bootstrap/docs/file-transport-tandem.md`: write the contract to Zo Files through MCP, trigger a short runner command through MCP, then fetch talkback from Zo Files. Use Zo chat only for tiny activation prompts or when the live persona/rule model itself must judge the work.

## Nested Repo Safety Rule

During local development, `refer-zo-bootstrap` may be checked out inside this workspace at `refer-zo-bootstrap/`. It is still a separate Git repository with its own remote, branch history, and `main`.

Do not confuse the repositories:

- Work in `e:\refer-script-factory` for Codex Script Factory, VS Code extension, and provider-neutral doctrine.
- Work in `e:\refer-script-factory\refer-zo-bootstrap` for Zo bootstrap, hive, Telechurch Zo, dispatch/talkback/heartbeat, and Zo deployment.
- If there is any ambiguity before editing, run `git rev-parse --show-toplevel` in the target directory and confirm the repository root.
- Same branch names across the two repos do not imply shared history or shared commits.

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

Treat the active AI agent as the factory's growth, repair, and execution intelligence. The scripts are durable muscles and memory; the AI is the watcher that decides when to use them, compares intended effects to observed effects, repairs the smallest responsible layer, and records what should become local capability next time.

The factory does not have to begin perfect. Its purpose is to become increasingly competent by using every task as training material for its own structure. When the current system cannot resolve something locally, the AI should build the missing structure, verify it, and leave evidence so the next similar task costs fewer tokens and uses more local script capacity.

Self-healing and self-expansion are core duties, not optional cleanup:

- self-executing: use existing governed scripts and readiness records when they fit the intent;
- self-healing: when execution or understanding is blocked, patch the responsible layer rather than calling the script bad;
- self-expanding: when a repeatable need is discovered, turn the working trace into a script, forge, registry entry, context asset, test, status event, or doctrine rule;
- self-recording: preserve the trace, verdict, and readiness evidence so future agents inherit the improvement.

Do not convert the AI's role into an endless chain of resolver scripts. The AI performs judgment, repair, and integration. Scripts should remain bounded, deterministic tools that expose structured results and durable artifacts.

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

1. If a script already exists, use it.
2. If no script exists for a valid intent, create a draft/gap record and allow an
   authorized AI build lane to produce the first working solution.
3. Record the build trace: intent, changed artifacts, errors, fixes, checks, and
   talkback/evidence.
4. Distill the working trace into a script/forge definition.
5. Add or update the command/runner if it is executable.
6. Replay the script from the original intent and verify the output.
7. Add status/process events when it runs.
8. Add scan/tree/context outputs if it creates artifacts.
9. Update the Script Legend when new terms or categories appear.
10. Verify with `npm run test`.

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
