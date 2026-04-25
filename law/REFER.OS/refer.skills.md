# Law 70: refer.skills.md — Skill Governance & Execution Aids

Skills are reusable execution aids. They do not create authority; they only package lawful procedures already governed by REFER.OS.

## Article 70.1: 1. Purpose

- Define when a skill may be created.
- Constrain skills to lawful, repeatable procedure.
- Prevent skills from overriding or reinterpreting law.

## Article 70.2: 2. Authority & Subordination

- `refer.flow.md` is the primordial law; all skills are subordinate to it.
- Skills must never authorize behavior that is not already permitted by REFER.OS law.
- Skills may not redefine routing, identity, structure, or inference.
- If a skill conflicts with any refer.* document, the skill must be updated or disabled.

### Section 70.2.1: Position in the system

REFER.OS operates as three layers:
1) **Refer (law layer)** — defines what is allowed and the binding order.
2) **Codex reasoning (decision layer)** — interprets intent, applies law, routes domains.
3) **Skills (execution layer)** — perform narrow, repeatable mechanics once law is settled.

### Section 70.2.2: What skills are / are not

Skills are:
- procedural shortcuts,
- mechanical executors,
- repeatable workflow packages.

Skills are not:
- sources of authority,
- decision makers,
- planners,
- interpreters of intent.

### Section 70.2.3: Startup binder precedence

On platforms that support local workspace binders such as `agent.md` and `AGENTS.md`, skills must load beneath those binders.

Startup or bootstrap behavior should ensure:
- local `agent.md` is read before first substantive response when present;
- local `AGENTS.md` is read before first substantive response when present;
- active skills remain subordinate to those binder surfaces;
- skills must not compensate for a missing startup binder by silently acting as constitutions.

## Article 70.3: 3. When a Skill May Be Created

Create a skill only when all conditions are true:
1) A lawful action already exists in REFER.OS (build/repair/migrate/etc.).
2) The procedure is repeatable and benefits from standardized steps.
3) The skill does not add new authority or change scope.
4) The skill can require explicit approval before execution when the inferred domain is ambiguous.

If any condition is false, do not create a skill; update the governing law instead.

### Section 70.3.1: Domain-aligned skills

Skills should map to the PGSFR domains:
- Plan: summarize intent, derive acceptance criteria, expand dependencies.
- Governance: validate MVFs against references, scaffold log entries.
- Blueprint: map structure/boundaries, produce non-scope sections.
- Inference: generate diffs, draft migrations, compile execution steps.
- Repo: apply diffs, run checks, update manifests, commit.

## Article 70.4: 4. Required Skill Structure

Every skill must include:
- A **primordial constraint** line that subordinates it to `refer.flow.md`.
- A **gating step** that honors router inference:
  - If the domain is unambiguous, proceed after announcing the inferred `refer.<domain>`.
  - If ambiguous, require an explicit domain choice before execution.
- A **reference pointer** to the governing refer action doc (e.g., `refer.build.md`).
- A **response signature** that follows the `Signed:` rule from `refer.flow.md`.

### Section 70.4.1: Invocation & traceability

- Skills may only be invoked when intent is recorded and the current domain permits the action.
- Skills must never execute irreversible actions without explicit consent.
- All skill effects must be reflected in Planner updates or downstream artifacts (blueprint/inference/repo).

## Article 70.5: 5. Prohibited Skill Behavior

Skills must not:
- invent new routing rules beyond `refer.md`;
- bypass the execution chain (Send Contract → Factory → Repo);
- execute without honoring the unambiguous/ambiguous routing rule;
- change governing documents unless invoked under `refer.governance`.
- promote MVFs or change domains.
- encode authority, scope, or routing; if they do, promote the rule into governance and remove it from the skill.

## Article 70.6: 6. Skill Lifecycle

- Skills are created or updated only through `refer.governance`.
- Audit skills regularly under `refer.audit.md`.
- If a skill becomes redundant or conflicting, deprecate it and record the decision in `refer.os.md`.
- If a platform requires startup-surface patching so binders are read before skills, that requirement must be recorded in the platform reference and bootstrap metadata.

## Article 70.7: 7. Cross-links

- `refer.flow.md`
- `refer.md`
- `refer.governance.md`
- `refer.audit.md`
