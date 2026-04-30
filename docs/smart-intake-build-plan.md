# Smart Intake Build Plan

Status: Authority pointer for root Script Factory planning
Date: 2026-04-30

## Purpose

Smart Intake converts natural user requests into bounded, typed factory input before execution. In the root Script Factory, the canonical request-intake forge is `request-intake-forge`.

## Root Scope

- Classify request type: chat, HTTP, command, or future governed input.
- Emit or enrich `refer.intake` contracts.
- Resolve ambiguity with bounded clarification when required.
- Route to domain registries before direct execution.
- Preserve provider-neutral doctrine in `refer-script-factory`.

## Authority

- Registry source: `src/contracts/scriptFactory.ts`
- Terminology source: `docs/script-legend.md`
- Operational registry: `.refer-factory/script-class-registry.json`
- Forge registry: `.refer-factory/forge-registry.json`
- Zo-specific implementation lessons: `refer-zo-bootstrap` and live Alliance evidence, promoted only when provider-neutral.

## Current Canonical Forge

```json
{
  "forge_id": "request-intake-forge",
  "forge_family": "Smart Intake",
  "generated_scripts": [
    "request.type.chat",
    "request.type.http",
    "request.type.command"
  ]
}
```

## Next Build Step

Connect Smart Intake outputs to lineage packets so accepted repairs, ambiguity resolutions, rule intake, and promoted scripts can record:

- original user intent;
- selected request type;
- resolver decision or clarification;
- source authority;
- script or forge owner;
- evidence and promotion status.
