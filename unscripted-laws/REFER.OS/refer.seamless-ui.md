# Law 72: refer.seamless-ui.md - Flat Seamless UI Pattern

# refer.seamless-ui.md

Purpose
Define the canonical "Flat Seamless UI" page pattern so future pages can mirror one coherent, production-safe layout language.

Scope

- Applies to flat page surfaces that replace stacked card chrome.
- Applies to page-level composition, section rhythm, and responsive behavior.
- App-specific copy/content still lives in app references; this doc defines structure and experience contract.

Identity

- Pattern name: `Flat Seamless UI`
- Aliases accepted in prompts: `flat seamless`, `flat seamless ui`, `seamless ui`

Core build contract

1. Single column frame with `max-width: 900px`, centered.
2. Borderless section blocks with distinct surfaces (no transparent ambiguity).
3. 16:9 hero media lock for primary org image.
4. Consistent horizontal gutters across all sections.
5. Vertical rhythm between sections is explicit and uniform.
6. Mobile-first collapse behavior for all multi-column rows.
7. One-loader policy per route transition (no sequential/double spinners).
8. Shared primitives first (header/footer/chat/input wrappers) before local overrides.

Section model (recommended order)

1. Hero image section.
2. Organization detail surface + primary CTA.
3. Host feature section.
4. Events listing section (hidden when no public events).
5. Footer surface (About + platform links/actions).

Surface rules

- Page background and section surface must differ by value/tint so section boundaries are clear without borders.
- Avoid drop-shadows unless they convey state (not decoration).
- Prefer gradients/color fields over card outlines.
- Remove radius where sections meet; seams should be flush.
- Parent containers must not reintroduce card chrome (`shadow`, `bubble`, `glass`) around seamless stacks.

CTA rules

- Primary CTA is visually dominant and centered when it is the page action.
- Button label can include emoji when product tone allows it.
- Padding above and below CTA must preserve tap comfort on mobile.

Content rules

- Truncated long details must expose `more...` expansion inline.
- Empty event detail fallback text must be friendly and explicit.
- Private events are excluded from public home listings.

Responsive contract

- No horizontal overflow at 320px width.
- Host/event rows must stack cleanly on narrow screens.
- Media uses `object-fit: contain` when logo integrity is required (no crop).
- Typography and action tap targets remain legible/tappable on mobile.
- Sticky headers must reserve scroll offset so anchor/autoscroll targets are not hidden.

Interaction and behavior rules

- Every visible menu action must terminate in a concrete behavior: `navigate`, `store intent`, or `API call` (never no-op).
- Public gated actions open auth modal first; unauth users should not be sent into protected-route loops.
- Context resolution is mandatory for public pages: user default org -> URL context -> org DB default -> referring page org.
- Share links must preserve required routing context; vanity links must include shortcode when shortcode is route identity.

Messaging and chat rules

- Chat containers on seamless pages must inherit light surfaces; no dark fallback shells unless explicitly themed.
- Own-message and other-message text must both meet contrast on their background.
- Date separators are flat inline separators (no card/bubble styling unless scoped by theme law).

Event/email broadcast state rules

- Email follower broadcast is idempotence-aware in UI and DB.
- Persist last sent timestamp on event record (e.g., `email_broadcast_sent_at`).
- Menu shows primary action plus subtext `Sent <date>` when present.
- Re-send updates the same timestamp and reflects latest send time in UI.

Failure patterns and resolution defaults

1. Symptom: "Section still looks like a card."
   Resolution: remove `box-shadow`, `border`, and meeting-edge radius at both child and parent shells.
2. Symptom: "Header not truly sticky."
   Resolution: ensure sticky container has `top: 0`, explicit `z-index`, non-transparent backdrop, and scroll offset buffers.
3. Symptom: "Action appears wired but does nothing."
   Resolution: trace click -> handler -> terminal behavior; fail QC if chain is incomplete.
4. Symptom: "Wrong share context/OG context."
   Resolution: recompute context from route+org identity source and regenerate scoped URL/metadata.
5. Symptom: "Double loading flash."
   Resolution: collapse to single hydration gate and one reveal sequence.

Flat seamless QC checklist (required)

1. No inter-section gap unless explicitly declared.
2. No decorative shadows in seamless stack.
3. No hidden content beneath sticky headers.
4. No horizontal overflow at 320px.
5. Action map complete for all menu items.
6. Contextual links validated (vanity/shortcode/org).
7. Chat contrast verified for own and others' messages.
8. Single loader verified per route entry.
9. Footer width and seam alignment match page stack.
10. If deviating from this law, record deviation in plan artifact.

IMSCE mapping

- `I` Index: page shell + frame.
- `M` Modal/Page: seamless page mode.
- `S` Sections: hero, org, host, events, footer.
- `C` Components: host/media/event rows and action groups.
- `E` Elements: labels, pills, buttons, links, icons.

Adoption recipe for future pages

1. Start from this pattern before creating new page-level layout.
2. Keep the 900px frame + gutter tokens unchanged unless a plan explicitly overrides.
3. Reuse section order; only remove sections if product scope requires.
4. Preserve responsive contract and IMSCE mapping.
5. Document any intentional deviation in the plan record.

Related references

- `REFER.OS/refer.plan.md`
- `REFER.OS/refer.design.md`
- `REFER.OS/refer.md`
- `REFER.OS/refer.structure.md`
- `REFER.OS/refer.designlab.md`
