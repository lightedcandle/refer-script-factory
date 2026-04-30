# Law 55: refer.structure.md — Structural Mapping (UI • Workflow • Broadcast)

This reference defines how work is structurally classified and wired across the three front-edge layers: UI, workflow, and broadcast. Use it to keep new changes consistent with REFER.OS boundaries (views render state + dispatch intents; IO and business logic live outside components).

## Article 55.1: 1. The three layers

- **UI (Body)**: components/templates under `src/app/features/**` (and pages, if present). Views bind to selectors and dispatch intents only.
- **Workflow (Mind)**: orchestration under `src/app/workflows/**` (actions/services/guards/signals).
- **Broadcast (Spirit)**: realtime/signal relations under `src/app/core/realtime/**`.

## Article 55.1.1: Body default visual doctrine (Flat Seamless)

For page-level Body realization, the default visual doctrine is `REFER.OS/refer.seamless-ui.md`.

- Applies automatically to Index/Modal/Section/Card layout decisions when composing public or app page surfaces.
- Parent shells may not reintroduce card chrome around seamless stacks unless explicitly scoped by Plan deviation.
- Section seams must remain flush where sections meet (no accidental gap/radius/shadow artifacts).
- Sticky Body headers must preserve scroll offset buffer so anchored content is not hidden.
- Body actions rendered in menus must terminate in concrete behavior (no dead actions).
- If a feature intentionally diverges, record the deviation in Plan and treat it as a scoped exception.

## Article 55.2: 1.1 The refer.app Mirror

`refer.app/` mirrors the structure of `REFER.OS/` to provide app-scoped interpretations of universal laws.

- **Universal Scope**: `REFER.OS/` (Apply to all apps)
- **App Scope**: `refer.app/` (Apply to all features in this app)
- **Feature Scope**: `refer.app/features/**` (Apply to specific features)

Check `refer.app` for scoped overrides before applying universal laws.

## Article 55.3: 1.2 IMSCE structural definitions (UI)

These definitions are structural and component-first. CSS styles may organize elements inside a component, but CSS must not replace structure.

- **I (Index)**: the HTML template for a feature component (the route’s primary view).
- **M (Modal)**: each route has a prevailing Index and a Page Modal (2p). The Page Modal is the first overlay above the page and must be an explicit component (typically referenced/shared). Exceptions are for quick tests or rapid prototyping, with the expectation the component becomes reverent later.
- **S (Section)**: the first grouping layer inside a modal (2p, 2f, etc.). Sections are explicit components and live inside modals.
- **C (Card)**: cards sit inside sections and can be atomic or composite. A card inside another card is still a card. Structure is always component-based; CSS does not replace components.

## Article 55.4: 1.3 UI harmony stack (structure + styling)

Harmonize rules by clearly owning each concern. Structure is component-first; CSS styles should not replace components.

- **Layout ownership**: parents own layout (grid/flex/position/size). Children do not reposition themselves outside their root.
- **Component scope**: component CSS styles only its own subtree; avoid global selectors and deep overrides.
- **Token discipline**: use CSS variables for color/spacing/typography; define render tokens at the nearest owning parent.
- **Named variables**: use named copy variables for text; do not label copy keys as tokens.
- **Single source per concern**: only one layer owns width/position, one layer owns theme/typography, one layer owns internal spacing.
- **Root normalization**: component roots set `display`, `min-width`, `box-sizing` as needed to avoid implicit layout conflicts.
- **Override hygiene**: avoid `!important` unless explicitly documented; prefer component APIs/inputs over global overrides.

## Article 55.5: 1.3.1 Theme cascade (canonical)

Theme resolution follows a strict cascade:

1. **Local** (component scope): component stylesheet tokens or inline component-scoped overrides.
2. **Theme** (feature/route scope): theme classes/tokens applied at the feature root (e.g., `theme-*`).
3. **Default** (global scope): `:root` tokens and baseline defaults.

If a token is not defined at a higher layer, it must fall back to the next layer in order. Components must use `var(--token, fallback)` to preserve this cascade.
Cascade is not just priority; it is **authorship**. Each layer may emit tokens. The
Default layer must emit derived tokens from the base seed (`M.surface`) so the UI
has a complete token set even without Local/Theme overrides.

## Article 55.6: 1.4 IMSCE identity + identifiers

Every IMSCE component must declare a stable identifier so Honeycomb can map theme intent accurately.
IMSCE is the identity rule; the acronym encodes the canonical order and constraints.

Requirements:

- Unique per feature/route.
- Encodes the IMSCE layer and lineage.
- Stable across refactors (only changes when identity changes).
- Must include explicit depth tags (numeric) on IMSCE containers.

Identifier policy:

