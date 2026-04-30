# Hive Backlog

Updated: 2026-04-30T02:35:23.153Z

Track hive work as typed contracts before dispatching to factory nodes.

## Templates

| Template | Mode | Purpose |
|---|---|---|
| `hive-feature` | `BUILD` | Build a provider-neutral hive capability in the root Script Factory. |
| `zo-runtime-fix` | `VERIFY` | Repair or verify Zo-specific runtime behavior in refer-zo-bootstrap or a live Zo node. |
| `factory-doctrine-promotion` | `RATIFY` | Promote a provider-neutral lesson from a Zo lane back into root doctrine. |
| `ratification-test` | `VERIFY` | Ask a node to prove a behavior and return talkback evidence. |

## Items

| ID | Status | Node | Priority | Mode | Title |
|---|---|---|---|---|---|
| `hive.task.telechurch.refer-factory-static-visualizer.20260430` | intake_contracted | `telechurch` | high | `BUILD` | Telechurch REFER Factory Static Visualizer |
| `hive.task.registration-page-bootstrap-generator` | queued | `codex-script-factory` | normal | `VERIFY` | Build hive registration page and bootstrap generator |
| `hive.task.alliance.base-atomic-forges.20260429` | ratified | `alliance` | high | `VERIFY` | Alliance base atomic forge pack |
| `hive.task.alliance.skill-binding.20260429` | ratified | `alliance` | high | `VERIFY` | Alliance REFER skill binding |
| `hive.task.alliance.self-evolution.20260429` | ratified | `alliance` | high | `VERIFY` | Alliance self-evolution loop |
| `hive.task.alliance.script-factory-completion.20260429` | ratified | `alliance` | high | `VERIFY` | Alliance Script Factory completion |
| `hive.task.alliance.app-shell-completion.20260429` | ratified | `alliance` | high | `BUILD` | Complete Alliance Hub app shell content |
| `hive.task.telechurch.route-rectification-ratification.20260429` | ratified | `telechurch` | high | `VERIFY` | Ratify route build rectification pattern |
| `hive.task.alliance.intake-automation.20260429` | ratified | `alliance` | high | `BUILD` | Install Alliance build intake automation |
| `hive.task.alliance.readiness-report.20260429` | ratified | `alliance` | normal | `VERIFY` | Record Alliance workspace readiness report |
| `hive.task.alliance.registered-node-ratification.20260429` | ratified | `alliance` | normal | `VERIFY` | Ratify registered Alliance hive node |
| `hive.task.20260429T193810865Z.d738ee3912` | ratified | `telechurch` | high | `VERIFY` | Ratify bounded Telechurch execution |
| `hive.task.20260429T192457244Z.edb26d473e` | ratified | `telechurch` | high | `VERIFY` | Verify Telechurch hive director loop |
| `hive.task.alliance.app-shell.20260429` | route_ratified | `alliance` | high | `BUILD` | Build Alliance Hub app shell |

### Telechurch REFER Factory Static Visualizer

- ID: `hive.task.telechurch.refer-factory-static-visualizer.20260430`
- Contract: `.refer-factory\hive-build-intake\outbox\hive.task.telechurch.refer-factory-static-visualizer.20260430.json`
- Summary: Build a Zo-hosted static REFER Factory visualization at /refer-factory-map that serves as the source of truth for ratification and expansion. The page should render factory domains, ratification nodes, expansion edges, status, authority, evidence, and last verified dates. Keep it static, readable, and data-model-first; no animation yet.
- Acceptance: Zo page loads at /refer-factory-map; Every visible item has a stable machine ID; Ratification status is visible for each node; Ratified structure is visually distinct from proposed expansion candidates; Node details include type authority evidence and last_verified; Data model can later be updated from contracts datasets or source registries
- Evidence:
  - 2026-04-30T02:35:23.153Z: build intake contract emitted: .refer-factory\hive-build-intake\outbox\hive.task.telechurch.refer-factory-static-visualizer.20260430.json
