# Law 71: refer.plan.md â€” Planner & Factory Intake

# refer.plan.md

Canonical Planner and Pipeline Flow for REFER.OS

Purpose
This document defines the canonical planning artifact and the end to end execution flow used by Codex inside REFER.OS. It exists to remove ambiguity, reduce model interpretation cost, and ensure that once a plan is clarified it can flow deterministically through governance, Send Contract, Factory execution, and repo without pausing.

Core idea
Chat is not the build system.
Planner is the build contract.
Conversation must remain natural and instantaneous for the human.
Planner and the Factory chain exist to discipline Codex, not the user.

Planner contract doctrine

- Discussion is where ambiguity is burned down.
- Planner is the canonical contract/tracker once scope, authority, and completion are strict enough.
- A Plan is considered spawn-ready when equal-skill executors could act on its bounded packets without reinterpreting intent.
- Do not introduce a second freeform "contract" artifact when the Planner record already contains the strict execution truth; derive execution packets from the Plan itself.
- Execution should resume from Planner/tracker truth, not conversational memory.
- Resolved Plans should condense into a compact **Send Contract** before leaving Planner for script runners, external executors, or downstream bounded packets.

Three-intent model
All user prompts map to one of three intents:

1. **Plan (CRUD Plan Record)** â€” create, read, update, or deprecate Plans in Planner.
2. **Flow (Execution Plan)** â€” execute the deterministic Plan â†’ Governance â†’ Send Contract â†’ Factory â†’ Repo sequence.
3. **Governance (Law)** â€” update refer.\* law and policy artifacts.

Plan is the default intent for chat. Flow and Governance execute only when explicitly requested or unambiguously inferred by the router.

Intent bands (operational):

- **Explore (no register / no code)**: conversational exploration or research; may write notes or references to docs but must not change code or plans.
- **No-register code**: single-layer Combing/Expand work that is unambiguous and small (<=2 new artifacts). Executes under inferred `refer.combing`/`refer.expand` without Plan registration. `refer.repair` remains an accepted alias.
- **Plan-register (multi-layer)**: any prompt that touches 3+ artifacts, adds multiple UI/workflow elements, or otherwise needs multi-step clarification must be upgraded to a Plan for scrutiny.

UI pattern routing note
When a plan requests a borderless, flat, section-surface page style (or asks to mirror an existing seamless page concept), bind visual doctrine to `REFER.OS/refer.seamless-ui.md` during Planner details so structure, responsiveness, and CTA hierarchy stay consistent across pages.

Automatic seamless binding rule

- For any Plan that includes page-level UI composition, section layout, header/footer behavior, chat surfaces, or event/home/org visual flow, Planner must auto-attach `REFER.OS/refer.seamless-ui.md` as a governing reference.
- This binding is default-on and does not require user restatement.
- If a Plan intentionally diverges from seamless doctrine, Planner must record an explicit deviation note and rationale in the Plan record.

Script factory binding rule

- For any Plan or chat that materially involves repeated known structure, portable scripts, interpreters, script registries, codebase assembly, anchors, or reducing repeated AI burn, Planner must auto-attach `REFER.OS/refer.factory.md`, `REFER.OS/refer.engine.md`, and `REFER.OS/refer.efficiency.md`.
- If a request can be satisfied through existing known machinery, Planner should prefer script-first execution packets over repeated prose build instructions.
- Plans that leave Planner for execution should emit a Send Contract that is smaller than the full Plan and suitable for machine/script consumption.

Authority
`refer.plan.md` is the highest order law for user intent and intake. All other refer.\* documents (including `refer.flow.md`) are subordinate to Plan for any conversational or planning behavior.

REFER.OS operates with optimistic interaction and intent-driven mutation.

- Read-only analysis, inspection, and reporting may execute optimistically and immediately.
- Mutations proceed when user intent is clear; Codex only pauses for ambiguity or destructive risk.

Once a feature leaves Planner, the system should not stop unless Governance rejects it as unlawful or incomplete. Execution is autonomous after Plan takeoff.

Key terms

Planner
The canonical intake artifact for plan work. Planner is where intent is clarified through interrogation until there are no open questions. Planner is not a casual task list. It is a plan contract.

Send Contract
A compact machine-oriented derivative of the Plan. A Send Contract carries the bounded execution truth needed by script engines, adapters, runners, or equal-skill executors. It must not introduce new scope beyond the Plan.

Plan
Minimal Viable Feature. The smallest coherent, end to end functional feature that can ship in one pass and can be tested. Plan is the atomic unit that flows through the pipeline.

Plan splitting and convergence
Not all intent enters the system as a single linear Plan. REFER.OS supports intentional splitting and convergence of Plans, similar to dependency management in source control.

Splitting Plans (dependency first)
An Plan must be split when a prerequisite capability, rule, or structure does not yet exist.

Indicators that splitting is required:

- The plan depends on data, permissions, or infrastructure not yet present
- The plan extends a system boundary that is undefined or unstable
- Governance would require speculative assumptions to proceed
- The plan implies multiple distinct user outcomes or more than one modal/sub-flow within a single page-level change

In these cases:

- The prerequisite becomes its own Plan
- The original Plan is rewritten to depend explicitly on the prerequisite Plan
- Prerequisite Plans must complete the full execution flow first

This is analogous to introducing a base commit before a dependent commit.

Converging Plans (extension)
An Plan may explicitly extend one or more completed Plans.

Rules for convergence:

- An Plan may list completed Plans as dependencies
- All dependency Plans must exist in Repo
- Converging Plans may assume dependency behavior as stable

Converging Plans must not:

- Redefine dependency behavior
- Patch missing functionality from dependencies

If a dependency is insufficient, a correction Plan must be created instead.

Planner responsibility
Planner is responsible for detecting when intent should be split into prerequisite Plans versus when it can proceed as a single Plan.

Governance responsibility
Governance validates declared Plan dependencies and enforces execution order.

This ensures REFER.OS evolves through explicit dependency chains rather than hidden coupling.

No-register code threshold (single-layer vs multi-layer)

- **Single-layer**: unambiguous change with **two or fewer new artifacts**. Executes as No-register Repair/Expand.
- **Multi-layer**: three or more new artifacts, or a prompt that adds multiple UI/workflow elements, API calls, or features in one request. Must be upgraded to a Plan.
- If the artifact count is unclear, ask a single clarifying question to determine whether the request is single-layer or multi-layer.

Governance
The authoritative control domain for REFER.OS. Governance validates lawfulness, applies Refer Outflow routing, and maintains REFER law, flow, and policy artifacts.

Governance updates are not Factory-track artifacts.
A governance update is a control-plane change, not a feature build. Governance updates do not traverse the Send Contract / Factory / Repo execution track.

When governance must change:

- A Governance Update Artifact (GUA) is created
- The GUA is authored, reviewed, ratified, and committed within the Governance domain
- The GUA updates law, flow, or reference documents only
- No application feature code is produced

Plan records may depend on completed Governance Update Artifacts, but governance updates themselves do not enter the Send Contract / Factory track.

Refer Outflow
A governance function that routes an Plan based on what it requires next. Outflow is not a build step. It is a decision rule that governs motion between phases.

