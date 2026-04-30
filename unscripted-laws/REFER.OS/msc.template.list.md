# Law 4: msc.template.list.md — Modal / Section / Card Template Registry

This registry defines the base component templates for Modals, Sections, and Cards (MSC).
These are the canonical structural bases for IMSCE‑aligned UI. Local components may extend
or override these bases, but must declare the override explicitly in their feature docs.

## Article 4.1: 1. Purpose

- Provide a single source of truth for MSC base components.
- Keep structure component‑first; CSS never replaces structure.
- Ensure overrides are deliberate and documented.

## Article 4.2: 2. Base Templates

### Section 4.2.1: Modal (M)
- **Component**: `MSC.ModalBase`
- **Role**: First overlay above the page (2p).
- **Required Slots**: header, body, actions
- **Required Props**: `open`, `ariaLabel`
- **Default Rules**:
  - owns overlay/scrim
  - owns focus trap + escape close
  - owns fixed positioning and sizing

### Section 4.2.2: Section (S)
- **Component**: `MSC.SectionBase`
- **Role**: First grouping layer inside a modal or index.
- **Required Slots**: header (optional), body
- **Default Rules**:
  - owns layout stacking (gap, padding)
  - does not own global positioning

### Section 4.2.3: Card (C)
- **Component**: `MSC.CardBase`
- **Role**: Content unit inside a section.
- **Required Slots**: body (header optional)
- **Default Rules**:
  - owns visual container (radius, border, shadow)
  - no positioning outside its own box

## Article 4.3: 3. Override Rules

- Overrides must be declared in feature docs (or a local AGENTS.md) and point to the base
  component they extend.
- CSS overrides are allowed only inside the component’s own stylesheet.
- Structural overrides (different slot model or layout ownership) must be documented.

## Article 4.4: 4. Adoption Checklist

- Identify which MSC base(s) a new component extends.
- If deviating, document the override before shipping.
