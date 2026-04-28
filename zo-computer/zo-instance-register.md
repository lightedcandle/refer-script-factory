# Zo Instance Register

Last updated: 2026-04-21
Status: Active
Scope: Track initialized Zo instances and their roles

## Purpose

This document records Zo instances, their names, their intended roles, and the evidence available for each one.

## Rules

- One entry per Zo instance.
- Distinguish `initialized`, `active`, and `target` instances.
- Record whether the evidence is documented, observed, or inferred.
- Keep operational role separate from verified capability.

## Active Instances

### `refer`

- State: `initialized`
- First recorded: `2026-04-20`
- Evidence type: `Observed`
- Environment: `Zo desktop app`
- Role: first Zo instance for REFER-aligned evaluation and future VIPC chaining
- Current posture:
  - personal command environment candidate
  - potential root Zo node for future multi-instance orchestration
  - foundational knowledge and experimentation instance

Observed details:

- instance/account label shown as `refer`
- plan label shown as `Free`
- hostnames / addresses observed:
  - `refer.zo.computer`
  - `refer.zo.space`
  - `refer@zo.computer`
- channel evidence visible:
  - text number configured
  - email address `refer@zo.computer`
  - Telegram channel present
- workspace folder `REFER` created
- workspace subfolders created:
  - `REFER/Validation`
  - `REFER/Templates`
  - `REFER/Skills`
- workspace note created and UI-confirmed:
  - `REFER/refer-instance-notes.md`
- first template created:
  - `REFER/Templates/low-quota-operating-prompt.md`
- first staged skill draft created:
  - `REFER/Skills/refer-documentation-discipline.SKILL.md`
- first active skill installed:
  - `Skills/refer-documentation-discipline/SKILL.md`

Notes:

- This is the first known initialized Zo instance in the current universal context.
- Multi-instance behavior is not yet validated; `refer` should currently be treated as the first node, not as a proven controller.

### `telechurch`

- State: `initialized`
- First recorded: `2026-04-21`
- Evidence type: `Observed`
- Environment: `Zo computer / Zo Space`
- Role: Telechurch-specific VIPC and remote admin/training surface
- Current posture:
  - dedicated Telechurch ministry operator computer
  - hosts the Telechurch admin entry surface at `https://telechurch.zo.space`
  - acts as an AI training/operator layer while Telechurch remains the system of record

Observed details:

- instance/account label reported by Zo as `telechurch`
- hostnames / addresses observed:
  - `telechurch.zo.space`
- environment token key:
  - `ZO_COMPUTER_TELECHURCH`
- workspace folder `TELECHURCH` created
- workspace subfolders created:
  - `TELECHURCH/Validation`
  - `TELECHURCH/Templates`
  - `TELECHURCH/Skills`
- workspace notes created:
  - `TELECHURCH/telechurch-instance-notes.md`
  - `TELECHURCH/telechurch-vipc-operating-rules.md`
  - `TELECHURCH/telechurch-admin-route-map.md`
- active/persona target:
  - `Telechurch Ministry Operator`
- Zo Space routes created:
  - `/admin`
  - `/console`
  - `/api/auth/exchange`
  - `/api/me`
  - `/api/tenants/:tenantId/summary`
  - `/api/tenants/:tenantId/audit`

Notes:

- `telechurch` is intentionally separate from `refer`.
- This instance is currently a POC/operator surface, not a live authority over Telechurch tenant data.
- The live bridge should use tenant-scoped Telechurch APIs with actor, tenant, role, scope, and audit context.

### `jamaicaeats`

- State: `initialized`
- First recorded: `2026-04-22`
- Evidence type: `Observed`
- Environment: `Zo computer / Zo Space`
- Role: JamaicaEats-specific VIPC and repo-connected operator/design surface
- Current posture:
  - dedicated JamaicaEats operator computer
  - connected by policy to the app repo at `E:\jamaicaeats`
  - acts as a planning, training, design, and safe prototype layer while JamaicaEats remains the system of record

Observed details:

- environment token key:
  - `ZO_COMPUTER_JAMAICAEATS`
- local helper route:
  - `node E:/refer/zo-computer/tools/zo-mcp.mjs --instance jamaicaeats`
- initial live checks:
  - `list-tools --instance jamaicaeats` succeeded
  - `get_space_settings --instance jamaicaeats` returned empty/default settings before setup
  - `list_space_routes --instance jamaicaeats` returned an empty route list before setup
  - `list_personas --instance jamaicaeats` returned an empty list before setup
  - `list_rules --instance jamaicaeats` returned an empty list before setup
- target hostnames / addresses:
  - `jamaicaeats.zo.space`
- repo connection:
  - `E:\jamaicaeats`
  - `E:\jamaicaeats\AGENTS.md`
  - `E:\jamaicaeats\docs\jamaicaeats-feature-blueprint.md`
- target workspace files:
  - `JAMAICAEATS/jamaicaeats-instance-notes.md`
  - `JAMAICAEATS/jamaicaeats-vipc-operating-rules.md`
  - `JAMAICAEATS/jamaicaeats-repo-connection-map.md`
- target active skills:
  - `refer-zo-intake-router`
  - `zo-design-driver`
  - `jamaicaeats-vipc-driver`
  - `jamaicaeats-design-driver`

Notes:

- `jamaicaeats` is intentionally separate from `refer` and `telechurch`.
- This instance is currently a bootstrap/operator/design surface, not a live authority over JamaicaEats store, menu, order, payment, driver, customer, or map data.
- The live bridge should use scoped JamaicaEats APIs with actor, store, role, scope, confirmation, and audit context.

## Planned Future Instance Classes

- ministry domain node
- app development domain node
- partner development node
- client personal node
- client professional or corporate node

## Open Questions

- Should `refer` remain the long-term root operator node, or become a learning node later replaced by a dedicated control Zo?
- Which future instances should be isolated by role versus connected through shared channels or external orchestration?
- Which instance metadata needs to be standardized for repeatable provisioning?

## Update Log

### 2026-04-20

- Created instance register.
- Recorded first initialized Zo instance: `refer`.

### 2026-04-21

- Recorded initial REFER workspace structure inside Zo.
- Confirmed `REFER/refer-instance-notes.md` exists in the Zo UI.
- Recorded first reusable Zo-side prompt template.
- Recorded first staged Zo-side skill draft. It is not yet confirmed as installed or active.
- Installed and verified first active Zo skill: `refer-documentation-discipline`.
- Confirmed remote update/readback of `REFER/Validation/2026-04-21-initialization-validation.md`.
- Recorded live Zo computer specs observed by user:
  - CPU: 3 cores
  - CPU clock: 1.8 GHz
  - architecture: x86_64
  - OS: Linux 6.12
  - processes: 18
  - memory: 1.0 GB / 4.0 GB, 3.0 GB free, 26.0% used
  - uptime: 2h 25m
  - specs can change dynamically depending on workloads and plan
- Recorded new Telechurch-specific Zo computer:
  - env key: `ZO_COMPUTER_TELECHURCH`
  - handle: `telechurch`
  - Space: `https://telechurch.zo.space`
  - route surface: `/admin`, `/console`, and read-only API stubs

### 2026-04-22

- Recorded new JamaicaEats-specific Zo computer bootstrap:
  - env key: `ZO_COMPUTER_JAMAICAEATS`
  - target handle: `jamaicaeats`
  - target Space: `https://jamaicaeats.zo.space`
  - repo connection: `E:\jamaicaeats`
  - initial status: reachable and blank before bootstrap
