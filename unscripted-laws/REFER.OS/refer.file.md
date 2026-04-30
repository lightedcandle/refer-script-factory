# Law 68: refer.file.md — Canonical File Resolver & Central Upload Pipeline (Cross-App)

This file defines the cross-app contract for file uploads, canonical URLs, and resolver behavior. App-specific domains and implementations live in `refer.app/` and in system/provider references.

## Article 68.1: 1. Scope & Intent

- Establish a universal, cross-app contract for file identity and resolution.
- Ensure all apps can share a consistent upload pipeline and canonical URL pattern.
- Keep provider-specific details (Supabase, S3, etc.) in their own system references.

## Article 68.2: 2. Canonical URL Contract

- **Canonical host**: `file.<app-domain>` (app-defined in `refer.<app>.md`).
- **Canonical path**: `/<uuid>` (UUID is the stable asset identity).
- **Storage URLs are transient**: do not persist long provider URLs in data stores.
- **Canonical URL is identity**: all UI and downstream services use the canonical URL only.

## Article 68.3: 3. Central Upload Pipeline (Canonical)

1) Upload file to the storage provider.
2) Register asset metadata (bucket, path, size, mimetype, checksum if available).
3) Return and persist the canonical `file.*` URL and metadata record.
4) Downstream consumers render only the canonical URL.

## Article 68.4: 4. Resolver Responsibilities

- Accept `file.<app-domain>/<uuid>` requests.
- Resolve UUID -> bucket/path -> signed URL or streamed blob.
- Keep long provider URLs private and short-lived.
- Apply safe caching headers suited to the provider and asset type.

## Article 68.5: 5. Legacy & Fallback

- Legacy public URLs may be rendered if already persisted.
- Do not rewrite legacy URLs in place unless a repair or migration plan is approved.
- Fallbacks may be used at runtime but should not replace the canonical URL in storage.

## Article 68.6: 6. Provider Alignment

- Supabase implementations must follow `refer.supabase.md`.
- Other providers must map to the same canonical contract and resolver behavior.

## Article 68.7: 7. Non-Goals

- No bucket migrations or bulk backfills by default.
- No resolver domain changes without explicit governance.

## Article 68.8: 8. Verification

- New upload returns a `file.*` URL and metadata record.
- Resolver serves the asset when given the canonical UUID URL.
