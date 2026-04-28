---
name: refer-os
description: Use at Zo session start or when a chat needs REFER-governed operation. Binds startup behavior to local workspace law by reading agent.md and AGENTS.md before specialist execution, then routes into the narrowest REFER skill needed.
---

# REFER OS Entry

Primordial constraint: this skill is the startup and intake entry wrapper for REFER on Zo. It is subordinate to `refer.zo.md`, `refer.skills.md`, `refer.plan.md`, and `refer.flow.md`. It does not replace law.

## Purpose

Use this skill to make REFER visible and explicit on a Zo computer.

It exists because a Zo session may begin with persona, persistent rules, and installed skills without reliably foregrounding workspace binders.

## Startup Binding

Before first substantive response when the files exist:

1. read `agent.md` in Zo Files
2. read `AGENTS.md` in Zo Files
3. read `REFER.OS/refer.md`, `REFER.OS/refer.zo.md`, and any relevant REFER law in Zo Files
4. treat them as binding workspace context
5. treat active skills under the Zo Files `Skills/**` folder as subordinate execution wrappers

If the files do not exist, proceed normally and state that no local workspace binder was found when that absence matters.

## Routing

After binding startup posture:

1. identify whether the request is best handled by a narrower REFER skill;
2. prefer the narrowest applicable skill;
3. keep mutation subordinate to law and explicit user intent.

Primary follow-on skills:
- `refer-zo-intake-router`
- `refer-governance`
- `refer-contract-tandem`
- `refer-library-bootstrap`

## Output

Keep the first response compact:
- confirm startup binding state
- state the active governing surface when relevant
- route into the narrowest next skill or workflow
