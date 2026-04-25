# Law 63: theme.spec.md — Canonical Theme Token Template (IMSCE)
Tokens in this spec refer to render-quality controls (color, spacing, typography, motion, state). Copy text uses named variables, not tokens.

This document is the authoritative token template for themes. It is not a theme.
Every theme (CSS, DB, or generated) should map to these keys. Missing tokens must
fall back through the canonical cascade: Local → Theme → Default.
The cascade is **priority + emission**: each layer may *author* tokens, and higher
layers override lower layers. Default is not passive; it must emit a complete
derived set from the base seed when no higher layer is active.

Cross-links:
- Structural law + HL derivation: `REFER.OS/refer.honeycomb.md`

## Article 63.1: 1.1 Relationship to Honeycomb

`refer.honeycomb.md` defines the IMSCE structure and phase behavior. This spec defines the
token contract that Honeycomb consumes. Mapping is 1:1 by layer:

- I tokens fill the Index phase.
- M tokens fill the Modal phase.
- S tokens fill the Section phase.
- C tokens fill the Card phase.
- E + E.<type> tokens fill Element phases and their typed variants.

HL Derivation rules (in Honeycomb) describe how to compute these tokens from `M.surface`.
HL is the numeric engine for the **theme plane**; it does not supersede cascade priority.
Default/root must author the derived tokens if no Theme/Local overrides exist.

## Article 63.2: 1. Purpose

- Provide a complete, reusable token map for IMSCE theming.
- Act as the “inspector” template for coverage and validation.
- Support future DB-driven themes without changing the spec.

## Article 63.3: 2. IMSCE Layer Tokens (Required)

### Section 63.3.1: Index (I)
- `I.surface`
- `I.surfaceGradient`
- `I.surfacePattern`

### Section 63.3.2: Modal (M)
- `M.surface`
- `M.surfaceGradient`
- `M.surfacePattern`

### Section 63.3.3: Section (S)
- `S.surface`
- `S.surfaceGradient`
- `S.surfacePattern`
- `S.border`
- `S.shadow`
- `S.radius`

### Section 63.3.4: Card (C)
- `C.surface`
- `C.surfaceGradient`
- `C.surfacePattern`
- `C.text`
- `C.textMuted`
- `C.border`
- `C.shadow`
- `C.radius`

### Section 63.3.5: Element (E) — Base
- `E.surface`
- `E.surfaceGradient`
- `E.surfacePattern`
- `E.text`
- `E.textMuted`
- `E.border`
- `E.shadow`
- `E.radius`

## Article 63.4: 3. Element Type Tokens (Required by Type)

Element types (from `refer.structure.md`):
- `button`
- `field`
- `chip`
- `dot`
- `icon`
- `media`
- `badge`
- `text`
- `label`
- `details`

For each element type above, define:
- `E.<type>.surface`
- `E.<type>.surfaceGradient`
- `E.<type>.surfacePattern`
- `E.<type>.text`
- `E.<type>.textMuted`
- `E.<type>.border`
- `E.<type>.shadow`
- `E.<type>.radius`

## Article 63.5: 4. Optional Extension Tokens

These are optional but recommended for richer themes:
- `I.shadow`, `M.shadow`
- `I.radius`, `M.radius`
- `E.<type>.accent`, `E.<type>.accentContrast`
- State tokens: `E.<type>.error`, `E.<type>.warning`, `E.<type>.success`, `E.<type>.focus`
- Interaction tokens (optional):
  - `E.<type>.hover`
  - `E.<type>.active`
  - `E.<type>.pressed`
  - `E.<type>.disabled`
  - `E.<type>.selected`

## Article 63.6: 4.1 Optional Elevation Scale (Structural)

Elevation should be structural, not decorative. Two optional patterns are allowed:

Option A: Semantic elevation
- `S.shadowLow`
- `S.shadowHigh`
- `C.shadowRaised`
- `M.shadowOverlay`

