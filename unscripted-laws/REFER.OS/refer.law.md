# Law 39: refer.law.md Ã¢â¬â Governing Laws for REFER.OS

This document captures the core laws that replaced the old E2E protocols (E2E Build Protocol, Execution Flow, Laws, No-Client-DB, etc.) and now govern REFER.OS. Every refer action must stay compliant with these laws before RETURN/COMMIT/PUBLISH can complete.

## Article 39.1: 1. No Action Without Reference

- REFER.OS requires every **execution intent** to begin with `refer.` or `refer.md:`. The router rejects any attempt to execute without a refer directive; unprefixed inputs are treated as **secular chat** only.
- Identity, structure, relation, and unfolding must all be anchored in the refer.\* documents (`refer.identity.md`, `refer.structure.md`, `inference.md`, `refer.<system>.md`, etc.) before IO happens.
- `refer.flow.md` is the primordial law; all other refer.\* documents must reconcile to it.
- Skills are subordinate to `refer.flow.md`; skills may not authorize execution without reference.

## Article 39.2: 2. Single Source of Interpretation

- `refer.md` is the Rosetta Stone (per `refer.os.md` ÃÂ§1 and ÃÂ§6.2). It classifies the domain, selects the reference files, and enforces the RETURN/COMMIT/PUBLISH sequence.
- No direct instructions to core services/repositories should occur outside the `refer.*` action documents; negotiate through the router even for simple fixes.

## Article 39.3: 3. Referential Consistency

- IMSCE (Identity) + ASEDAWSI/EWCPSI (Structure/Workflow) now live inside `refer.identity.md`, `refer.structure.md`, and `inference.md`.
- Every action must verify that the identity definitions, structure mappings, and inference blueprints used match the current serialized references before mutation.

## Article 39.4: 3.1 Reverent Execution (Refer Lineage)

- **Refer** is the verb (to point) and the noun (the operating system derived from that verb).
- **Reverent** means compliant with the Refer order: actions only unfold from referenced sources.
- External knowledge is raw material until made reverent; do not act on it directly.
- Canon answers must be sourced from an opened reference in-session. If the reference is not open, the response must be declared secular and the agent must request permission to make it reverent by reading the source.
- Secular chat is permitted for non-executable discussion. If governed intent is detected, the agent must infer the likely `refer.<domain>`; proceed without a prompt when unambiguous, and present a short domain choice prompt only when ambiguous.
- Identity is defined by placement/behavior (IMSCE position), not by labels or class names; labels are optional aids.
- If a needed reference is missing or ambiguous, create or update the reference before proceeding.
- Domain shifts are inferred but require explicit confirmation.
- Every unfold must close the loop with RETURN (no drift, no partials, no dangling lineage).

## Article 39.5: 3.1.1 Reference-Only Execution (No Freestyle)

- No repo mutation is allowed unless the exact behavior is explicitly documented in REFER.OS (refer.\*) sources.
- User prompts are not authority by themselves; they must point to an existing reference or trigger a governance update first.
- If no reference exists, stop execution and enter refer.governance to codify the rule before any change.
- No exceptions.

## Article 39.6: 3.1.2 Law as Blueprint (Primordial)

- Law is the primordial blueprint that seeds all plan blueprints.
- Missing plan specs do not block execution when the governing law applies.
- Repairs must classify intent into Mind/Body/Spirit and align to law; blueprint guidance is optional, not required.
- Builds manifest lawful capabilities not yet materialized in code; "new" means not yet implemented, not invented.

## Article 39.7: 3.1.3 Non-Precedent Rule

Repetition, frequency, or consistency across instantiations or manifestations SHALL NOT create precedent or authority. Law may be created or modified only through explicit governance and ratification.

## Article 39.8: 3.2 UTF-8 Encoding Law

- All REFER.OS documents and repo docs must be stored as UTF-8 without BOM.
- Do not introduce mixed encodings; normalize files to UTF-8 when touched.

## Article 39.9: 3.3 Responsive Integrity (Structure + Safety)

- Use fluid sizing for layout (%, rem, em, clamp(), min(), max()); fixed px widths are allowed only for icons, borders, and hairlines.
- Container-first widths: parents define size; children default to width: 100% and max-width: 100%.
- Flex/grid guard: any flex/grid child that can grow must set min-width: 0 to allow shrinking.
- Text safety: long strings must wrap (overflow-wrap: anywhere; word-break: break-word).
- Media safety: img/video/svg must not overflow (max-width: 100%; height: auto).
- Breakpoints are content-driven; prefer mobile-first with min-width queries.
- Viewport must include width=device-width and initial-scale=1.0.
- Accessibility: tap targets >= 48px, content reflows without loss, keyboard and touch parity.
- Scroll discipline: vertical scrolling is default; horizontal scrolling only for intentional rails; avoid global overflow: hidden.
- IMSCE padding ladder: define tokenized padding per layer with clamp() so small screens compress and large screens breathe.
  - I (Index): clamp(12px, 2.5vw, 28px)
  - M (Modal): clamp(10px, 2.2vw, 24px)
  - S (Section): clamp(8px, 2vw, 20px)
  - C (Card): clamp(8px, 1.6vw, 16px)
  - E (Element): clamp(6px, 1.2vw, 12px)
