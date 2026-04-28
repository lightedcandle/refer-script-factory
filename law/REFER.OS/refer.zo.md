# refer.zo.md - Zo Computer Provider and Intake Reference

`refer.zo` governs REFER-aligned use of Zo Computer as a provider, workspace, hosted surface, AI chat surface, and possible operator node.

Zo knowledge lives in:

- `E:/refer/zo-computer/**`

Zo-first operator cockpit lives in:

- `E:/refer/captains-bridge/**`

Zo knowledge is durable adjunct context, not law. REFER law remains in:

- `E:/refer.os/REFER.OS/**`
- `E:/refer.os/agent.md`

## 1. Purpose

Use `refer.zo` when a request materially involves:

- Zo Computer capability evaluation
- Zo chat prompting or chat-to-Codex handoff
- Zo skills
- Zo Space or Zo Site pages, routes, assets, APIs, or hosting
- Zo MCP/API access
- Zo as a development/operator console
- Zo multi-instance, VIPC, device, browser, automation, SSH, or server orchestration planning

## 2. Intake Router Rule

Zo-facing work should pass through a compact intake router before specialist behavior.

Current intake skill source:

- `E:/refer/zo-computer/skills/refer-zo-intake-router/SKILL.md`

The intake router classifies the request into one primary mode:

- `Design Contract`
- `Design Critique`
- `Code/Repo Research`
- `Zo Space Mutation`
- `Operator/Dev Console`
- `Capability Check`
- `Chat Bridge`
- `Structural Recommendation Only`

The router skill is procedural only. If a routing rule becomes authoritative, this file must be updated through `refer.governance`.

## 3. Compact Return Doctrine

Zo should minimize token use by default.

For general Zo returns:

```md
MODE:
STATUS:
OUTPUT:
STRUCTURAL_RECOMMENDATIONS:
BLOCKERS:
NEXT_ACTION:
```

For Codex-to-Zo bridge prompts:

```md
MODE:
STATUS:
CONTRACT:
STRUCTURE_CHANGE_REQUESTS:
IMPLEMENTATION_NOTES:
BLOCKERS:
```

For capability checks:

```md
MODE: Capability Check
CONFIRMED:
OBSERVED:
INFERRED:
UNKNOWN:
BLOCKED:
NEXT_TEST:
```

Default verbosity budgets:

- `brief`: 150-300 words
- `contract`: 500-900 words
- `full`: explicit request only

## 4. Mutation Boundary

Zo should default to non-mutating output unless the user or orchestrating agent explicitly asks Zo to edit, update, create, delete, publish, deploy, or run state-changing commands.

If a mutation request is unclear, Zo should ask one short clarifying question.

Zo Space mutation does not authorize mutation of Telechurch, Supabase, Cloudflare, GitHub, local repos, or production infrastructure unless the governing app and provider laws also authorize that action.

## 5. Evidence Boundary

Zo capability claims must be labeled according to evidence:

- `Confirmed`: official Zo docs or product sources
- `Observed`: hands-on test or screenshot
- `Inferred`: reasonable from confirmed or observed evidence
- `Unknown`: not established
- `Blocked`: cannot be tested or access is missing

Operationally important claims should update:

- `E:/refer/zo-computer/zo-validation-log.md`
- the relevant Zo corpus file under `E:/refer/zo-computer/**`

## 6. Specialist Skill Relationship

Specialist Zo skills may package repeatable behavior, but they do not own authority.

For Telechurch visual design, the specialist skill is:

- `E:/refer/zo-computer/skills/zo-design-driver/SKILL.md`
- `E:/refer/zo-computer/skills/telechurch-figma-design-driver/SKILL.md`

`zo-design-driver` contains platform-agnostic design principles. Scoped app overlays, such as the Telechurch design driver, must not duplicate universal principles unless the scoped rule intentionally narrows them.

Telechurch visual work should still obey app-local law, including the prototype-first path:

`prototype -> approval -> contract -> wiring`

## 7. Cross-References

- `refer.plan.md`
- `refer.flow.md`
- `refer.skills.md`
- `refer.providers.md`
- `refer.systems.security.md`
- `E:/refer/zo-computer/zo-master-knowledge-base.md`
- `E:/refer/captains-bridge/README.md`
