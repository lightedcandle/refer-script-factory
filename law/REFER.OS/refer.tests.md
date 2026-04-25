# Law 60: refer.tests.md — Test Reference for REFER.OS Actions

Tests live alongside the referential audit (`refer.qc.md`) to prove that the technical implementation matches the scoped intent.

## Article 60.1: 1. What to run

- `npm run lint` / `ng lint` — catches template/type issues that violate Angular/IMSCE constraints.
- `npm run test` (unit) and `npm run test:ci` (if available) — confirm guards/services respond to intents.
- `npm run build` or `npm run prod` — ensures the final bundle respects the `REFER.OS` layout and bundles correctly before deployment.
- Policy tooling reset — enforcement moved to on-demand tooling per `REFER.OS/refer.tooling.md`.

Include any app-specific smoke tests or API integration suites that the feature touches (e.g., hitting Supabase Edge functions or Cloudflare workers) and log the commands/results in `refer.qc.md` under RETURN/COMMIT lists.

## Article 60.2: 2. How it fits with refer.qc

`refer.qc.md` remains the semantic guard, while `refer.tests.md` gives you the practical commands to run before RETURN. After tests pass, record their outputs/links in `refer.qc.md` so the COMMITS/PUBLISH steps know the code has been executed successfully.

## Article 60.3: 3. Logging

- Note the test commands and results in your action logs or `build_tracker.yaml` before invoking `refer.commit`; this keeps the audit trail complete for future reviews.
