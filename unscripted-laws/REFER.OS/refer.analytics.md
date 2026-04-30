# Law 7: refer.analytics.md — Analytics Systems Reference (App-Agnostic)

This reference defines the canonical doctrine for analytics in E2E systems.

## Article 7.1: Purpose

Analytics exists to answer:
- Where people enter, what they do next, and where they leave
- Which guards/prompt boundaries help or harm progress
- What to improve next (based on evidence), without collecting user content

## Article 7.2: Doctrine

- **Behavior, not content**: record actions/outcomes, not user-entered text or secrets.
- **Structured raw**: go wide early on *coverage* (major surfaces), not on *detail* (no full clickstream text capture).
- **Two layers**:
  - **Raw events** (append-only) for short-term debugging and exploration.
  - **Rollups / stories** for long-term trend and narrative.
- **Trajectory-ready**: keep a deterministic mapping from “last meaningful signal” → “current phase” (Reveal/Hold/Shepherd).

## Article 7.3: Data hygiene (required)

- Never store:
  - Auth secrets (tokens, codes, passwords)
  - User content (messages, comments, prayer requests)
  - PII (email, phone, names) unless explicitly required and governed
- Prefer route **shape**, not identifiers (normalize ids to `:id`).

## Article 7.4: Click tracking (UI)

Apps may use a lightweight click map to understand what people actually use, without recording content.

- Default mode is **opt-in**: only elements with a `data-track` attribute are recorded.
- Inputs/textareas/selects are ignored by default to avoid capturing user content.
- Keys must be stable and human-readable (so reports are understandable).

**Key format (recommended)**
- Use a dot namespace: `feature.surface.action`
- Examples:
  - `topbar.menu.toggle`
  - `topbar.item.orgs`
  - `ichurch.nav.give`
  - `orgs.events.viewAll`

**Rules**
- Never put secrets/PII into `data-track`.
- Treat `data-track` values as public and permanent identifiers (changing them breaks historical charts).

## Article 7.5: Scheduling (required)

All nightly/daily compilation must follow `REFER.OS/refer.cron.md`:
- Cron dispatches only (no heavy work)
- Execution edges do work (rollups, pruning, story generation)
- Payload is minimal “luggage”

