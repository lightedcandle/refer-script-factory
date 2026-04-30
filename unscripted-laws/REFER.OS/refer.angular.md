# Law 8: refer.angular.md — Angular System Relation

This reference captures Angular-specific constraints while pointing readers to REFER.OS as the active governance layer.

## Article 8.1: 1. Angular constraints

- Components remain view-only. They only bind to signals/selectors and dispatch intents. No direct repository or service IO belongs in a Angular view; all IO lives behind effects or services.
- Signal-based state is the canonical source of truth. Any feature component should lean on `store` facades (`refer.build`, `refer.repair` actions) and signal derivations (`refer.structure.md`, `inference.md`) rather than local mutable state.
- OnPush change detection, standalone components, and clear selector contracts keep the UI layer predictable. Follow the `src/app/features/*` feature layout, naming each component consistent with its registered identity in `refer.identity.md`.

## Article 8.2: 1.1 Responsiveness contract (Page → Modal → Section → Card → Elements)

Responsiveness is enforced as a *layered contract* so every new feature inherits predictable behavior without bespoke per-page fixes.

### Section 8.2.1: Page
- Use a single page shell: `.tc-page` (+ optional `.tc-container`) for `min-height`, gutters, safe-area bottom padding, and horizontal overflow protection.
- Avoid `width: Npx` for layout. Use `min()`, `max()`, `clamp()`, or Tailwind responsive utilities.

### Section 8.2.2: Modal
- Structure modals as: scrim + centered shell + constrained card:
  - Scrim: `.tc-modal-scrim`
  - Shell: `.tc-modal`
  - Card/panel: `.tc-modal__card`
- Modal padding must include safe-area insets (top/right/bottom/left).
- Modal height constraints must use `dvh` units (`100dvh`) to behave correctly on mobile browser chrome.

### Section 8.2.3: Section / Card
- Sections and cards must always satisfy: `width: 100%`, `max-width: 100%`, `min-width: 0`.
- Prefer `.tc-section` / `.tc-card` (or role primitives `role-section` / `role-card`) and avoid nested fixed paddings that create overflow at small widths.

### Section 8.2.4: Elements
- Any element inside responsive containers must be allowed to shrink:
  - In flex/grid layouts, children must have `min-width: 0` (the #1 cause of “mystery” overflow).
  - Media must never exceed container width (`img/video/canvas { max-width: 100% }`).
  - Form controls must not exceed container width (`input/select/textarea/button { max-width: 100% }`).

Implementation lives in `src/styles.css` under the `.tc-*` primitives and `--tc-*` render tokens.

Named variables are for copy text (label keys); render tokens govern visual behavior (color/spacing/typography/motion).

## Article 8.3: 2. Referential alignment

- When `refer.build` or `refer.expand` adds a UI surface, cite this reference to ensure ASEDAWSI, IMSCE, and guard logic stay intact. Map the component to identities in `refer.identity.md`, reflect the signals in `refer.structure.md`, and document inference paths in `inference.md`.
- Use the Design Lab (`refer.designlab.md`) to iterate on primitives, then promote them to this canonical reference so every Angular surface uses the same tokens and signals.

## Article 8.4: 3. System compliance

- Upgrades, CLI commands, or module wiring must respect the Living Execution System (LES) spelled out in `refer.os.md` and `refer.law.md`.
- Every Angular change must pass `refer.qc.md` checks (especially structural/inference integrity) before RETURN → COMMIT → PUBLISH wraps the work, keeping the Angular layer consistent with the refer router.
