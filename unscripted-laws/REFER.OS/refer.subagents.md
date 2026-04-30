# Law 73: refer.subagents.md - Subagent Architecture

Purpose
Define the canonical subagent model for REFER.OS so intake, governance, execution, verification, and publishing remain distinct and lawful.

Core principle
Subagents are acting roles. `refer.*` documents are governing law. The actor and the law must not be conflated.

Examples:

- `plan-agent` follows `refer.plan.md`
- `mind-agent` follows the relevant build/combing/migrate law
- `spirit-agent` follows the relevant spirit/cloudflare/runtime law
- `body-agent` follows the relevant implementation realization law; when `refer.figma` is active, design authority remains with Figma and `body-agent` realizes rather than governs design
- `publish-agent` follows the relevant publish/release law

## Article 73.1: Control Plane vs Execution Plane

REFER.OS separates deciding from doing.

Control plane roles:

- `plan-agent`
- `governance-agent`
- `publish-agent`

Execution plane roles:

- `mind-agent`
- `spirit-agent`
- `body-agent`

Control plane roles classify, route, authorize, and release.
Execution plane roles materialize governed change inside their owned domains.

## Article 73.2: Active work modes

Every actionable request must be placed into exactly one active mode at a time:

- `Explore`
- `Build`
- `Combing`
- `QC`
- `Governance`
- `Publish`

Rules:

- A request may have only one active mode at a time.
- Mode must be explicitly declared before mutation begins.
- Mode transitions must be explicit and lawful.

Legacy alias:

- `Repair` remains accepted as a legacy alias for `Combing`.

## Article 73.3: The Front Door

`plan-agent` is the mandatory first-contact acting role for unspecified governed requests.

`plan-agent` responsibilities:

1. Classify the moment.
2. Bind the governing `refer.*` law.
3. Assign one primary owner.
4. Declare secondary owners when multi-domain coordination is required.
5. Determine whether the request remains `Explore`, qualifies as No-register code, or must become a registered Plan.

`Explore` is a mode, not an ownership role.

## Article 73.4: Ownership law

Each actionable request must have one primary owner.

Primary ownership domains:

- `governance-agent`
- `mind-agent`
- `spirit-agent`
- `body-agent`
- `publish-agent`

If multiple domains are involved, `plan-agent` must declare:

- `primary_owner`
- `secondary_owners`
- `coordination_intent`

Cross-domain work may not proceed under assumed shared ownership.

## Article 73.5: Domain boundaries

### Section 73.5.1: governance-agent

Owns law, policy, router, identity, and governance reference mutation.

Typical surfaces:

- `REFER.OS/**`
- repo governance in `AGENTS.md`
- app-scoped governance in `refer.app/**`

### Section 73.5.2: mind-agent

Owns durable truth, workflow logic, repositories, migrations, and relational authority.

Typical surfaces:

- `src/app/workflows/**`
- `src/app/core/**`
- `supabase/**`

### Section 73.5.3: spirit-agent

Owns edge/runtime routing, realtime coordination, cache/transport, webhook ingress, and live shared-state sequencing.

Typical surfaces:

- `wrangler/**`
- `refer.app/spirit/**`
- Spirit-facing runtime surfaces

### Section 73.5.4: body-agent

Owns UI realization, Angular surfaces, components, selectors, stores, and presentation structure.

When `refer.figma` is active, `body-agent` does not become independent design authority. It realizes the approved design inside the implementation framework.

Typical surfaces:

- `src/app/features/**`
- `src/app/plans/**`

### Section 73.5.5: publish-agent

Owns release sequencing, branch/merge/publish control, and production promotion.

Typical surfaces:

- branch/publish scripts
- QC evidence and reports
- GitHub/Cloudflare release flows

## Article 73.6: Combing and QC

`Combing` and `QC` are work modes, not standing ownership agents.

### Section 73.6.1: Combing

Combing is recursive alignment work on existing behavior.

Rules:

- There is no local repair by default.
- A visible defect is an entry signal into combing, not the natural boundary of work.
- Combing routes by ownership domain.

Subtypes:

- corrective combing
- alignment combing

### Section 73.6.2: QC

QC is verification work.

Rules:

