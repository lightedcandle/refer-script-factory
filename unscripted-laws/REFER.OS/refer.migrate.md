# Law 43: refer.migrate.md — Migration Action Reference

`refer.migrate` handles schema/data migrations, especially for Supabase, where canonical URL and system relations must remain consistent.

## Article 43.1: 1. Migration intent

- **Trigger:** `refer.migrate: <description>` for database changes, Supabase schema updates, or rollout scripts.
- **Purpose:** Coordinate migration steps with Supabase reference docs and ensure RETURN/COMMIT/PUBLISH acknowledges the system impact.

## Article 43.2: 2. Migration flow

1. **Relation check:** Review `refer.supabase.md` and the Supabase system relation to understand impacted assets (short URLs, resolvers, etc.).
2. **Planning:** Document the migration plan, rollback strategy, and guard conditions (ensure Supabase service roles/edges remain secure).
3. **Execution:** Apply the migration scripts, verify success via RETURN tests, and log any architectural changes.
4. **Lineage:** Run `refer.commit`/`refer.branch` steps to seal the migration and trigger PUBLISH so the system knows the new schema is live.

## Article 43.3: 3. Communication

- Notify dependent teams or providers (Cloudflare, Supabase) about the migration so their caches/relations stay synchronized.
