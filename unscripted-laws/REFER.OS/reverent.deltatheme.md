# Law 62: reverent.deltatheme

﻿# reverent.deltatheme.md - Delta Theme Governance (Reverent)

Purpose
- Define the delta-driven theme model that derives all layer tokens from a single base.
- The base seed is `M.surface`; derivation authors tokens, not just priority fallback.
- Hue should remain stable; derivation adjusts lightness/chroma unless a variant explicitly changes hue.
- Make theme behavior auditable (compliance vs violation) and consistent across IMSCE layers.

Scope
- Applies to UI theming where a single base color (Modal) is shifted by declared deltas.
- Governs the 5-layer IMSCE stack: Index -> Modal -> Section -> Card -> Elements.

Model
- Base: Modal (layer 2) provides the chromatic anchor.
- Deltas: Each lower layer applies a fixed vector shift to the base.
- Vectors are declared, not inferred. No ad-hoc drift.

Vector axes (6)
- dL: lightness shift
- dHue: hue rotation shift
- dChroma: saturation magnitude shift
- dTemp: warm/cool bias shift
- dNeutral: pull toward gray shift
- dContrast: text contrast pressure shift

Layer rules
1) Index: Neutral anchor (no color shift).
2) Modal: Base color (delta = [0,0,0,0,0,0]).
3) Section: Delta applied from Modal.
4) Card: Delta applied from Modal (stronger than Section).
5) Elements: Delta applied from Modal (focus, borders, readable text).

Compliance rules
- Each layer has declared delta bounds. A layer is compliant if all 6 axes stay within bounds.
- Alt cards must stay within the same bounds as primary cards (content pressure cannot change deltas).
- Violations must surface the first offending token and axis.

Token mapping (concept)
- Each layer maps to concrete tokens (surface, text, border, button, focus).
- Example mapping (not exhaustive):
  - Section -> --refer-s-surface, --refer-s-text, --refer-s-border
  - Card -> --refer-c-surface, --refer-c-text, --refer-c-border
  - Element -> --refer-e-button-surface, --refer-e-text, --refer-e-focus

Non-goals
- No per-org/per-user runtime variation in this phase.
- No database dependency; deltas live in static config until proven necessary.

Implementation notes (for later)
- The model may be wired into Designlab or Honeycomb, but governance is independent of tooling.
- Honeycomb modification is optional; enforcement can be done at build-time.

Semantic deviation layer (system meaning)
- Semantic roles (error, warning, success, info, link, highlight) are computed as a deviation layer from the Modal base, not a separate palette.
- Components select a semantic role; the system derives paired tokens for background/text/border/icon/ring.
- Derived tokens (per role):
  - --refer-sys-<role>-bg
  - --refer-sys-<role>-text
  - --refer-sys-<role>-border
  - --refer-sys-<role>-icon
  - --refer-sys-<role>-ring
- Guardrail (embedded in deviation):
  - If semantic hue is too close to base hue or contrast fails, shift/invert the semantic deviation until contrast passes.
  - Always derive text from background to guarantee contrast; never use a role background without its paired role text.
