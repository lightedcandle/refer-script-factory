# Law 33: refer.honeycomb.md — The Biological Design Genome
Tokens in this document refer to render-quality controls (color, spacing, typography, motion, state). Copy text uses named variables, not tokens.
## Article 33.1: refer.honeycomb.md — The Biological Design Genome

The Honeycomb System is the **Structural Atmosphere** of REFER.OS. It uses a biological metaphor to govern how color identity (Pollen) resonates through the physical hierarchy (IMSCE) using intensity levels (Phases) and material transformations (Switches).

Cross-links:
- Token contract: `REFER.OS/theme.spec.md`

## Article 33.2: 1. The IMSCE Resonance (Target)
Aesthetics are not assigned; they are **Reflected** based on an element's position in the lineage.

### Section 33.2.1: The Tree Analogy (Biological Hierarchy)
The app is a Tree. Fruit cannot grow on the Trunk. Structure must follow nature:

| Level | Role | Analogy | Default Phase | Shape |
| :--- | :--- | :--- | :--- | :--- |
| **0 (Root)**| Repository | Roots | Phase 0 | Invisible |
| **I (Index)** | Ambient Ground | Trunk | Phase 1 (Pollen) | Square (Full Bleed) |
| **M (Modal)** | Focused Overlay | Main Branch | Phase 2 (Blossom) | Rounded (Floating) |
| **S (Section)**| Structural Region| Sub Branch | Phase 3 (Bloom)| Rounded (Island) |
| **C (Card)** | Identity Unit | Leaf Branch | Phase 4 (Super) | Rounded (Island) |
| **E (Element)**| Interaction Unit| Fruit | Phase 5 (Hyper) | Rounded (Interactive) |

**The Law of Growth**: Use the phase to determine the specific aesthetic. If a component feels wrong, do not paint it; **Replant it**.
**The Law of Proximity (Strict Lineage)**: Nature does not skip generations. A Phase N element MUST grow on a Phase N-1 element.
*   **Illegal**: Fruit (5) on Section (3). (Gap!)
*   **Legal**: Fruit (5) on Card (4) on Section (3).
A Fruit (E) trying to grow on a Section is a "Wild" violation and must be domesticated by inserting a Leaf (Card).

**Text Placement Rule (Reverent)**: Text lives only on **Cards (C)** and **Elements (E)**. Index/Modal/Section do not own text tokens.

**Element identity (E)**: E-layer is resolved by IMSCE lineage (I->M->S->C) and element role class (button/field/text/etc). Explicit E IDs are optional and only needed for per-instance tracking.

### Section 33.2.2: IMSCE Inference (Honeycomb)
Honeycomb infers IMSCE identity purely from nesting depth and modal behavior.
See `refer.structure.md` for canonical IMSCE identity, nesting, and modal/card rules.

Depth mapping:
- 1 = Index (I) -> Phase 1
- 2 = Modal (M) -> Phase 2
- 3 = Section (S) -> Phase 3
- 4 = Card (C) -> Phase 4
- 5 = Element (E) -> Phase 5
- E+ remains Element identity.

Modal kind inference:
- 2P = Page modal (in-flow, no scrim)
- 2F = Floating modal (overlay + scrim)
- 2L = Locked modal (persistent dock, no scrim)
- 2N/2S/2E/2W = News modal (directional slide)

Invalid states are disallowed and must be reclassified to the correct modal kind or treated as build violations.

### Section 33.2.3: Modal Types (M)
Modal is a focused overlay layer with distinct subtypes:
- **Page modal**: persistent, embedded on the page (in-flow modal surface).
- **Floating modal**: popup overlay with scrim (hovering above Index).
- **News modal**: slide-in panels (down, left, right, or up).

---

## Article 33.3: 2. The Genetic Switches (Enzymes)
Switches are theme-agnostic instructions. Their specific rendering is defined by the **Theme Family**.

| Switch | Name | Logic |
| :--- | :--- | :--- |
| **F** | Flat | Solid opaque surface. |
| **G** | Gradient | Non-linear blend / depth. |
| **T** | Translucent | Fractional opacity / Backdrop blur. |
| **S** | Shadow | Neutral elevation (Gray/Dark). |
| **W** | Glow | Atomic radiance (Theme-colored). |
| **A** | Anchor | Text-Shadow for high-contrast readability. |
| **R** | Rounded | Soft corner geometry. |
| **P** | Pattern | Micro-texture (Grain/Noise). |
| **L** | Lighting | Specular highlight / Top-edge shimmer. |

