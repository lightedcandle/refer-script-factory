# Law 66: refer.figma.md - Figma Design Authority & Handoff Law

`refer.figma` governs how REFER handles design work when Figma is the official design surface and Codex is the implementation surface.

This law exists to prevent design drift, over-interpretation, and local re-design during implementation.

## Article 66.1: 1. Figma authority

When a surface has an approved Figma-authored contract, Figma is the visual authority for that surface.

Binding scope:

- layout
- hierarchy
- visible copy
- spacing intent
- card and section composition
- responsive presentation
- interaction presentation

Codex must treat the contract as implementation law for the designed surface, not as a suggestion.

If an approved prior design already exists for the same surface, that approved design should be treated as the highest visual authority unless it has been explicitly superseded.

Existing implementation is not visual authority by default.

## Article 66.2: 2. Codex role under Figma authority

When `refer.figma` is active, Codex is the implementation agent, not the visual designer.

Codex owns:

- repo wiring
- route correctness
- store/service integration
- data mapping
- fallback handling
- architecture-safe implementation

Codex does not own discretionary redesign of an approved Figma surface.

Implementation may inform constraints, but it must not silently become design direction.

## Article 66.3: 3. Default design behavior

If Figma is the official designer for the repo or surface:

- Codex should not originate polished visual design locally by default.
- Codex may produce basic wireframes, structural placeholders, or implementation scaffolds only.
- Any substantial visual treatment should be pushed back to Figma for authoritative design iteration unless the user explicitly asks Codex to design locally.

Allowed local design work without Figma handoff:

- basic wireframe
- structure-only mockup
- placeholder card layout
- utility modal or internal tool UI
- temporary implementation scaffold pending Figma update

Disallowed by default when Figma is the official designer:

- inventing a new visual language
- substituting a different shell pattern
- polishing a page beyond structural wireframe level
- preserving legacy visuals over an approved contract

## Article 66.3A: 3A. Detached design rule

When Figma-governed design work is being created or evaluated, inspection of the existing repo or application is allowed only for:

- route and data reality
- platform and framework constraints
- component availability
- integration constraints
- discovery of already approved design authority

Repo or application inspection must not be allowed to visually bias a new design toward legacy, incomplete, drifted, or merely existing implementation.

Design should remain detached from live code unless the thing being observed is itself approved design authority.

## Article 66.3B: 3B. Consult and critique mode

`refer.figma` is not limited to handoff execution.

It may also be used as a design consult mode for:

- critique of existing pages or surfaces
- polish review
- hierarchy diagnosis
- coherence review
- premium-finish evaluation
- pre-implementation design advisement

In this mode, design judgment comes before implementation translation.

Critique should explain:

- what the surface is communicating
- what the user is likely feeling
- what is strongest
- what is weakest
- which design laws are being preserved or violated
- what changes would most improve clarity, coherence, and polish

## Article 66.4: 4. Contract binding law

If a Figma contract exists and the designed surface is specific enough to implement, Codex must execute it faithfully.

Codex must assume:

- replacement means replacement
- enhancement means scoped enhancement
- contract-locked copy is binding
- `Do Not Reinterpret` is binding
- literal template targets are binding

Codex may deviate only when:

- the contract conflicts with actual repo or route reality
- the required data does not exist and no documented fallback is provided
- the contract violates architecture boundaries that cannot be reconciled safely

In those cases, deviation must be constraint-driven, not preference-driven.

## Article 66.4A: 4A. Coherence review rule

When implementing against an approved design, Codex must explicitly determine which parts of the current surface are:

- retained as-is
- adapted to match the approved design
- replaced entirely

If the existing surface cannot achieve coherence without shell-level refactor or full replacement, Codex should prefer the coherent refactor rather than preserving inconsistent structure out of habit.

## Article 66.5: 5. No suggestion treatment

Codex must not treat a valid Figma contract as inspirational guidance.

Prohibited implementation behavior:

- adapting instead of replacing when replacement is specified
- preserving legacy shell patterns by habit
- substituting local preferences for contract decisions
- softening or reinterpreting contract-locked visuals

The burden is on Codex to prove a contract element cannot be implemented as written before changing it.

## Article 66.6: 6. Required contract qualities

For page-scale redesigns, Figma contracts should include:

1. Implementation Intent
2. Canonical Page Skeleton
3. Do Not Reinterpret
4. Contract-Locked Copy
5. Responsive Truth Table
6. Wiring Map (`existing` vs `proposed`)
7. Implementation Tolerance
8. Literal Angular Template Target for replacement-grade surfaces

If these exist, Codex should not ask the contract to be more "suggestive"; it should implement the contract.

Recommended additions when fidelity risk is high:

9. Coherence Decision
10. fallback rendering rules for optional data
11. text-length or truncation rules where overflow matters

## Article 66.7: 7. Wireframe-to-Figma loop

When the user asks Codex to prepare design work before Figma:

- Codex should produce minimal, clear wireframes
- Codex should document structure, constraints, and mappings
- Codex should avoid over-polishing
- Codex should hand the surface back to Figma for visual authorship

The goal is to give Figma a strong structural base, not to compete with Figma’s design role.

## Article 66.8: 8. Repo-local and universal alignment

## Article 66.7A: 7A. Lightweight realization direction

REFER should prefer lighter implementation realization when it can faithfully deliver the approved design.

Preferred characteristics:

- reusable components
- direct page composition
- minimal necessary abstraction
- simple, portable design philosophy
- framework-native realization rather than unnecessary rendering indirection

Heavy token orchestration, design-lab complexity, or database-derived rendering should not be treated as the default ideal when they add weight without improving clarity, fidelity, or speed.

`refer.figma.md` should exist:

- in the universal REFER law surface
- in the repo-visible local law surface when the repo uses Figma as its official designer

If both copies exist, they must remain materially aligned.

## Article 66.9: 9. Router usage

Use `refer.figma` when the task involves:

- design-to-implementation handoff
- Figma contract execution
- Figma/Codex working agreements
- design critique and polish review
- wireframe preparation for Figma
- resolving drift between Figma contract and implementation

`refer.figma` does not replace `refer.build` or `refer.combing`.
It governs design authority and handoff discipline while those execution domains do the actual implementation work.

## Article 66.10: 10. Practical doctrine

Short form:

- Figma designs
- Codex wires
- contracts bind
- critique is lawful
- wireframes stay simple
- implementation should stay as light as fidelity allows
- deviation requires a real constraint
