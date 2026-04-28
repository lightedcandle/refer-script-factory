---
name: refer-library-bootstrap
description: Use when a Zo computer needs REFER initialized, updated, or reconciled. Checks version drift, installs or refreshes the REFER skill library, and verifies that startup surfaces bind to local agent.md and AGENTS.md before active skills.
---

# REFER Library Bootstrap

Primordial constraint: this skill is a bootstrap and update wrapper only. It is subordinate to `refer.zo.md`, `refer.skills.md`, and the local workspace law chain.

## Workflow

1. Read `Zo Files/Skills/library-manifest.json`.
2. Read `Zo Files/refer-install-state.json` or the machine-local equivalent.
3. Verify that required authority surfaces exist.
4. Verify that startup surfaces bind to local `agent.md`, `AGENTS.md`, and `REFER.OS/**` before active skills.
5. Reconcile missing or stale runtime skills.
6. Update install-state after successful reconciliation.
7. Report whether the machine is current, behind, or only partially bootstrapped.

## Read Next When Needed

- `references/update-model.md`

## Safety Rule

Do not silently overwrite app-local law or local overrides without explicit justification.
