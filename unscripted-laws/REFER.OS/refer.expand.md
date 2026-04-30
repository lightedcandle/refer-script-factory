# Law 29: refer.expand.md — Expansion Action Reference

Use `refer.expand` when introducing new capabilities that stretch identity or structure boundaries (beyond routine builds). This action ensures emerging domains follow REFER.OS governance before they become part of the canonical system.

## Article 29.1: 1. Expansion intent

- **Trigger:** `refer.expand: <concept>` or natural-language directive describing a capability that alters identity (new workflow domain, new broadcast signal, novel provider integration).
- **Purpose:** Document how the expansion affects `refer.identity.md` (identity), `refer.structure.md` (structure), inference patterns, and system/provider relations before implementation.

## Article 29.2: 2. Expansion flow

1. **Identity discovery:** Update `refer.identity.md` with the new identity nodes (e.g., new workflow, experience).
2. **Structure review:** Add sections to `refer.structure.md` and `inference.md` describing how the expansion integrates UI/workflow/broadcast and ASEDAWSI/EWCPSI patterns.
3. **Relation mapping:** Declare any new systems/providers in `refer.<system>.md` or `refer.provider.<provider>.md`. If the expansion touches Supabase or Cloudflare, cite those documents. If it introduces or changes front-end services, map them to `refer.spirit-runtime.md` runtime authority (headers, route class, and mutation path).
4. **RETURN/COMMIT planning:** Track how RETURN will verify the expansion, then follow commit/branch rules before publishing.

## Article 29.3: 3. Documentation

- Record the expansion rationale and new identity/structure references so future prompts automatically route to the expanded domain.
