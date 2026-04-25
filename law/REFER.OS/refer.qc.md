# Law 51: refer.qc.md — Referential Coherence Engine

REFER.OS treats quality as referential coherence, not just tests. `refer.qc.md` is the gatekeeper that verifies every action before RETURN→COMMIT→PUBLISH runs by ensuring identity, structure, systems, providers, execution contracts, and lineage remain lawful; it always defers to `refer.md`/`refer.os.md` so the checks stay aligned with the router.

## Article 51.1: 1. Referential Integrity Checks

- Confirm each action reference maps to real documents (`refer.identity.md`, `refer.structure.md`, `inference.md`, system refs, provider refs).
- Verify no orphan files or missing selectors exist.
- Ensure every identity mentioned in the intent is registered in `refer.identity.md`.

## Article 51.2: 2. Structural Integrity Checks

- UI → Workflow → Broadcast mappings exist and ASEDAWSI/EWCPSI flows remain intact.
- Components reference signals/selectors described in `refer.structure.md`.
- Broadcast/realtime contracts resolve to documented channels.

## Article 51.3: 3. Lineage Integrity Checks

- Working tree is clean before builds/branches/publish.
- If the worktree is dirty at BranchGuard, Codex must auto-commit all changes with message format `Preplan <PLAN-ID>: <Title>` (no prompt) to achieve a clean state.
- No branches originate from older commits—forward-only branching must hold.
- RETURN inspections have run and noted no drift or deleted features.
- Missing commits are detected and reintroduced via forward fixes.

## Article 51.4: 4. System Integrity Checks

- Cloudflare/Supabase/Docker configs align with `refer.<system>.md`.
- Environment variables, CLI auth, edge functions, and migrations are referenced and validated before-call.
- Large assets were sized per `refer.build`’s asset guard.

## Article 51.5: 5. Provider Integrity Checks

- Optional providers (Stripe, Twilio, Resend, Daily) have their references and credentials ready.
- Canonical URLs and fallback behaviors match `refer.supabase.md`.
- Provider updates never violate the referred guardrails.

## Article 51.6: 6. Execution Integrity Checks

- Unfolded features follow the execution cadence described in `inference.md`.
- No new structure is created without identity, Plan, Send Contract, and regression approval.
- Every Factory or script execution step is logged so drift can be traced.
- QC owns the Plan / Send Contract / Factory / Repo sync loop; when drift is detected, repair the contract or route rather than regenerating legacy maps. If an execution audit is required, coordinate with `refer.audit.md` and record the audit reference in this decision log.

## Article 51.7: 7. RETURN Integrity Checks

- Build, repair, expand, migration actions finish without loose ends.
- Guards/policies executed, signals settled, and no lingering documents remain unreferenced.
- Plan, Send Contract, and Factory evidence refreshed before handing off to COMMIT.

## Article 51.8: 8. COMMIT Integrity Checks

- Commit message references the refer action and obeys `refer.github.md`.
- Branch rules respected, forward-only lineage confirmed, no rewrites/stashes remain.

## Article 51.9: 9. PUBLISH Integrity Checks

- Deployments (git push, Cloudflare worker, Supabase function, Docker image) succeed or report precise rollback-free fixes.
- Environment sync recorded, no drift reported.

## Article 51.10: 10. Activation points

- Run this checklist after every build/repair/branch/migrate, before commit/publish, after governance updates, and whenever you suspect drift.
- When commit/publish is requested, run RETURN automatically without prompting; only skip if the user explicitly requests a skip.
- Codex/agents must pause if any check fails, trigger the interrogatory, and only continue after you approve the fix.

## Article 51.11: Decision Log

- Build: Instant Church lower nav bar structure/styling in `src/app/features/ichurch/B-IC1S1.component.ts`, UI-only, no new identities/inference updates; system ref `REFER.OS/refer.angular.md`.
- Build: DevNotes floatie + console error hub (UI/store/effects/core repo + Supabase functions/migration) with contract/route sync; refs `REFER.OS/refer.build.md` + `REFER.OS/refer.supabase.md`.
- Execution alignment: tooling reindex is on-demand per `REFER.OS/refer.tooling.md`; record any alignment in QC + todo.
- Publish: Cloudflare Pages deploy for `telechurchlive` (SPA build + 404 fallback) per `REFER.OS/refer.cloudflare.md` and `refer.app/refer.telechurch.cloudflare.md`; cache purge failed because `CLOUDFLARE_ZONE_ID_TELECHURCH` is not set in `.env.master`.
- Publish: Cloudflare cache purge succeeded for `telechurchlive` after setting `CLOUDFLARE_ZONE_ID_TELECHURCH` per `REFER.OS/refer.cloudflare.md`.
- Publish: Cloudflare Pages deploy for `telechurchlive` with `/events` mobile centering/wrapping fix per `REFER.OS/refer.cloudflare.md` and `refer.app/refer.telechurch.cloudflare.md`.
- Publish: Cloudflare Pages deploy for `telechurchlive` + zone cache purge executed locally per `REFER.OS/refer.cloudflare.md`; purge required legacy `CLOUDFLARE_EMAIL`/`CLOUDFLARE_API_KEY` because the scoped token is forbidden for purge.
- Publish: Removed Angular Service Worker (SW) registration and build config; deployed `telechurchlive` via Cloudflare Pages per `REFER.OS/refer.cloudflare.md` and `refer.app/refer.telechurch.cloudflare.md`.

## Article 51.12: 11. Complementary Baseline Checks

These checks are low-friction and reuse-first. Apply only when the change touches the surface below.

- **NFR**: If performance/latency/payload/availability is affected, confirm a "no regression" target (or a stated target) is recorded in plan/contract evidence.
- **Data contracts**: If schemas/APIs/DTOs change, confirm an owner + version tag is recorded and the source of truth is referenced (migration or contract file).
- **Rollback**: If DB/edge/deploy is touched, confirm a rollback trigger + minimal rollback action is recorded in the QC note.
- **Acceptance**: Confirm 1-3 acceptance checks are recorded in plan/contract evidence; if absent, default to "no regression" plus QC/RETURN.
- **Turnstyle guards**: Run `npm run guards:turnstyle` and fail RETURN if registry/naming/edge-authority checks fail.

## Article 51.13: Recursive Comb Enforcement (RETURN Gate)

QC must enforce recursive repair validation for any troubleshooting/repair execution:

- Require evidence of at least one post-fix full re-check in the same scope.
- If failures remain, require a residual list with explicit classification:
  - external dependency
  - blocked by missing authority/context
  - intentionally deferred with rationale
- Fail RETURN if unresolved in-scope actionable failures exist without classification.

This gate exists to prevent first-error-only completion claims.