- Notes:
  - 2026-04-30T02:35:17.771Z: User requested this be built on Zo, not created in e:\refer-script-factory.
  - 2026-04-30T02:35:23.153Z: Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.

### Build hive registration page and bootstrap generator

- ID: `hive.task.registration-page-bootstrap-generator`
- Contract: _not emitted_
- Summary: Create a registration page where a user enters computer name and access code, then the factory generates and deploys the correct bootstrap for that registered node.
- Acceptance: registration creates a typed node record; access code is never printed or committed; bootstrap pack is generated from registry data; deployment writes evidence back to hive registry
- Notes:
  - 2026-04-29T21:22:56.001Z: Slated after registered computer nodes are fully working.

### Alliance base atomic forge pack

- ID: `hive.task.alliance.base-atomic-forges.20260429`
- Contract: _not emitted_
- Summary: Package executable base atomic Script Factory forges for page, section, card, button, field, text, form, and workspace scan; sync and verify them live on Alliance.
- Acceptance: Alliance page-add, button-add, and card-add run through factory:intake and write script-artifacts; registry doctor reports missing_executable_count=0
- Evidence:
  - 2026-04-30T01:35:25.833Z: Alliance registry-doctor reported record_count=13 and missing_executable_count=0 after auto-chunker sync.
  - 2026-04-30T01:35:38.498Z: Alliance factory:intake ran page-add, button-add, and card-add with status=done and wrote datasets/script-artifacts records.
- Notes:
  - 2026-04-30T01:35:09.472Z: Ratified live on Alliance after atomic forge sync.

### Alliance REFER skill binding

- ID: `hive.task.alliance.skill-binding.20260429`
- Contract: _not emitted_
- Summary: Install and verify REFER skills, startup rules, REFER law directory, and active VIPC startup persona on Alliance so chat knows to use the Script Factory lane.
- Acceptance: vipc-bootstrap verify passes for profile alliance and instance alliance
- Evidence:
  - 2026-04-30T01:16:51.398Z: vipc-bootstrap verify passed for --profile alliance --instance alliance: authority files, Skills, REFER.OS directory, persona marker, and five REFER rules verified.
- Notes:
  - 2026-04-30T01:16:45.318Z: Verification passed after installing REFER startup rules, REFER law directory, and active Alliance REFER VIPC Startup Operator persona.

### Alliance self-evolution loop

- ID: `hive.task.alliance.self-evolution.20260429`
- Contract: _not emitted_
- Summary: Install and ratify the bounded self-evolution loop: inbox automation, registry doctor, evolution-log events, tandem talkback, and hourly Zo automation trigger.
- Acceptance: Alliance factory:evolve returns ok=true; registry missing executable count is zero after placeholder repair; hourly Zo automation exists for factory:evolve
- Evidence:
  - 2026-04-30T01:01:54.710Z: Alliance list_automations shows active hourly automation id 0271d44c-1613-42d6-827d-068928de8cdf for factory:evolve using zo:fast.
  - 2026-04-30T01:02:08.106Z: Alliance factory:evolve returned ok=true and wrote evolution-log plus tandem talkback records.
- Notes:
  - 2026-04-30T01:01:32.125Z: Live Alliance evolution tick returned ok=true and wrote evolution talkback; hourly automation created with FREQ=HOURLY;INTERVAL=1.
  - 2026-04-30T01:02:19.453Z: Final status restored after self-evolution evidence recording.

### Alliance Script Factory completion

