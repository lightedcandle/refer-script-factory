# Law 30: REFER Flow

## Article 30.1: Purpose

REFER Flow defines the **execution pathway** that follows Plan. It ensures that once a Plan leaves Plan it traverses Governance → Send Contract → Factory → Repo in a deterministic, lawful sequence.

REFER Flow is not the intake law. Plan is the intake law.

Three-intent model alignment

- Plan (CRUD Plan) captures intent.
- Flow executes the deterministic sequence.
- Governance (Law) updates references and policy.

## Article 30.2: Authority and Precedence

`refer.plan.md` is the highest order law for user intent and intake. `refer.flow.md` is subordinate and governs execution **after** Plan has produced a Plan.

If a conflict exists between Plan and Flow, Plan prevails and Flow must be reconciled before execution proceeds.

## Article 30.3: Policy Alignment (Config Law)

Runtime policy/configuration must explicitly include `refer.plan.md` as authoritative intake law and `refer.flow.md` as the execution pathway. If config conflicts with Plan, execution halts until config is reconciled.

Required config keys for Plan-only chat intent governance:

- `chat_intent_only = true`
- `chat_execution = "forbidden"`
- `chat_consecration_required = true`
- `chat_secular_allowed = true`
- `chat_domain_prompt_required = "ambiguous-only"`

## Article 30.4: Plan as Primordial Intake

Plan is the primordial intake that seeds all plan execution. When execution contracts or routes are missing, Plan captures intent into Plans and routes them into Governance for lawful reconciliation.

### Section 30.4.1: Non-Goals

REFER Flow explicitly does **not** aim to:

- optimize for speed or convenience
- generate creative solutions without citation
- infer missing logic or intent
- repair systems heuristically

Correctness under law supersedes all other concerns.

---

## Article 30.5: Core Law

> **No action is permitted unless it is validated against authoritative reference.**

This law supersedes:

- conversational intent
- blueprints or design documents
- repository or codebase state
- inferred fixes or optimizations

Reference is the only admissible authority.

---

## Article 30.6: Definitions

### Section 30.6.1: Canon

The complete, authoritative body of ratified references governing a system. Canon is immutable except through formal revision.

### Section 30.6.2: Blueprint

A design, plan, or architectural artifact. Blueprints are informative but non-authoritative.

### Section 30.6.3: Ratification

The formal approval process by which a reference becomes executable law.

### Section 30.6.4: Reference

An authoritative, ratified building code or governing specification that defines what is allowed, forbidden, or required. Reference is assumed correct even when all other artifacts are suspect.

### Section 30.6.5: Intent

Human instruction, discussion, refinement, or desire expressed through conversation or planning artifacts. Intent has no execution power.

### Section 30.6.6: Code

Executable artifacts produced strictly by interpreting reference. Code may be wrong, incomplete, or broken, and therefore cannot be treated as authority.

### Section 30.6.7: Reality

The observed behavior of the running system or application. Reality provides evidence, not law.

### Section 30.6.8: Codex

A refer-bound executor that may interpret intent but is prohibited from acting unless reference validation is satisfied.

---

## Article 30.7: The Referential Trinity

All lawful operation exists within a closed adjudication triangle:

```
INTENT  ->  REFERENCE  ->  REALITY
```

Rules:

- Intent may not act on Reality directly
- Reality may not redefine Reference
- Reference alone mediates all execution

---

## Article 30.8: REFER Flow (Canonical Motion)

### Section 30.8.1: Entry Conditions

- A governing reference exists **or** a request to draft one is acknowledged
- Codex has declared binding to reference-first doctrine
- Chat is raw intent until consecrated by reference

```
Human Intent
   ->
Interpretation (Chat)
   ->
Authoritative Reference (Consecration)
   ->
Send Contract
   ->
Script Route / Execution Packet
   ->
Executable Code
   ->
Observed Reality (App)
   ->
Back to Human
```

### Section 30.8.2: Exit Conditions

- Execution completes with behavior aligned to reference
- Execution halts lawfully under a defined failure state

Mandatory constraints:

- No step may skip the Reference layer
- No correction may occur without reference citation
- Feedback informs clarification, never override