Send Contract
The compressed machine-readable execution packet derived from Plan. A Send Contract defines bounded targets, inputs, invariants, and allowed motion. It does not invent intent.

Factory
The living execution blueprint that turns Send Contract truth into exact file diffs, migrations, script runs, and implementation steps. Factory does not invent scope.

Repo
The execution step that applies diffs, runs checks, commits, and syncs manifests. Repo does not interpret requirements.

Plan upgrade
A new Plan that extends an existing shipped capability.

Plan correction
A new Plan that fixes a defect or misalignment in a shipped capability.

Repair
A correction Plan that may require tracing backward through phases to discover missing artifacts or missing governance.

Canonical flow

PGSFR domains
REFER.OS operates through five canonical domains. These domains define where intent lives, where decisions are made, and where work is materialized.

PGSFR

- Plan
- Governance
- Send Contract
- Factory
- Repo

These domains are exclusive and ordered. Each domain has a single responsibility and a strict boundary.

Domain definitions

Plan
The only domain where humans and Codex interact conversationally. Plan is where intent is discovered, interrogated, clarified, and recorded as Plans. No other domain allows free conversation.

Governance
The authoritative control domain for REFER.OS. Governance enforces law, validates Plans, applies Refer Outflow routing, and determines whether a Plan requires governance edits or may advance directly to Send Contract.

Send Contract
The first machine structural domain. Send Contract compresses an approved Plan into bounded execution truth. It does not question intent and does not edit governance.

Factory
The execution domain. Factory derives all implementation artifacts, diffs, script routes, and build steps required to realize the Send Contract. Factory does not invent scope or structure.

Repo
The materialization domain. Repo assembles inferred artifacts into a working system through execution, commits, and verification. Repo does not interpret or redesign.

Forward flow
Plan â†’ Governance â†’ Send Contract â†’ Factory â†’ Repo

Reverse flow (Combing)
Combing traverses the same domains in reverse order when necessary:
Repo â†’ Factory â†’ Send Contract â†’ Governance â†’ Plan

Combing uses the same rules as forward flow but moves backward to locate missing or invalid artifacts before continuing forward again. `Repair` remains accepted as a legacy alias.

Phase order

1. Planner
2. Governance
3. Send Contract
4. Factory
5. Repo

Rule
An Plan promoted from Planner must complete the full pipeline unless Governance rejects it. Partial execution is forbidden.

Planner responsibilities

What Planner is
Planner is where conversation is turned into a contract. Interrogation happens here until the Plan is clear, bounded, and testable.

What Planner is not
Planner is not where code is written.
Planner is not where governance is edited.
Planner is not where repo changes occur.
Planner is not a bucket of vague tasks.

Planner outcome
Planner produces Plans that contain everything needed for deterministic routing and build.

Spawn-ready outcome

When a Plan is sufficiently strict, it should be treated as the execution contract/tracker for downstream work. Execution packets, watcher automation state, or actor-specific deltas may reference or extend the Planner record, but must not replace it as canonical truth.

Plan readiness
An Plan is considered ready to leave Planner only when interrogation is complete.\r\n\r\nDeterministic plan intake (fixed global sequence)

- Stage 1: Category. Determine plan type (Governance, Build, or Combing) from prompt context.
- Stage 2: Identity. Determine the name/identity (existing or new) of the plan.
- Stage 3: Description. Plain-language statement of what the plan will accomplish.
- Stage 4: Details. Ask derived questions to reach execution readiness.

Details-stage framing (deterministic count = 3, non-verbatim)

- Build:
  1. Smallest end-to-end outcome for the user.
  2. Non-scope for v1 (what it must not do).
  3. Dependencies/constraints that must remain true.
- Combing:
  1. Current broken behavior and who experiences it.
  2. Expected behavior (smallest fix outcome).
  3. Human verification steps without reading code.
- Governance:
  1. Law/policy/reference to add or change.
  2. What routing/decision it enables or blocks.
  3. Minimal lawful definition/change required.
     Interrogation completion criteria
     Interrogation is not a linear checklist of questions. It is a root-first discovery process designed to identify the core intent and derive inevitable branches without wasting time on obvious or redundant questions.

Root-first interrogation principle
Interrogation must begin with root questions that, once answered, allow downstream details to be derived rather than asked individually.

Codex must prioritize questions that:

- Collapse multiple downstream decisions into one answer
- Reveal intent, constraint, or boundary that determines many consequences
- Eliminate entire branches of unnecessary inquiry

Interrogation mode (strict)

- Root questions are **internal**; translate them into layman, featureâ€‘vision prompts.
- Ask exactly **one** featureâ€‘vision question per turn.
- Focus on â€œwhat the plan doesâ€ and â€œhow it feels in operation,â€ not how it is built.
- Do not ask implementation/mechanics questions (tech stack, storage, pings, thresholds) in Plan.
- Do not ask for repo paths, existing code, or routing directives in Plan.
- Do not propose defaults; do not request confirmation of invented rules.
- Do not repeat a question if the answer is already recorded in the Plan.
- If the user answers multiple root intents in one reply, record all and move to the next missing intent only.\r\n\r\nDeterministic plan intake (fixed global sequence)
- Stage 1: Category. Determine plan type (Governance, Build, or Combing) from prompt context.
- Stage 2: Identity. Determine the name/identity (existing or new) of the plan.
- Stage 3: Description. Plain-language statement of what the plan will accomplish.
- Stage 4: Details. Ask derived questions to reach execution readiness.

Details-stage framing (deterministic count = 3, non-verbatim)

- Build:
  1. Smallest end-to-end outcome for the user.
  2. Non-scope for v1 (what it must not do).
  3. Dependencies/constraints that must remain true.
- Combing:
  1. Current broken behavior and who experiences it.
  2. Expected behavior (smallest fix outcome).
  3. Human verification steps without reading code.
- Governance:
  1. Law/policy/reference to add or change.
  2. What routing/decision it enables or blocks.
  3. Minimal lawful definition/change required.
     Interrogation completion criteria
     Interrogation is complete only when the following root questions have been answered explicitly and recorded in the Plan:

Root questions (internal, not user-facing)

- What problem is being solved and why does it matter now?
- Who is the primary actor and what authority or capability do they have?
- What is the smallest end to end outcome that must exist for this to be considered real?
- What constraint, if changed, would invalidate the feature?
- What existing system, plan, or rule does this depend on?
- What is the lawful execution mode for this plan: `single-agent` or `multi-domain`?

Derived questions (do not ask unless not derivable)
The following questions should only be asked if they cannot be logically derived from root answers:

- What happens before this plan runs?
- What happens after this plan runs?
- What data is required or produced?
- What UI or interaction is exposed?
- If execution is `multi-domain`, which domains are truly disjoint and who should own them?

Verification question

- How can a human verify success without reading code?

Rule
If a derived answer can be inferred safely from root answers and existing system knowledge, Codex must infer it and record it in the Plan rather than asking the user.

Execution-mode trigger

Planner must decide the execution mode before a Plan leaves intake.

Available execution modes:

- `single-agent`
- `multi-domain`

Default:

- `single-agent` is the default

Promote to `multi-domain` only when at least one of these is true:

- two or more domain surfaces can progress independently with low integration risk
- write scopes are disjoint by file, module, or provider surface
- verification or provider-prep work can proceed in parallel with implementation

