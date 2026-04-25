# Law 36: refer.init.md — REFER.OS Bootstrap Guide

`refer.init.md` captures the canonical startup story for REFER.OS: how the router, QC engine, refer.\* documents, and forward-only lineage come online together.

## Article 36.1: 1. Init Intent

- **Trigger:** `refer.init: bootstrap` or any directive that brings new agents into REFER.OS and describes how to begin.
- **Purpose:** Walk through registering identities, wiring structure/inference, enabling refer prefixes, and confirming guardrails such as branch rules, QC checks, and context continuity.
- **Bootstrap override:** when a prompt clearly asks for a brand-new repo or app workspace, initialization takes precedence over normal build/combing routing until bootstrap interrogation and scaffolding are complete.

## Article 36.2: 2. Initialization steps

1. **Verify requirements:** confirm `refer.md`, `refer.qc.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`, and `refer.supabase.md` exist and match the canonical versions.
   - If a standalone universal source is in use, verify the attached universal root first (for example `E:/refer.os/REFER.OS`) and then confirm any local fallback copy is aligned.
   - If the operator is working from the universal workspace, reject any bootstrap target nested under `E:/refer.os`.
     1a. **Run bootstrap interrogation:** before scaffolding a new consumer repo, capture at minimum:
   - repo/app name
   - target path
   - repo purpose
   - primary actor
   - smallest end-to-end outcome
   - core constraint
   - whether the repo starts headless or with a visible plan/app UI
2. **Provision todo workspace:** ensure `refer.app/plan/` exists with `refer.plan.json` (master plan register) and feature briefs (e.g., `refer.app/plan/<feature>.md`) so planning artifacts stay centralized for all future builds.
   - For repos without a plan UI, bootstrap a headless Planner contract by creating `public/assets/plan/refer.plan.json` as the canonical machine-readable register and `refer.app/plan/refer.plan.md` as the local human-readable plan note.
   - The Planner contract must initialize even when no `/plan` route or planner screen exists; UI is optional, Planner artifacts are not.
   - Ensure a machine-readable attachment marker exists when using standalone universal governance (recommended: `.refer/source.json`).
   - Ensure a local `agent.md` is created so the consumer repo binds the universal agent posture immediately.
3. **Register identities:** ensure `refer.identity.md` maps the doctrine/tree, and add any new workflows to the manifest.
4. **Hook references:** update `refer.md` table, law (`refer.law.md`), and `refer.qc.md` references so the router resolves every new intent.
5. **Apply guardrails:** enforce context continuity, forward-only branching, split-footprint builds, asset sizing, and the new QC checklist before allowing any build/repair/migrate actions.
   - Enforce active-root containment so universal governance lookup never implies cross-repo write authority.
6. **Confirm config:** point `c:\Users\agent\.codex\config.toml` (or equivalent) at REFER.OS documents, enable refer prefixes, and ensure the project scope requires refer context.
   - Repo-local config may point at the standalone universal root while still keeping app-local law in the repo.
7. **Provision remote keys:** verify `.env.master` (or the approved key vault) holds the Cloudflare/Supabase/GitHub tokens so remote management intents can authenticate via `refer.systems.security.md`.
8. **Automate startup:** register a `refer.init` alias in the router table if new agents need to bootstrap automatically.
   - Preferred bootstrap path for a new repo attached to standalone REFER is: seed universal law, seed Planner artifacts, attach `.refer/source.json`, then create the first local app-law markers.
   - Bootstrap completion is the only lawful point for switching active context into the new repo.

## Article 36.3: 3. Activation

- Use this document when terraforming a new workspace, onboarding a new agent, or resetting the refer surface after a governance update. Call `refer.init` before running more specific refer actions so the system knows the canonical references are live.