- ID: `hive.task.alliance.script-factory-completion.20260429`
- Contract: _not emitted_
- Summary: Install the Zo-local Script Factory loop so ordinary prompts route through local intake, node scope, script registry lookup, script-gap scaffolding, talkback, and automation tick.
- Acceptance: Alliance local intake returns auto-scoped needs_script talkback for ordinary prompt; Alliance inbox automation processes queued intake and writes talkback
- Evidence:
  - 2026-04-30T00:30:55.321Z: Alliance inbox-automation.mjs --once processed alliance-live-automation-check.json with processed_count=1 error_count=0 and wrote talkback.
  - 2026-04-30T00:31:04.368Z: Alliance local-intake-runner returned status=needs_script with node_scope:auto_resolved for alliance-application-build and script_scaffold:created.
  - 2026-04-30T00:31:04.465Z: Alliance sync uploaded local-script-registry, local-intake-runner, inbox-automation, local-intake dataset, and script-registry docs; remote syntax check returncode=0.
- Notes:
  - 2026-04-30T00:30:48.091Z: Ratified live on Alliance with local-intake-runner and inbox-automation.mjs --once.
  - 2026-04-30T00:31:11.993Z: Final status restored after evidence recording; live Alliance checks passed.

### Complete Alliance Hub app shell content

- ID: `hive.task.alliance.app-shell-completion.20260429`
- Contract: `.refer-factory\hive-build-intake\outbox\hive.task.alliance.app-shell-completion.20260429.json`
- Summary: Complete the Alliance Hub app shell content after intake automation ratification. Ensure all eleven routes render meaningful demo content, consistent navigation, universal alliance data, and Faith / Church Alliance profile content without external integrations.
- Acceptance: all eleven app routes render meaningful non-placeholder content; navigation is consistent across routes; Faith / Church Alliance demo profile is present; talkback lists changed routes and build activity evidence; route ratification passes with source inspection
- Evidence:
  - 2026-04-29T22:48:14.319Z: route ratification passed: .refer-factory\hive-route-ratifications\hive.task.alliance.app-shell-completion.20260429.20260429T224814319Z.json
  - 2026-04-29T22:48:35.099Z: Alliance app-shell completion pass ratified: build intake recorded, source-inspected route ratification passed for all eleven routes, and get_space_errors returned count=0.
  - 2026-04-29T23:19:21.386Z: build intake contract emitted: .refer-factory\hive-build-intake\outbox\hive.task.alliance.app-shell-completion.20260429.json
  - 2026-04-29T23:20:27.282Z: build intake recorded on alliance; talkback fetched
  - 2026-04-29T23:20:41.774Z: Alliance runner now auto-resolves local node scope; latest talkback includes node_scope:auto_resolved and scope_id alliance-application-build.
- Notes:
  - 2026-04-29T22:45:23.703Z: Created after Alliance build-intake automation reached ratified status.
  - 2026-04-29T22:45:43.818Z: Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.
  - 2026-04-29T22:48:35.099Z: No route rewrite was needed in this pass; existing Alliance route sources already contained substantial demo content and Faith / Church Alliance profile content.
  - 2026-04-29T23:19:21.386Z: Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.
  - 2026-04-29T23:20:41.774Z: Users do not need to speak factory scope vocabulary; node scope is applied automatically by contract-inbox-runner.

### Ratify route build rectification pattern

- ID: `hive.task.telechurch.route-rectification-ratification.20260429`
- Contract: `.refer-factory\hive-contracts\outbox\hive.task.telechurch.route-rectification-ratification.20260429.json`
- Summary: Telechurch must prove it received the updated file-transport tandem doctrine that defines route-build rectification and cross-ratification after direct Zo route builds.
- Acceptance: Telechurch confirms updated tandem doc exists; Telechurch runner returns talkback; local talkback validation passes
- Evidence:
  - 2026-04-29T22:01:24.765Z: dispatch and talkback fetch completed for telechurch
  - 2026-04-29T22:01:30.587Z: talkback validation passed: .refer-factory\hive-validations\hive.task.telechurch.route-rectification-ratification.20260429.json
- Notes:
  - 2026-04-29T22:00:58.537Z: Created after Alliance app-shell routes were ratified upstream.

### Install Alliance build intake automation