Remain `single-agent` when any of these is true:

- the work is tightly coupled
- key decisions must be made in sequence
- shared files dominate the implementation
- domain ownership cannot be stated precisely

If `multi-domain` is selected, Planner must also record:

- `primary_owner`
- `secondary_owners`
- `coordination_intent`
- domain, path, or provider ownership notes that explain why the work is safely disjoint
- `orchestrator`

Orchestration trigger for `multi-domain`

If Planner selects `multi-domain`, it must treat orchestration as required, not optional.

Planner must record:

- which role acts as `orchestrator`
- which domain agents are participating
- which surfaces each domain owns
- whether any live external mutation must be sequenced centrally

Planner must reject `multi-domain` readiness if:

- no orchestrator is declared
- domain ownership is ambiguous
- integration points are unnamed
- the plan is actually sequential and would be faster as `single-agent`

Featureâ€‘vision interrogatory (userâ€‘facing question bank)
Ask these in sequence (one per turn), paraphrased for the specific feature:

1. **What will this plan do for the user, endâ€‘toâ€‘end?**
2. **What does â€œdoneâ€ feel like to the user (the smallest version youâ€™d ship)?**
3. **What should it NOT do in v1?**
4. **What existing parts must it work with (login, profiles, payments, meetings, etc.)?**
5. **What rule or promise must stay true for this to still be the same plan?**

Contextualization rule (identity questions)

- Prompts must be contextualized to the feature and phrased as if the AI understands the app.
- Use the Plan title/description to make each question concrete (no generic/agnostic phrasing).
- The template is stored generically, but the asked question must be specific and sensible for the plan.

Example (contextualized)

- Template: â€œWhat will this plan do for the user, endâ€‘toâ€‘end?â€
- Contextualized: â€œIn v1, what should a trainee be able to do from start to finish in /ordination?â€

Single-choice cascade rule

- Each question should request **one answer**.
- Prefer multiple-choice (2â€“4 options) so the user can select a single option.
- Use answers to cascade into the next, narrower question.

Socratic method

- Each question should narrow assumptions by probing intent with a single, concrete choice.
- Avoid leading the user toward implementation details; keep prompts about behavior and experience.
- Use followâ€‘ups that reduce ambiguity, not increase scope.

Option sourcing rule

- Multiple-choice options must be sourced from the Plan title/description or existing Plan register text.
- If no grounded options exist, ask an open â€œOther â€” specifyâ€ question instead of inventing choices.

Prohibited Plan prompts

- Do not ask the user to restate or invoke a domain (no `refer.plan` prompts).
- Do not ask for code locations, file paths, or repo inspection.
- Do not ask about data schemas, APIs, or implementation dependencies in Plan.

Planner extraction rule

- Planner must derive the internal root answers from the userâ€™s vision answers and the Plan title/description.
- The register should store both:
  - **Vision summary** (userâ€‘facing description), and
  - **PSFRâ€‘ready summary** (structured interpretation used downstream).

Autoplan provision (Planner)

- If the user requests autoplan, Codex may complete missing Plan/spec details using best practices.
- Autoplan must not conflict with REFER.OS laws or expand scope beyond stated intent.
- Minimum required inputs before autoplan: problem, primary actor, smallest end-to-end outcome, and a core constraint.
- Codex must clearly mark any assumptions and keep open questions empty only if all root answers are resolved.
- Autoplan is Plan-domain only; it does not bypass Governance/Send Contract/Factory/Repo gates.
- Codex must output a user-friendly natural language report summarizing scope, non-scope, acceptance criteria, dependencies, and verification.

If any root question cannot be answered, interrogation is not complete and the Plan must remain in Planner.

Interrogation is complete only when all of the following questions have been answered explicitly and recorded in the Plan:

- What problem is being solved?
- Who experiences the problem?
- What must happen for the problem to be considered solved?
- What is the smallest end to end behavior that delivers value?
- What happens before this plan runs?
- What happens after this plan runs?
- What is intentionally not being solved?
- How can a human verify success without reading code?
- What existing plan, if any, is this building on or correcting?

If any of these questions cannot be answered, interrogation is not complete and the Plan must remain in Planner.

Readiness conditions
An Plan is considered ready to leave Planner only when:

- The user intent is clear in plain language
- Scope is bounded and small enough to ship in one pass
- Non scope is explicit
- Acceptance criteria are explicit and testable
- Open questions are empty
- Dependencies are declared at a high level
- Interrogation completion criteria are fully satisfied

Gap test (pre-execution)

- Before any Plan execution, run a **gap test** to confirm no missing dependencies, missing artifacts, or missing governance references. If gaps are found, they must be resolved (new Plan or Governance Update) before execution proceeds.
- Mandatory tool invocation for gap test: `tools/plan-readiness-check.cjs` (and `tools/planner-interrogation-check.cjs` when Plan readiness includes root-answer completeness).
- Optional routing report after gap test: `tools/refer-outflow-suggest.cjs` (suggestion only; does not override governance authority).

Spec requirement (Execution gate)

- Any Plan entering execution must include a **Spec**: a plain-language, end-to-end operational walkthrough that describes how the feature works as if touring the app.
- The Spec is attained through the interrogatory and must be recorded in the Plan register before Send Contract / Factory execution.
- The Spec should include: user journey, key states, guards/gates, data/IO touchpoints, and explicit scope/non-scope.
- Each iteration should include a brief review and recommendation summary alongside the Spec updates.

Spec template (plain-language walkthrough)

- **Overview**: one paragraph describing the feature as a user would experience it.
- **User journey**: step-by-step flow from entry to completion (what the user sees and does).
- **Key states**: list the main states and transitions (loading, gated, success, error, etc.).
- **Guards/gates**: eligibility or blockers and how they are surfaced.
- **Data/IO touchpoints**: what data is read/written and when (no schema required).
- **Scope / Non-scope**: explicit boundaries for v1.
- **Verification**: how a human confirms it works without reading code.
- **Review + Recommendation**: brief assessment and suggested next choices for the next iteration.

Planner format

Planner registers and backlog lanes
Planner includes a registry of deferred intent and active Plans. Backlog lanes are receivers after routing and must not override governance.

Domain backlogs (lanes)
| Domain | Backlog Reference | Status |
| :--- | :--- | :--- |
| **Governance** | `REFER.OS/refer.governance.md` | Active |
| **Telechurch** | `refer.app/refer.telechurch.plan.md` | Active |
| **Compiler** | `REFER.OS/refer.compiler.md` | Active |
| **Bedrock/Memory**| `REFER.OS/refer.supabase.md` | Active |

Backlog handshake

1. **Verb Mapping**: detect user verbs (`fix`, `build`, `update`, `schedule`) and select the correct `refer.*` document.
2. **Contextual Anchor**: scan the active backlog for existing threads to prevent reâ€‘invention.
3. **DNA Materialization**: extract codified intent and materialize it according to Send Contract and Factory cadence.

Workflow notes

- Every Plan-mode conversation must result in a Planner entry or an explicitly deferred Plan.
- High immediacy items promote to the active session ledger for materialization.
- Every audit (including execution audits) must emit backlog entries unless the audit explicitly reports no findings.
- Planner lanes capture deferred intent only; once intent becomes live it must exit active planning and be recorded in Send Contract / Factory evidence (optionally archived for memory).

