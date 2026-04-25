# Law 10: refer.audit.md ƒ?" Human Audit of Referential Reverence

Auditors patrol the post-build lifecycle and spot-check the platform at human cadence. Audit is the intentional, human-reviewed complement to `refer.qc.md`—it does not run in the compiler, it runs against the repository and documentation to confirm that every App/Mind/Body/Spirit surface remains reverent to the governing references.  

## Article 10.1: 1. Purpose

Audit is the worker who steps in after the contractor (build) completes work, or during periods of platform growth, to detect drift. Its job is not to invent: it is to confirm that implementation continues to honor `refer.flow.md`, `refer.os.md`, and the App/Mind/Body/Spirit laws. “Reverent” means the code and docs are legal, referenced, and traceable back to Refer OS law.

## Article 10.2: 2. Scope

- **Body (UI/IMSCE)**: Comb through sections/cards/components and verify they obey IMSCE placement, naming, and selector bindings.
- **Mind (Workflow/ASEDAWSI)**: Trace workflows, actions, services, and guards to ensure logic still follows ASEDAWSI and that IO lives in effects/services.
- **Spirit (Signal/EWCPSI)**: Inspect channels, guards, broadcasts, and realtime wiring to keep the Spirit from improvising outside the reference.
- **App & Docs**: Confirm `REFER.OS/*`, feature docs, and `AGENTS.md` still describe the lived reality. If docs drift, audit notes what needs updating and whether a governance action is required.

Audits lean on the repository’s naming convention (e.g., the `B-IC…`/`M-IC…` schematic IDs in `apps/telechurch/blueprint/features/instant_church.schematic.md` and the header comments described in `REFER.OS/ESCL_2.0_Schematic.md`) to enumerate every modal, workflow, and signal. Each ID becomes an audit anchor; the tooling walks the tree by following these identifiers so no surface is skipped.

Audits obey the contextual discovery model: natural language conversations or discovery notes trigger the router to call `refer.audit`. The human reviewer inclines toward conversation (LLM-enabled) and then translates that lived discourse into directives, findings, and reference-aligned instructions. The audit therefore lives between conversation and code—it translates context into actionable refer directives without abandoning the natural flow.

## Article 10.3: 3. Workflow

1. **Discovery**: Identify the audit trigger (feature completion, deployment, stakeholder report, or surface-level intuition that things drifted). Capture the reason and scope.
2. **Map the Lens**: Decide which layers to revisit. Each audit run should examine:
   - IMSCE violations (Body)
   - ASEDAWSI violations (Mind)
   - EWCPSI violations (Spirit)
3. **Check Reverence**: For each finding, cite the governing reference(s) (`refer.structure.md`, `refer.law.md`, `refer.identity.md`, system/provider refs, App-specific refer docs).
   - **Deterministic traversal**: Use the canonical IDs/naming conventions to visit every modal/workflow/signal; when a new ID appears, add it to the audit map before concluding the scan.
4. **Record the Findings**: Document the violation, severity, affected layer, and whether the fix should trigger a `refer.repair`, a doc update, a governance amendment, or simply a reminder to rerun `refer.qc`.
5. **Register the Work**: Every audit finding must become a backlog entry in the appropriate Plan lane; audits are not run without the intent to fix and therefore always emit actionable items (unless the audit passes with no findings).
6. **Report & Recommend**: Produce a human-readable audit report (consider a dedicated `/audit` feature page or report log) so the developer group can bring the repo back to reverence or update the reference itself.

Auditors may mandate updates, suggest revisions, and, once the audit report is accepted, trigger the appropriate downstream refer action (often `refer.repair`, occasionally `refer.build`, and sometimes Plan intake to clarify with stakeholders).

## Article 10.4: 4. Relationship to Other Domains

- **refer.qc.md**: QC remains the automated, machine-level gate. Audit should align with QC findings, amplify them with human context, and close the loop by verifying that QC outputs are still accurate. Audit often runs before or after QC to provide the narrative the machine lacks.
- **refer.repair.md**: Audit is the upstream inspector that, once approved, requests `refer.repair` to restore order. Each audit finding should describe the required repair scope (Body/Mind/Spirit) so the repair action inherits a reverent intent. Audit can also re-open closed repairs when the fix drifts again.
- **refer.plan.md**: Use Plan intake whenever the audit needs clarification or when conversation is the best way to surface the next steps; the auditor’s natural language notes should be wrapped into Plan so the router knows the domain shift.
- **refer.io (future)**: If an audit surfaces provider/IO drift, it may suggest future refer.io coverage once that domain exists.