- Text roles: primary voice is location (IMSCE layer + element type), secondary voice is tag (h1/h2/body/sub).
  - C layer roles: card.h1, card.h2, card.body, card.sub, card.metric-label, card.metric-value.
  - E layer roles: el.action, el.label, el.helper, el.metric.
  - Role mapping: button text => el.action; input label => el.label; input helper/error => el.helper; stat labels => card.metric-label; stat values => card.metric-value; paragraphs => card.body; card titles => card.h2 (or card.h1 when primary).

## Article 39.10: 3.4 Semantic UI States (System Meaning)

- Semantic states are explicit labels applied to UI state (error, warning, success, info, link, highlight).
- Components opt into a semantic role when rendering a semantic state; the same component can render neutral or semantic variants.
- Semantic roles map to paired tokens (bg/text/border/icon/ring) derived from the delta semantic deviation layer.
- Semantic meaning must be consistent across layers; only the role changes, not the component identity.

## Article 39.11: 4. Micro-law staging

- Micro-laws and emergent governance heuristics belong inside the relevant refer document rather than as standalone files: add a titled paragraph, checklist, or subsection within `refer.law.md`, `refer.knowledge.md`, or the action doc (`refer.build.md`, etc.).
- When a micro-law grows into a broader domain, promote it to a dedicated `refer.<domain>.md` and update `refer.md` so the router can resolve it.
- When the router detects an intent without a documented rule, trigger an interrogatory: notify the prompter, walk through the implications across identity, structure, inference, and related systems, and only after you validate the behavior do we codify the micro-law and resume the action.
- Communication follows Ã¢â¬ÅChat Ã¢â â Teach Ã¢â â InterrogateÃ¢â¬Â: explanations should stay human and short, metaphors align new ideas with known ones, and clarifying questions must cascade logically before any refer action resumes.
- Evolutionary expectation: whenever a more efficient methodology appears, capture it as a new micro-law or refer document, update the router references, and treat the prior version as archived knowledge; REFER.OS must always make room for better practices without losing the lineage.
- Context continuity: Each `refer.` invocation opens a persistent session. The router locks that refer domain until you explicitly authorize a new `refer.<domain>` or state Ã¢â¬Åswitch context toÃ¢â¬Â¦Ã¢â¬Â. If an unrelated intent is detected, the router will flag it, suggest starting a new chat, or require an explicit context authorization before proceeding.
- Context alerts: The router surfaces alerts when it detects unauthorized context shifts or undeclared intents so you can acknowledge the switch or invoke the interrogatory; prompts are required only when the inferred domain is ambiguous.

## Article 39.12: 4.2 Hover & Destructive Voice

- **Hover Accent Law**: hover states may adjust shadows, outlines, borders, or elevation tokens only; the base surface color/texture must stay at the IMSCE-layer level so hover interactions emphasize depth/edges instead of repainting the panel background.
- **Destructive Confirmation Law**: any destructive delete (bookmarks, journeys, audio history, profile artifacts, etc.) must be blocked by an explicit confirmation step (modal, inline guard, or prompt) before the backend request runs; the confirmation copy must remind the user of the permanence and require a second affirmative tap/click.

## Article 39.13: 5. Completion + RETURN

- Actions must articulate how RETURN confirms no half-builds, no dangling branches, no drift, and how COMMIT seals the update.
- RETURN gates COMMIT. If RETURN verification fails, the action must abort and re-enter the reference review cycle.

## Article 39.14: 6. Systems & Providers must be referenced, not manipulated

- Use `refer.<system>.md` or `refer.provider.<provider>.md` whenever interacting with Angular, Supabase, Cloudflare, Git, etc.
- Avoid embedding direct environment-specific logic inside componentsÃ¢â¬âreflect the dependency in a systems reference and let effects/services handle the IO.

## Article 39.14.1: 6.1 Complementary Baselines (Low-Friction)

These baselines add reuse and reduce reasoning. They do not add friction and apply only when the change touches the relevant surface.

- **NFR baseline**: When a change affects performance, latency, payload size, or availability, record a simple target in the blueprint/plan (e.g., "no regression vs current behavior"). If no target is declared, default to "no regression."
- **Data contract baseline**: When adding or changing tables, APIs, or shared DTOs, record the contract owner and a version tag in the blueprint/plan, and point to the migration or contract source of truth. If no new contract is introduced, no action is required.
- **Rollback baseline**: When a change touches DB schema, edge functions, or deploy steps, record a rollback trigger and the minimal rollback action (e.g., revert commit, run rollback script) in the QC note. If no deploy surface is touched, no action is required.
- **Acceptance baseline**: Each build/repair should list 1-3 acceptance checks in blueprint/plan. If none are listed, default acceptance is "no behavior regressions" plus QC/RETURN checks.

## Article 39.15: 7. Governance Updates

Governance Log

