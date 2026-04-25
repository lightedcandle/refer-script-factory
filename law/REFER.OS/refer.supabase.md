# Law 56: refer.supabase.md — Supabase Systems Reference

This file captures the canonical Supabase patterns that REFER.OS relies on, including storage, assets, and the canonical URL policy described in `refer.file.md`, `refer.md`, and the artifact map.

## Article 56.1: 1. Storage & Asset Governance (canonical URLs)

- **No long Supabase URLs in persisted data** — Supabase returns signed URLs with query-heavy tokens that are fragile for APIs, emails, or webhook-driven flows. We treat those as transient and never store them in the database or surface them to clients.
- **Canonical short URLs** — When a Supabase storage upload occurs, we immediately issue and persist a short canonical URL under the app’s canonical asset domain (e.g., `https://file.<app-domain>/{uuid}`, as defined in `refer.<app>.md` and governed by `refer.file.md`). That URL becomes the identity reference used by all front-end intents, action documents, and downstream services.
- **Resolution layer** — The API or Edge function that receives a canonical `{uuid}` resolves it to the actual Supabase path (`storage.bucket.from(bucket).getPublicUrl(path)` or a signed URL with TTL) and either redirects or streams the asset. This keeps the long Supabase URL behind the resolver and ensures the canonical reference remains clean.
- **Asset metadata** — Store Supabase path, size, mimetype, and canonical URL in Supabase itself (or a proxied datastore) so we can rehydrate the asset if the resolver must reauthorize a new signed URL.
- **No webhooks or Stripe-supplied tokens for storage resolution** — We only rely on the resolver’s own authentication (service role) to fetch/stream assets. This avoids the problems with JWTs that cannot be verified in Supabase storage webhook contexts.

## Article 56.2: 2. Refer action alignment

### Section 56.2.1: refer.build

- When designing features that add new media assets (images, videos, files), refer to this canonical URL policy so the store action, database field, and canonical reference are created together in one unfold.
- Document in `refer.build.md` that every new asset type must define its resolver logic (bucket, path pattern, TTL handling).

### Section 56.2.2: refer.repair

- If long Supabase URLs leak into data or UI, `refer.repair.md` should include steps to re-canonicalize the asset (generate a fresh short URL, migrate references, update resolver). Mention this reference so repair signals know to re-run the canonical policy.

### Section 56.2.3: refer.systems.url (optional)

- If we create `refer.systems.url.md` later, include URL transformation specs, resolver endpoints, and any TTL policies. This doc would centralize the canonical URL lifecycle for both builds and repairs.

## Article 56.3: 3. Signals & Edge functions

- The resolver lives in an Edge function that:
  - Accepts `https://file.<app-domain>/{uuid}` requests (see `refer.<app>.md` for the concrete domain).
  - Looks up the stored Supabase metadata for `{uuid}`.
  - Uses the Supabase service role to fetch a signed URL or stream the blob.
  - Sets sane caching headers and redirects/streams the asset.

- Update this reference if we ever support additional CDN domains or alias `{uuid}` styles; the refer router (via `refer.md`) will then know which domain/deployment to target.

## Article 56.4: 4. Supabase relation enforcement

Treat `refer.supabase.md` as the single source of truth for Supabase storage and canonical URL behavior. When new Supabase-based services are built, reference this doc, ensure `refer.build`/`refer.repair` mention it, and keep `refer.md` pointing to `refer.supabase.md` as part of the Relation pillar.

## Article 56.5: 5. Remote migrations + function deploy (operational)

CLI-first relation:

- `supabase` CLI is the canonical operational control surface for remote Supabase work.
- Prefer authenticated CLI execution over browser/manual mutation when the CLI supports the task.

### Section 56.5.1: Required keys (canonical source)

- `.env.master` holds the canonical secrets for remote Supabase ops.
- Use:
  - `SUPABASE_DB_PASSWORD` for `supabase db push`
  - `SUPABASE_ACCESS_TOKEN` for CLI auth (required for remote push/deploy)
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side runtime access when needed

### Section 56.5.2: Migrations (PowerShell)

**Convention:** `YYYYMMDDHHMM_name.sql`
**Example:** `202601070215_heavenly_seed_final.sql`

```powershell
$env:SUPABASE_DB_PASSWORD = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_DB_PASSWORD=' } | ForEach-Object { $_.Split('=',2)[1] })
$env:SUPABASE_ACCESS_TOKEN = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' } | ForEach-Object { $_.Split('=',2)[1] })
npx supabase db push
```

### Section 56.5.3: Edge functions (PowerShell)

```
$env:SUPABASE_ACCESS_TOKEN = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' } | ForEach-Object { $_.Split('=',2)[1] })
npx supabase functions deploy <function-name>
```

Notes:

- If `npx supabase db push` fails with auth errors, confirm the `.env.master` values and that the CLI is linked to the correct `project_id` in `supabase/config.toml`.
- Do not echo secrets in logs; keep these steps scoped to local shells.
- Before mutation, verify the intended project and auth state with the CLI rather than assuming ambient state.

### Section 56.5.4: Recent pattern: meeting instance feedback

- When adding a new Edge Function + table pair (ex: `org-instance-rating` + `org_instance_ratings`), deploy in this order:
  1. `npx supabase db push`
  2. `npx supabase functions deploy org-instance-rating`

## Article 56.6: 6. Compiler-Driven Materialization (Gifts)

The REFER compiler (`refer.compiler.md`) can materialize primitives directly into SQL via the **Supabase Gift Strategy**.

- **Seeding:** High-level primitives (Roots, Shells, Actions) are seeded into `refer.refer_primitives`.
- **DDL:** The compiler provides the structural DDL to ensure the Bedrock matches the Intent.
- **Protocol:** Generate `.sql` migrations via `refer.build` and apply them using the PowerShell commands in Section 5.
