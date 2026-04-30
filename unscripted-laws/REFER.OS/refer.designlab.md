# Law 28: refer.designlab.md — Design Lab & Compiler Integration
Tokens in this document refer to render-quality controls (color, spacing, typography, motion, state). Copy text uses named variables, not tokens.

Design Lab remains REFER.OS’s visual law engine, but every prototype now has a clear path into the compiler-driven pipeline. This doc explains how immutable/semantic identities, tokens, and experiments flow into UBB data so `refer.build` can materialize them deterministically.

---

## Article 28.1: 1. Layered Identity (Immutable → Semantic → Derivative)

- **Immutable identity** names the primitive (IMSCE scope, DOM selector, component class). Once promoted, this identity lives in `refer_primitives` (TS/HTML/SCSS templates, `style_tokens`, `rule_hints`).
- **Semantic identity** conveys meaning states (active, muted, highlight, danger, success, warning, info). Each immutable primitive exposes semantic slots documented in `refer.structure.md` and encoded as token hooks so stores/effects can reference them.
- **Derivative rules** translate immutable + semantic inputs into visual treatments (brighten, saturate, deepen-shadow for active; darken, flatten, reduce opacity for muted). These rules must map to theme tokens so the compiler can render them consistently.

---

## Article 28.2: 2. Experimental Workflow (Compiler-Aware)

1. **Prototype safely** inside `/designlab` or `experiments/<feature>`. Record the immutable+semantic pair in `refer.identity.md` and mark the identity as experimental in the registry so the router knows it isn’t canonical yet.
2. **Capture tokens in data**. Do not leave theme values in SCSS alone—mirror every approved token into Supabase so the compiler can consume them:
   - Use `refer_primitives.style_tokens` for per-primitive palettes.
   - Use (or introduce) a `refer_theme_tokens` table for global palettes, typography, spacing, etc.
   - Attach derivative metadata as JSON (`rule_hints`, `design_tokens`) so `refer.build` can apply them.
3. **Document inference**. Update `refer.structure.md` and `refer.inference.md` with the reasoning behind new identities/tokens. These notes justify the semantic slots and help future promotions reuse the same logic.
4. **Respect system guards**. Asset sizing, secret handling, and branch etiquette follow `refer.build.md` and `refer.systems.security.md` even in lab mode. Compress media before storing it, mark experimental buckets clearly, and keep labs detached from production branches until promoted.

---

## Article 28.3: 3. Promotion Path (Lab → Compiler)

When a prototype succeeds:

1. **Encode tokens + templates**: move finalized TS/HTML/SCSS into the relevant primitive definition under `refer_primitives`.
2. **Seed instances**: add/update rows in `refer_instances` so features reference the new identity (include semantic props/tokens as needed).
3. **Run `refer.build materialize --feature <slug>`** to regenerate Angular artifacts. The compiler now emits components referencing your canonical tokens.
4. **QC**: run `refer.build qc` (Jest placeholder, wrangler Vitest, Angular build). Log the build ID in `refer.qc.md` and note the promotion in `refer.compiler.init.md`.
5. **Update todos/docs**: move the lab item from idea → active track in `public/assets/plan/refer.plan.json`, record the status in `refer.designlab` notes, and update `refer.qc.md` with the RETURN answers.

Until these steps finish, keep work in the lab sandbox (no `refer.branch`/`refer.commit`).

---

## Article 28.4: 4. Codex Signals

- Saying `refer.designlab` tells the agent to operate inside the lab sandbox: create/update experiments, record immutable/semantic pairs, and manipulate token data without promoting.
- Once you say “promote” (or explicitly call for compiler integration), the agent moves tokens/templates into Supabase, runs `refer.build`, and documents the change. This ensures Codex never silently bypasses lab governance.

---

## Article 28.5: 5. Alignment with Theming & `/referdesign`

- `/referdesign` is the live preview surface compiled from these tokens. After promotion, regenerate `/referdesign` with the compiler so it reflects the canonical palette.
- Feature theming (e.g., `/events` bloom) must reference the same token registry. Design Lab owns the tokens; the compiler distributes them by reading the Supabase entries you authored.
- Order of operations for theming:
  1. Prototype in lab → validate immutable/semantic pair.
  2. Persist tokens to Supabase (`refer_primitives.style_tokens`, `refer_theme_tokens`).
  3. Regenerate `/referdesign` + the target feature via `refer.build`.
  4. Run QC + manual inspection; log results.

---

## Article 28.6: 6. Future Hooks

- OG share cards will reuse this pipeline: treat OG visuals as a semantic variant of cards/sections governed by the same tokens.
- Broadcast overlays, OBS/Daily surfaces, and future IMSCE themes will inherit from the same registry once those features move into compiler mode.