- **Reverent (production)**: explicit IMSCE identifiers are mandatory.
- **Incarnation (development)**: inference by nesting/behavior is allowed for speed, but explicit IDs must be added before reverent promotion.

Canonical format:

```
<I|M|S|C|E>-<feature><index>[-<path>]
```

Examples:

```
I-IC1
M-IC1-HostDetails
S-IC1-Header
C-IC1S3-EventsList
E-IC1S3C2-JoinButton
```

Legacy aliases like `B-IC1S3C2` remain valid if they already encode lineage; when ambiguous, add an explicit layer prefix.

Depth codes:

- 1 = Index (I)
- 2 = Modal (M)
- 3 = Section (S)
- 4 = Card (C)
- 5 = Element (E)
- E+ resolves to Element identity

Depth tag rule:

- IMSCE containers must include a numeric depth tag (e.g., `data-imsce-depth="2"`).

Element identity note:

- **E is explicit by position and role**: elements are resolved by IMSCE lineage (I->M->S->C) plus their role class (button/field/text/etc). E-level IDs are optional and only needed for per-instance tracking.
- **Uniqueness rule**: within a card, element labels/names should be unique. For lists, include a stable item key in the element's semantic tag (e.g., `data-action="events.view:<id>"`) to keep identity deterministic without E IDs.

## Article 55.7: 1.5 Modal kinds (2P / 2F / 2N / 2S / 2E / 2W)

Modal kind is inferred by behavior:

- **2P**: Page modal (in-flow, no scrim)
- **2F**: Floating modal (overlay + scrim)
- **2N/2S/2E/2W**: News modal (directional slide)

Invalid states are disallowed: mixed modal behaviors must be reclassified (e.g., fixed + directional = 2N/2S/2E/2W), and any layer skip is a build violation.

## Article 55.8: 1.5.1 Modal z-index hierarchy (canonical)

Z-index is a modal-layer concern only (2\*). Sections/Cards should not set z-index unless a local overlap is explicitly required.

Highest to lowest:

1. **2F** (floating, overlay + scrim; system popups)
2. **2N** (news north/down)
3. **2S** (news south/up)
4. **2L** (news left) _(alias of 2W)_
5. **2R** (news right) _(alias of 2E)_
6. **2P** (page modal, in-flow)

If a modal needs local ordering within its band, use a small offset inside its band; do not cross bands without reclassifying the modal kind.

Numeric scale (default):

- **2F**: `--z-2f: 60`
- **2N**: `--z-2n: 50`
- **2S**: `--z-2s: 45`
- **2L/2W**: `--z-2l: 40` / `--z-2w: 40`
- **2R/2E**: `--z-2r: 35` / `--z-2e: 35`
- **2P**: `--z-2p: 20`

## Article 55.9: 1.5.2 System overlay tier (non-IMSCE)

System overlays sit above all IMSCE modals. They are not IMSCE layers.

Default system z-index tokens:

- **system:toast**: `--z-system-toast: 80`
- **system:menu/tooltip**: `--z-system-overlay: 75`
- **system:blocker/loader**: `--z-system-blocker: 90`

## Article 55.10: 1.6 IMSCE nesting rules (structure law)

Nesting defines identity. Components must follow IMSCE order and may not skip layers:

- **Position is the law**: identity is determined by placement/behavior regardless of label or class naming.
- **Compound Cards (DX)** may contain nested cards as sub-atoms of a single identity (C → C is allowed only for DX).

Allowed flows:

- I → M → S → C → E
- I → M → S (empty section placeholder is allowed)

Disallowed:

- I → S (section outside a modal)
- M → C or M → E
- S → E (element directly in section)

Governance inference:

- A component placed directly under Index is a Modal by identity.
- Explicit naming is optional for development inference; reverent production requires explicit identifiers.

## Article 55.11: 1.7 Card canon (density + identity)

Card kinds are organized by density (the number of primary content atoms):

- Atomic: density 1
- Dual: density 2
- Tri: density 3
- Quad: density 4
- Compound: DX (nested cards, variable density)

Non-kind layer:

- Layered overlays: state indicators (dots, pills). These express state, not identity.

Identifier guidance:

- Use `C-<feature><section>-D#` for atomic/dual/tri/quad (e.g., `C-IC1S3-D3`).
- Use `C-<feature><section>-DX` for compound cards.

## Article 55.12: 1.8 Card template methodology (Card Compiler)

Card templates are composed of:

- Container: surface, borders, radius, shadow.
- Layout: layoutKind (grid or split) and slot arrangement.
- Slots: named positions that accept atoms (image/title/details/etc).
- Dimensions: size, height, bleed behavior.
- Styles: token-driven colors, typography, imagery.
- States: overlays and status indicators (Layered).