### Section 33.3.1: Layered Background Rule
Honeycomb treats background layers as additive, not overriding:
- Image layer (top): `bg-image`
- Gradient layer (middle): `bg-gradient`
- Solid layer (base): `bg-color`

Rendering order (top -> bottom):
1) background image
2) background gradient
3) background color

If a layer is missing, the next available layer shows through.

---

## Article 33.4: 3. The 5 Apex Families (Species)
Every theme belongs to a **Family** which dictates how the Genetic Switches are interpreted.

| Family | Vibe | Rendering Focus |
| :--- | :--- | :--- |
| **Lithic** | Stable | Opaque, sharp, high contrast. |
| **Vitro** | Ethereal | Glass, blur, specular highlights. |
| **Velvet** | Soft | Clay-like, inner glows, pastels. |
| **Neon** | Radiant | Pure darks, vibrant outer halos. |
| **Organic**| Tactile | Micro-noise, paper, grain. |

---

## Article 33.5: 4. The Resonant DNA String
Every visual element in REFER.OS can be described by a code string:
`[Target] : [Phase] + [Switches]`

*Example (Card):* `C:3+GS+R` (Card at Bloom phase, with Gradient, Shadow, and Rounded corners).

---

## Article 33.6: 4.1 Theme Token Key Naming

Theme tokens are IMSCE-scoped and optionally element-typed. Format:

```
<Layer>[.<ElementType>].<Attribute>
```

Layers:
- `I`, `M`, `S`, `C`, `E`

ElementType (optional, only for E-layer overrides):
- `button`, `field`, `text`, `chip`, `dot`, `media`, `label`, `details`, `badge`

Attributes (baseline set):
- `surface`
- `surfaceGradient`
- `surfacePattern`
- `text`
- `textMuted`
- `border`
- `shadow`
- `radius`

Examples:
- `I.surface`
- `M.surfaceGradient`
- `C.border`
- `E.surface`
- `E.button.surface`
- `E.field.border`

## Article 33.7: 4.2 HL Derivation (HCL/OKLCH Integration)

Honeycomb accepts a **Hue + Lightness (HL)** derivation layer that converts a single seed
surface into a full IMSCE palette using OKLCH (or HCL) math. The structure (IMSCE) remains
the law; HL is the numeric engine. HL operates on the **theme plane** (token authoring),
while the cascade determines which authored set wins.

**Seed**:
- `M.surface` is the base seed color.
- Hue should remain stable across derived layers unless a variant explicitly changes hue.

**Surface progression (phase deltas)**:
- I.surface: M.surface (no delta; index equals the modal seed)
- S.surface: M.surface L + 6%, C - 0.01
- C.surface: M.surface (no delta; cards inherit the modal seed)
- E.surface: M.surface L + 18%, C - 0.03

*(Invert L deltas when M.surface is light; I.surface remains equal to M.surface.)*

**Text derivation**:
- C.text and E.<type>.text are solved **locally** against their own surfaces.
- Use WCAG contrast targets (C/E text >= 4.5:1, muted >= 3:1).
- No I.text / M.text / S.text tokens are authored.

**State deltas**:
- Hover: L ±4–6%
- Active/Pressed: L ±6–10%
- Disabled: L ±10–12% + reduce C by 0.03–0.05
- Selected: L ±6% + C +0.01–0.02

**Clamps**:
- L ∈ [0.02, 0.98]
- C ∈ [0.00, 0.22]
- Hue drift should remain ≤ 2° unless explicitly mutated.

State canon:
- Neutral is the origin unless another state is set on load; Hover/Active/Pressed/Disabled/Selected are explicit interaction states.
- Muted is a text-only variant, not an interaction state.
- Active ≠ Pressed; Selected ≠ Active; Disabled overrides all.
- NHPADM: Neutral → Hover → Pressed → Active → Disabled → Muted (canonical sequence).
- NHP: shorthand for Neutral → Hover → Pressed.
- HPAD: shorthand for Hover → Pressed → Active → Disabled.
- 1N/2H/3P/4A/5D/6M: numeric alias for NHPADM (ordering is explicit).

