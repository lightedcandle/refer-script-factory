# CLAUDE.md — REFER Script Factory

Read `AGENTS.md` before doing substantive work here — it is the binding law for this repo, not this file. This file only helps a fresh Claude session find that law faster.

**Role:** factory-repo (`repo_id: refer-script-factory` in the ecosystem map)
**Purpose:** seed implementation and doctrine source for the REFER Script Factory — the provider-neutral system that converts ratified REFER Execution Contracts and verified methods into bounded script plans, artifacts, verification evidence, and reusable registrations. CLI/HTTP/MCP are adapters around it, not the product identity.

## Read this before editing anything in `machines/`

**There is no deploy step. Saving a file is deploying it.** A scheduler reads `machines/*.cjs` off disk at the moment it fires, every five minutes, against a live board. Main is production; the only rollback is another commit. A half-edited machine does not run at all, so a file left part-written silently stops the rhythm it drives.

Run `npm run gate:machines` before the save, not after the push.

The law, the guard's exact behaviour and the branch policy are in `AGENTS.md` under *Machines: there is no deploy step, so saving is deploying*.

## Binding order

1. `E:/refer.os/AGENTS.md` — universal REFER agent law
2. `AGENTS.md` (this repo) — factory governance, machines, and Script-First Law

## Before you treat this working tree as current

```powershell
git status -sb
```

Main is production for `machines/`, and this tree is where several lanes and a
scheduler meet. A session that reads `AGENTS.md`, `CLAUDE.md` or the shelf from a
tree that is behind origin is reading superseded law and cannot tell. On
2026-09-12 a session wrote a whole `CLAUDE.md` two commits behind, blind to the
machines law, the gates and the thread register that were already on origin.

Being behind is not an error state here — it is the normal cost of a repo with a
scheduler and several lanes. Reading it as current is the error.

## Commands

Tests are compiled Node scripts, not a test runner: `npm run test` compiles to
`dist/` and runs ~37 `dist/test/*.test.js` in sequence. No watch, no `--filter`,
no lint step.

```powershell
npm run test            # compile + every test
npm run compile         # tsc only - narrow type check, emits dist/
npm run verify:core     # core type-check + the provider-neutral boundary check
```

Run one test by compiling once, then invoking the file. PowerShell 5.1 has no
`&&`:

```powershell
npm run compile; node dist/test/coreApi.test.js
```

`npm run test:cli` and `npm run test:node` are the two named subsets.

The gates are separate from the tests and cover `machines/`, which the TypeScript
suite does not touch at all:

```powershell
npm run gate:machines   # run this BEFORE the save - see the machines section above
npm run gate:prove      # breaks the gate five ways, requires it to catch each
npm run gate:pulse-belt
```

After adding or changing a script under `scripts/**`, regenerate rather than
hand-editing: `npm run scripts:registry`.

## Repo-specific notes

- `machines/` holds the universal machines of the Living Factory — one copy, every repo. Every machine resolves its subject from `process.cwd()` and never from `__dirname` (precedent P13). `machines/README.md` is the working doc; `machines/kind.cjs` is the belt's only vocabulary.
- The belt (`.claude/agent-context/findings.jsonl`) is **per consuming repo and never in this one**. Findings are about a repo; a shared belt would merge several repos' work into one unreadable stream.
- Provider-neutral core lives under `src/core/**` (no VS Code APIs or host adapters). The rule is machine-checked, not honour-system: `scripts/verify/core-boundary.mjs` walks every import, export, `require` and dynamic import in the AST and fails on `vscode` or on any relative path escaping `src/core`. `src/core/index.ts` is the intentional public API.
- **`src/chat/` and `src/contracts/` are MIXED, and this is the trap here.** Some files are one-line `export * from "../core/..."` re-exports; others are real modules that re-export the core contract *and* add the `node:fs` side the provider-neutral core is not allowed to have — `referIntake.ts` adds `writeReferIntakeRecord`, `scriptLegend.ts` adds `writeScriptLegend`, and `codebaseTree.ts`, `factoryGaps.ts` and `scriptographer.ts` are several hundred lines of real implementation. Open the file before assuming. Editing a re-export is lost work; moving a filesystem function into `src/core/**` breaks the boundary check.
- The VS Code adapter was **retired on 2026-09-12** — `src/adapters/vscode/**`, `src/cockpit/`, `src/commands/`, the extension manifest and the `@refer` participant are gone. This is a plain Node package with a CLI bin. `standaloneLanguage.test.ts` fails if a manifest field comes back.
- `refer-zo-bootstrap/` is the sibling Zo-scoped factory — a separate git repository nested in this working tree, ignored here, reference material only unless the user explicitly asks for Zo/bootstrap/hive work.
- `alliance-hub/` (submodule, own `AGENTS.md`) holds the live `telechurchlive` subdomain app source.
- Script-First Law: repeating work becomes a script, not a habit; record tool/provider limits in `docs/known-limits-and-constraints.md`.

## Key references

- `AGENTS.md` — full governance, machines and branch policy, sibling-factory boundary, Script-First Law
- `machines/README.md` — what each machine asks, and the belt's four kinds
- `docs/factory-system-doctrine.md` — forge / Script Factory / Factory System doctrine
- `E:/Telechurch-e2e-v2/.claude/agent-context/precedents.md` — P13 governs what belongs in this repo rather than a product repo
- `E:/e2e-bridge/governance/ecosystem-map.json` — full repo map and cross-repo ownership

Do not duplicate law here. If `AGENTS.md` changes, this file should only need its pointers updated, not rewritten.
