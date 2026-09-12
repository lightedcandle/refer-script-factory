# CLAUDE.md — REFER Script Factory

Read `AGENTS.md` before doing substantive work here — it is the binding law for this repo, not this file. This file only helps a fresh Claude session find that law faster.

**Role:** factory-repo (`repo_id: refer-script-factory` in the ecosystem map)
**Purpose:** seed implementation and doctrine source for the REFER Script Factory — the provider-neutral system that converts ratified REFER Execution Contracts and verified methods into bounded script plans, artifacts, verification evidence, and reusable registrations. VS Code/CLI/HTTP/MCP are adapters around it, not the product identity.

## Read this before editing anything in `machines/`

**There is no deploy step. Saving a file is deploying it.** A scheduler reads `machines/*.cjs` off disk at the moment it fires, every five minutes, against a live board. Main is production; the only rollback is another commit. A half-edited machine does not run at all, so a file left part-written silently stops the rhythm it drives.

Run `npm run gate:machines` before the save, not after the push.

The law, the guard's exact behaviour and the branch policy are in `AGENTS.md` under *Machines: there is no deploy step, so saving is deploying*.

## Binding order

1. `E:/refer.os/AGENTS.md` — universal REFER agent law
2. `AGENTS.md` (this repo) — factory governance, machines, and Script-First Law

## Repo-specific notes

- `machines/` holds the universal machines of the Living Factory — one copy, every repo. Every machine resolves its subject from `process.cwd()` and never from `__dirname` (precedent P13). `machines/README.md` is the working doc; `machines/kind.cjs` is the belt's only vocabulary.
- The belt (`.claude/agent-context/findings.jsonl`) is **per consuming repo and never in this one**. Findings are about a repo; a shared belt would merge several repos' work into one unreadable stream.
- Provider-neutral core lives under `src/core/**` (no VS Code APIs or host adapters).
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