Plan chat protocol (consolidated)
Planner is the single conversational intake surface. Any intent discussion that was previously routed to separate intake chat is now governed here.

Signature

- Required signature line: `Signed: refer.plan` for Plan-mode chat. If the conversation is purely secular (no build/repair/governance intent), use `Signed: Codex` and do not execute.

Context scope (PSFR only)
PSFR = Plan â†’ Send Contract â†’ Factory â†’ Repo.

- Plan chat must only read from Plan / Send Contract / Factory / Repo sources (PSFR). For Telechurch intake, use `public/assets/plan/refer.plan.json` and `refer.app/plan/refer.plan.md` (and app-scoped plan specs referenced by those files).
- Do not scan the wider repo for context or pull from secular/non-plan files.
- Repo-backed rebase exception (Plan intake only): when a requested build/repair/governance target is missing from Planner and cannot be resolved from plan artifacts, Codex may run a **targeted repo search** scoped to identity/description keywords to locate the existing feature and re-base the Planner before proceeding. Repo evidence never becomes authority; it only seeds Plan records and does not change code.
- Legacy modal inventory exception (Plan intake only): with explicit user consent, Codex may run a **time-boxed, scope-limited repo search** to enumerate legacy modal/overlay surfaces when plan sources are insufficient. Search is limited to modal/overlay terms and UI/template files, and the use of the exception must be logged in Planner context notes. No code changes or execution beyond search are allowed under this exception.
- Re-base behavior by category:
  - Combing: auto re-base the missing plan entry before any fix work.
  - Build: detect close matches and prompt extension vs new Plan.
  - Governance: treat as governance-only re-base; do not override law without explicit approval.
- Build vs repair classification (Plan intake):
  - Build: introduces a new user-visible capability or action/outcome that did not exist.
  - Combing: aligns or corrects existing behavior, UI, or copy without adding a new capability/action/outcome.
  - UI-only exception: adding a new UI element with no new action/outcome is treated as Combing; any new action/outcome is Build.

Discovery-only

- Prompts like "investigate" or "see if X forms a foundation" are discovery only by default.
- Discovery produces analysis and citations; it does not create instantiation artifacts or governance updates unless explicitly authorized.
- Promotion from discovery to execution requires explicit request.

System references

- When a plan chat touches a system (Cloudflare, Supabase, GitHub, Angular, Stripe, etc.), cite the corresponding `REFER.OS/refer.<system>.md` file.
- When the intent touches cron/scheduling/recurrence, cite `REFER.OS/refer.cron.md`.
- When OG/share, SPA cache headers, or in-app browser behavior are involved, cite `REFER.OS/refer.og.md` and `REFER.OS/refer.cloudflare.md`.

Command prompt doc discovery (keyword index)

- For command-like prompts (e.g., push, publish, deploy), Codex must consult the keyword index below before answering.
- If no keyword match exists, Codex must run a targeted repo doc search across `REFER.OS/*.md` and `refer.app/plan/*.md` to locate governing rules. Do not search application source code for command policy.
- Once a governing doc is found, cite it explicitly in the response and add the keyword to the index for next time.

Keyword index (command prompts)
| Keyword | Governing doc |
| --- | --- |
| push / push all | `REFER.OS/refer.library.md` Article 16.3 (Push initiator) + `REFER.OS/refer.github.md` + `REFER.OS/refer.branch.md` |

## Publish initiator (preferred keywords: `publish:branch`, `publish:all`; legacy: `push`, `push all`)

Terminology normalization

- `execute:plan` = plan implementation flow (DESM execution path).
- `publish:branch` = branch publication flow (push branch + PR lane behavior).
- `publish:all` = full publish chain (commit -> push -> merge/deploy path as applicable).
- `push`/`push all` remain backward-compatible aliases for `publish:branch`/`publish:all`.

This repo treats **push** as a governed operation, not a reflex. In chat, `push` starts a short preflight summary, then runs the agreed push sequence immediately when intent is explicit.

**Why it exists (the "secret")**

- The "secret" is not a credential; it's the **preflight summary** that keeps RETURN -> COMMIT -> PUBLISH traceable while executing immediately on clear intent.
- This prevents accidental deploys, avoids pushing secrets, and keeps RETURN -> COMMIT -> PUBLISH traceable via `REFER.OS/refer.qc.md` and `REFER.OS/refer.commit.md`.

### Push modes (how much gets pushed)

- **Contextual push** (default): push only the current scoped work to its branch, with the smallest lawful checks.
- **Overall push**: push after full QC gates, typically when promoting work or when a push can trigger deployments (e.g., `main`).
- **Push all**: an overall push that also walks the publish chain (commit -> GitHub -> merge to `main` -> Cloudflare Pages deploy via wrangler per `REFER.OS/refer.cloudflare.md`), using the specific docs for each stage. When the router detects a `push all` intent that touches production, it infers and runs any outstanding Supabase migrations/functions first (`REFER.OS/refer.supabase.md`), followed by RETURN/QC, a global commit, and the Cloudflare Pages publish, so you no longer have to itemize each dependency.

### What "gets pushed" (units)

- **Files** don't push; **commits** push. The push unit is: `working tree -> staged -> commit(s) -> branch -> remote`.
- "Contextual" means: only commits that belong to the current feature/governance change; no unrelated tidy-ups.
- "Overall" may additionally include: branch promotion (`feat-beta/*` -> `feat/*`), PR publish, and provider deployments that are triggered by GitHub workflows.

### Atomic push locations (labels)

Each location is an independent "push surface" with its own rules and reference doc.

- **Git (local)**: creates the commit(s) that represent the change (`REFER.OS/refer.commit.md`).
- **Git remote (origin)**: pushes commit(s) to a branch on the remote (`REFER.OS/refer.github.md`).
- **GitHub (PR/merge)**: publishes the PR and merges it to `main` (still Git, but governed by GitHub checks/policies) (`REFER.OS/refer.github.md`, `REFER.OS/refer.branch.md`).
- **Supabase migrations (DB)**: pushes schema changes via `supabase db push` (`REFER.OS/refer.supabase.md`, `REFER.OS/refer.systems.security.md`).
- **Supabase functions (Edge)**: deploys Edge Functions via `supabase functions deploy <name>` (`REFER.OS/refer.supabase.md`, `REFER.OS/refer.systems.security.md`).
- **Cloudflare Pages (deploy)**: deploys the SPA (wrangler-only; no GitHub Actions deploy path) (`REFER.OS/refer.cloudflare.md`, `apps/telechurch/refer.telechurch.cloudflare.md`).

### Official push sequence (recommended)

When you type `push`, Codex answers with a proposed sequence using these references:

- GitHub/branch rules: `REFER.OS/refer.github.md`, `REFER.OS/refer.branch.md`
- QC gate: `REFER.OS/refer.qc.md`
- Commit sealing: `REFER.OS/refer.commit.md`
- Provider deploy implications: `REFER.OS/refer.cloudflare.md`, `REFER.OS/refer.supabase.md` (as applicable)
- Secret/credential handling: `REFER.OS/refer.systems.security.md`

Default sequences:

