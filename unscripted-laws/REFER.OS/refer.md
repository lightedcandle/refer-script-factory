## refer.md - Router for REFER.OS

`refer.md` is the Rosetta Stone router described in `refer.os.md`. Every instruction that touches REFER.OS or the broader E2E lineage is interpreted through a `refer.` directive.

**Inference Duty**: The Architect is not required to type the `refer.` prefix. The Agent infers the correct directive from natural language (e.g., "Build this" -> `refer.build`, "Fix that" -> `refer.combing`) and acknowledges the mapping before execution. When the intent is unambiguous, the Agent should proceed without a domain prompt. When the intent is ambiguous, the Agent must present a short domain choice prompt and wait for a selection. When a refer context is active, the Agent continues in that context unless a context shift is implied; if a shift is inferred, the Agent acknowledges the new domain and proceeds without forcing a restate. This keeps governance intact without forcing the Architect to speak governance.

**Router bands (Plan cockpit)**:

- **Explore**: conversational only; no plan registration, no code changes (notes/docs allowed when requested).
- **No-register code**: single-layer Combing/Expand with two or fewer new artifacts; execute under inferred `refer.combing`/`refer.expand`. `refer.repair` remains an accepted alias.
- **Plan-register**: three or more artifacts or multi-step additions; register a Plan and run interrogation before execution.

**Bootstrap override**:

- If a prompt clearly requests creation or initialization of a new repo/app workspace, the router must switch first to `refer.init: bootstrap`.
- Bootstrap is an initialization override, not a standing active work mode.
- Bootstrap interrogation must complete before normal repo execution or context switch.
- New consumer repos must not be created under `E:/refer.os\**`.

**App-agnostic boundary**: `refer.*` files only capture routing law and governance. Any TeleChurch or other app-specific requirements, roadmaps, or specs must live in the application docs (e.g., `codex/todo/To_do_list.md`, plan registers, execution contracts) with REFER.OS linking to them by reference instead of embedding feature details.

**Developer resource boundary**: shared operator resources such as installed-CLI inventories, local environment manifests, and reusable machine-local notes should live in a Developer root rather than inside REFER law. REFER may discover and reference those resources, but they remain operational artifacts, not authority.

**Universal knowledge boundary**: cross-repo capability references, role registers, product dossiers, and other durable operator context may live in `E:/refer/**`. This knowledge surface is reusable and persistent across repos, but it is not REFER law. REFER may consult it, summarize it, and extend it when explicitly authorized, but law remains in `E:/refer.os/REFER.OS/**`.

**Persistence rule for ongoing domains**: when a universal knowledge domain has already been established under `E:/refer/**`, future chats should continue from that corpus rather than restarting the topic from session memory. This is especially true for living infrastructure domains such as script registries, platform architecture, and reusable factory tooling, where capability understanding matures over time through research plus validation.

For any time-based behavior (cron, scheduling, recurrence, compiler rules), always reference `REFER.OS/refer.cron.md` as the canonical scheduling doctrine.
For flat, borderless, section-surface page composition, reference `REFER.OS/refer.seamless-ui.md` as the canonical UI pattern doctrine.

## refer.md - The Reference Router

### 0. The Refer Philosophy (Pointer vs. Manifestation)

**Code should Point, not Paint.**
The term "Refer" is literal: To point to a truth that exists elsewhere.

- **The Painter (Anti-Pattern)**: Tries to manifest reality directly in the code (e.g., hardcoding `color: #fff`). This is "Self-Referencing" and brittle.
- **The Librarian (Refer-Pattern)**: Points to the authoritative source (e.g., `color: var(--section-text)`). The code is merely an instruction on _where_ to find the truth (Registry/Theme) and _how_ to apply it (Materialization).

**The Duty**: Never manifest a primitive (color, spacing, rule) if you can refer to a Governance Node. The code is the Weaver; the Reference is the Thread.

### 0.1 Theme discovery route

When the intent is theme discovery, route through the canonical stack:
`refer.plan` -> `refer.os.md` -> `refer.md` -> `refer.structure.md` -> `refer.honeycomb.md` -> `theme.spec.md`.
Theme variants live in `theme.spec.md` as optional N1..N4 bands with HPAD overlays.