Option B: Global elevation scale
- `elevation.0`
- `elevation.1`
- `elevation.2`
- `elevation.3`

Components may reference the elevation scale while still supporting `*.shadow`.

## Article 63.7: 4.2 Optional Accent Tokens (Layer)

Layer accents (optional):
- `I.accent`
- `M.accent`
- `S.accent`
- `C.accent`

## Article 63.8: 4.3 Typography Tokens (Required)

Typography is part of theme matching to preserve contrast and layout fidelity.
Themes must supply the typography tokens below so text renders consistently
across surfaces and states.

Required typography tokens:
- `font.display`
- `font.body`
- `text.title.size`
- `text.title.weight`
- `text.title.lineHeight`
- `text.title.letterSpacing`
- `text.sub.size`
- `text.sub.weight`
- `text.sub.lineHeight`
- `text.sub.letterSpacing`
- `text.body.size`
- `text.body.weight`
- `text.body.lineHeight`
- `text.body.letterSpacing`
- `text.caption.size`
- `text.caption.weight`
- `text.caption.lineHeight`
- `text.caption.letterSpacing`
- `text.label.size`
- `text.label.weight`
- `text.label.lineHeight`
- `text.label.letterSpacing`

## Article 63.9: 4.4 Pattern Token Guidance

`*.surfacePattern` may reference a URL, SVG ID, or named pattern token.
Themes must document the pattern format they use.

## Article 63.10: 4.5 System Semantic Tokens (Reserved)

System semantics (error/warning/success/info) must remain consistent across themes
and must meet contrast requirements on any surface. These tokens may be used by any
layer or element to override local/theme colors when a semantic state is present.

Reserved tokens:
- `system.error.bg`
- `system.error.text`
- `system.error.border`
- `system.error.icon`
- `system.error.ring`

- `system.warning.bg`
- `system.warning.text`
- `system.warning.border`
- `system.warning.icon`
- `system.warning.ring`

- `system.success.bg`
- `system.success.text`
- `system.success.border`
- `system.success.icon`
- `system.success.ring`

- `system.info.bg`
- `system.info.text`
- `system.info.border`
- `system.info.icon`
- `system.info.ring`

Semantic enforcement:
- Error/warning/success/info must override local/theme colors when state is active.
- Use ring/shadow/glow when needed to guarantee contrast on any surface.

## Article 63.11: 4.6 Banded Delta Rules (Theme Stability)

Bands keep color changes within a phase so themes stay cohesive and avoid contrast collisions.
All state variants must stay within their layer’s band.

### Section 63.11.1: Band rules
- **Base seed**: define `M.surface` first. All other layers derive from it.
- **Within-band only**: hover/active/pressed/disabled/selected must not change hue family.
- **Small deltas**: apply small lightness/saturation/alpha shifts only.
- **No cross-phase jumps**: do not derive element states from a different layer’s base.

Compound card (DX) guidance:
- DX cards inherit `C.surface` by default.
- A DX card may apply a small local delta (±4-12% L) to create depth inside a compound stack.
- DX deltas must stay within the C band and must not introduce new hue families.

### Section 63.11.2: Recommended delta ranges (guidance)

Surface bands (relative to the layer’s own surface):
- **Hover**: ±4–6% lightness
- **Active/Pressed**: ±6–10% lightness
- **Disabled**: reduce contrast by 12–18% and reduce saturation by 10–20%
- **Selected**: keep within ±6–10% + optional border/outline accent

Text bands (relative to layer text):
- **Muted**: 30–45% toward neutral/transparent
- **Disabled**: 45–60% toward neutral/transparent
- **Selected/Active**: 5–10% toward stronger contrast (no hue jump)

Borders/shadows:
- **Border**: 10–25% toward text color or accent, not a new hue.
- **Shadow**: small opacity shifts only; no new hue unless semantic state (error/warn/success/info).

If a theme needs more distance, adjust the base layer token, not the state variants.

## Article 63.12: 4.6.1 State Canon (Standard)

