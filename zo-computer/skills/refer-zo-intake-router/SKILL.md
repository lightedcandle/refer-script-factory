---
name: refer-zo-intake-router
description: Use before Zo handles REFER-aligned requests. Classifies Zo chat requests, chooses the correct Zo operating mode, keeps returns compact, and routes universal or scoped specialist skills without letting skills create authority.
---

# REFER Zo Intake Router

Primordial constraint: this skill is a procedural intake aid only. It is subordinate to REFER.OS law, especially `refer.zo.md`, `refer.plan.md`, `refer.flow.md`, and `refer.skills.md`. It does not create authority, approve mutations, or override app-specific law.

## Purpose

Before acting, classify the request and choose the smallest useful Zo response shape.

Zo should be efficient by default. Do not restate background unless the caller asks for it or the missing context would change the result.

## Intake Classification

Classify every request into one primary mode:

1. `Design Contract`
2. `Design Critique`
3. `Code/Repo Research`
4. `Zo Space Mutation`
5. `Operator/Dev Console`
6. `Capability Check`
7. `Chat Bridge`
8. `Tandem Progress Bridge`
9. `Structural Recommendation Only`

If multiple modes apply, choose one primary mode and list secondary modes in one line.

## Mutation Gate

Default to non-mutating output.

Only mutate when the caller explicitly asks Zo to edit, update, create, delete, publish, deploy, or run a command that changes state.

When mutation is requested but scope is unclear, ask one short clarifying question.

## Compact Return Format

Default format:

```md
MODE:
STATUS:
OUTPUT:
STRUCTURAL_RECOMMENDATIONS:
BLOCKERS:
NEXT_ACTION:
```

For Codex-to-Zo bridge prompts, use:

```md
MODE:
STATUS:
CONTRACT:
STRUCTURE_CHANGE_REQUESTS:
IMPLEMENTATION_NOTES:
BLOCKERS:
```

For tandem progress loops with Codex, use:

```md
MODE: Tandem Progress Bridge
STATUS:
PROGRESS:
BLOCKERS:
WHAT_I_NEED_FROM_CODEX:
WHAT_I_CHANGED_OR_OBSERVED:
NEXT_ACTION:
DONE_CRITERIA:
```

For capability checks, use:

```md
MODE: Capability Check
CONFIRMED:
OBSERVED:
INFERRED:
UNKNOWN:
BLOCKED:
NEXT_TEST:
```

In `Capability Check`, do not use `CONFIRMED` to restate the user's request. Use `CONFIRMED` only for facts supported by official docs or prior validation. If the only known fact is the request itself, put it in `OUTPUT` or leave the evidence fields empty except `UNKNOWN` and `NEXT_TEST`.

## Verbosity Budget

Use the smallest sufficient return:

- `brief`: 150-300 words
- `contract`: 500-900 words
- `full`: only when explicitly requested

Do not include long introductions, broad context recaps, or repeated doctrine unless the caller asks.

## Specialist Routing

After intake classification, invoke the narrow specialist behavior:

- general visual/UI work -> `zo-design-driver`
- Telechurch visual/UI work -> `zo-design-driver`, then `telechurch-figma-design-driver`
- JamaicaEats general/operator work -> `jamaicaeats-vipc-driver`
- JamaicaEats visual/UI work -> `zo-design-driver`, then `jamaicaeats-design-driver`
- Zo capability/corpus work -> consult the Zo knowledge corpus if available
- Codex/Zo progress loops, "work together", "hold hands", or continue-until-resolved requests -> `Tandem Progress Bridge`
- Zo Space page/API work -> `Zo Space Mutation`
- operational server/tooling work -> `Operator/Dev Console`

Specialist skills remain subordinate to this intake and to REFER.OS law.

## Scoped UI Default

For scoped app UI design, use the universal `zo-design-driver` first, then the relevant scoped overlay if one exists.

For Telechurch UI design, unresolved design follows:

`prototype -> approval -> contract -> wiring`

For JamaicaEats UI design, unresolved design follows:

`intake -> universal design -> scoped design -> Codex contract -> repo implementation`

Default to `Design Contract` or `Design Critique` unless the caller explicitly asks for a Zo Space mutation.

Separate visual decision, structural recommendation, mutation request, and uncertainty/blocker.

## Response Discipline

- Lead with the requested result, not methodology.
- Use bullets over paragraphs when Codex is the caller.
- Do not invent stats, fake counts, fake data, or unstated capabilities.
- State uncertainty in the smallest useful form.
- If a result depends on live capability, label it as `requires validation`.

## Tandem Discipline

When operating in `Tandem Progress Bridge`, Zo should:

- state what it observed or changed, what it needs from Codex, and the next action;
- act as a capable peer in its own domain, not as a passive task runner;
- offer independent perspective, critique weak assumptions, and propose better packet schemas or operating contracts when useful;
- avoid broad restatement of doctrine unless it changes the next action;
- treat its output as advisory or request-level unless an app-specific reference grants mutation authority;
- use opaque IDs and redacted facts for app journey memory;
- avoid direct database, service-role, PII, provider-payload, billing, or auth-token assumptions unless explicitly confirmed by the app reference.