### 0.2 The Kinetics of Inference

Efficiency is shaped by the relationship between:

- **Fuel**: tokens and iteration budget,
- **Vehicle**: the model and tool surface,
- **Driver**: the steering quality of the human or active agent,
- **Terrain**: the codebase, framework, law quality, and ambiguity level,
- **Cargo**: the weight of scope and novelty,
- **Road Law**: REFER governance that keeps routing explicit.

High burn is usually a mismatch signal, not a moral failure.

The duty is to reduce friction by:

- smoothing the terrain with law, anchors, and contracts,
- reducing cargo before adding more fuel,
- and converting repeated work into factory/engine machinery.

### 1. Canonical prefixes & router syntax

Codex always looks for these canonical prefixes before acting so it can route you through the Rosetta Stone:

- `refer.` - the general intent trigger; allowed even in unprimed chats or new repos. Any instruction that begins with `refer.` is routed through the router described in this file.
- `refer.md:` - the explicit Rosetta Stone call that reinforces governance awareness. It still obeys the same routing rules but emphasizes that the instruction is being interpreted through `refer.md`.

All refer directives follow this pattern:

```
refer.<domain>: <action> [context]
```

| Directive                        | Purpose                                                                                | Notes                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `refer.build`                    | Execute a build-like unfold (feature additions, integrations)                          | see `refer.build.md`.                                                                                                              |
| `refer.compiler`                 | Run the compiler pipeline (interpret/materialize/synthesize/broadcast modes)           | governed by `refer.compiler.md` + `refer.compiler.blueprint.md`; usually invoked by `refer.build` but available for targeted runs. |
| `refer.combing`                  | Resolve a defect or failure path through recursive combing/alignment                   | see `refer.combing.md`.                                                                                                            |
| `refer.repair`                   | Legacy alias for `refer.combing`                                                       | compatibility entry; see `refer.repair.md`.                                                                                        |
| `refer.audit`                    | Human audit of App/Body/Mind/Spirit reverence and repo compliance                      | see `refer.audit.md`; triggers refer.repair or refer.governance as needed once findings are approved.                              |
| `refer.expand`                   | Introduce a new capability or expansion that alters identity/structure                 | attaches to `refer.ontology.md`.                                                                                                   |
| `refer.commit`                   | Seal the unfolding with the commit law (refer.branch).                                 | MUST be paired with reasoning for RETURN.                                                                                          |
| `refer.branch`                   | Manage branch creation, switching, or rollback.                                        | Refer to REFER.OS branch rules.                                                                                                    |
| `refer.migrate`                  | Drive Supabase migrations, schema captures, and rollout.                               | Requires relation to `refer.supabase.md`.                                                                                          |
| `refer.designlab`                | Explore prototypes or experiments before formalizing build work.                       | Document learning in `refer.designlab.md` and stage new identities before promoting to `refer.expand`.                             |
| `refer.figma`                    | Govern Figma-authored design authority, critique, handoff discipline, and contract execution.    | See `refer.figma.md`; use when Figma is the official designer and Codex should implement, not redesign, or when Figma-style critique/polish review is needed.                            |
| `refer.seamless-ui`              | Apply the Flat Seamless UI page pattern and guardrails.                                | See `refer.seamless-ui.md`; use for reusable borderless page composition and responsive section rhythm.                            |
| `refer.cli`                      | Execute CLI commands as part of a refer action, keeping shell calls scoped and logged. | `refer.providers.md` describes which CLI commands each refer action may run and how to signal success back into the refer loop.    |
| `refer.google`                   | Operate against Google Cloud relations using the governed Google provider path.        | See `refer.google.md`; prefer `gcloud` for operational inspection and mutation.                                                    |
| `refer.efficiency`               | Audit fuel, terrain, cargo, and repeat-burn patterns so execution stays economical.    | See `refer.efficiency.md`; use when cost, drift, or retry loops become architectural concerns.                                     |
| `refer.odometer`                 | Track prompt mileage, gallons, response-vs-codebase efficiency, and `MPG = Mutations Per Group`. | See `refer.odometer.md`; use when token spend should be measured per prompt or session.                                            |
| `refer.gears`                    | Classify AI work into five gears and profile engine strength by gear.                  | See `refer.gears.md`; use when measuring which kind of work the AI is doing and where it is strongest.                             |
| `refer.factory`                  | Govern the app factory model, artifact assembly routes, anchors, and reusable outputs.  | See `refer.factory.md`; use when replacing repeated inference with assembly-line manifestation.                                     |
| `refer.codebases`                | Govern repo-level tracking, monorepo subspace routing, and codebase registry behavior.  | See `refer.codebases.md`; use when a repo contains multiple apps, packages, services, or workers.                                  |
| `refer.engine`                   | Govern the script engine, portable script packs, interpreters, and assembly-like scripts. | See `refer.engine.md`; use when execution should move from prose toward scripts and adapters.                                      |
| `refer.governance` / `refer.gov` | Update REFER.OS governance (law, structure, identity).                                 | See `refer.governance.md` for the 7-step path; `refer.gov` is a short-form alias.                                                  |
| `refer.turnstyle`                | Apply the guard architecture doctrine (T1/T2/T3, registry, boundary checks).           | See `refer.turnstyle.md`; typically paired with `refer.build`/`refer.governance`.                                                  |