Definitions:
- **NHPADM**: Neutral → Hover → Pressed → Active → Disabled → Muted (canonical sequence).
- **NHP**: shorthand for Neutral → Hover → Pressed.
- **HPAD**: shorthand for Hover → Pressed → Active → Disabled (interaction subset).
- **1N/2H/3P/4A/5D/6M**: numeric alias for NHPADM (ordering is explicit).
- **Neutral**: baseline, no interaction; the origin for all state deltas unless another state is set on load.
- **Hover**: pointer over; subtle emphasis only.
- **Active**: toggled/on state (semantic “on”, not press).
- **Pressed**: physical down state during interaction (momentary).
- **Disabled**: unavailable; lowest contrast within the band.
- **Selected**: chosen among peers; persistent but not necessarily “on”.
- **Muted**: text-only variant; lower emphasis, not an interaction state.

Equivalence rules:
- **Active ≠ Pressed** (active is semantic; pressed is momentary).
- **Selected ≠ Active** (selected is contextual choice; active is on/off).
- **Muted ≠ Disabled** (muted is readable but low emphasis; disabled is deactivated).

State precedence (when multiple apply):
1) Disabled
2) Pressed
3) Active
4) Selected
5) Hover
6) Neutral

Token mapping:
- Interaction states map to `E.<type>.<state>` tokens.
- Muted maps to `*.textMuted` for its layer/type.

## Article 63.13: 4.6.2 Variant Band (N-Variants) - Optional

Variants are Neutral-tier bands, not interaction states. They select a base
surface/text pair before HPAD applies.

Recommended mapping:
- **N1**: Primary
- **N2**: Ghost
- **N3**: Warn
- **N4**: Muted

Naming (element-typed):
- Base: `E.<type>.n1` ... `E.<type>.n4`
- Variant text: `E.<type>.n1text` ... `E.<type>.n4text`
- Variant muted text: `E.<type>.n1textMuted` ... `E.<type>.n4textMuted`
- HPAD overlay per variant: `E.<type>.n1h`, `E.<type>.n1p`, `E.<type>.n1a`, `E.<type>.n1d`

Rules:
- Variants do **not** replace HPAD; they provide the Neutral base.
- Muted remains a text-tone; `N4` should resolve to `*.textMuted` or `n4textMuted`.
## Article 63.14: 4.7 HL Derivation (Seed-Based Themes)

Themes are derived from a single seed (`M.surface`) using OKLCH/HCL deltas. The spec
defines the *rules* and the seed swaps per org/route. Hue should remain stable;
derivation adjusts lightness/chroma unless a variant explicitly changes hue.

Surface deltas (from M.surface):
- I.surface: no delta (I.surface == M.surface)
- S.surface: L + 6%, C - 0.01
- C.surface: L + 12%, C - 0.02
- E.surface: L + 18%, C - 0.03
*(Invert L deltas for light seeds; I.surface remains equal to M.surface.)*

Text rules:
- Only **C.text** and **E.<type>.text** are authored.
- Text contrast uses WCAG ratios: 4.5:1 normal, 3:1 muted.
- No I.text / M.text / S.text tokens are authored.

## Article 63.15: 4.8 Text Shadow Readability (Required)

All text-rendering elements must apply a tokenized text shadow for legibility.
Use `E.text.shadow` or `E.<type>.shadow` as the canonical source for text shadow.
The shadow must be inverse to the surface (dark text on light surfaces uses a light
shadow; light text on dark surfaces uses a dark shadow) with minimal blur/spread.

## Article 63.16: 6. Motion Tokens (Optional, Reserved)

Reserved motion namespace (not required yet):
- `motion.fast`
- `motion.base`
- `motion.slow`
- `easing.standard`

## Article 63.17: 5. Template Block (Copy/Paste)

