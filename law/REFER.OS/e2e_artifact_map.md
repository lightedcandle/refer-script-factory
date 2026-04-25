# Law 2: E2E → REFER.OS Artifact Translation Map

This file captures the E2E governance artifacts that still exist in the repo and the REFER.OS documents or action files they are destined to become. Use it as a checklist while we migrate each document into the reference-first architecture described by `REFER.OS/refer.os.md`.

## Article 2.1: 1. Manifest & Identity (refer.identity.md)

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `E2E_MANIFEST.yaml` | High-level doctrine manifest and identity registry for the E2E era. | `refer.identity.md` (canonical identity registry). |
| `REFER.OS/manifests/e2e_manifest.schema.json` | Schema describing the manifest structure (IMSCE/lineage). | `refer.identity.md` (replace with referent schema + mapping). |
| `REFER.OS/manifests/lineage.schema.json` | Lineage record definition. | `refer.identity.md` (lineage + identity references). |
| `codex/archive/E2E_LIVING_ALIGNMENT_REPORT.md` | Narrative on alignment between identity/structure/mind-body. | `refer.identity.md` + cross-link to `refer.structure.md`. |

## Article 2.2: 2. Structure & Blueprint (refer.structure.md / inference.md)

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `REFER.OS/manifests/workflow.index.schema.json` | ASEDAWSI/workflow sequencing map. | `refer.structure.md` (structure) and `inference.md` (if we record unfolding rules). |
| `codex/archive/E2E_Build_Framework_Summary.md` | Mind→Spirit→Body build system summary. | `refer.structure.md` (UI/Workflow/Broadcast) + `inference.md` for blueprint logic. |
| `codex/governance/domains/telechurch_framework.md` | Telechurch framework description (UI/Workflow/Broadcast). | `refer.structure.md` (structural mapping). |
| `reports/e2e_knowledge.json` | Knowledge dump with E2E insights. | `inference.md` or a new `refer.knowledge.md` if we want to preserve context. |

## Article 2.3: 3. Systems & Providers (`refer.<system>.md` + `refer.provider.<provider>.md`)

The following `codex/governance/domains/*` documents describe the systems and providers that REFER.OS now treats as relations.

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `Angular.md` | Angular-specific constraints. | `refer.angular.md`. |
| `Cloudflare.md` | Cloudflare deployment references. | `refer.cloudflare.md`. |
| `Supabase.md`, `Supabase.RemoteOperations.Law.md`, `supabase.operations.map.json` | Supabase law/operations. | `refer.supabase.md` and/or `refer.systems.url.md` (for canonical URL rules). |
| `Git.md`, `GitHub.md`, `LocalRepo.md` | Git tooling references. | `refer.github.md` or `refer.commit.md` (lineage). |
| `CLI.md`, `Codex.md`, `ChatGPT.md` | Tooling/agent behavior. | `refer.provider.codex.md`. |
| `Supabase.md` | Also mention canonical asset URLs (see short URL policy). | Capture in `refer.supabase.md` plus cross-links from `refer.build.md` and `refer.repair.md`. |

## Article 2.4: 4. Protocols & Actions (`refer.<action>.md`)

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `codex/governance/protocols/codex_genesis_init.protocol.md` | Genesis build/interrogation flow. | `refer.build.md` (build protocol + router behavior). |
| `codex/governance/protocols/governance_repair.md` | Repair/resolution work. | `refer.repair.md`. |
| `codex/governance/modes/governance-response-engine.md` | Response flow for governance updates. | `refer.governance.md` or embed in `refer.law.md`. |

## Article 2.5: 5. Law & Governance (`refer.law.md`)

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `codex/governance/GOVERNANCE_MANIFEST.yaml` | Governance manifest versioning. | `refer.law.md` (lawful principles + RETURN/COMMIT requirements). |
| `codex/governance/README.md` | General governance scaffolding. | `refer.law.md` or `refer.md` introduction. |
| `codex/governance/protocols/governance_repair.md` | Already noted above; law-level enforcement belongs in `refer.law.md`. | `refer.law.md`. |

## Article 2.6: 6. Knowledge, Reports & Legacy Data

| Legacy artifact | Description | Refer target |
| --- | --- | --- |
| `reports/e2e_knowledge.json` | Dump of E2E data/insights. | Reference note in `inference.md` or a new `refer.knowledge.md`. |
| (Any other doc that captures E2E philosophy) | | Link off `refer.md` when the router needs context. |

## Article 2.7: 7. Outstanding Actions

1. Create `refer.identity.md`, `refer.structure.md`, `inference.md` drafts that absorb the corresponding artifacts listed above.
2. Add `refer.<system>.md` and `refer.provider.<provider>.md` reference files for Angular, Cloudflare, Supabase, Git, etc., then add them to the `REFER.OS/refer.os.md` layout and `refer.md` table.
3. Draft `refer.build.md`, `refer.repair.md`, `refer.governance.md`, `refer.systems.url.md` (for canonical asset URLs) and tie them back to the canonical prefixes.
4. Update `refer.md` whenever new domains are introduced so the router remains authoritative.

Keep this map updated as each E2E artifact is translated. Once the refer files exist, we can remove the legacy docs or archive them under `/codex/archive/` for historical reference.
