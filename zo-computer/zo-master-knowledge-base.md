# Zo Computer Knowledge Base Index

Last updated: 2026-04-22
Corpus status: Draft
Purpose: Universal index for the Zo Computer dossier under `E:\refer\zo-computer`

## Scope

This directory is a reusable Zo knowledge corpus for REFER-aligned work across repos.

This corpus is not law.
Law remains in:

- `E:\refer.os\REFER.OS\**`
- `E:\refer.os\agent.md`

This corpus is also not a substitute for direct verification. It should be treated as:

- a research and operations reference
- a deployment planning aid
- a staging area for claims that still need hands-on validation

This corpus is intended to persist across chat sessions. Future Zo-related work should extend this directory rather than restarting the dossier in repo-local notes or ephemeral conversation summaries.

## Evidence Legend

- `Confirmed`: supported by official Zo docs or official Zo product pages
- `Observed`: seen directly in screenshots or hands-on use
- `Inferred`: reasonable interpretation from confirmed or observed evidence
- `Unverified`: not yet proven enough for deployment-grade reliance

## Current Corpus Status

What is strong:

- core product positioning
- desktop and server mental model
- pricing and plan structure
- AI configuration concepts
- documented tools and integrations

What still needs normalization or validation:

- API and MCP surfaces need stronger per-claim sourcing
- browser-use claims must respect Zo's documented current limitations
- some draft docs still need the same normalization pattern

## File Index

| File | Purpose | Current status |
| --- | --- | --- |
| `zo-master-knowledge-base.md` | Corpus index and evidence posture | Confirmed |
| `zo-computer-capability-reference.md` | Baseline fact-checked capability map | Confirmed |
| `zo-interface-map.md` | UI and navigation observations | Confirmed + Observed |
| `zo-instance-register.md` | Our Zo instances and their roles | Observed |
| `zo-computer-role-register.md` | Zo's evolving role in REFER context | Inferred |
| `zo-architecture-and-system.md` | Architecture, providers, system posture | Confirmed |
| `zo-plans-and-pricing.md` | Pricing and billing posture | Confirmed |
| `zo-ai-layer.md` | AI configuration model | Confirmed |
| `zo-tools-reference.md` | Tool families and operating surface | Confirmed |
| `zo-integrations.md` | Integration options and boundaries | Draft |
| `zo-files-and-workspace.md` | Files, sync, and workspace behavior | Draft |
| `zo-sites-and-space.md` | Sites, space, and selling surface | Draft |
| `zo-server-and-ssh.md` | Services, networking, and SSH usage | Draft |
| `zo-automations.md` | Automation model | Draft |
| `zo-api-reference.md` | API notes and working assumptions | Partially verified |
| `zo-mcp-server.md` | MCP connectivity notes and working assumptions | Tested |
| `zo-mcp-tool-inventory.md` | Live MCP tool inventory for `refer` | Tested |
| `zo-devices.md` | Devices feature notes | Draft |
| `zo-browser-use.md` | Browser-use capability notes | Confirmed with limitation |
| `zo-agent-skills.md` | Zo skills, intake router, universal/scoped design split, and relation to Agent Skills | Confirmed for Zo support |
| `zo-free-tier-platform-limits.md` | Confirmed Free tier constraints for sleep, public service uptime, automation cadence, API child sessions, and durable state | Confirmed + Observed |
| `zo-byok.md` | BYOK posture and validation boundaries | Confirmed at feature level |
| `zo-control-other-computers.md` | Notes on controlling other machines | Unverified |
| `zo-advanced.md` | Advanced idea backlog | Unverified |
| `zo-validation-log.md` | Hands-on validation log | Active |

## Source Index

Primary official sources used in this corpus:

- https://docs.zocomputer.com/
- https://docs.zocomputer.com/intro
- https://docs.zocomputer.com/vision
- https://docs.zocomputer.com/information/security
- https://docs.zocomputer.com/information/terms
- https://docs.zocomputer.com/sites
- https://docs.zocomputer.com/ssh-zo
- https://docs.zocomputer.com/servers
- https://docs.zocomputer.com/integrations
- https://docs.zocomputer.com/connections
- https://docs.zocomputer.com/prompting
- https://docs.zocomputer.com/personas
- https://docs.zocomputer.com/rules
- https://docs.zocomputer.com/skills
- https://docs.zocomputer.com/updates
- https://docs.zocomputer.com/billing
- https://docs.zocomputer.com/byok
- https://www.zo.computer/
- https://www.zo.computer/pricing
- https://www.zo.computer/channels
- https://www.zo.computer/channels/api

## Working Rule

If a file here contains a claim that would materially affect architecture, cost, security, or multi-instance orchestration, prefer:

1. a direct official source
2. a dated observed test in `zo-validation-log.md`
3. only then a working inference

When the understanding changes, update the existing relevant file and record the change as a dated delta rather than creating parallel conflicting summaries.

## Dated Delta

### 2026-04-21 - REFER Zo intake router staged

- Added `skills/refer-zo-intake-router/SKILL.md` as the universal Zo request classifier and compact-return discipline.
- Updated `zo-agent-skills.md` so future Zo skill work starts from the intake router before specialist skills.
- The router skill is procedural. Binding authority remains in `E:\refer.os\REFER.OS\refer.zo.md` and the broader REFER.OS law chain.

### 2026-04-21 - Universal/scoped design skill split

- Added `skills/zo-design-driver/SKILL.md` as the platform-agnostic visual design skill.
- Reduced `skills/telechurch-figma-design-driver/SKILL.md` to a Telechurch scoped overlay that depends on the universal design driver.
- Updated the intake router so general visual work routes to `zo-design-driver`, while Telechurch visual work routes through `zo-design-driver` and then the Telechurch overlay.

### 2026-04-22 - JamaicaEats VIPC bootstrap

- Added `jamaicaeats` as a dedicated Zo VIPC/bootstrap instance connected by policy to `E:\jamaicaeats`.
- Added `skills/jamaicaeats-vipc-driver/SKILL.md` for JamaicaEats repo/operator work.
- Added `skills/jamaicaeats-design-driver/SKILL.md` as a scoped design overlay after the universal `zo-design-driver`.
- Updated `refer-zo-intake-router` so JamaicaEats work routes through intake first, then the operator driver or universal + scoped design chain.
- Created safe stub routes on `https://jamaicaeats.zo.space`:
  - `/operator`
  - `/console`
  - `/api/repo/context`
  - `/api/stores/demo/summary`

### 2026-04-22 - Free tier platform limits promoted

- Promoted Telechurch Zo's `zo-free-tier-platform-limits` skill into the universal Zo corpus.
- Added `zo-free-tier-platform-limits.md` and `skills/zo-free-tier-platform-limits/SKILL.md`.
- Updated universal `refer.zo` so Zo Free tier planning defaults to private pages, `/home/workspace/` durable files, and 30-minute-or-slower automations.
- Recorded the architectural boundary: Free tier public Zo services can sleep with the computer; API calls are not keep-alives; always-on public or low-latency needs should use paid Zo or the app/Cloudflare layer.