```
I.surface:
I.surfaceGradient:
I.surfacePattern:

M.surface:
M.surfaceGradient:
M.surfacePattern:

S.surface:
S.surfaceGradient:
S.surfacePattern:
S.border:
S.shadow:
S.radius:

C.surface:
C.surfaceGradient:
C.surfacePattern:
C.text:
C.textMuted:
C.border:
C.shadow:
C.radius:

E.surface:
E.surfaceGradient:
E.surfacePattern:
E.text:
E.textMuted:
E.border:
E.shadow:
E.radius:

E.button.surface:
E.button.surfaceGradient:
E.button.surfacePattern:
E.button.text:
E.button.textMuted:
E.button.border:
E.button.shadow:
E.button.radius:

E.field.surface:
E.field.surfaceGradient:
E.field.surfacePattern:
E.field.text:
E.field.textMuted:
E.field.border:
E.field.shadow:
E.field.radius:

E.chip.surface:
E.chip.surfaceGradient:
E.chip.surfacePattern:
E.chip.text:
E.chip.textMuted:
E.chip.border:
E.chip.shadow:
E.chip.radius:

E.dot.surface:
E.dot.surfaceGradient:
E.dot.surfacePattern:
E.dot.text:
E.dot.textMuted:
E.dot.border:
E.dot.shadow:
E.dot.radius:

E.icon.surface:
E.icon.surfaceGradient:
E.icon.surfacePattern:
E.icon.text:
E.icon.textMuted:
E.icon.border:
E.icon.shadow:
E.icon.radius:

E.media.surface:
E.media.surfaceGradient:
E.media.surfacePattern:
E.media.text:
E.media.textMuted:
E.media.border:
E.media.shadow:
E.media.radius:

E.badge.surface:
E.badge.surfaceGradient:
E.badge.surfacePattern:
E.badge.text:
E.badge.textMuted:
E.badge.border:
E.badge.shadow:
E.badge.radius:

E.text.surface:
E.text.surfaceGradient:
E.text.surfacePattern:
E.text.text:
E.text.textMuted:
E.text.border:
E.text.shadow:
E.text.radius:

E.label.surface:
E.label.surfaceGradient:
E.label.surfacePattern:
E.label.text:
E.label.textMuted:
E.label.border:
E.label.shadow:
E.label.radius:

E.details.surface:
E.details.surfaceGradient:
E.details.surfacePattern:
E.details.text:
E.details.textMuted:
E.details.border:
E.details.shadow:
E.details.radius:

E.button.hover:
E.button.active:
E.button.pressed:
E.button.disabled:
E.button.selected:

E.field.hover:
E.field.active:
E.field.pressed:
E.field.disabled:
E.field.selected:

E.chip.hover:
E.chip.active:
E.chip.pressed:
E.chip.disabled:
E.chip.selected:

E.dot.hover:
E.dot.active:
E.dot.pressed:
E.dot.disabled:
E.dot.selected:

E.icon.hover:
E.icon.active:
E.icon.pressed:
E.icon.disabled:
E.icon.selected:

E.media.hover:
E.media.active:
E.media.pressed:
E.media.disabled:
E.media.selected:

E.badge.hover:
E.badge.active:
E.badge.pressed:
E.badge.disabled:
E.badge.selected:

E.text.hover:
E.text.active:
E.text.pressed:
E.text.disabled:
E.text.selected:

E.label.hover:
E.label.active:
E.label.pressed:
E.label.disabled:
E.label.selected:

E.details.hover:
E.details.active:
E.details.pressed:
E.details.disabled:
E.details.selected:

font.display:
font.body:

text.title.size:
text.title.weight:
text.title.lineHeight:
text.title.letterSpacing:

text.sub.size:
text.sub.weight:
text.sub.lineHeight:
text.sub.letterSpacing:

text.body.size:
text.body.weight:
text.body.lineHeight:
text.body.letterSpacing:

text.caption.size:
text.caption.weight:
text.caption.lineHeight:
text.caption.letterSpacing:

text.label.size:
text.label.weight:
text.label.lineHeight:
text.label.letterSpacing:
```