Card identity is determined by kind + layoutKind + slot model; state overlays are additive and do not create a new kind.

## Article 55.13: 1.9 Element theming (E layer)

Elements (E) are atomic UI units inside Cards. They must follow the same theme cascade:
**Local → Theme → Default**. Default must author derived E tokens when no higher
layer provides them.

Baseline element classes (catalog; reference, do not invent):

- `role-element`
- `role-input`, `role-textarea`, `role-select`, `role-toggle`, `role-checkbox`, `role-radio`, `role-switch`, `role-slider`, `role-range`, `role-stepper`, `role-date`, `role-time`, `role-search`, `role-file`
- `role-button`, `role-button-primary`, `role-button-secondary`, `role-button-ghost`, `role-icon-button`, `role-link`, `role-fab`
- `role-title`, `role-heading`, `role-subheading`, `role-body`, `role-caption`, `role-label`, `role-metadata`, `role-badge-text`
- `role-image`, `role-avatar`, `role-icon`, `role-video`, `role-audio`, `role-cover`, `role-thumbnail`
- `role-tag`, `role-chip`, `role-pill`, `role-badge`, `role-status`, `role-dot`, `role-indicator`
- `role-tab`, `role-tab-item`, `role-breadcrumb`, `role-nav-item`, `role-pagination`, `role-step`
- `role-stat`, `role-metric`, `role-counter`, `role-progress`, `role-bar`, `role-spark`
- `role-tooltip`, `role-toast`, `role-alert`, `role-banner`, `role-loading`, `role-spinner`, `role-skeleton`

Token guidance (use `var(--token, fallback)`):

- Text: `--el-text`, `--el-text-muted`
- Surface: `--el-bg`, `--el-border`
- Accent: `--el-accent`, `--el-accent-contrast`
- States: `--el-error`, `--el-warning`, `--el-success`, `--el-focus`

Element theming rules:

- Elements must not redefine layout outside their card.
- Elements should inherit typography from the card unless explicitly overridden.
- State styles must resolve through tokens (no hardcoded colors in elements).
- **Reverence**: element roles must be referenced from this catalog (no ad‑hoc element classes in production).
- **Lookup rule**: E-layer theming resolves by role class + IMSCE container lineage; explicit E IDs are not required for theme resolution.

## Article 55.14: 1.10 Theme Map Bridge (conditional routing)

The Theme Map Bridge selects the active theme based on conditions and exposes a stable Theme ID to the UI.
It must support a default path while allowing explicit overrides.

### Section 55.14.1: Condition order (highest priority first)

1. **Local override** (route/feature override, explicit user action)
2. **User preference** (stored preference)
3. **Auth state** (authed vs unauth)
4. **Default** (no condition)

### Section 55.14.2: Resolution rules

- The first satisfied condition wins.
- If no condition matches, fall back to **Default**.
- Resolution must be explicit (no implicit theme changes without a declared condition).

### Section 55.14.3: Theme ID contract

- The bridge must set a Theme ID on the feature root (e.g., `data-theme-id="<id>"`).
- Theme files must bind to Theme ID or theme classes derived from the ID.
- Components resolve tokens via the canonical cascade: **Local → Theme → Default**.

### Section 55.14.4: Expandability

- New conditions must be additive and documented in the feature’s theme map.
- Overrides must declare which condition they replace or supersede.

## Article 55.15: 2. Execution chain (structural invariant)

Use this as a structural checklist whenever you introduce a new behavior:

1. **Action / Intent**: a typed event describing what happened.
2. **Service / Effects**: async/IO work and integration calls.
3. **Guard**: policy checks, gating, redirects, remote/edge routing.
4. **Edge / Signal**: state updates and broadcast emission.
5. **UI**: views render derived state and dispatch new intents.

Front-end service construction rule:

- Services/effects that call edge APIs SHALL follow runtime authority and routing contracts in `refer.spirit-runtime.md` (header contract, route class, and mutation path selection).

## Article 55.16: 3. Component boundary (Body law)

- Components must not import repositories/services from `src/app/core/**`.
- Components may import selectors, intents, and feature store facades.

## Article 55.17: 4. When to update this file

- Adding a new feature surface that changes how UI/workflow/broadcast cooperate.
- Introducing a new workflow domain (new guard surfaces, new broadcast channels).
- Fixing a repair where the defect was “wrong layer” wiring (IO in views, missing guard, missing signal/state update).

## Article 55.18: 5. Cross-links

- Identity registry: `refer.identity.md`
- Router: `refer.md`
- Unfolding map: `inference.md`
- Law/QC: `refer.law.md`, `refer.qc.md`
- MSC base templates: `msc.template.list.md`
- Theme spec template: `theme.spec.md`
