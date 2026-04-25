# Law 44: refer.og

**REFER.OS – Open Graph (OG) System Blueprint (v0.1 Draft)**

---

## Article 44.1: 1. Purpose

Make every shareable URL a self-describing object. Internal/external platforms can interpret identity, intent, and visibility without custom share logic. OG is a REFER primitive, not a page-level hack.

---

## Article 44.2: 2. Core Principle

- Objects own share identity.
- Pages render share identity.
- REFER governs the mapping.

---

## Article 44.3: 3. System Placement (Mind • Body • Spirit)

- **Mind (Workflow / ASEDAWSI)** – resolves which object is in view.
- **Body (UI / IMSCE)** – hosts the `<head>` tags.
- **Spirit (Broadcast / EWCPSI)** – enables external consumers (social/messaging/embeds).

OG lives in the Identity → Projection → Perception lane bridging all three.

---

## Article 44.4: 4. Canonical Components

### Section 44.4.1: 4.1 ShareIdentity (Logical Trunk)

```ts
interface ShareIdentity {
  type: 'event' | 'profile' | 'church' | 'page' | 'media';
  title: string;
  description: string;
  image: string;
  url: string;
  visibility: 'public' | 'unlisted' | 'private';
}
```

- Exists exactly once per object.
- Stored/derived in REFER data (compiler/runtime), never authored in UI/HTML.

### Section 44.4.2: 4.2 Feature Share Projections (Adapters)

- Each shareable table defines how its data maps into `ShareIdentity`.
- Examples: Event → banner + summary; Profile → avatar + display name; Church → logo + mission.
- Pure data mapping, not OG tagging.
- **Rule:** if a table has a canonical URL, it may define a projection.

### Section 44.4.3: 4.3 Central Share Engine

- Resolves `ShareIdentity`.
- Applies fallbacks + length normalization.
- Enforces visibility (no private leakage).
- Ensures ShareIdentity is resolved before HTML is returned (SSR/edge/compiler); OG data is never delayed until client hydration because scrapers do not execute JS.
- May cache ShareIdentity at the REFER runtime layer, but cache invalidation must follow object mutation, not page access.
- Invoked through REFER routing (compiler + runtime service), never manually.
- Sources data from canonical projections (e.g., the `refer_share_identity` view for events) so compiler/runtime surfaces stay in lockstep with Supabase mutations.

### Section 44.4.4: 4.4 Standard OG Shell (Immutable Contract)

Every page renders the same `<head>` fragment:

```html
<meta property="og:type" content="{{share.type}}">
<meta property="og:title" content="{{share.title}}">
<meta property="og:description" content="{{share.description}}">
<meta property="og:image" content="{{share.image}}">
<meta property="og:url" content="{{share.url}}">
```

- Identical across routes.
- Never customized per feature.
- Filled dynamically by the Share Engine / compiler materializer.
- Platform-specific extensions (e.g., `twitter:*`) may derive from ShareIdentity but must not introduce new source fields.
- The Share Engine enforces OG image constraints (size/aspect, format) and selects compliant fallbacks.

### Section 44.4.5: 4.5 Route-Level Materialization

1. Router identifies the feature/object.
2. REFER resolves `ShareIdentity`.
3. OG tags inject into `<head>`.
4. External scrapers consume the tags.

Pages just host the tags; REFER decides the content.

> Edge bridge: `refer.build` writes each fragment under `dist/refer-head/<feature>` **and** mirrors the manifest into `wrangler/src/generated/<feature>-head.generated.ts`, so the Cloudflare Worker streams the correct `<head>` for `/events/:id/share` before issuing a meta-refresh/JS redirect back to Angular. Angular's `Meta/Title` wiring remains available as the dev/local fallback.

---

## Article 44.5: 4.6 Link Strategy (App-Specific)

App-specific link strategies belong in `refer.<app>.md` (or the app’s OG reference), including canonical link styles and any legacy share routes.

## Article 44.6: 5. Data Model Alignment

- Core tables stay domain-pure (no OG columns).
- Projections (views/services) derive share-safe data.
- **Rule:** Truth stays in tables, visibility in projections, representation in `ShareIdentity`.

---

## Article 44.7: 6. Security & Governance

- Private objects never project.
- REFER enforces access before projection.
- OG rendering is visibility-aware.
- If ShareIdentity cannot be resolved or visibility is not `public`, REFER must emit no OG tags (or a safe generic identity) to avoid leaking data or producing broken previews.
- External platforms cannot scrape beyond intended scope.

---

## Article 44.8: 7. Why This Works

- Zero per-platform share logic.
- Zero duplication.
- Immutable head structure.
- Centralized evolution + automatic consistency.
- URL == share object.

---

## Article 44.9: 8. Final Law

Every public URL in REFER.OS resolves to exactly one `ShareIdentity`, governed centrally and rendered uniformly.

---

## Article 44.10: 9. Caching guardrails (required for reliable previews)

OG works only when external scrapers receive the correct `<head>` tags on the **first response**. For SPAs, that means:

- Do not rely on `404` HTML shells for deep links. Many unfurlers refuse to generate previews on non-2xx, even if OG tags exist in the body. Serve `200` for SPA deep-link shells (and `HEAD` probes), then inject OG tags at the edge.
- Never cache HTML documents (serve `Cache-Control: no-store` for share shells and SPA fallbacks).
- Cache assets aggressively (hashed JS/CSS and static images as `public, max-age=31536000, immutable`).
- Avoid Cloudflare Pages `_headers` patterns that apply `no-store` to `/*` because header merging can poison asset caching.

When OG/share work is involved, cite `REFER.OS/refer.cloudflare.md` and follow its “Document caching doctrine (SPA + OG routes)” section.