Subagent architecture and acting-role doctrine are governed by `refer.subagents.md`. That document defines the relationship between acting roles (for example, `plan-agent`, `mind-agent`, `body-agent`) and the authoritative `refer.*` laws they follow.

`refer.build` remains the canonical entry point for feature work, but `refer.compiler` ensures those instructions flow through the Supabase genome + Angular host pipeline described in `refer.compiler.md` and the accompanying blueprint. Use `refer.compiler` when you need to run interpreter/materializer modes directly (e.g., bilateral testing) while still honoring router law.

The router treats Supabase as a Relation with its own canonical URL policy. When `refer.build` introduces media assets or `refer.combing` resolves asset regressions, they must cite `refer.file.md` (cross-app canonical file resolver) and `refer.supabase.md` (provider implementation) so the action follows the canonical resolver contract. `refer.repair` remains an accepted alias. Always run `refer.qc.md` before RETURN, COMMIT, or PUBLISH so REFER.OS remains coherent.

### 2. Routing protocol

1. **Referral**: Codex infers the target domain (action, law, system, provider) from explicit `refer.` directives or unambiguous natural language, and classifies the request into Explore / No-register code / Plan-register before executing.
   1a. **New-repo detection override**: if the intent is to create/bootstrap a new repo, route to `refer.init: bootstrap`, interrogate repo identity and purpose, reject nested targets under the universal governance root, seed the bootstrap artifacts, and only then switch active repo context.