Variant band (optional):
- N1..N4 are Neutral-tier variants (primary/ghost/warn/muted).
- Variants select the base; HPAD applies on top (e.g., N2H = ghost + hover).
- Muted remains text-tone; N4 should resolve to `*.textMuted` or variant textMuted.
  
Compound card rule (DX):
- DX cards inherit `C.surface` and apply a small local delta (±4-12% L) to
  create depth within compound stacks without changing phases.

## Article 33.8: 4.3 Honeycomb ↔ Theme Spec Mapping

Honeycomb defines *structure and phase*; theme.spec defines *token keys*. The mapping is:

IMSCE layer -> Theme token keys
- I: `I.surface`, `I.surfaceGradient`, `I.surfacePattern`
- M: `M.surface`, `M.surfaceGradient`, `M.surfacePattern`
- S: `S.surface`, `S.surfaceGradient`, `S.surfacePattern`, `S.border`, `S.shadow`, `S.radius`
- C: `C.surface`, `C.surfaceGradient`, `C.surfacePattern`, `C.text`, `C.textMuted`, `C.border`, `C.shadow`, `C.radius`
- E: `E.surface`, `E.surfaceGradient`, `E.surfacePattern`, `E.text`, `E.textMuted`, `E.border`, `E.shadow`, `E.radius`
- E.<type>: element-specific tokens for `button`, `field`, `chip`, `dot`, `icon`, `media`, `badge`, `text`, `label`, `details`

Influence direction:
- Honeycomb -> defines *where* tokens apply (IMSCE phase + switches).
- theme.spec -> defines *what* tokens exist and must be filled.
- HL Derivation -> defines *how* tokens are computed from `M.surface`.

Notes:
- Use element-typed keys only when a theme needs explicit overrides.
- Background images are reserved for texture/pattern (not content).

### Section 33.8.1: Canonical Token Keys (Baseline)

Layer keys (IMSCE):
- Index (I):
  - `I.surface`
  - `I.surfaceGradient`
  - `I.surfacePattern`
- Modal (M):
  - `M.surface`
  - `M.surfaceGradient`
  - `M.surfacePattern`
- Section (S):
  - `S.surface`
  - `S.surfaceGradient`
  - `S.surfacePattern`
  - `S.border`
  - `S.shadow`
  - `S.radius`
- Card (C):
  - `C.surface`
  - `C.surfaceGradient`
  - `C.surfacePattern`
  - `C.text`
  - `C.textMuted`
  - `C.border`
  - `C.shadow`
  - `C.radius`
- Element (E):
  - `E.<type>.surface`
  - `E.<type>.surfaceGradient`
  - `E.<type>.surfacePattern`
  - `E.<type>.text`
  - `E.<type>.textMuted`
  - `E.<type>.border`
  - `E.<type>.shadow`
  - `E.<type>.radius`

Element type legend:
- `button`: primary and secondary action buttons
- `field`: input, textarea, select, toggle/switch, checkbox, radio
- `chip`: tags, pills, status chips
- `dot`: status dot/indicator
- `icon`: functional iconography
- `media`: image/video/icon containers
- `badge`: compact label badges
## Article 33.9: 5. Governance Laws
1.  **Exclusivity**: An element cannot have both **S (Shadow)** and **W (Glow)** unless specifically authored as a mutation.
2.  **Hierarchy**: A child phase must be $\ge$ its parent phase to ensure contrast (Pollen $\rightarrow$ Blossom $\rightarrow$ Bloom).
3.  **Anchoring**: If the background is **T (Translucent)** or **G (Gradient)**, the text must trigger the **A (Anchor)** switch.
4.  **The Law of Inheritance (Verticality)**:
    *   Components (2S, 2L) do **not** inherit from other components (2P). They inherit from the **Phase (Registry)**.
    *   **2P (Page Modal)** is the *Firstborn*, setting the visual expectation.
    *   **2S (Menu Modal)** is a *Sibling*.
    *   Both must drink from the same **M (Mother)** variable in the Registry.
    *   *Violation:* `2S` copying styles from `2P` css.
    *   *Correction:* Both pointing to `var(--refer-m-surface)`.
