# Audit 2026-09-16 — is the Script Factory Reverent?

Law 10 (`E:/refer.os/REFER.OS/refer.audit.md`) audit, invoked by the operator.
"Reverent" per Article 10.1 and Law 45 §5: legal, referenced, traceable to REFER.OS
law, and harbouring no reinvented logic.

**Verdict: not yet Reverent.** Healthy and self-consistent in what runs;
drifting in what it says about itself, and only partly anchored to universal law.

Method: three read-only Opus scouts (docs vs reality; traceability to law;
reinvented logic), load-bearing claims re-checked by the orchestrator, plus the
repo's own gates. Invocations, for replay:

| Run | Result |
| --- | --- |
| `npm run gate:machines` | PASS — 20 machines, 2 engine files; 8 BOMs in prose only |
| `npm run gate:pulse-belt` | PASS |
| `npm run verify:core` | PASS — 17 files, 33 imports provider-neutral |
| `npm run test` | PASS — 36 tests (docs say ~37) |

Grades: **Runtime (machines/engine)** A- · **Core boundary** A · **Docs vs reality** C+ ·
**Traceability to universal law** C.

## Findings

Gate column: `needs governance` · `needs refer.repair` · `needs docs update`.

### Governance

| # | Finding | Evidence |
| --- | --- | --- |
| G1 | Branch policy (direct-to-main for `scripts/` and undeclared machines; refuses the lineage convention) overrides universal law with no recorded ratification. Its stated reason ("no concurrent lanes") contradicts this repo's `CLAUDE.md` ("several lanes and a scheduler meet"). | `AGENTS.md:92-98`; `E:/refer.os/AGENTS.md:32`; `CLAUDE.md:29` |
| G2 | No universal law mentions the Script Factory, the Living Factory, machines, engine or belt. The machine/script/engine split is recorded only in Telechurch precedent P13. | `E:/refer.os/REFER.OS/*` (searched); Telechurch `precedents.md` P13 |
| G3 | Two registries each claim authority: universal `refer.factory.md` §10 names `manifests/factory.routes.json`; this repo names `scriptFactory.ts` + `.refer-factory/script-registry.json`. Neither points at the other. | `refer.factory.md:285`; `docs/domain-script-registry.md:37-59` |
| G4 | Where the belt lives is contradicted: `CLAUDE.md`, `README.md` and `machines/README.md` say never here; `.gitignore` and git say it has been tracked here since 2026-09-14 (commit `ab0eb63`). | `CLAUDE.md:75`; `.gitignore:54-58` |
| G5 | Authority to run and push: "do not execute scripts automatically" and the Alliance "push all" rule conflict with the operator's working agreement (push/PR/merge are ordinary work) and with this repo's own unattended scheduler. | `AGENTS.md:226`, `:249` |

### Repair

| # | Finding | Evidence |
| --- | --- | --- |
| R1 | Two heartbeat writers for the hive node registry, with different interval rules. Telechurch's claims "nothing has ever written" the fields the factory script writes. | Telechurch `tools/factory/node-heartbeat.cjs:9,186-197`; `scripts/hive/hive-node-registry.mjs:137-237` |
| R2 | `pulse-check` counts "open" by its own regex instead of `kind.cjs` `beltIndex`/`isDone`. | `machines/pulse-check.cjs:160` |
| R3 | Trigger suffixes and search folders are re-declared outside `triggers.cjs`, missing `machines`. This bug has not triggered yet. | `engine/schedule.cjs:131-133`; `machines/build-tracker.cjs:214-218`; `engine/serve-tracker.cjs:128-130` |
| R4 | Kind words typed as literals, and a dead `TERMINAL` copy, bypass `kind.cjs`. | `engine/serve-tracker.cjs:708`; `machines/build-tracker.cjs:4489,5171`; `machines/manager.cjs:91` |
| R5 | The core-boundary check would let `node:fs` pass: it bans only `vscode` and escaping paths. | `scripts/verify/core-boundary.mjs:63-83` |
| R6 | `@refer` participant still in the script legend and registry labels; `refer.extension.*` registry id; scanner still carries VS Code detectors. | `src/core/contracts/scriptLegend.ts:115,551,1137`; `scriptFactory.ts:19,46`; `src/contracts/codebaseTree.ts` |
| R7 | The generated repo map (2026-09-12) omits `machines/`, `engine/`, `scripts/ci/`. | `.refer-factory/codebase-tree.json:3` |
| R8 | `.refer/source.json` tracks two universal files and its schema breaks `universal-source-sync.mjs`. This is already on the shelf. | `shelf.md:270-274` |
| R9 | `unscripted-laws/REFER.OS`: 64 of 86 files differ from universal law (22 identical). README calls it dormant, but `applyReferUpdate` can write from it. The installed-runtime plan already tracks this. | `docs/PLAN-REFER-FACTORY-INSTALLED-RUNTIME-001.md:92,466` |

### Docs update

- Codex lanes still read as live: `AGENTS.md:140,170`; `docs/hive-build-plan.md`; `docs/cross-factory-orchestration.md`; `docs/chat-surface-scripts.md`; `docs/domain-script-registry.md:10`.
- `README.md:237,245,337-339` present-tense VS Code commands and `@refer`.
- `machines/README.md`: `*.station.json` → `*.trigger.json` (:9); machine table lists 8 of 20 (:92-101); "build-tracker in Telechurch" (:156); roll-up claimed (:160) that the move record says does not exist.
- `AGENTS.md`/`CLAUDE.md` never point at `refer.factory.md` / `refer.forge.md`; binding order skips `refer.agent.md`.
- Test count: ~37 → 36.
- Ecosystem map purpose still reads "Codex adapter implementation" (`E:/e2e-bridge/governance/ecosystem-map.json:212-221`).
- Telechurch plans `refer-script-factory.master-plan.md`, `refer-script-factory.bootstrap-handoff.md`, `refer.living-factory.plan.md` still describe a VS Code extension / open intake.
- Telechurch `CLAUDE.md` cites `REFER.OS/refer.factory.md` as local; it exists only in `E:/refer.os`.

## Checked and clean

Every npm script and function the docs name exists; the VS Code code is truly gone;
P13 (`process.cwd()` for subjects) holds across all machines and engine files;
`src/chat` and `src/contracts` have no genuine duplicates of core; Telechurch keeps no
stale copies of scheduler, board server, board builder or clock.

## RETURN

Status: reported, awaiting acceptance (Article 10.3 step 6). On acceptance the path to
Reverent is G1-G5 ratified or corrected in law first, then R1-R9 and the docs pass,
then this audit re-run.
