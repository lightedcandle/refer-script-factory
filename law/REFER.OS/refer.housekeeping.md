# Law 34: refer.housekeeping.md - Housekeeping Action Reference

Housekeeping is the governed path for routine cleanup and maintenance that does
not change product behavior. It is for keeping the repo tidy and safe to
navigate without introducing new features or repairs.

## Article 34.1: 1. When to use

Use `refer.housekeeping` for:
- Removing unused assets, temp files, or obsolete docs.
- Pruning stale scripts or backups that are no longer referenced.
- Normalizing file placement when a file drifted from its intended folder.

Do not use housekeeping to change runtime behavior or fix defects. Those belong
to `refer.build` or `refer.repair`.

## Article 34.2: 2. Allowed scope

- Filesystem cleanup only (no behavioral code changes).
- No schema changes, migrations, or API edits.
- No dependency upgrades or package changes.

If any change affects behavior or requires a new rule, stop and route to
`refer.governance` first.

### Section 34.2.1: Governance Cleanup Sweep
When a directory is orphaned, ambiguous, or ungoverned, run a governance
cleanup sweep:

1. **Detect**: List top-level and mid-level directories; flag any without a
   clear home (REFER.OS, refer.app, apps/<app>, src, reports, tools).
2. **Classify**: Decide whether each item is governance (REFER.OS), app state
   law (refer.app), app code (apps/<app>, src), tooling output (reports/tools),
   or legacy (remove).
3. **Distribute**: Move files into their correct governed location and update
   all references.
4. **Retire**: Delete legacy paths once replacements are verified.
5. **Log**: Record the sweep in `refer.os.md` and regenerate LAS indexes if
   governance files changed.

## Article 34.3: 3. Housekeeping flow

1. **Reason**: State why the cleanup is needed.
2. **Inventory**: Identify candidates and confirm they are unused (search for
   references, validate build/runtime paths).
3. **Plan**: List removals or moves; confirm the minimal set.
4. **Execute**: Apply changes locally; keep them scoped.
5. **RETURN**: Re-check references and ensure no drift.

## Article 34.4: 4. References

- Router: `REFER.OS/refer.md`
- Law: `REFER.OS/refer.law.md`
- Local repo rules: `REFER.OS/refer.localrepo.md`
- CLI rules (if running commands): `REFER.OS/refer.provider.cli.md`