1. **Contextual push**
   - Preflight: `git status`, confirm branch/target remote, ensure the change set is scoped.
   - Local gates (typical): `npm run env:scan`, `npm run policy:check`, `npm run guards:turnstyle`, `npm run typecheck`, `npm run lint`.
   - Commit + push: `npm run commit:auto:push` (preferred) or `git add -A && git commit && git push` if automation is unavailable.

2. **Overall push**
   - Preflight: confirm whether pushing triggers a deploy (especially `main`), and confirm the promotion target (`feat-beta/*` vs `feat/*` vs `main`).
   - QC gates (typical): `npm run env:scan`, `npm run policy:check:strict`, `npm run guards:turnstyle`, `npm run typecheck`, `npm run lint`, `npm test --if-present -- --ci`, `npm run build`.
   - Verified commit: `npm run commit:verified` (after QC interrogatory/pass is recorded).
   - Publish lane: `npm run branch:publish` (and optionally `npm run branch:finish` when enabling auto-merge on PR).

3. **Push all** (full publish chain)
   - Preflight: confirm intended target (`feat-beta/*` vs `feat/*` vs `main`) and whether this should deploy via GitHub Actions.
   - QC gates: use the **overall push** gates above (strict when `main` is involved).
   - **Git (local)**: commit (always first) (`REFER.OS/refer.commit.md`).
   - **Git remote (origin)**: push the branch commits to origin (`REFER.OS/refer.github.md`).
   - **GitHub (PR/merge)**: publish/update PR (`REFER.OS/refer.github.md`, `REFER.OS/refer.branch.md`).
   - **Supabase migrations (DB)**: deploy schema first _if the release includes migrations_ (`REFER.OS/refer.supabase.md`).
   - **Supabase functions (Edge)**: deploy functions next _if the release includes functions_ (`REFER.OS/refer.supabase.md`).
   - **GitHub (merge to `main`)**: merge PR after checks are green (forward-only) (`REFER.OS/refer.github.md`).
   - **Cloudflare Pages (deploy)**:
     - Primary (current): deploy via wrangler per `REFER.OS/refer.cloudflare.md` + `apps/telechurch/refer.telechurch.cloudflare.md` (remote management requires `REFER.OS/refer.systems.security.md`).
     - **Production deploy branch-state rule (explicit):** production deploy must run from a local checkout of `main` after merge. Required pre-deploy checks: `git checkout main`, `git pull --ff-only`, and `git rev-parse HEAD` must match `origin/main`.
     - **No inference rule:** "merged on GitHub" is not sufficient by itself; local branch state must satisfy the rule above before deploy commands run.
     - Note: GitHub Actions deploy is intentionally disabled to keep deploys human-controlled.

### How the chat runs when you say `push`

Codex asks only what is needed to choose the lawful mode:

1. Target: which branch/remote (and whether `main` is involved)
2. Scope: contextual vs overall
3. Risk: does it touch `.github/workflows/*` (workflow-scope push), `codex/governance` (submodule pointer rules), Cloudflare, Supabase, or `.env*`

Then Codex prints the exact command sequence and waits for `Continue` before executing.

| deploy / cloudflare | `REFER.OS/refer.cloudflare.md` + app runbook (`refer.app/refer.telechurch.cloudflare.md`) |
| supabase | `REFER.OS/refer.supabase.md` + `REFER.OS/refer.systems.security.md` |
| npm publish | `REFER.OS/refer.tooling.md` |

Publish all additions

- `publish:all` includes Cloudflare Pages deploy unless `--no-deploy` is specified (see `REFER.OS/refer.library.md` Article 16.3).
- `push all` is accepted as a legacy alias for `publish:all`.
- Npm publish is included when applicable: if `git status` shows uncommitted changes under `REFER.OS/` docs, include npm publish in the push-all chain.
- Npm publish runs **after** commit/merge and **before** Cloudflare deploy.
- `publish:all` must automatically commit all current changes before pushing, without asking for a separate confirmation prompt.
- Commit message for `publish:all` should be auto-generated from the active Plan ID/Title when available; otherwise use a short chat-context summary.
- `publish:all` must automatically run QC (as defined by the project QC checklist) before pushing, without prompting.
- When a plan is in execution, `publish:all` should auto-correct branch context to the plan execution branch if invoked from `main` before implementation is complete, then continue lawfully.
- `publish:all` is relative to the current branch:
  - From an execution branch: commit only that branch's work, run QC/verification, open/merge PR to its parent (`main`), and update the plan registry on `main`.
  - From `main`: run the full publish chain to production.
  - If currently not on local `main`, deploy must pause for branch-state correction (`checkout/pull/verify`) and then continue; do not treat intent or GitHub merge status as a substitute.
- Mandatory tool invocation for `publish:all` (and legacy `push all` alias): `tools/push-all-controller.cjs`.
- Mandatory embedded gates in `push all` flow:
  - readiness/interrogation checks (`tools/plan-readiness-check.cjs`, `tools/planner-interrogation-check.cjs` when plan-bound),
  - QC sequence (`tools/quality-gate-runner.cjs`),
  - migration check/apply path (`tools/auto-migration-runner.cjs`),
  - commit format enforcement (`tools/commit-message-enforcer.cjs`),
  - branch-state guard (`tools/branch-state-guard.cjs`).

Plan chat workflow

- Review gate (mandatory): every Plan turn must include a brief review of new suggestions to prevent drift; intent is not law and does not override governance.

1. Summarize context (identity, relevant docs, prior decisions).
2. Plan review block (mandatory): concise objective framing with benefits, pitfalls, consequences, and 2-4 options. Clearly label a recommended option while allowing deviation.
   - Idea framing standard: restate the idea in one sentence, state the smallest end-to-end outcome in one sentence, then present benefits/pitfalls/consequences and 2-4 options with one recommended.
   - End the review block with a confirmation prompt that preserves user choice.
3. Task split check (mandatory): if the plan implies more than one focused change or cross-domain work, split into prerequisite or parallel Plans before interrogation continues.
4. Verification micro-block (mandatory): add 1-2 human verification steps (commands or UI checks) that would prove success.
5. Workflow + context note (mandatory): record workflow hint (explain/fix/test/ui/refactor/review/docs), preferred surface (IDE/CLI/Cloud), and any context notes.
6. List uncertainties (constraints, conflicts, missing artifacts).
7. Capture the Plan (scope, non-scope, acceptance criteria, dependencies, open questions).
8. Confirm readiness status (ready or clearly not-ready with missing answers).
9. Idea guard: scan the app plan register for matching threads before creating new entries.

Blank Plan chat rule

- If a Plan chat begins without clear context, first determine whether it maps to an existing Plan or a new one.
- Check app plan registers (`refer.plan.json`, `refer.plan.md`) for near matches and surface them as candidates.
- Ask only one routing question: â€œIs this a new Plan or continuation of <existing Plan>?â€
- Once confirmed, run the root-question interrogatory only for missing answers.

Plan response format (strict)

- Keep Plan intake concise and non-technical unless the user already supplied technical rules.
- Do not propose build steps, code paths, or implementation mechanics.
- Do not mention â€œready for Governanceâ€ or any downstream phase unless the user explicitly requests execution.
- Ask only the minimum root questions needed to remove ambiguity.
- Do not assume constraints, gates, or dependencies unless explicitly present in the user prompt or an existing Plan/spec. If uncertain, leave them blank and ask.
- Do not expose internal tool calls, shell commands, file reads, or planning logs in Plan responses.

