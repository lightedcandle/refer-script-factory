# Zo Computer Agent Skills

Last updated: 2026-04-24
Verification status: Confirmed for Zo support, mixed for broader open-spec details

## Scope

This file captures how Zo relates to skills and how that matters for REFER-aligned workflow design.

## Confirmed

- Zo documents a `Skills` capability.
- Zo uses `SKILL.md`-based skill folders.
- Zo's docs describe skills as reusable instruction packages that can include supporting files.
- Active skill layout on a Zo computer is `/home/workspace/Skills/<skill-dir>/SKILL.md`.
- Observed hub-facing metadata currently includes `DISPLAY.json` with fields like `icon` and `tags`.

Source:

- https://docs.zocomputer.com/skills

## Startup Gap

Zo does not currently guarantee that `/home/workspace/agent.md` and `/home/workspace/AGENTS.md` are read automatically at session initialization.

That creates a real startup gap:

- a fresh session may begin with persona, rules, and installed skills;
- local workspace law may not be foregrounded until later in the session;
- a future turn can therefore miss long-lived workspace posture unless the startup stack explicitly binds to the local files first.

## Startup Binding Rule

A REFER-governed Zo computer should patch or instruct its startup surfaces so they do this before first substantive response:

1. read `/home/workspace/agent.md`
2. read `/home/workspace/AGENTS.md`
3. treat them as binding workspace context
4. treat active skills under `/home/workspace/Skills/**` as subordinate execution wrappers

Preferred precedence:

1. system prompt and product safety
2. built-in persona and persistent rules
3. `/home/workspace/agent.md`
4. `/home/workspace/AGENTS.md`
5. active skills under `/home/workspace/Skills/**`

## Current Use Rule

For Zo planning, skills should currently be treated as:

- reusable workflow instructions
- wrappers around REFER law or app-local doctrine
- a bridge between REFER patterns and Zo-native task execution
- a path for reusable multi-instance operating doctrine when packaged cleanly

## Discovery Rule

Zo should be able to infer skills from normal chat intent without requiring the user to name a skill explicitly.

Active discovery should inspect:
- `/home/workspace/Skills/**`

Portable library mirrors are not runtime-discoverable by default.
They become discoverable after installation into the active `Skills/` root.

## REFER Skill Library Status

Status: structured as a portable library source with active runtime equivalents.

Portable library root:
- `E:/refer/zo-computer/skills/`

Canonical metadata:
- `E:/refer/zo-computer/skills/library-manifest.json`
- `E:/refer/zo-computer/refer-install-state.json`

Current universal REFER-facing library entries:
- `refer-os`
- `refer-zo-intake-router`
- `refer-governance`
- `refer-contract-tandem`
- `refer-library-bootstrap`

## Hub Metadata Rule

Use the `SKILL.md` frontmatter `description` as the core discoverability text.
Use `DISPLAY.json` for hub-facing presentation fields like:
- `icon`
- `tags`

Current REFER hub direction:
- icon: `anchor`
- purpose: anchor intent to canonical truth and prevent drift

## Credit Attribution Rule

Canonical skill-library attribution should be kept at the library level, not guessed per-skill unless Zo documents a first-class field for that.

Current canonical attribution should live in:
- `E:/refer/zo-computer/skills/library-manifest.json`
- `E:/refer/zo-computer/skills/README.md`

Current attribution:
- library: `REFER.OS`
- author: `Calvin Anderson`
- alias: `ApostleJ`
- site: `https://telechurchlive.com`

## Installation and Update Rule

Until a native cross-instance installer is validated, portable distribution means copying a skill folder from:
- `E:/refer/zo-computer/skills/<skill>/`

to:
- `/home/workspace/Skills/<skill>/`

while preserving:
- folder name
- `SKILL.md`
- any bundled supporting files
- `DISPLAY.json` when present

The local machine should also maintain:
- installed REFER version
- installed skill-library version
- update channel
- last check time
- bootstrap state
- startup binding status

through:
- `E:/refer/zo-computer/refer-install-state.json`

## Prompt Policy

Default update posture:
- prompt if behind
- do not force-update active work mid-session
- offer `update_now`, `remind_later`, `skip_this_version`
- reserve priority prompting for critical governance or security updates

## Authority Rule

Skills do not create authority.

Binding behavior is governed by:
- `E:/refer.os/REFER.OS/**`
- `E:/refer.os/agent.md`
- local `/home/workspace/agent.md`
- local `/home/workspace/AGENTS.md`
- app-local law surfaces when present

## Universal and Scoped Split

Universal REFER-facing skills belong in the portable library.
Scoped app overlays may also exist, but should remain clearly scoped and should not replace universal entries.

## Remaining Open Questions

- how Zo will eventually support first-class cross-instance skill distribution or marketplace-style install
- what parts of the broader Agent Skills ecosystem Zo fully implements
- whether a manifest beyond folder + `SKILL.md` plus `DISPLAY.json` becomes necessary for portable install
