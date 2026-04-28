# Zo VIPC Bootstrap Blueprint

Last updated: 2026-04-27
Status: Universal Template

## Purpose
This document defines the universal standard for bootstrapping a dedicated Zo Virtual Intelligent Private Computer (VIPC) surface for any application.

A VIPC bootstrap does not make Zo the system of record. The target application's repository remains the authority for app code, production deploys, and schemas. Zo serves as the operator, planning, and training layer.

## The Four Pillars of a Bootstrap

Every dynamic bootstrap includes four core components:

1. **Universal REFER Skills**
   The foundational laws that give the AI its structural boundaries. These are strictly synced from the `library-manifest.json` and must always include:
   - `refer-zo-intake-router`
   - `refer-library-bootstrap`
   - `refer-contract-tandem`
   - `refer-os`
   - `refer-governance`

2. **Authority Surfaces (The Profile Folder in Zo Files)**
   A profile-specific folder inside Zo Files (`<APP_NAME>/`, addressed by MCP through the detected Files workspace root) that contains the operational rules for the AI. This folder must contain:
   - `<app>-instance-notes.md`: Current runtime notes for the active instance.
   - `<app>-vipc-operating-rules.md`: Non-negotiable mutation and access boundaries.
   - `<app>-repo-connection-map.md`: Map pointing the AI to canonical repos and external schemas.
   - `<app>-design-system.md`: The active profile's brand posture, color theory, and responsive discipline.
   - `Templates/codex-handoff-prompt.md`: The standard workflow handoff template.

3. **App-Specific Drivers**
   Specialized skill drivers tailored to the specific profile (e.g., `<app>-vipc-driver`, `<app>-design-driver`). These are synced to the `Skills/` folder in Zo Files if they exist in the local `zo-computer/skills/` registry.

4. **Manifests & Install State**
   The standard `library-manifest.json` and `refer-install-state.json` trackers. These are placed in the Zo Files `Skills/` folder and Files root respectively to allow the `refer-library-bootstrap` skill to reconcile version drift on future boots.

5. **Persona & Persistent Rules**
   Zo persona is the platform-native startup binder, equivalent in function to `AGENTS.md` for chat startup. Bootstrap must append a REFER VIPC startup map to the active/profile persona because Zo may not discover REFER binders or installed skills on its own. Persistent Zo Rules then reinforce the same boundaries as always-on behavior.

   Persona appendix must include:
   - active profile name and Zo Files profile paths
   - `agent.md` and `AGENTS.md` in Zo Files
   - installed REFER skill names and `Skills/<skill>/SKILL.md` paths in Zo Files
   - routing shortcuts for governance, intake, Codex handoff, library repair, operator work, design work, and build-director automation

   Rules must carry durable startup constraints:
   - read startup binders before substantive work
   - read active profile rules and repo map before repo-connected guidance
   - route requests through REFER vocabulary
   - block production mutation without explicit approval and Codex handoff
   - label stub, sandbox, and production behavior

## Dynamic Bootstrapping (`vipc-bootstrap.mjs`)

The bootstrap process is automated via `zo-computer/tools/vipc-bootstrap.mjs`.

The tool transfers files from the local `zo-computer/` folder relative to this repository, not from a hard-coded machine path. It detects the MCP filesystem address for the Zo Files workspace with `pwd`; use `--remote-root <absolute-path>` if the instance reports a different Files root. It recursively syncs universal skill folders, including `references/`, then syncs profile-specific skill folders whose names begin with the active profile.

### Usage
```bash
node tools/vipc-bootstrap.mjs --profile telechurch --instance refer
```

### Derivation
If the `--profile` flag is omitted, the tool will attempt to derive the profile by querying the detected Zo Files workspace root, looking for existing project folders or context files.

## Non-Negotiable Boundaries
- No direct database (Supabase) access from Zo Space routes without explicit approval.
- No service-role or production secrets in Zo route code.
- No live system mutation without an approved Codex.
- Stub, sandbox, and production behavior must be clearly labeled in the VIPC UI.