Planner write policy

- Planner updates are default-authorized in Plan unless the user explicitly opts out.
- Do not ask for permission to write Planner entries unless the user has requested no writes.
- Avoid inventing constraints, timing rules, or thresholds not stated by the user.

Plan response template (example)
Context: <one sentence referencing existing Plan/plan record if found>
Plan (draft):

- Plan ID:
- Title:
- Problem:
- Primary actor:
- Smallest end-to-end outcome:
- Scope (1â€“3 bullets):
- Non-scope (1â€“3 bullets):
- Acceptance criteria (1â€“3 bullets):
- Dependencies (high level):
- Branch name (execution branch, if started):
- Target paths (explicit file paths):
- Verification (1-2 steps):
- Workflow hint (explain/fix/test/ui/refactor/review/docs):
- Preferred surface (IDE/CLI/Cloud):
- Cloud delegate (yes/no):
- Context notes (open files, links, commands, constraints):
  Open questions (root only, minimal):
- <root question 1>
- <root question 2>
  Plan status: Not ready (missing answers) | Ready (all root questions resolved)

Commit naming

- When executing a Plan, the commit message must match the Plan ID/Title (e.g., `PLAN-123: <Title>`).

Issue-style spec note
Plan drafts should read like concise issue specs: clear scope, acceptance criteria, and verification steps. Avoid implementation detail unless the user already supplied it.

Execution triggering

- Plan initiates build/repair/governance/migrate execution when user intent is explicit in natural language; no separate domain confirmation is required.
- Execution remains phase-scoped and follows the three-intent model; pause only if intent is ambiguous.
- Once Plan execution begins, it runs autonomously without additional prompts (auto-resolve timeouts, auto-run checks, and produce a verification report).
- When the user says "build" without context, Codex must ask a single-choice prompt:
  1. CLI Build (run project build command, e.g., npm run build)
  2. Plan Build (execute the current Plan through Governance -> Send Contract -> Factory -> Repo)
     Codex proceeds only after the user selects 1 or 2.

Auto-migrations

- If migrations are created during Plan execution or No-register code execution, they must be pushed automatically before verification (no user prompt).
- If auto-migrations are skipped or fail, Codex must run them and re-enter verification without halting execution unless the migration cannot be executed lawfully.
- Auto-migrations must run immediately after migration creation; do not pause for confirmation or additional prompts.

Automated smoke loop (Plan completion)

- When a Plan defines smoke tests, Codex should run them automatically after execution.
- If a smoke test fails, Codex should attempt a lawful fix, re-run the smoke tests, and repeat until success.
- Once smoke tests pass, Codex should mark the Plan as completed and record the final smoke outcome in the Plan context notes.

Command timeout policy

- If a QC or build command times out under the tool default, re-run once with an extended timeout.
- Default extended timeouts: build 10 minutes, lint/typecheck 5 minutes, tests 5 minutes.
- If the extended run also times out, pause and ask for guidance before proceeding.

Execution reporting and signers
Because REFER.OS performs multi-domain end-to-end execution, a single signer is insufficient to represent system truth.

Planner entries and registers (`refer.plan.json`) must support multi-signer reporting.

Plan register automation

- Plan register is `public/assets/plan/refer.plan.json` and is edited directly (no sync step).
- Timestamp stamping is currently **on-demand**, not implicit.
  - Use `npm run plan:autostamp` after plan register edits.
  - Use `npm run plan:stamp -- --id <PLAN-ID>` for a targeted entry update.
- Direct file edits (manual JSON edits, scripted writes, ad hoc tooling) do not auto-run stamping unless one of the commands above is executed.
- Required: after every plan register mutation, stamp timestamps before commit so both `meta.updated_at` and changed entry `updated_at` fields are current.
- Plan-first execution: plans are created/updated on `main` before execution begins.
- Before leaving `main` to start execution, commit the plan-register changes on `main` (plan record + target_paths).
- When execution starts, set plan status to `EXECUTION FLOW` and record `branch_name`.
- On merge to `main`, mark the plan `Completed` and clear or archive `branch_name`.
- `target_paths` must be explicit before execution; inference is not permitted for conflict detection.
- `branch_name` must include the Plan ID as the first token after the lane (e.g., `feat-beta/PLAN-123--dev--feature`).

Signer report model
Each Plan may accumulate signer reports as it progresses:

- Plan signer
  Confirms interrogation completeness and intent clarity

- Governance signer
  Confirms lawfulness and required governance artifacts are in force

- Send Contract signer
  Confirms bounded execution truth matches the Plan

- Factory signer
  Confirms implementation artifacts and routes are complete and deterministic

- Repo signer
  Confirms execution, commit integrity, and materialization

Rules

- Signers do not imply authorship; they imply domain-level attestation
- A domain may only sign for its own responsibility
- A plan record may enter execution only after Plan and Governance signers are present
- A completed Plan should retain all signer reports as an immutable audit trail

Register implication
The Planner register (plan.json) must be extended to store signer reports per Plan. Codex responses should append or update signer entries instead of using a single global signer.

This enables traceability across domains and replaces the single "signer" response model.

Planner naming
Planner is the only canonical intake surface. `/plan` is the canonical route name, and the canonical planner artifact is `refer.plan.json` (with optional `refer.plan.md` for human-readable notes).

Planner format

File name
refer.plan.json is the canonical artifact name.
If you must use plan.md for compatibility with Codex conventions, it may be used, but the meaning remains Planner.

Bootstrap rule for new repos

- A new REFER-attached repo must be able to initialize Planner without requiring a planner UI.
- Minimum Planner bootstrap artifacts are:
  - `public/assets/plan/refer.plan.json`
  - `refer.app/plan/refer.plan.md`
- If no planner UI exists, Codex still writes and maintains these artifacts silently in the background.
- If a planner UI is added later, it must read from the existing `refer.plan.json` register rather than redefining Planner.

Entry format
Each Plan entry should include:

- ID
  A stable identifier. Example: Plan-001

- Title
  Short plan name

- Tags
  Optional labels for intent: `plan_new`, `plan_expand`, `plan_refactor`.

- Problem
  The user problem being solved

- Intent
  What the plan must achieve

- Scope
  In scope behaviors, written as bullets

- Out of scope
  Explicit non goals, written as bullets

- Acceptance criteria
  Testable statements, written as bullets

- Data and integrations
  High level notes only, no schema yet

- UX notes
  High level user facing notes only

- Open questions
  Must be empty to promote

- Dependencies
  Any known upstream requirements or existing components

- Execution mode
  One of: `single-agent`, `multi-domain`

- Orchestrator
  Required when `execution_mode` is `multi-domain`

- Primary owner
  The main coordinating owner for execution

- Secondary owners
  Optional supporting domain owners for `multi-domain` execution

- Coordination intent
  Optional note describing how the owners divide and integrate work

- Branch name
  Execution branch name when in execution flow (empty when only planned)

- Target paths
  Explicit file paths expected to change; required for conflict detection