- ID: `hive.task.alliance.intake-automation.20260429`
- Contract: `.refer-factory\hive-build-intake\outbox\hive.task.alliance.intake-automation.20260429.json`
- Summary: Add a governed Alliance build lane so app route changes are initiated from typed intake contracts and return talkback, route evidence, and usage records instead of direct untracked Zo route edits.
- Acceptance: Alliance has a Skills or factory runner surface; build requests create intake or dispatch records; route changes produce talkback evidence; datasets contain build activity beyond tandem ratification
- Evidence:
  - 2026-04-29T22:22:11.663Z: build intake contract emitted: .refer-factory\hive-build-intake\outbox\hive.task.alliance.intake-automation.20260429.json
  - 2026-04-29T22:22:31.483Z: build intake recorded on alliance; talkback fetched
  - 2026-04-29T22:22:36.239Z: talkback validation passed: .refer-factory\hive-validations\hive.task.alliance.intake-automation.20260429.json
  - 2026-04-29T22:22:58.295Z: talkback validation passed: .refer-factory\hive-validations\hive.task.alliance.intake-automation.20260429.json
  - 2026-04-29T22:23:40.811Z: Alliance build-activity dataset contains hive.task.alliance.intake-automation.20260429.json and validated talkback includes build_intake:recorded evidence.
- Notes:
  - 2026-04-29T21:50:32.150Z: Queued because partial app shell routes exist but no intake automation or script-factory activity is visible.
  - 2026-04-29T22:18:27.041Z: Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.
  - 2026-04-29T22:22:11.663Z: Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.
  - 2026-04-29T22:23:40.811Z: Updated tandem runtime on Alliance with build-intake recording support before live dispatch.

### Record Alliance workspace readiness report

- ID: `hive.task.alliance.readiness-report.20260429`
- Contract: _not emitted_
- Summary: Alliance reported Projects/Alliance-Hub contains documentation and personas only, no zo.space routes, no app code, no DB, no build tooling, and the defined next step is an Alliance Hub app shell.
- Acceptance: readiness report captured as hive evidence; next build task is queued from BUILD-PLAN directive
- Evidence:
  - 2026-04-29T21:35:36.857Z: Alliance readiness report: docs/personas complete; app code/routes/db/tooling absent; next directive is app shell with Dashboard, Organizations, People, Calendar, Initiatives, Documents, Governance, Compliance, Communications, Profiles, Settings.
- Notes:
  - 2026-04-29T21:35:29.335Z: Report supplied from Alliance Zo readiness scan in current chat.
  - 2026-04-29T21:35:36.857Z: Captured as user-supplied Alliance Zo readiness talkback.

### Ratify registered Alliance hive node

- ID: `hive.task.alliance.registered-node-ratification.20260429`
- Contract: `.refer-factory\hive-contracts\outbox\hive.task.alliance.registered-node-ratification.20260429.json`
- Summary: Alliance must prove registered-node file/API tandem execution with bounded non-mutating operations.
- Acceptance: Alliance receives typed contract through file/API transport; Alliance runner writes talkback; talkback validates locally
- Evidence:
  - 2026-04-29T21:19:53.281Z: dispatch and talkback fetch completed for alliance
  - 2026-04-29T21:19:59.694Z: talkback validation passed: .refer-factory\hive-validations\hive.task.alliance.registered-node-ratification.20260429.json
- Notes:
  - 2026-04-29T21:19:09.312Z: Created after Alliance registration and runtime staging.

### Ratify bounded Telechurch execution

- ID: `hive.task.20260429T193810865Z.d738ee3912`
- Contract: `.refer-factory\hive-contracts\outbox\hive.task.20260429T193810865Z.d738ee3912.json`
- Summary: Run guarded non-mutating operations on Telechurch through the hive director contract path and return execution evidence in compressed talkback.
- Acceptance: file_exists operation returns true; list_dir operation returns factory script entries; talkback includes executor:zo.bounded.v1
- Evidence:
  - 2026-04-29T19:38:23.241Z: dry-run dispatch path verified for telechurch
  - 2026-04-29T19:39:55.342Z: dispatch and talkback fetch completed for telechurch
  - 2026-04-29T19:40:15.921Z: Telechurch bounded executor returned status=done with executor:zo.bounded.v1, package.json exists=true, and scripts/factory list_dir entries.
  - 2026-04-29T20:04:41.653Z: talkback validation passed: .refer-factory\hive-validations\hive.task.20260429T193810865Z.d738ee3912.json
