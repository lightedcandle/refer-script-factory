# Law 15: refer.build.md — Build Action Reference

This action document replaces the E2E build protocol (`codex/governance/protocols/codex_genesis_init.protocol.md`) and describes how features unfold through REFER.OS. Follow it whenever `refer.build:` intents arrive.

## Article 15.1: 1. Build intent

- **Trigger**: `refer.build: <feature>` or a natural-language directive that Codex interprets as a build request.
- **Purpose**: Manifest lawful capabilities that are not yet materialized in code. "New" means not yet implemented, not invented or uncharted. Every build must anchor to:
  - The identity registry (`refer.identity.md`) to determine the relevant domain.
  - The structural map (`refer.structure.md`) to place UI/workflow/broadcast layers.
  - The execution cadence (`inference.md`) to sequence services, guards, edges, and UI.
  - The flat seamless UI doctrine (`refer.seamless-ui.md`) for page/section UI realization and consistency.
  - The Spirit runtime authority contract (`refer.spirit-runtime.md`) when constructing or modifying front-end services that call edge APIs.
  - The canonical URL policy (`refer.supabase.md`) if media assets are involved.
  - The responsive integrity law (`refer.law.md`) whenever UI layout or styling is touched.
- **Scope partition requirement**: build execution MUST keep agnostic law separate from app scope:
  - agnostic invariants in `REFER.OS/*`,
  - app-specific runtime values in app artifacts (Spirit: `refer.app/spirit/*`).
- **Planner precondition**: An MVF must exist in the Plan domain and Governance must route it to a bounded Send Contract and lawful Factory/Repo path before `refer.build` executes.

## Article 15.2: 1.1 Split-footprint builds

- Prefer pointed, separable operations (one edge/function per CRUD action, e.g., save, update, delete) rather than monolithic all-in-one flows that mix conditions. Document each focused edge in its own intent so the build remains efficient, transparent, and expandable.

## Article 15.3: 1.2 Asset sizing guard

- When builds include large assets (videos, media bundles), auto-detect and flag anything over the gateway or deployment limits and keep replacements within the allowed range. Describe the sizing requirements in this intent, have the resolver compress/clip as needed, and avoid pushing oversized files that would trip Cloudflare or Supabase updates.

## Article 15.4: 1.3 Contract chain gate (Plan → Send Contract → Factory → Repo)

- **Dominant order**: Plan → Send Contract → Factory → Repo is the required sequence for governed build execution. It supersedes convenience and cannot be bypassed.
- **Repo admission rule**: No artifact may enter the repo unless it is covered by the active Plan, Send Contract, or the lawful no-register code exception.
- **Factory admission rule**: No script route, interpreter step, or execution packet may exceed the Plan scope or mutate beyond declared targets.
- **Send Contract admission rule**: No Send Contract is valid unless it is traced to a `refer.build` or `refer.combing` directive that requested the change. `refer.repair` remains an accepted alias.
- **Chain enforcement**: If any link is missing, execution halts and the missing contract or authority must be created/updated before code changes proceed.

## Article 15.5: 2. Build flow

1. **Referential kickoff**: Read the `refer.build` directive from `refer.md`; classify the intent and determine the domain (UI, workflow, broadcast).
2. **Identity validation**: Confirm the target feature fits an existing identity in `refer.identity.md` or register a new identity before implementing.
3. **Structure alignment**: Use `refer.structure.md` to tie the work to UI/workflow/broadcast nodes and ensure component guardrails and selectors map correctly.
4. **Seamless profile binding (Body/UI)**: If the build touches page-level UI composition, default to `refer.seamless-ui.md` rules (seam joins, single-loader policy, sticky offset, action wiring completeness, contrast contract) unless a documented plan deviation exists.
5. **Execution plan**: Outline the ASEDAWSI/EWCPSI sequence from `inference.md`. Define required services, guard checks, deployment edges, Spirit runtime route-class/header-contract mapping per `refer.spirit-runtime.md`, and whether existing Factory machinery should be used instead of fresh manifestation.
6. **Return plan**: Specify how RETURN will verify completion (no dangling guards, no drift). Document COMMIT expectations (refer.branch rules) and Publish steps (deploy, push, notify).

### Durable Object build gate (required when touching `/rt/*` or DO handlers)

When a build changes Durable Object routing, room identity parsing, websocket handlers, or `/rt/*` behavior, the following tooling chain is mandatory before publish:

1. `npm run do:contract-check`
2. `npm run do:smoke -- --base <target-spirit-api>`
3. `npm run do:deploy:verify` for live deployment verification

On failure, tooling must emit reports and halt promotion:

- `reports/do-contract-check.json`
- `reports/do-smoke.json`
- `reports/do-deploy-verify.json`

### Reminder alarm build gate (required when touching reminder scheduling/dispatch)

When a build changes reminder DO keying, alarm scheduling, reseed logic, or notification dispatch paths, the build must satisfy this gate before publish:

1. **Scheduler proof**: reseed/bootstrap returns non-zero candidate metrics when test data exists (`fetched`, `normalized`, `scheduled`).
2. **Alarm proof**: DO diag shows a valid future `alarm_iso` immediately after scheduling.
3. **Lifecycle proof**: after due time, DO diag shows either:
   - `last_alarm_ok_iso` + `last_dispatch_ok_at`, or
   - `last_alarm_error_iso`/`last_dispatch_error_at` with captured error details.
4. **Side-effect proof**: notification stream insert exists for expected reminder `intent_ref` and template key.

Implementation requirements:

- Compute earliest future due entry by scanning pending due keys; do not assume first-row ordering.
- Persist minimal diagnostic markers always; gate verbose diagnostic fields behind an env flag.
- Keep a guarded internal reminder-diag endpoint for rapid production verification.

### Recursive combing gate (required for incident fixes and UI/runtime regressions)

When fixing build/runtime failures, execution MUST run recursive combing:

1. Patch first discovered fault.
2. Re-run full scenario comb (not a single failing step).
3. Continue patch -> full comb cycles until no cascading failures remain.
4. Emit final verification summary with all discovered faults and dispositions.

Stopping at the first resolved fault is non-compliant for regression repair work.

## Article 15.6: 3. Asset considerations

- If assets are introduced, call out the resolver path defined in `refer.supabase.md` and ensure the short canonical URL is stored in the DB rather than the Supabase signed path. Mention this in the build definition so Codex wires the resolver correctly.

## Article 15.7: 4. Documentation

- A build action must update `REFER.OS` references (`refer.identity.md`, `refer.structure.md`, `inference.md`) as needed and ensure `refer.md` still routes to the right domain.
- If UI surfaces were changed, verify `refer.seamless-ui.md` remains referenced and respected (or document an explicit deviation).
- Keep a changelog entry (or commit note) that cross-links the `refer.build` directive, active Plan, and Send Contract to the new code/workflow for future audits.
