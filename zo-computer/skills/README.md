# REFER Skill Library for Zo

REFER is a reference-first operating system and skill library for Zo. It turns normal chat into governed execution by interpreting intent through one canonical router, keeping work aligned to law and referenced truth instead of drift, contradiction, or ad hoc building.

## Purpose

This directory is the portable REFER skill library source for Zo-native use.

It is intended to seed active runtime skills under:
- `Zo Files/Skills/<skill>/SKILL.md`

## Entry Skill

The visible umbrella entry is:
- `refer-os`

Use it to bind startup posture, route into narrower REFER skills, and foreground workspace law before specialist execution.

## Credit Attribution

Credit this library as:
- `REFER.OS by Calvin Anderson`

Alias:
- `ApostleJ`

Site:
- `https://telechurchlive.com`

Attribution line:
- `Built from REFER.OS governance and routed workflow doctrine by Calvin Anderson (ApostleJ), adapted into Zo-native skills for Telechurch tandem operation.`

Canonical attribution metadata lives in:
- `E:/refer/zo-computer/skills/library-manifest.json`

## Canonical Library Metadata

- manifest: `E:/refer/zo-computer/skills/library-manifest.json`
- install state: `E:/refer/zo-computer/refer-install-state.json`
- bootstrap skill: `refer-library-bootstrap`

## Current Library

Universal REFER-facing skills:
- `refer-os`
- `refer-zo-intake-router`
- `refer-governance`
- `refer-contract-tandem`
- `refer-library-bootstrap`

Scoped overlays may live beside them, but should stay clearly scoped.

## Startup Binding Requirement

A REFER-governed Zo computer must ensure its startup surfaces read local binders before first substantive response:

1. `Zo Files/agent.md`
2. `Zo Files/AGENTS.md`
3. `Zo Files/REFER.OS/**`
4. then active skills under `Zo Files/Skills/**`

The bootstrap/update path should mark that requirement through:
- `startup_binding_required`
- `startup_binding_version`
- `startup_binding_installed`

## Install Shape

Portable installation is currently:
1. copy the desired skill folder from this library into `Zo Files/Skills/`
2. keep the folder name as the skill name
3. preserve the `SKILL.md` filename
4. add any supporting files under the same folder as needed
5. update `Zo Files/refer-install-state.json` or the machine-local install state equivalent

## Update Policy

Default behavior:
- prompt if behind
- do not force-update active work mid-session
- allow `update_now`, `remind_later`, `skip_this_version`
- reserve priority prompts for critical governance or security updates

## Authority Rule

These skills are wrappers, not law.

Authority remains in:
- `E:/refer.os/REFER.OS/**`
- `E:/refer.os/agent.md`
- local `Zo Files/agent.md`
- local `Zo Files/AGENTS.md`
- local `Zo Files/REFER.OS/**`
- app-local law surfaces when present
