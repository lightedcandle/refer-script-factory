# Zo Computer AI Layer

Last updated: 2026-04-20
Verification status: Confirmed with time-sensitive model list

## Scope

This file summarizes Zo's documented AI configuration model.

## Confirmed Configuration Layers

Zo's docs describe multiple persistent or semi-persistent AI customization surfaces:

- bio
- rules
- personas
- skills
- tools

Sources:

- https://docs.zocomputer.com/bio
- https://docs.zocomputer.com/rules
- https://docs.zocomputer.com/personas
- https://docs.zocomputer.com/skills
- https://docs.zocomputer.com/prompting

## Confirmed Behavior Notes

- Bio is persistent background context about the user.
- Rules are conditional or always-on behavioral instructions.
- Personas define role and style and can carry model assignments.
- Channel-specific persona assignment is supported in Zo's UI observations and persona docs.
- Skills are reusable workflow packages represented by `SKILL.md`-based structures.

## Time-Sensitive Model Note

Model availability is time-sensitive and should not be frozen as a stable fact in this file without a date.

If model inventories are recorded here later, they must include:

- capture date
- source URL
- whether the list was observed in product UI or docs

## Guidance

For REFER use, treat Zo's AI layer as configurable along multiple axes, but do not assume any specific model remains available unless it has been recently verified.
