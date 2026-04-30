# Law 23: refer.compiler.metrics.md

Canonical "compiler coverage" metrics for REFER.OS.

This exists to avoid confusion when we say "fully compiler-driven" or "100% compiler".

---

## Article 23.1: 1) The One-Sentence Definition

**"100% compiler-driven" means UI decisions can be changed by editing REFER data (DB/runtime) without changing Angular templates for that page.**

Notes:
- "100% compiler-driven" does **not** mean "no code". Store/effects/guards/renderers remain code by design.
- "Compiler-driven" is about **what is governed by data** (structure, selection, tokens, copy), not about whether an engineer wrote TS.

---

## Article 23.2: 2) Coverage Axes (the canonical scorecard)

We report compiler coverage per page across these axes:

1. **Copy** (text, labels, empty states)
2. **Selection** (which template/variant a page uses)
3. **Presentation** (sections/layout/structure of the page)
4. **Cards** (card design spec + state variants)
5. **Behavior** (IO, navigation, guards, workflows)

Each axis is measured independently; don't collapse to a single number unless you explicitly say how you weighted it.

---

## Article 23.3: 3) The Scale (0 -> 100% per axis)

Use this scale per axis:

- **0%**: Hardwired in Angular templates/styles.
- **25%**: Mostly hardwired, but with some runtime/config toggles.
- **50%**: Data exists, but still mirrored in code and must be changed in both places.
- **75%**: Data is primary; code is a thin adapter; small hardcoded fallbacks remain.
- **100%**: Data is authoritative; swapping DB/runtime values changes output with no template edits.

---

## Article 23.4: 4) What "100%" Means per Axis (plain language)

### Section 23.4.1: 4.1 Copy (100%)

All user-facing page copy (titles, headings, placeholders, empty states) comes from DB/runtime (e.g., `refer_page_templates.spec`) and can be changed there.

**Still allowed in code:** fallback defaults if DB is missing.

### Section 23.4.2: 4.2 Selection (100%)

The page chooses templates/variants by DB/runtime mapping, not by hardcoded `if (code === "tri7")` logic.

Example mapping fields (page-driven):
- `spec.directory.cardTemplateCode`
- `spec.events.upcomingCardTemplateCode`
- `spec.events.pastCardTemplateCode`
- `spec.actions` (optional action-key mapping for intent dispatch)

At 100% selection, you can change "tri7 -> tri9" in the DB and the page uses the new template without changing TS/HTML.

### Section 23.4.3: 4.3 Presentation (100%)

The page's section layout is described by REFER data (UBB instances / page template spec sections) and rendered by a page renderer.

At 100%, you can reorder/add/remove sections in DB/runtime and the page structure changes accordingly.

**Important:** this usually requires a `page-renderer` abstraction; if there is no page renderer and the page HTML is still bespoke, this axis is not 100%.

Practical schema (recommended):
- `spec.presentation.layout.sections[]` with `{ id, kind, region, enabled?, props? }`

### Section 23.4.4: 4.4 Cards (100% data, renderer still code)

Card *design* is represented as data:
- container (bg/corners/border/shadow/padding)
- slots + layout kind
- state variants (private/live/etc)
- atomic building blocks (atoms) and their media/text rules

At "100% cards", the data fully specifies the card and the renderer is a stable interpreter.

**Renderer stays code by design:** the interpreter component is not expected to be DB-authored.

### Section 23.4.5: 4.5 Behavior (intentionally not 100%)

Behavior includes:
- IO/data fetching
- auth/guards
- navigation
- timers
- workflow/service calls

These should remain in store/effects/services (Mind lane). The compiler can *wire* events to intents, but it shouldn't move IO into DB.

Typical "healthy" target:
- **0-10%** behavior coverage (compiler emits events/intents; code executes them)

---

## Article 23.5: 5) Reporting Template (use this in chats/docs)

When reporting "how compiled" a page is, use this format:

- **Copy:** X%
- **Selection:** X%
- **Presentation:** X%
- **Cards:** X% (data) + renderer (code)
- **Behavior:** X% (by design)

Then add one sentence that defines what "100%" means for this page (usually Selection + Copy; sometimes Presentation too).

---

## Article 23.6: 6) Example: `/orgs-c` (the reference example)

For `/orgs-c`, we treat "100% compiler-driven" as:
- Copy is DB-driven (`refer_page_templates`).
- Template selection is DB-driven (page spec chooses template codes).
- Card designs/atoms are DB-driven (`refer_card_templates`).

But:
- Page layout/presentation is still a bespoke Angular template unless/until a page renderer is introduced.
- IO/navigation remains store/effects by design.

---

## Article 23.7: 7) Registry + Drift Alerts (non-blocking)

- Canonical per-page status + percentages live in `REFER.OS/refer.compiler.pages.md`.
- Use `npm run compiler:scan` to emit a non-blocking report that flags:
  - routed pages missing from the registry
  - routed page components missing a compiler header (optional)
  - obvious "drift candidates" (large inline templates / missing plan links)