2. **Reference selection**: The router looks up identity + structure metadata from `refer.ontology.md` to ensure the command is anchored.
   2a. **Developer resource discovery**: when the task depends on operator or machine-local context, the router should seek a developer root in this order: explicit path from the user, machine-local developer root, then repo-local `Developer\`. Operational artifacts found there may inform execution but do not overrule REFER law.
   2b. **Universal knowledge discovery**: when the task benefits from durable cross-repo context, product capability history, or long-lived infrastructure evaluation, the router should also seek `E:/refer/**` after REFER law and before repo-local ad hoc notes. Records found there may inform planning, research, and execution, but they do not overrule REFER law.
   2c. **Continuation over restart**: if a relevant domain corpus already exists in `E:/refer/**`, prefer updating and reconciling that corpus over creating disconnected new notes in repo-local docs unless the user explicitly wants repo-local duplication.
   2d. **Factory/Engine discovery**: when the task materially involves portable scripts, interpreters, registries, assembly routes, anchor maps, or script-first execution, route through `refer.factory.md` and `refer.engine.md` and prefer portable script hosts over repo-local one-offs when lawful.
3. **Intent unfolding**: The selected action document (`refer.*.md`) defines the required steps, dependencies, and RETURN guardrails.
4. **Completion**: Once the action resolves, RETURN must confirm no drift before COMMIT and PUBLISH.
5. **Evolutionary Inference**: If the Architect's intent (Seed) implies a greater potential (Tree), the router authorizes the Agent to suggest expansions or superior Gifts beyond the prompt. (See `refer.os.md` Principle 10).
6. **Interrogatory for missing references**: If the prompt maps to an intent that lacks a documented rule, the router will pause, notify the prompter, and invite discussion to clarify the desired behavior. We then interrogate how the prompt interacts with identity/structure/inference, inspect system relations, and only after validation codify the micro-law (in `refer.law.md`, `refer.knowledge.md`, or an action doc) before resuming the flow.
   6a. **Reference-only execution**: The router must refuse any repo changes unless the exact behavior is documented in refer.\* sources. User instructions alone do not authorize mutation; missing references must be codified via refer.governance before any execution.
   6b. **Adjunct knowledge updates**: updates to `E:/refer/**` are allowed when the user explicitly asks to create or maintain persistent cross-repo knowledge. These updates do not create law by themselves; any binding behavior inferred from them must still be codified through `refer.governance`.
7. **Context continuity**: `refer.` invocations establish a persistent context. Once a domain (build, combing, governance, etc.) is active, the router keeps that context alive and continues without re-prompting. If a new message implies a different domain, the router should infer the shift, acknowledge it, and proceed; only ask for clarification when the intent is ambiguous or conflicting. It may suggest a new chat/intent stream if the switch introduces unrelated, parallel work.

### Push inference

When the router identifies a `push` intent that targets Cloudflare Pages or production, it automatically expands the chain to include the dependent workloads described in `REFER.OS/refer.plan.md` and `REFER.OS/refer.supabase.md`: outstanding Supabase migrations/functions run first, then RETURN/QC executes before a global commit, and finally wrangler publishes to Cloudflare Pages (`REFER.OS/refer.cloudflare.md`). This inference lets you describe a single push while the router invokes each required step in order, ensuring production pushes stay stable without manually enumerating migrations, function deploys, global commits, or QC gates.

### 3. Governance overrides

Governance updates are always expressed through `refer.governance`. They trigger the canonical governance update flow (`refer.os.md` A-9). The router:

- classifies the request as `refer.governance`,
- routes to `refer.law.md` or the appropriate reference file,
- enforces the seven-step path (Reason + Referral + Reference Review + Structural Reconciliation + Identity Reconciliation + RETURN + COMMIT + PUBLISH),
- and rejects any attempt to edit non-governance files without explicit tokens from this flow.
- `refer.flow.md` is the primordial law; all refer.\* governance must reconcile to it before execution.
- Skills are subordinate to `refer.flow.md` and cannot authorize execution on their own.

### 4. Extending the router

When REFER.OS needs a new action domain, add:

1. A new `refer.<new>.md` describing the unfolding, dependencies, and RETURN tests.
2. A new row in the directives table so `refer.md` remains the single source of interpretation.
3. Updates to `refer.ontology.md` and `inference.md` if identity or structure definitions shift.

Every change is routed through an inferred `refer.` directive. The Architect does not need to type the prefix; the Agent must infer and proceed when intent is clear, only pausing for ambiguity.

### 5. Context alerts

- When the router detects an intent that would change domains mid-stream, it emits a context alert (for example, "detected `refer.combing` while `refer.build` is active -- please confirm context switch or start a new refer"). Use this alert to either acknowledge the switch, start a new chat/intent stream, or append "switch context to refer.combing:" to the current message so the router tracks the new session explicitly. `refer.repair` remains valid as a legacy alias.
- For undocumented prompts the alert will also include the remind-to-interrogate message before codification so you can decide how to proceed without losing the original context.

### 6. Application definitions

REFER.OS is app-agnostic. The specific application running on the OS is defined by its own `refer.<domain>.md` file (e.g., `refer.telechurch.md`).
This file:

1.  Extends `refer.ontology.md` with app-specific identities (`app.features`, `app.core`).
2.  Tracks the app's compiler status and roadmap.
3.  Defines app-specific Cloudflare/Edge rules.

When routing commands relative to the _content_ or _status_ of features, refer to the App Definition.
