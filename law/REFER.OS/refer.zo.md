# refer.zo.md - Zo Computer Provider and Intake Reference

`refer.zo` governs REFER-aligned use of Zo Computer as a provider, workspace, hosted surface, AI chat surface, and possible operator node.

Zo bootstrap and portable knowledge live in:

- `https://github.com/lightedcandle/refer-zo-bootstrap`
- local clone when present: `E:/refer-zo-bootstrap/**`

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

- `E:/refer-zo-bootstrap/skills/refer-zo-intake-router/SKILL.md`

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

## 4. Zo Script-First Transport Law

Zo chat is not the default transport for machine work.

For Codex-to-Zo, hive, bootstrap, tandem, dispatch, build, verification, and talkback workflows:

1. save the full contract, script, or packet to Zo Files through MCP/API;
2. trigger a short script command through MCP/API;
3. write results to a file or dataset;
4. fetch results through MCP/API;
5. use Zo chat only for a tiny activation prompt or when the live persona/rule model itself must judge the work.

Do not paste full contracts, code, or long result bodies into Zo chat when file/API transport can carry them.

If an ad hoc transfer, command, or chat pattern is repeated, build a reusable script and document it before using it again.

Zo-specific machine tandem work should use isolated datasets:

- `datasets/tandem-contracts/`
- `datasets/tandem-talkback/`
- `datasets/tandem-dispatch/`

Live user Zo activity should remain in the live Zo datasets unless deliberately promoted.

## 5. Zo Limits Ledger

Zo provider limits and observed constraints must be documented.

When Zo MCP/API, Zo Files, Zo chat, Zo automations, Zo Space routes, or local commands produce a size limit, timeout, altered readback format, tool behavior, missing path, or runner mismatch, update:

- `refer-zo-bootstrap/docs/known-limits-and-constraints.md`

The mitigation should become a script, not a repeated workaround.

## 6. Mutation Boundary

Zo should default to non-mutating output unless the user or orchestrating agent explicitly asks Zo to edit, update, create, delete, publish, deploy, or run state-changing commands.

If a mutation request is unclear, Zo should ask one short clarifying question.

Zo Space mutation does not authorize mutation of Telechurch, Supabase, Cloudflare, GitHub, local repos, or production infrastructure unless the governing app and provider laws also authorize that action.

## 7. Evidence Boundary

Zo capability claims must be labeled according to evidence:

- `Confirmed`: official Zo docs or product sources
- `Observed`: hands-on test or screenshot
- `Inferred`: reasonable from confirmed or observed evidence
- `Unknown`: not established
- `Blocked`: cannot be tested or access is missing

Operationally important claims should update:

- the relevant Zo corpus file under `E:/refer-zo-bootstrap/docs/**`
- the standalone bootstrap repo at `https://github.com/lightedcandle/refer-zo-bootstrap`

## 8. Specialist Skill Relationship

Specialist Zo skills may package repeatable behavior, but they do not own authority.

For Telechurch visual design, the specialist skill is:

- `E:/refer-zo-bootstrap/skills/zo-design-driver/SKILL.md`
- `E:/refer-zo-bootstrap/skills/telechurch-figma-design-driver/SKILL.md`

`zo-design-driver` contains platform-agnostic design principles. Scoped app overlays, such as the Telechurch design driver, must not duplicate universal principles unless the scoped rule intentionally narrows them.

Telechurch visual work should still obey app-local law, including the prototype-first path:

`prototype -> approval -> contract -> wiring`

## 9. Cross-References

- `refer.plan.md`
- `refer.flow.md`
- `refer.skills.md`
- `refer.providers.md`
- `refer.systems.security.md`
- `E:/refer-zo-bootstrap/docs/zo-vipc-bootstrap-blueprint.md`
- `E:/refer-zo-bootstrap/docs/file-transport-tandem.md`
- `E:/refer-zo-bootstrap/docs/known-limits-and-constraints.md`
- `E:/refer/captains-bridge/README.md`