- Target area
  ui, workflow, broadcast, or combination

Promotion rule
An Plan does not leave the Plan domain automatically. Promotion is an explicit state change governed by readiness signals and authority.

Decision authority

- Codex is responsible for determining Plan readiness based on the formal criteria in this document
- The human (system owner) is the final authority to allow promotion if explicit confirmation is required
- In autonomous mode, Codex may promote an Plan automatically once readiness criteria are satisfied

Promotion signal
Conclusion principle
Interrogation concludes when the goal or intent can be functionally realized end to end based on all information present.

Definition of conclusion
An Plan is considered concluded when Codex can, without asking further questions, derive:

- A coherent Send Contract
- A complete Factory plan
- A deterministic Repo execution path

In other words, if the plan can be built without additional clarification, interrogation is concluded.

Eligibility
An Plan is eligible to leave the Plan domain only when:

- The goal or intent is functionally realizable end to end
- All root interrogation questions are answered
- All derived fields are inferred or explicitly recorded
- Acceptance criteria are complete and testable
- Dependencies are declared and validated
- No open questions remain

Conclusion protocol
Governance-aware conclusion
Interrogation and conclusion are not complete unless governance requirements are satisfied or explicitly addressed.

Governance awareness during interrogation
During Plan-domain interrogation, Codex must continuously evaluate whether the Plan:

- Introduces a new rule, boundary, category, or flow
- Modifies existing REFER.OS law, flow, or governance documents
- Requires assumptions not currently governed

If any governance gap is detected:

- Codex must create a separate Governance Update Artifact (GUA)
- The GUAâ€™s sole purpose is to update or create required governance artifacts
- The primary plan record must declare the GUA as a dependency
- The primary Plan cannot be concluded until the GUA is ratified and committed within the Governance domain

Conclusion eligibility (expanded)
An Plan may only be concluded when:

- The goal or intent is functionally realizable end to end
- All root interrogation questions are answered
- All derived fields are inferred or explicitly recorded
- Acceptance criteria are complete and testable
- Dependencies are declared and validated
- Required governance artifacts exist and are in force
- No open questions remain

Conclusion protocol (final)
Once all functional and governance conditions are met, Codex must:

1. Declare that it has sufficient information and lawful grounding to proceed
2. Reiterate and summarize the Plan (scope, non-scope, acceptance criteria, dependencies, governance coverage)
3. Ask: "Ready to execute the plan?" (this is the only permitted transition phrasing)

Only after this protocol may promotion occur.
Once these conditions are met, Codex must:

1. Declare that it has sufficient information to proceed
2. Reiterate and summarize the Plan (scope, non-scope, acceptance criteria, dependencies)
3. Ask: "Ready to execute the plan?" (this is the only permitted transition phrasing)

Only after this protocol may promotion occur.

When these conditions are met and permission is granted, Codex must mark the Plan as READY and initiate forward flow.

If any condition later becomes invalid, the Plan must be returned to Plan.
An Plan is eligible to leave the Plan domain only when:

- All root interrogation questions are answered
- All derived fields are inferred or explicitly recorded
- Acceptance criteria are complete and testable
- Dependencies are declared and validated
- No open questions remain

When these conditions are met, Codex must mark the Plan as READY and initiate forward flow.

If any condition later becomes invalid, the Plan must be returned to Plan.
Only Plans with zero open questions and clear acceptance criteria can be promoted.

Governance responsibilities

Governance has two jobs

1. Law validation
   Confirm that the Plan is lawful under REFER.OS rules, existing references, and repo policies.

2. Routing via Refer Outflow
   Determine where the Plan must go next.

Governance outputs

- A governance log entry for the Plan
- Any required reference creation or updates
- A routing decision produced by Refer Outflow

Refer Outflow routing

Outflow question
Given this Plan, what is the next lawful phase?

Routes

Route A: Governance edit required
Use when:

- A required reference does not exist
- A policy or flow document must be updated
- The Plan introduces a new category or boundary that must be defined
- The Plan changes rules that govern future work

Action:

- Create or update the necessary reference documents
- Log the governance changes
- Re validate
- Then route to Send Contract

Route B: Qualified for Send Contract
Use when:

- The Plan is already covered by existing references
- No governance documents need modification
- The Plan can be expressed structurally without policy changes

Action:

- Route directly to Send Contract

Reject back to Planner
Use when:

- The Plan contains unresolved ambiguity
- Acceptance criteria are missing
- Scope is not bounded
- The Plan conflicts with law or cannot be made lawful without redesign

Action:

- Return to Planner with explicit rejection reasons and required clarifications

Send Contract responsibilities

Send Contract goal
Translate the Plan into bounded execution truth.

Send Contract must define:

- Files or targets to change or create
- Data models at a conceptual level
- Component or route boundaries
- Event and workflow boundaries
- API and function boundaries
- Non scope and constraints
- Test approach at a high level

Send Contract must not:

- Invent new behaviors not declared in Plan
- Expand scope
- Write production code

Factory responsibilities

Factory goal
Turn Send Contract truth into exact implementation artifacts.

Factory produces:

- Concrete file diffs
- SQL migrations if required
- Function signatures
- Component code plans
- Step by step build actions
- Verification steps

Factory must not:

- Invent scope
- Change acceptance criteria
- Skip required governance constraints

Repo responsibilities

Repo goal
Execute the implementation exactly as routed.

Repo actions:

- Apply diffs
- Run checks, lint, tests as defined
- Update manifests and indexes
- Commit with clear message
- Confirm build integrity

Repo must not:

- Ask design questions
- Change structure
- Add features beyond routed artifacts

Continuous cycle

Test and iterate
After repo execution, the human tests.

If the plan is complete
No further action.

If something is missing
Create a new Plan in Planner that describes the missing behavior as a plan upgrade or correction, then run the full pipeline again.

No-register code exception
Single-layer Combing/Expand (<=2 new artifacts) may execute without Plan registration under inferred `refer.combing`/`refer.expand`. `refer.repair` remains an accepted alias. Multi-layer work must still become a Plan.

Upgrades, corrections, repairs

All are Plans (multi-layer)
Upgrade, correction, and combing are Plans when multi-layer. Single-layer Combing/Expand remains no-register.

Repair tracing
When a repair Plan is processed, Governance may trace backward:

- Is the behavior in repo
- Is there a Factory route or execution packet
- Is there a Send Contract
- Is there governance coverage

If a layer is missing
Governance routes the repair to create the missing artifacts first, then continues forward.

Operational rules to reduce cost

Optimistic interaction vs intent-driven mutation
REFER.OS is designed so the human experiences continuous conversational flow.

Rules:

- The user never selects domains, modes, or phases.
- The user never manages Planner artifacts directly.
- Codex must maintain Planner state silently in the background.

Optimistic interaction
Codex may execute immediately and conversationally when the request is:

- Read-only
- Reversible
- Analytical or diagnostic
- Reporting or summarization

Consequences + gap feedback (mandatory)

- Before executing any change (even single-layer), Codex must briefly explain the consequence of the change and flag any obvious gaps or adjacent consistency impacts.
- Keep the feedback short and practical (1–3 sentences) and do not over‑prompt.
- The goal is to help the operator make the best long‑term decision, not to block progress.