- Updated refer.flow signature requirement: all responses use `signer:`; explicit declaration no longer required.
- Disambiguated named variables (copy keys) vs render tokens across refer docs.
- Ratified dual Stripe account IDs for live/test onboarding and account selection.
- Ratified Stripe upcoming payments + subscription management workflow (upcoming list + cancel/pause via edge).
- Added reverent.deltatheme.md to codify delta-driven theme governance (IMSCE layers, vectors, bounds, compliance).
- Added Responsive Integrity law to prevent overflow and enforce fluid, accessible layouts.
- Added IMSCE padding ladder (clamp-based) to standardize responsive spacing per layer.
- Added text role system (IMSCE-first, tag-second) for consistent typography voices.
- Added Semantic UI States (system meaning) for semantic role application.
- Added recurring Purpose Giving Stripe workflow (weekly/bi-weekly/monthly cadence + start date) to refer.stripe.md and ratified it for execution.

- Added refer.housekeeping to govern non-behavioral cleanup actions and router entry in refer.md.
- Added refer.automated.md to govern automation classes and feature vs function precedence.
- Added logout presence-cache clearing rule for automated identity use.
- Added Cloudflare deploy requirement for push all unless --no-deploy is specified.
- Added baseline Daily provider reference (as-built) to anchor Telechurch Daily token/embedding behavior.
- Added baseline auth reference (as-built) for Supabase + OAuth + persistence gating.
- Clarified auth gating for realtime participation that needs verified identity (modal prompt + cancel).
- Router/Flow alignment: unambiguous natural language intent auto-routes to the inferred `refer.<domain>` without prompting; ambiguity prompts a short domain choice (aligns `refer.flow.md` with `refer.md`/`refer.plan.md`).
- Plan-router authority: unambiguous Plan intent auto-routes without explicit domain prompts; ambiguous intents prompt a short domain choice across Flow/Skills/OS logs.
- No-register code band: single-layer Repair/Expand (<=2 new artifacts) may execute without Plan registration; 3+ artifacts must upgrade to Plan; gap test required before Plan execution; auto-migrations run before verification.
- AI settings alignment: refer prefix no longer required for unambiguous natural-language routing; prompts only when intent is ambiguous.
- Consequence review: before executing changes (including single-layer), provide a brief impact note + any obvious gaps/adjacent consistency concerns; keep it concise and non-blocking.

- Clarified giving cancel reset behavior (clear inputs without unmounting Stripe) and events detail modal close-on-enter.
- Aligned Telechurch shortlink docs to canonical `/code` (no `/s/` prefix).
- Added baseline shortlink system reference and Telechurch prefix mapping.
- Shortlink middleware resolves `/<code>` for all GET/HEAD requests except bots (OG path).
- Added complementary baselines for NFRs, data contracts, rollback criteria, and acceptance checks (low-friction, reuse-first).
- Updated refer.flow signature rule to require `Signed:` context tags per governing domain; default to `Signed: Codex` when no explicit reference is cited.
- Replaced dual signature lines with single `Signed: refer.<doc>` (or `Signed: Codex` for secular responses).
- Allowed secular chat by default; execution auto-routes on unambiguous intent, and prompts only when the inferred domain is ambiguous.

- Added Canonical Asset Resolver identity (file.telechurchlive.com) to refer.identity.md for resolver governance.
- Added Central Upload Pipeline identity for shared upload helper governance.
- Added automated smoke loop guidance to refer.plan.md (auto-fix + re-run until success, then mark plan done).
- Added rule for ambiguous "build" to prompt CLI Build vs Plan Build choice in refer.plan.md.
- Added cross-app `refer.file.md` to govern canonical file resolver + central upload pipeline; updated router + Supabase references.
- Added timeout autonomy to refer.flow.md (classify timeouts, adjust strategy, rerun with bounded retries).
- Added refer.forge.md to govern tooling factory and registry doctrine.
- Added reminder alarm reliability doctrine across Cloudflare/build/inference/repair/spirit runtime docs, including earliest-future-alarm selection and internal diagnostics requirements.

- Removed the Plan interrogatory question "What should it NOT do in v1?"; non-scope is now captured only when explicit or safely inferred.
- Require committing plan-register changes on `main` before leaving `main` to start execution.
- `refer.governance` is the only allowed path for editing governance documents. It enforces the seven-step loop described in `refer.os.md` ÃÂ§9.
- Governance edits must document the triggering contradiction and the structural/identity reconciliation that justified the change.
- Registered Org Media Library feature identity to unblock PLAN-ORG-MEDIA-001.
- Added self-correcting execution flow: actions must follow DESM, auto-fix missing steps (including migrations) and continue; halt only when correction is impossible.
- Added migration immediacy: when a migration is created during execution, auto-push immediately without prompts.

## Article 39.16: 8. RETURN Ã¢â â COMMIT Ã¢â â PUBLISH

- RETURN: confirm transition stability, run tests/audits, and ensure no structural drift.
- COMMIT: create a message derived from the reference context, obey branch rules (`refer.branch`), and seal lineage.
- PUBLISH: push to canonical remotes, trigger deployments (Cloudflare/Supabase/Docker), and broadcast the updated reference state.

Any deviation from these laws must re-enter the governance update path via `refer.governance`.
