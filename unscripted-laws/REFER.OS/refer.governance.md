# Law 32: refer.governance.md — Governance Action Reference

`refer.governance` is the routing command for updating REFER.OS laws, structures, or identity definitions (per `REFER.OS/refer.os.md` §9). Use this action whenever governance documents (`refer.os.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`) must change.

## Article 32.1: 1. Governance intent

- **Trigger**: `refer.governance: <reason>` or an instruction that Codex classifies as modifying REFER.OS governance.
- **Purpose**: follow the governance update path (Reason → Referral → Reference Review → Structural Reconciliation → Identity Reconciliation → RETURN → COMMIT → PUBLISH) while limiting changes to governance files.

Three-intent model alignment

- Plan (CRUD MVF) captures and maintains MVFs.
- Flow executes the deterministic Plan → Governance → Send Contract → Factory → Repo sequence.
- Governance (Law) updates refer.\* policy and reference artifacts.

## Article 32.1.1: Governance Update Artifacts (GUA)

- Governance updates are **control-plane** changes and do not traverse the Blueprint/Inference/Repo track.
- Each governance change is tracked as a **GUA** (Governance Update Artifact) scoped to reference documents only.
- Feature MVFs may depend on completed GUAs, but GUAs never emit feature code.

## Article 32.2: 2. Governance flow

1. **Reason**: Capture why the law/structure/identity needs updating; document contradictions or emergent domains.
2. **Referral**: Confirm Codex routes the request via `refer.md` and that `refer.governance` is the target domain.
3. **Reference review**: Identify all affected reference files (`refer.os.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`, any system/provider references) and limit edits to them.
4. **Structural reconciliation**: Evaluate structural mappings (UI/workflow/broadcast, ASEDAWSI) to prevent circular logic.
5. **Identity reconciliation**: Update identities in `refer.identity.md` only when necessary; avoid creating conflicting lineage records.
6. **Return/Commit/Publish**: Run RETURN validation (tests, audits), commit with the law-based message (per `refer.law.md`), and publish (git push, trigger deployments if required).

## Article 32.3: 3. Documentation

- Record the governance update reason, the files changed, and the finalized state in `refer.os.md` or refer.law so future agents know why the system evolved.

## Article 32.4: 4. Scope Partition Law (Agnostic vs App)

Governance updates MUST keep REFER law portable by separating:

- **Agnostic REFER law** (cross-app invariants, routing laws, gates, contracts), and
- **App scope** (deployment domains, numeric thresholds, capability inventories, route maps, and trigger values).

Required partition behavior:

1. Agnostic laws remain in `REFER.OS/*`.
2. App-scoped bindings live in app artifacts (for Spirit: `refer.app/spirit/*`).
3. Agnostic laws may reference app artifacts but must not depend on hardcoded app values to remain valid.
4. When app values change, update app artifacts first; law docs should only change if invariants changed.
5. Validation tooling must read app artifacts for thresholds/maps and apply agnostic law gates to those values.
