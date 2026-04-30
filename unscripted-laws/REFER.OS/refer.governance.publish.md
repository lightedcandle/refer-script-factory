# Law 68: refer.governance.publish.md - Governance Distribution

This document describes how to publish REFER.OS as a reusable universal-law bundle
and consume it across multiple app repositories without collapsing app-local law.

## Article 68.1: 1. Local-first universal source

The preferred first deployment shape is a standalone local universal repo, for
example:

- `E:/refer.os/REFER.OS` -> canonical universal law

Consumer app repos keep their own:

- `AGENTS.md`
- `refer.app/**`
- feature-local docs and plans

Universal law is shared. App law remains sovereign per repo.

## Article 68.2: 2. Export governance

From the source repo root:

`node tools/referos-export.mjs --out=dist/refer-os-governance`

This creates:

- `dist/refer-os-governance/*` (copy of `REFER.OS/`)
- `dist/refer-os-governance/GOVERNANCE_MANIFEST.json` (file hashes + timestamp)

To seed a standalone local source directly:

`node tools/referos-export.mjs --out=E:/refer.os/REFER.OS`

## Article 68.3: 3. Attachment contract for app repos

App repos attach to the universal source through a hybrid contract:

1. **Development source**: resolve universal law from the shared local root (`E:/refer.os/REFER.OS`) when present.
2. **Portable fallback**: allow export/copy or vendored fallback when the shared root is unavailable.
3. **App sovereignty**: keep app-specific law in the app repo (`refer.app/**`, app docs, AGENTS).
4. **Containment**: reading universal law does not authorize writes outside the active project root.

Recommended machine-readable attachment marker inside each app repo:

- `.refer/source.json`

Recommended fields:

- `universalGovernanceRoot`
- `localUniversalFallbackRoot`
- `appGovernanceRoot`
- `resolutionOrder`
- `writePolicy`

## Article 68.4: 4. Standalone repo publish shape

If the local universal source becomes its own Git repo:

1. Create a new repository (example: `refer.os`).
2. Place exported law at `REFER.OS/` inside that repo or use the repo root as the exported law surface.
3. Commit the manifest and distribution notes with the law files.
4. Keep app-local law out of the standalone repo.

## Article 68.5: 5. Consumer update modes

Supported consumer update modes:

- **Linked local root**: app repo reads from a shared local path.
- **Submodule**: app repo mounts the standalone repo at `REFER.OS/`.
- **Vendor/copy**: app repo copies a stamped export for offline or portable use.

All three are lawful as long as:

- universal law remains app-agnostic
- app-local law stays in app scope
- active-root containment prevents unintended cross-repo mutation

## Article 68.6: 6. Migration rule

When a repo currently carries embedded `REFER.OS/` and is migrating to a
standalone universal source:

1. Preserve local app law first.
2. Attach the repo to the universal source.
3. Move only app-specific deviations into `refer.app/**` or app-local docs.
4. Treat any remaining embedded `REFER.OS/` copy as a fallback or migration snapshot, not as the long-term app-specific home for universal law.