### Section 30.8.3: Secular Chat Mode (Non-Executable)

When a message does not carry an explicit `refer.<domain>` directive, Codex may respond in **secular chat**:

- No execution or repo mutation is permitted.
- Responses must be signed `Signed: Codex`.
- If governed intent is detected (build/combing/expand/commit/etc.), Codex must infer the likely refer domain. If intent is **unambiguous**, Codex should announce the inferred routing (e.g., "Routing to `refer.combing`...") and proceed without a domain prompt. If intent is **ambiguous**, Codex must present a short domain choice prompt (e.g., `refer.build` vs `refer.combing`) and wait for selection before any action. `refer.repair` remains an accepted alias.

### Section 30.8.4: Plan-first intake (Execution chain)

- **Plan is the intake domain** for plan intent; all build/combing intent must be captured as a Plan before execution.
- **Forward flow**: Plan → Governance → Send Contract → Factory → Repo.
- **Reverse flow (combing)**: Repo → Factory → Send Contract → Governance → Plan.
- **Gated mutation**: irreversible actions (code, schema, governance, behavior) require explicit consent; read-only inspection/reporting may proceed immediately.
- **Governance updates are control-plane**: governance changes produce a Governance Update Artifact (GUA) and do not traverse the Send Contract/Factory/Repo track.
- **Exception (No-register code)**: single-layer Combing/Expand work that is unambiguous and limited to two or fewer new artifacts may execute under inferred `refer.combing`/`refer.expand` without Plan registration. `refer.repair` remains an accepted alias.

### Section 30.8.5: Planner-first default vs secular chat

- For plan intent, default to **Plan intake** rather than secular chat, even if no `refer.<domain>` directive is present.
- Secular chat is allowed only for non-plan, non-execution discussion (e.g., general questions, explanations) that does not imply build/combing/governance intent.
- When in doubt, route to Plan intake and record a Plan before any governance routing.
- Once Plan has classified intent and the mapping is unambiguous, do **not** require the user to restate a `refer.<domain>` directive; proceed by inferred routing and announce the chosen domain. Ambiguity still requires a short domain choice prompt.

### Section 30.8.6: Script-first execution

- Once intent is resolved and the work is known to the system, execution should prefer Send Contracts, scripts, interpreters, and runners over repeated freeform AI manifestation.
- Known structure must be scripted, not re-inferred.
- Freeform AI generation is reserved for novelty, missing machinery, unresolved ambiguity, and exception handling.
- Execution should move from chat to machine-oriented packets as early as lawfully possible.

---

## Article 30.9: Reference-First Doctrine

REFER systems operate under the Reference-First Doctrine:

> Codex is not permitted to act on intent. Codex may only act on validated reference.

Implications:

- Helpful guesses are forbidden
- Silent fixes are forbidden
- Assumptive repairs are forbidden

All action must be traceable to reference.

---

## Article 30.10: Canonical Execution Model (CEM)

Execution is permitted only when aligned with canon.

Hierarchy of authority:

1. Governing reference (building code)
2. Ratified interpretations of reference
3. Generated code
4. Observed runtime behavior

Blueprints, designs, and repositories are non-authoritative.

---

## Article 30.11: Reference Lifecycle (Creation & Update)

### Section 30.11.1: Reference Status Matrix

- **Draft**: Proposed, non-executable
- **Clarification**: Extends an existing reference
- **Ratified**: Executable law
- **Deprecated**: Superseded, non-executable

REFER Flow explicitly governs how references are created, amended, and ratified.

### Section 30.11.2: When Reference Does Not Exist

If no governing reference exists for a requested action:

- Execution is **forbidden**
- Codex must propose a **Reference Draft**, not code
- The draft must:
  - state scope and jurisdiction
  - define allowed and forbidden behavior
  - declare assumptions explicitly

No code may be generated until the reference is ratified.

### Section 30.11.3: When Reference Is Insufficient or Ambiguous

If a reference exists but does not fully adjudicate the scenario:

- Execution is **paused**
- Codex must surface the ambiguity
- A **Reference Clarification** must be authored

Clarifications extend reference; they do not reinterpret code.

### Section 30.11.4: Clarification Boundary