- QC may be requested directly.
- QC routes to the owning domain being verified.
- QC never introduces new behavior.
- `publish-agent` may not proceed without explicit QC pass.

## Article 73.7: Autonomous execution

The plan is the approval artifact for implementation authority.

Rules:

- A ratified plan authorizes autonomous implementation inside declared scope.
- Agents may infer bounded decisions when the inference is necessary to complete the plan, consistent with prior alignment, and inside declared scope.
- Agents must pause when scope escape, governance change, destructive out-of-plan risk, or ownership ambiguity appears.

## Article 73.8: Publish authority

Publishing is explicit.

Rules:

- Autonomous implementation does not imply autonomous publish.
- `publish-agent` acts only on explicit publish intent.
- Publish authority is repository-relative, not session-relative.
- `publish-agent` evaluates repo state, branch state, plan state, QC evidence, and governed artifacts as the source of truth.
- Work performed in other sessions may be treated as eligible if repo/governed state supports it.

## Article 73.9: Visibility doctrine

Subagent orchestration should remain mostly behind the scenes by default.

Default user-visible output should be limited to:

- current mode
- primary owner
- current action
- next action
- blocker/risk only when needed

Do not expose internal routing chatter unless clarification, approval, or risk requires it.

## Article 73.10: Instantiation model

Named agents are always routing identities.

They may also be instantiated as isolated worker contexts when task weight, scope isolation, or execution clarity benefits from delegation.

Rules:

- routing identity is mandatory
- spawned worker instantiation is optional and situational
- spawned workers remain subordinate to the same governing law as their parent route

## Article 73.11: Concurrent worker doctrine

Concurrent spawning is lawful only when it increases throughput without collapsing ownership clarity.

Concurrency classes:

- `single-owner local execution`
  - default mode
  - no spawned workers unless material benefit is clear
- `parallel read delegation`
  - for bounded discovery, doc lookup, repo search, or audit work
  - spawned workers remain read-only
- `parallel write delegation`
  - lawful only when write scopes are explicitly disjoint
  - each worker must receive explicit file/module ownership
- `orchestrated multi-agent execution`
  - one primary owner integrates outputs from multiple workers
  - QC cannot pass until integration is complete

Rules:

- Parallelism is for disjoint work, not vague "more thinking".
- The parent route must declare:
  - `primary_owner`
  - `secondary_owners`
  - `coordination_intent`
  - worker scope or path ownership
- Workers may not mutate overlapping write scopes without explicit coordination law.
- If the immediate next critical-path step depends on the result, prefer local execution over delegation.
- The parent route remains responsible for plan sync, QC aggregation, and final integration.

### Section 73.11.0: Orchestration law for `multi-domain`

When Planner selects `multi-domain`, execution must follow an orchestration model rather than ad hoc delegation.

Roles:

- `orchestrator`
  - coordination role only
  - responsible for assignment, sequencing, integration, and QC aggregation
- `domain agents`
  - peer lawful executors with equal capability standing under REFER
  - typical domains may include:
    - `spirit-agent`
    - `body-agent`
    - `mind-agent`
    - other app-lawful domain agents

Rules:

- The orchestrator is not a superior intelligence class; it is a coordination role.
- Domain agents are peers in capability and lawful standing.
- Differences between agents are scope and ownership, not trust rank.
- All agents remain equally bound to the same universal and local REFER law.

Required orchestration record for `multi-domain` execution:

- `execution_mode: multi-domain`
- `orchestrator`
- `primary_owner`
- `secondary_owners`
- `coordination_intent`
- domain ownership map

### Section 73.11.0.1: Domain execution contract

When `multi-domain` execution is active:

- each domain agent receives a clearly bounded owned surface
- each domain agent may execute autonomously inside that owned surface
- no domain agent may claim another domain's owned surface without explicit reassignment
- shared surfaces remain with the orchestrator unless explicitly delegated

Domain surfaces may be defined by:

- file paths
- directories
- provider surfaces
- runtime/platform surfaces
- app-law domain boundaries

### Section 73.11.0.2: Live mutation sequencing

Workspace isolation does not imply external platform isolation.

Rules:

- preparation work may proceed in parallel when disjoint
- live external mutation must be executed only by:
  - the owning domain agent, or
  - the orchestrator when sequencing across domains is required