- Notes:
  - 2026-04-29T19:40:15.921Z: This ratifies guarded non-mutating remote execution for echo, file_exists, list_dir, and read_json operation class; broader ops require new guards.

### Verify Telechurch hive director loop

- ID: `hive.task.20260429T192457244Z.edb26d473e`
- Contract: `.refer-factory\hive-contracts\outbox\hive.task.20260429T192457244Z.edb26d473e.json`
- Summary: Run a non-mutating ratification test proving the root hive director can emit a typed contract and delegate transport to the Zo tandem dispatcher.
- Acceptance: typed contract emitted; dry-run dispatch succeeds; node registry heartbeat records evidence
- Evidence:
  - 2026-04-29T19:25:09.527Z: dry-run dispatch path verified for telechurch
  - 2026-04-29T19:27:05.048Z: dry-run dispatch path verified for telechurch
  - 2026-04-29T19:30:11.564Z: dispatch and talkback fetch completed for telechurch
  - 2026-04-29T19:30:38.190Z: Telechurch talkback returned status=done with read_contract, decoded_transport:zo_task, and runner:contract-inbox-runner evidence.
  - 2026-04-29T20:05:00.516Z: talkback validation passed: .refer-factory\hive-validations\hive.task.20260429T192457244Z.edb26d473e.json
- Notes:
  - 2026-04-29T19:30:38.190Z: This ratifies the file/API transport and minimal activation runner; full remote task execution remains a separate hive capability.

### Build Alliance Hub app shell

- ID: `hive.task.alliance.app-shell.20260429`
- Contract: _not emitted_
- Summary: Create the Alliance Hub app shell with zo.space routes for Dashboard, Organizations, People, Calendar, Initiatives, Documents, Governance, Compliance, Communications, Profiles, and Settings. Populate with universal demo data plus a Faith / Church Alliance profile demo.
- Acceptance: zo.space routes exist for all named sections; first viewport is usable app shell not marketing page; demo data renders without external integrations; talkback lists changed routes and verification evidence
- Evidence:
  - 2026-04-29T21:50:06.845Z: Alliance zo.space now has partial routes: /, /organizations, /people, /_layout, /_shell, /components/nav, /lib/demo-data, /lib/alliance-types, /lib/layout-partial.
  - 2026-04-29T21:58:06.468Z: route ratification passed: .refer-factory\hive-route-ratifications\hive.task.alliance.app-shell.20260429.20260429T215806468Z.json
  - 2026-04-29T21:58:23.008Z: Alliance route ratification passed: all expected app-shell routes exist; report .refer-factory/hive-route-ratifications/hive.task.alliance.app-shell.20260429.20260429T215806468Z.json
- Notes:
  - 2026-04-29T21:35:46.587Z: Queued from Alliance BUILD-PLAN.md directive after readiness report.
  - 2026-04-29T21:50:06.845Z: Build appears to be happening through direct Zo route creation, not through hive director dispatch; no Skills directory exists and datasets only show prior tandem ratification files.
  - 2026-04-29T21:58:23.008Z: Route existence is ratified upstream, but the build still bypassed intake automation; continue with intake automation rectification before expanding features.

## Commands

```powershell
npm run hive:backlog
npm run hive:build-intake -- emit --id <item-id> --routes "/,/organizations,/people"
npm run hive:build-intake -- dispatch --id <item-id> --routes "/,/organizations,/people" --dry-run
npm run hive:contract -- --id <item-id>
npm run hive:dispatch -- --id <item-id> --dry-run
npm run hive:validate-talkback -- --id <item-id>
```