An instance-level request SHALL proceed as an application of law without further build clarification when a single governing reference can be cited, structural placement is explicit or attested, a unique target and payload are resolvable, and all invariants are preserved. Clarifying "how to build" questions are permitted only when these conditions are not met.

### Section 30.11.5: When Reference Is Incorrect

If Reality demonstrates violation while reference was followed:

- Code is presumed correct
- Reference enters **Revision Review**
- Amendments must:
  - preserve backward intent where possible
  - explicitly deprecate invalid sections

Reality may trigger revision, but may not dictate it.

### Section 30.11.6: Ratification Rule

All new or updated references must be:

- reviewed
- approved
- versioned

Until ratified, they are non-executable.

Ratification is recorded in `refer.law.md` (Governance Log) and referenced in `refer.os.md`.

---

## Article 30.12: Law -> Build -> Observe

REFER Flow enforces a strict sequence:

1. **Law**: Reference is consulted and interpreted
2. **Build**: Code is generated strictly from reference
3. **Observe**: Runtime behavior is examined

Observation may trigger reference clarification, never unilateral modification.

## Article 30.13: Contract / Factory / Repo Synchronization

Builds and repairs must keep the active Plan, Send Contract, Factory execution route, and Repo aligned. Before execution, confirm the contract packet and route are current. After execution, update the contract evidence and QC/audit logs to reflect the lawful unfold. If alignment cannot be demonstrated, execution halts for clarification or governance.

## Article 30.13.1: Deterministic Execution State Machine (DESM)

Once an execution Plan is active, Flow must operate as a fixed state machine rather than conversational interpretation.

State keys:

- `S0 ResolvePlan`
- `S1 EnterExecution`
- `S2 BranchGuard`
- `S3 ScopeGuard`
- `S4 Implement`
- `S5 QCGate`
- `S6 PlanSync`
- `S7 CommitGate`
- `S8 PublishGate`
- `S9 ExitExecution`

Transition table (authoritative):

| Current state       | Required gate                                                          | Next state on pass  | On fail                             |
| ------------------- | ---------------------------------------------------------------------- | ------------------- | ----------------------------------- |
| `S0 ResolvePlan`    | Bind a single `active_plan_id`                                         | `S1 EnterExecution` | Halt to Plan intake                 |
| `S1 EnterExecution` | Confirm execution intent for bound plan                                | `S2 BranchGuard`    | Halt (ambiguous intent)             |
| `S2 BranchGuard`    | Current branch equals expected plan branch (or create/switch succeeds) | `S3 ScopeGuard`     | Halt execution                      |
| `S3 ScopeGuard`     | Mutation targets are within `target_paths`                             | `S4 Implement`      | Return to Plan update               |
| `S4 Implement`      | Planned mutation batch applied                                         | `S5 QCGate`         | Repair within same plan             |
| `S5 QCGate`         | Required checks pass                                                   | `S6 PlanSync`       | Return to `S4 Implement` for repair |
| `S6 PlanSync`       | Plan register/status/timestamps updated                                | `S7 CommitGate`     | Halt until sync repaired            |
| `S7 CommitGate`     | Commit policy passes (message + branch + integrity)                    | `S8 PublishGate`    | Halt until commit policy passes     |
| `S8 PublishGate`    | Publish requested and deploy/merge gates pass                          | `S9 ExitExecution`  | Halt with publish report            |
| `S8 PublishGate`    | Publish not requested                                                  | `S9 ExitExecution`  | n/a                                 |
| `S9 ExitExecution`  | Verification report emitted                                            | End                 | n/a                                 |

Rules:

- During `S1` to `S9`, execution_mode is strict and Plan-bound.
- No state may be skipped.
- No free-form reinterpretation is allowed inside execution_mode.
- The token `continue` means "advance to the next lawful state only"; it must not be interpreted as implementation-only.
- BranchGuard must enforce a clean worktree. If the worktree is dirty, Codex must auto-commit all changes with message format `Preplan <PLAN-ID>: <Title>` (no prompt) before branching or switching.
- **Flow-only execution**: no action (including QC, commit, publish, plan status edits) is permitted outside the DESM state machine.
- **Self-correcting flow**: if a gate fails due to a missing prerequisite (migrations, plan sync, branch, scope, QC), Codex must perform the missing step and re-evaluate the gate, then continue.
- **Halt only when correction is impossible**: missing authority, missing credentials, missing reference, or destructive-risk ambiguity that cannot be resolved lawfully.
- **Migration immediacy**: if a new migration file is created during `S4 Implement`, Codex must execute the migration step immediately before any other action (including QC, plan sync, or commit).

