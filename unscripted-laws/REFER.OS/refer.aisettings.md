# Law 47: refer.aisettings.md - AI Settings Governance

## Purpose

This document is the **single authoritative source** for Codex AI settings. It governs:

- `config.toml` (global + project overrides)
- `rules/*.rules`

All AI settings must remain aligned with REFER.OS, refer.flow.md, and refer.plan.md. No other governance files should duplicate or override these settings.

## Scope

Applies to:

- User-level config (`C:\Users\<user>\.codex\config.toml`)
- Rules (`C:\Users\<user>\.codex\rules\*.rules`)
- Repo-local instantiated files (if used)

## Canonical alignment rules

1. **Refer-first operation**: settings must enforce REFER.OS as the active mode and allow natural-language prompts to be auto-routed by the router (refer prefix not required when intent is unambiguous).
2. **Gated mutation**: irreversible actions require explicit consent per refer.flow.md and refer.plan.md. If tooling approval is disabled, the consent gate must be enforced by procedure.
3. **Ratification chain**: ratification + human-in-loop must remain enabled when required by refer.flow.md.
4. **Logging**: local audit logging must remain enabled via approved local audit channels.
5. **Law chain**: law chain must include refer.flow.md, refer.os.md, refer.md, and refer.law.md at minimum.

## Required `config.toml` fields

These fields must exist to remain aligned with REFER.OS:

- `mode = "REFER.OS"`
- `policy_version = "REFER_OS_V1"`
- `require_document_reference = true`
- `require_refer_prefix = false`
- `reject_unreferenced_prompts = false`
- `chat_intent_only = true`
- `chat_execution = "forbidden"`
- `chat_consecration_required = true`
- `require_ratification = true`
- `ratifier = "gpt-5"` (or ratifier approved in governance)
- `human_in_loop = "<named human>"`
- `halt_on_unratified = true`
- `law_chain = ["REFER.OS/refer.flow.md", "REFER.OS/refer.os.md", "REFER.OS/refer.md", "REFER.OS/refer.law.md"]`
- `model = "<approved model>"`
- `model_reasoning_effort = "<approved level>"`
- `approval_policy = "on-request"` (preferred) **or** `"never"` with manual consent enforcement
- `sandbox_mode = "read-only" | "workspace-write" | "danger-full-access"`

### Project overrides (required)

Per-project blocks may override behavior, but must not relax refer-first requirements or remove ratification. Required defaults:

- `refer_enforced = true`
- `context_continuity = true`
- `phase_order = ["refer", "build", "commit"]`
- `build_sequence = "refer"`

## Required `rules/*.rules` policy

Rules must not override REFER.OS law. They may reduce friction or add safety guardrails but cannot contradict refer.flow.md consent rules.

### Minimum rule set

At least one rules file must exist. Do **not** enforce a refer-prefix-only rule; allow natural-language prompts so the router can infer the domain. If additional safety is desired, prefer **explicit blocklists** over prompts to avoid workflow friction.

## Distribution memo

See `.refer.npm.md` for npm distribution strategy, update policy, and security posture.

## Guided onboarding (AI training)

npm distributes REFER.OS tooling, but onboarding requires explicit guided prompts. Use `refer-setup --onboard` (stub) to launch a guided Q&A flow that walks new users through Plan/Flow/Governance and the PSFR loop. Until implemented, direct users to `REFER.OS/refer.plan.md` for the quick start flow.

## Instantiation / Updates

When AI settings are changed:

1. Update the authoritative policy in this file.
2. Apply changes to `config.toml` and `rules/*.rules`.
3. Log the change in refer.os.md governance log.
4. Record the change in approved local audit artifacts.

## Compliance

If runtime settings drift from this file, they must be reconciled immediately. REFER.OS execution pauses until settings are realigned.