Examples include audits, inspections, reports, explanations, and analysis.
These actions may materialize results immediately while Codex backfills Planner records invisibly.

Intent-driven mutation
Codex proceeds with mutations when user intent is explicit (e.g., ?push all?, ?fix this?, ?build that?).
Codex only pauses for clarification when intent is ambiguous or when a destructive action risks data loss.

This preserves flow without forcing the user to restate domains or confirm every mutation.

Response discipline
By default, every Codex response must result in a Planner update.

Skills interaction rule
Skills are a definitive execution layer within REFER.OS.

Purpose of skills
Skills exist to reduce Codex cognitive repetition and workload by packaging frequently repeated, lawful mechanics. They are the execution substrate that instantiates or duplicates behavior already authorized by REFER law.

Relationship to REFER

- REFER defines what is allowed, why it is allowed, and in what order
- Skills define how to perform a narrow, repeatable procedure efficiently
- Skills do not introduce authority, scope, routing, or law
- Skills must never override REFER, Planner, or Governance

Domain-aligned skills
Skills should be organized and designed around frequently visited domains:

- Plan skills: derivation, summarization, dependency expansion, acceptance-criteria shaping
- Governance skills: validation checks, reference scaffolding, log formatting
- Send Contract skills: structure scaffolding, boundary mapping, contract templates
- Factory skills: diff generation, migration drafting, step compilation
- Repo skills: execution routines, manifest updates, verification runs

Execution role
Skills act as the mechanical executors beneath Codex reasoning. Codex reasons once, then delegates repetitive or procedural work to skills.

Rules:

- Skills must never define what is allowed, lawful, or in scope
- Skills must never promote Plans, change domains, or bypass Planner or Governance
- Skills may only be used after intent is understood and recorded
- Skills are optional accelerators; absence of a skill must not block progress

Promotion rule
If a skill begins to encode rules, routing, or authority, it must be promoted into Governance references and removed from the skills layer.

Autonomous invocation
Codex may select and invoke skills autonomously when:

- The task is mechanical or repetitive
- The action is already permitted by the current domain
- No governance or scope decision is required

All skill effects must be reflected in Planner updates or downstream artifacts.
Codex skills are procedural accelerators, not sources of authority.

Rules:

- Skills must never define what is allowed, lawful, or in scope
- Skills must never promote Plans, change domains, or bypass Planner or Governance
- Skills may only be used to execute narrow, repeatable mechanics that are already lawful
- Skills are optional; absence of a skill must never block progress

Skills are invoked only after intent is understood. They operate beneath conversation and must obey REFER.OS law.

If a skill begins to encode rules, routing, or authority, it must be promoted into Governance references instead of remaining a skill.

By default, Codex may select and invoke skills autonomously when:

- The task is mechanical
- The action is already permitted by the current domain
- No governance or scope decision is required

All skill effects must be reflected in Planner updates or downstream artifacts.
By default, every Codex response must result in a Planner update.

Permitted conversation types
There are three valid conversational bands in REFER.OS:

1. **Explore (no register / no code)**  
   Conversation that explores ideas or gathers references. No code changes or Plan registration. Writing notes to markdown/reference docs is allowed only when explicitly requested.

2. **No-register code**  
   Single-layer Combing/Expand work that is unambiguous and limited to **two or fewer new artifacts**. This does not create a Plan and proceeds under inferred `refer.combing` or `refer.expand`. `refer.repair` remains an accepted alias.

3. **Plan-register (multi-layer)**  
   Any request involving **three or more artifacts**, multi-step UI/workflow additions, or broad changes must be upgraded to a Plan (Plan-New / Plan-Expand / Plan-Refactor tags) for scrutiny.

Rules:

- If the request is Explore, do not register a Plan and do not change code.
- If the request is No-register code, execute under inferred `refer.combing`/`refer.expand` without Plan registration. `refer.repair` remains an accepted alias.
- If the request exceeds two artifacts or is otherwise multi-layer, it **must** become a Plan (register + interrogation).
- Clarifying questions are allowed only to resolve ambiguity or determine whether a request is single-layer vs multi-layer.

Operational rules to reduce cost

- Planner is the place where **multi-layer** intent is created or debated; Explore and No-register code are permitted as defined above
- Governance routes deterministically using Refer Outflow
- Send Contract and Factory only translate, they do not interpret
- Repo only executes, it does not think
- Plans are small but end to end functional
- No partial flow once promoted from Planner

Execution lock (DESM handoff)

- After the transition prompt "Ready to execute the plan?" is accepted, the plan enters execution lock.
- In execution lock, Flow state order is deterministic (`ResolvePlan -> EnterExecution -> BranchGuard -> ScopeGuard -> Implement -> QCGate -> PlanSync -> CommitGate -> PublishGate -> ExitExecution`).
- `continue` advances to the next lawful state only; it does not authorize skipping BranchGuard, CommitGate, or other gates.
- If a gate fails, Codex must auto-correct within the current state path before advancing (migrations, plan sync, branch sync, QC retries).
- BranchGuard requires a clean worktree; if dirty, Codex must auto-commit all changes with message format `Preplan <PLAN-ID>: <Title>` without prompting.
- Execution must not halt for missing steps; it must correct and continue unless correction is impossible due to missing authority, missing credentials, or missing reference.

DESM tool enforcement map (mandatory when available)

- ResolvePlan:
  - `tools/plan-readiness-check.cjs`
  - `tools/planner-interrogation-check.cjs`
- EnterExecution:
  - `tools/refer-outflow-suggest.cjs` (routing suggestion artifact only)
- BranchGuard:
  - `tools/branch-state-guard.cjs`
  - if dirty worktree precondition is detected, auto-commit rule still applies (`Preplan <PLAN-ID>: <Title>`)
- ScopeGuard:
  - bounded staging helper when needed: `tools/tooling-scope-add.cjs`
- Implement:
  - plan-bound sequence controller: `tools/command-sequence.cjs` (contextual mode)
- QCGate:
  - `tools/quality-gate-runner.cjs`
- PlanSync:
  - `tools/plan-autostamp.cjs` (via `npm run plan:autostamp` or targeted stamp)
- CommitGate:
  - `tools/commit-message-enforcer.cjs`
- PublishGate:
  - push chain controller: `tools/push-all-controller.cjs`
  - plus branch-state verification: `tools/branch-state-guard.cjs`
- ExitExecution:
  - verification artifact emission through existing QC/report tooling and plan context notes update

Rule:

- If a mandatory tool exists for the current state, Codex must use it (or the controller that wraps it) instead of ad hoc/manual substitution.
- Intuitive/manual execution is allowed only when a required tool is missing or cannot run lawfully; in that case Codex must log the reason and emit a repair artifact candidate.

Suggested document updates for Codex

When Codex reads this document, it should update related docs to align with these canon rules:

- Ensure planner nomenclature is used consistently across routes, docs, and assets
- Ensure pipeline phases are explicitly defined in refer.flow docs
- Define Refer Outflow as a governance routing function
- Ensure all build prompts and workflows treat Planner Plans as the only valid intake

End
This document is the canonical source for Planner and the end to end pipeline flow. Any future flow rules should remain consistent with the principle that clarified Plans flow continuously from Planner to Repo unless Governance rejects them.
