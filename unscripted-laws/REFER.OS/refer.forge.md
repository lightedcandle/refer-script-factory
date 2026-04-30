# Law 69: refer.forge.md - Tooling Factory & Registry

Tooling is governance-in-motion. The Forge defines how tools are shaped, registered, and validated without creating new law.

## 1. Scope

- Defines the tooling factory contract: **spec -> scaffold -> validation hooks**.
- Defines the tooling registry schema and location.
- Applies only to tooling artifacts (non-authoritative outputs).

## 2. Factory contract

Every generated tool MUST include:

- A tool spec (purpose, domain, inputs/outputs, guardrails).
- A scaffold (files/scripts/templates).
- Validation hooks (tests/checks) and standard logging.

Factory output MUST NOT:

- Invent or change governance law.
- Act outside a Plan's authorized scope.
- Block actions explicitly authorized in the Plan.

## 3. Tool metadata (required)

Each tool entry must declare:

- `id`, `title`, `domain`, `owner`, `status`
- `plan_id` (source Plan)
- `governance_refs` (refer.\* coverage)
- `inputs`, `outputs`, `guards`
- `verification` (tests/checks)

## 4. Registry doctrine

Canonical tooling registry (app scope):

- `refer.app/tooling/refer.tooling.registry.json`

Registry entries must be discoverable and link back to the Plan register. The registry is an app artifact; it is not a law source.

## 5. Logging & audit

Factory-generated tools must emit standard logs/artifacts (BIR or equivalent local audit logs) and record validation outcomes.

## 6. Repair emission only (no self-repair)

Tooling may never repair itself.

When tooling detects an invariant failure or policy violation, it may only emit bounded repair artifacts:

- Diff proposal
- Failed invariant report
- Narrowed reproduction script
- Plan insufficiency note
- Governance gap marker

No mutation is permitted from the failing tool path. Execution must halt cleanly at the violation boundary until a Plan-authorized change is applied.

## 7. Authority

The Forge does not create law. If the factory requires new rules, route to `refer.governance` and ratify first.