- if multiple domain changes affect one live release chain, the orchestrator must sequence the mutations

Examples:

- UI code may prepare in parallel with Supabase function code and Cloudflare worker code
- deploy, push, apply, or publish actions against live providers must still respect ownership and sequence

### Section 73.11.0.2a: Implementation state model

For concurrent work, REFER distinguishes between isolated work, integrated repo truth, live provider mutation, and published state.

States:

- `isolated`
  - work exists only in an agent-local or worker-local execution context
  - it is not yet authoritative repo truth
- `integrated`
  - work has been accepted into the active repo/worktree
  - it is now the current local source of truth
- `provider-live`
  - a real external mutation has been executed against a provider or remote platform
  - examples: deploy, db push, function deploy, remote config mutation
- `published`
  - the governed release path has completed and the resulting state is considered released

Rules:

- `isolated` does not imply harmlessness if the task includes live provider commands.
- For code and local files, the guard between `isolated` and `integrated` is acceptance into the active repo state.
- For external systems, the guard between `integrated` and `provider-live` is the actual remote mutation command.
- `published` is a later release state, not a synonym for `integrated`.

### Section 73.11.0.2b: Integration guard

Integration means the worker result is accepted into the main active repo/worktree and becomes the current local truth.

Integration may occur by:

- applying the worker's accepted edit/diff
- merging the worker's accepted change into the active repo state
- selectively accepting and refining worker output before it becomes local truth

Integration does not require:

- manual rewrite from scratch
- immediate commit
- immediate publish

Rules:

- before integration, worker output is proposal state
- after integration, it is authoritative local repo state
- commit, provider mutation, and publish remain separate downstream guards

Residue rule:

- Integration must leave a coherent repo state with no worker-local scratch residue.
- After integration, only these may remain:
  - accepted implementation changes
  - governed artifacts intentionally created by the work
  - normal repo-native evidence such as migrations, plan updates, or QC artifacts when they are part of the lawful change
- These must not remain after integration:
  - duplicate scratch files
  - abandoned alternate implementations
  - worker-only temporary files
  - partial merge debris or unresolved proposal artifacts

### Section 73.11.0.3: Efficiency test

`multi-domain` execution is lawful only if it is expected to outperform `single-agent` execution after integration cost is considered.

Prefer `multi-domain` when:

- domain work is naturally disjoint
- provider surfaces are separate
- integration points are few and named

Prefer `single-agent` when:

- work is mostly sequential
- integration cost is high
- one agent can complete the work faster than coordination overhead would allow

### Section 73.11.1: Spawn thresholds

Spawned workers are recommended when at least one of these is true:

- multiple external/provider/doc questions can be resolved independently
- multiple code changes have disjoint write scopes
- verification can run in parallel with ongoing implementation

Spawned workers are discouraged when:

- the work is tightly coupled and integration-heavy
- the next step is blocked on the delegated result
- scope ownership cannot be stated precisely

### Section 73.11.2: Write-scope law

Before any write-capable worker starts, the parent route must define a disjoint ownership boundary such as:

- specific files
- specific directories
- a clearly isolated module or provider surface

Rules:

- No worker may revert or overwrite another worker's unrelated edits.
- If overlap appears, the parent route must halt concurrent write execution and reconcile ownership first.
- Shared files should remain under the parent route unless an explicit coordinator step assigns them.

### Section 73.11.3: Integration and wait discipline

Rules:

- Do not wait on workers reflexively.
- While workers run, the parent route should continue non-overlapping work.
- Wait only when the critical path is blocked on the worker result.
- Completed worker outputs must be reviewed quickly before integration.

### Section 73.11.4: QC aggregation

When concurrent workers are used:

- QC remains one mode with one owning route
- the parent route must aggregate:
  - changed surfaces
  - verification evidence
  - residual risks from each worker
- publish eligibility remains blocked until the integrated repo state passes QC

## Article 73.12: Canonical execution schema

Every actionable request should be representable as:

```text
request
-> mode
-> law
-> primary_owner
-> secondary_owners
-> ratification_state
-> execution_authority
-> QC_requirement
-> publish_eligibility
```