## Article 10.5: 5. Deliverables

- **Audit Report**: Summaries of findings, severity, legal cause, linked references, recommended refer action, and a compliance grade per layer (Body/Mind/Spirit). Reports should include whether the repo is comporting to the `refer.*` docs or whether the docs themselves require updates to describe a new methodology.
- **Compliance Actions**: When the report is reviewed, the auditor may mark each finding with a gate: `approved`, `needs refer.repair`, `needs governance`, `needs docs update`, etc.
- **Return Notes**: Include the most recent RETURN (per `refer.qc.md`) so that once fixes arrive, the audit can confirm the repo passes QC and the RETURN loop completes.

## Article 10.6: 6. RETURN & Closure

Every audit ends with:

1. **RETURN Check**: Confirm QC runs are clean and no open references remain. Log this in `refer.plan.md` or the `/audit` log so later agents know the audit occurred.
2. **Commit/Publish Alignment**: If the audit mandated code or refer doc changes, ensure `refer.commit.md` and `refer.github.md` guardrails run afterward.
3. **Reference Update**: When the audit reveals doc drift, update the relevant `REFER.OS` references (possibly including `refer.audit.md` itself) via `refer.governance`.

Audits therefore annotate the living reference and keep the router honest by documenting every assumption, conversation, and instruction that led to a follow-up `refer.*` action.

### Section 10.6.1: Optional Reporting Surface

Consider a `/audit` feature page that aggregates the latest audit report, highlights outstanding refer actions, and surfaces the compliance grade. This page would help the team see immediately what the next `refer.repair` or governance update needs to target.

## Article 10.7: 7. Persistent tooling plan

Audits are not one-off conversations; the tooling that walks the tree must live in the repo so it can be reused, tuned, and reused again. Create a dedicated directory (e.g., `scripts/audit/` or `tools/audit/`) that stores the helper scripts referenced in this document. Each audit run should:

1. Pick the named helper(s) from the list below, run them, and capture their output.
2. Append the invocation (script name + parameters + reference layer) to the audit report/log so the same run can be replayed later.
3. Commit any tooling updates back into the repo whenever a script is improved or a new mode is added.

**Starter tooling catalog**

| Name | Scope | Notes |
| BodyAudit.sh / body-audit.py | IMSCE/Element scans | Enumerates `B-`/`M-` modal IDs, checks selectors and tokens. |
| MindAudit.sh / mind-audit.py | ASEDAWSI/Workflow scans | Walks intents/stores/selectors, ensures actions map to reducers and services. |
| SpiritAudit.sh / spirit-audit.py | EWCPSI/Signal scans | Reviews broadcasts, channels, guards, and realtime wiring. |
| AuditReport.py | Reporting | Merges script outputs, attaches reference citations, and logs the audit chain. |
| AuditChain.yaml | Modes | Describes full vs partial runs so the router can choose a chain (Body-only, Mind-only, etc.). |

Treat these helpers as living artifacts: each time the router calls `refer.audit`, note which helper(s) were invoked, store their results under `/reports/audit/`, and keep improving the scripts so the audit gets more efficient without increasing LLM load.

## Article 10.8: 8. Contract / Factory / Repo Audit

Purpose:
- Validate that Plan, Send Contract, Factory route, and Repo remain synchronized after any build, repair, or update.

Scope flags:
- execution:all (repo-wide alignment)
- execution:feature:<name> (feature scope)
- execution:module:<name> (module scope)
- execution:section:<name> (IMSCE Section scope)
- execution:card:<name> (IMSCE Card scope)

Required checks:
- Confirm the active Plan and Send Contract reflect the executed change set and reference the governing law.
- Confirm the repo state matches the Factory route and contract steps (no missing steps, no extra behavior).
- Confirm any divergence is documented as a governance update or a repair note before proceeding.
- If an alien artifact is discovered (behavior or structure not covered by law), halt contract updates and route to governance for legal ratification before updating execution truth.

Required documentation:
- Record each build/repair/update in the execution audit log with the governing reference and the active Plan/Send Contract identifiers.
- If drift is found, mandate a repair or governance update and re-run the audit after the correction.
- Ensure each execution audit finding is captured in the relevant Plan backlog.