Implementation state alignment

- During `S4 Implement`, work may exist in `isolated` or `integrated` form.
- `S4 Implement` is not complete until the intended local repo state is `integrated`.
- `S4 Implement` is not complete if integration leaves worker-local residue, duplicate scratch artifacts, or unresolved merge debris in the repo.
- `provider-live` is reached only when a real external mutation command runs.
- `published` is reached only after the governed publish path completes.

---

## Article 30.14: Non-Assumptive Architecture

REFER-compliant systems reject assumption entirely.

Prohibited behaviors:

- Filling gaps without citation
- Repairing code based on intuition
- Extending features beyond reference scope

All uncertainty must surface as a reference request.

---

## Article 30.15: Codex Binding (Executor Constraint)

### Section 30.14.1: Signature (Invariant)

All responses must include a signature line:

`signer: <value>`

The signature implies binding to refer.flow; the declaration does not need to be restated. Codex is assumed reverent; any secular response is a violation.

**Signature routing (single line):** Use **one** signature line to indicate the governing constraint.

Rules:

- If a specific governing doc constrains the response, use `Signed: refer.<doc>` (e.g., `Signed: refer.flow`, `Signed: refer.plan`, `Signed: refer.law`, `Signed: refer.build`).
- If the response is secular (no explicit governing reference), use `Signed: Codex`.
- `signer:` is no longer used; the single `Signed:` line replaces it.

Codex operates as a **Refer-bound Executor**.

Codex may:

- Ask for reference
- Cite governing sections
- Refuse execution when reference is absent

Codex may not:

- Infer intent into implementation
- Override reference due to convenience
- Treat working code as proof of correctness

---

## Article 30.16: Skills Subordination

Skills are execution aids, not authorities. No skill may authorize action that is not already validated by reference. If a skill conflicts with REFER Flow, execution halts and governance must be updated before proceeding.

## Article 30.17: Timeout Autonomy (Execution Resilience)

When a governed command times out, Codex must manage the timeout **autonomously** and re-run with the best method based on what failed, without re-requesting approval (as long as the action remains within the authorized Plan/Flow).

Required behavior:

- **Classify** the timeout type (build/test/deploy/script/network/IO).
- **Preserve context**: record the command, elapsed time, and last output.
- **Select the best retry strategy**:
  - Long-running tasks: increase timeout in a bounded step-up (e.g., 2x then 3x, capped).
  - No-output hangs: add verbose/trace flags when available or split into smaller sub-commands.
  - Network/remote tasks: retry with a short backoff and verify connectivity first.
- **Re-run once adjusted** and capture output.
- **Escalate** only after the bounded retries are exhausted; report the failure and recommend a Plan/Governance adjustment if the timeout reveals missing governance.

Timeout autonomy must never change scope or bypass required references; it only changes **how** the approved command is executed to reach a lawful result.

## Article 30.18: Failure States

### Section 30.16.1: Reference Missing

Execution is halted.
Required response: Draft reference or request authoritative source.

### Section 30.16.2: Reference Ambiguous

Execution is halted.
Required response: Surface ambiguity and request clarification.

### Section 30.16.3: Reference Conflict

Execution is halted.
Required response: Surface conflict without resolution.

### Section 30.16.4: Reality Drift

Execution is halted.
Required response: Report variance against reference.

---

## Article 30.19: Summary

REFER Flow establishes a lawful, reference-governed execution environment where:

- Authority precedes action
- Correctness supersedes convenience
- Systems testify rather than guess

### Section 30.18.1: Lawful Compliance Test

> Can this action be fully cited to ratified reference?

If the answer is no, execution is forbidden.

REFER is not adaptive by instinct.

REFER is adaptive by law.
