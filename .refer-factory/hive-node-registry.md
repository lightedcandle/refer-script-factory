# Hive Node Registry

Updated: 2026-09-12T04:17:36.273Z

Track the machines the factory can reach - outposts that receive work, do it and report back - together with their roles, lifecycle state, and ratification evidence.

| Node | Kind | Role | Status | Account | Instance | Last Seen | Next Pulse | Transport | Persona | Rules |
|---|---|---|---|---|---|---|---|---|---|---|
| Alliance Zo | zo_computer | RETIRED. Was a multi-scope Zo hive node; its ratified scope was the Alliance application build. | retired | zo:alliance | alliance | 2026-05-01T13:57:27.813Z | watch / 1h / 2026-05-01T14:57:27.814Z | file_api_tandem | unknown | unknown |
| ApostleJ Zo Hive | zo_computer | RETIRED. Was the original hive deployment and distribution node; historical source for the early hive files and the Alliance deployment path. | retired | zo:apostlej | apostlej | 2026-04-30T12:15:56.209Z | ratifying / 15m / 2026-04-30T12:30:56.210Z | file_api_tandem | governance-synced | governance-synced |
| Codex Script Factory | codex_factory | RETIRED CLAIM - not transferred. This row asserted 'director and provider-neutral doctrine source'. Under precedent P14 a rename may move a duty but must never move a privilege, so the directorship is retired here rather than reassigned to Claude or to anything else. Nothing inherits it. | retired | lightedcandle2018@gmail.com | refer-script-factory | 2026-04-29T17:09:16.543Z | watch / 1h / 2026-04-29T18:23:36.720Z | local_scripts | AGENTS.md | unscripted-laws/REFER.OS |
| Home Desk | outpost | The operator's own Windows desktop - the machine the Living Factory actually runs on. It is the first and currently the only outpost. | active | local:windows-desktop | telechurch | 2026-09-12T04:11:53.746Z | living-factory / 15m / 2026-09-12T05:11:53.746Z | local_station | unknown | unknown |

## Node Details

### Alliance Zo

- ID: `alliance`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-activity`, `node-scope`, `local-intake`, `script-registry`, `evolution-log`, `script-artifacts`, `build-traces`
- Scripts: `contract-inbox-runner`, `dispatch-contract`, `ship-contract-to-zo`, `fetch-zo-talkback`, `sync-tandem-runtime-to-zo`, `node-scope`, `local-script-registry`, `local-intake-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`, `page-add`, `section-add`, `card-add`, `button-add`, `field-add`, `text-add`, `form-add`, `scan-workspace`, `auto-chunker`, `draft-promotion-runner`
- Heartbeat: `watch` every `1h` (max `24h`), next due `2026-05-01T14:57:27.814Z`
- Evidence:
  - 2026-05-01T02:53:58.201Z: 2026-05-01 verification after Phase 3 bridge apply: all 8 target routes have PHASE3_MODAL markers and no remaining f.name references; get_space_errors returned errors=[] with stale server_log only.
  - 2026-05-01T03:27:13.092Z: 2026-05-01 Alliance moved to Zo Sites: created public site/service label alliance at https://alliance-alliance.zocomputer.io; service_doctor healthy; source under /home/workspace/Projects/Alliance-Hub/alliance.
  - 2026-09-12T04:06:55.020Z: RETIREMENT EVIDENCE. Lifecycle judged STOPPED, not never-started and not merely unfed. It genuinely ran unattended at least once: evidence 2026-04-30T01:02:21Z records 'Alliance hourly self-evolution automation is active', and 2026-04-30T03:41:26Z records a live remote intake that auto-promoted qaremote-alliance-gap and replayed successfully without waiting for a heartbeat. Then it stopped: heartbeat.next_due_at was 2026-05-01T14:57:27Z and no beat ever followed, 134 days ago. What CANNOT be established from this machine is whether the Zo computer itself stopped or whether the operator simply stopped pushing to it - every last_seen_at here was written by the manual npm script hive:registry:heartbeat run on the Windows desktop, so the registry records the end of the relationship, not the death of the machine.
- Notes:
  - 2026-05-01T13:46:52.569Z: Phone now pulls SMS jobs from Cloudflare dispatcher over outbound HTTPS; no adb forward required for outbound relay
  - 2026-05-01T13:57:27.813Z: Phone polls Supabase Edge Function directly; cloud-only SMS outbox cleared without computer dispatcher or Cloudflare tunnel
  - 2026-09-12T04:06:55.020Z: RETIRED on the operator's instruction, 2026-09-11: 'we'll remove / retire the zo computers as i don't use them anymore'. Retired by marking, never by removal - a registry that forgets a machine it once had can no longer tell you that machine stopped, which is the one thing it exists to say. IMPORTANT SCOPE LIMIT: this retires the ALLIANCE ZO COMPUTER, not the Alliance project. Alliance work continued past this machine and does not depend on it - the SMS relay moved to a Supabase Edge Function plus a docked Android phone (see the 2026-05-01T13:57 note), and refer-zo-bootstrap's own git repo carries Alliance commits as recent as 2026-09-03. Do not read this row as Alliance being stood down.

### ApostleJ Zo Hive

- ID: `apostlej`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-traces`, `script-registry`, `script-artifacts`, `evolution-log`
- Scripts: `contract-inbox-runner`, `ship-contract-to-zo`, `fetch-zo-talkback`, `dispatch-contract`, `local-script-registry`, `local-intake-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`, `draft-promotion-runner`
- Heartbeat: `ratifying` every `15m` (max `24h`), next due `2026-04-30T12:30:56.210Z`
- Evidence:
  - 2026-04-30T11:47:13.660Z: root scripts/hive communication layer synced to ApostleJ; remote syntax check returncode=0
  - 2026-04-30T12:15:56.209Z: ApostleJ received local-intake compression fix; remote syntax check and sx1 round-trip passed ratio about 0.50
  - 2026-09-12T04:06:55.020Z: RETIREMENT EVIDENCE. Lifecycle judged NEVER STARTED as an autonomous outpost, which is a different fact from stopped and is the more accurate one. All ten of its prior evidence entries span a single day, 2026-04-30T03:21Z to 12:15Z, and every one of them is the same shape: the Windows desktop pushed a bundle and got a syntax check back ('synced to ApostleJ; remote syntax check returncode=0'). Nothing here records ApostleJ initiating anything. Unlike alliance, it never earned an 'automation is active' entry and never returned an unprompted talkback. Its heartbeat was left in mode 'ratifying' with next_due_at 2026-04-30T12:30:56Z - a due time that passed 135 days ago with no beat. So it functioned as a sync target and never as a self-running machine. Stated as observed, not inferred from silence: the absence of autonomous evidence is corroborated by the presence of that evidence on alliance, which proves the record WOULD have captured it.
- Notes:
  - 2026-04-30T11:47:13.660Z: ApostleJ carries root scripts/hive shims plus factory hive implementation fixes
  - 2026-04-30T12:15:56.209Z: local-intake-runner and inbox-automation now match Alliance compression behavior
  - 2026-09-12T04:06:55.020Z: RETIRED on the operator's instruction, 2026-09-11. Retired by marking, never by removal. Its historical value is real and is why the row stays: this was the ORIGINAL hive deployment machine and the path by which Alliance was first deployed, so deleting it would erase the only record of where the hive came from.

### Codex Script Factory

- ID: `codex-script-factory`
- Datasets: `chat-surface-token-useage`, `hive-node-registry`
- Scripts: `token-useage`, `hive-node-registry`
- Heartbeat: `watch` every `1h` (max `24h`), next due `2026-04-29T18:23:36.720Z`
- Evidence:
  - 2026-04-29T17:09:16.543Z: local token dashboard and script-first ledger active
- Notes:
  - 2026-04-29T17:09:16.543Z: Promote provider-neutral lessons from Zo back into this repo.
  - 2026-09-12T04:06:55.020Z: RETIREMENT NOTE. Lifecycle NEVER STARTED as a reporting entity: its single evidence entry is from the minute it was created, 2026-04-29T17:09:16Z, and nothing was ever added. It was a description of the repo, not a machine that ever reported. Its one standing instruction - 'Promote provider-neutral lessons from Zo back into this repo' - is DISCHARGED by the same pass that retired it: the Zo method was read off disk and classified before the machines were stood down, and the result is .refer-factory/zo-method-harvest.json. That is the note being closed on purpose rather than dropped with the row.

### Home Desk

- ID: `telechurch`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-traces`, `script-registry`, `script-artifacts`, `evolution-log`
- Scripts: `contract-inbox-runner`, `ship-contract-to-zo`, `fetch-zo-talkback`, `dispatch-contract`, `local-script-registry`, `local-intake-runner`, `draft-promotion-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`
- Heartbeat: `living-factory` every `15m` (max `24h`), next due `2026-09-12T05:11:53.746Z`
- Evidence:
  - 2026-04-30T12:07:57.302Z: Telechurch Scriptionary second gap pass validated remotely: count=30, missing=[], pending=[], updated=2026-04-30T12:15:00.000Z
  - 2026-04-30T12:15:55.355Z: Telechurch received local-intake compression fix; remote syntax check and sx1 round-trip passed ratio about 0.50
  - 2026-09-12T04:06:55.020Z: RE-FOUNDED AS AN OUTPOST, not retired. Verified rather than assumed. WRITER: tools/factory/node-heartbeat.cjs, a registered station with its own trigger json, hardcodes NODE_ID='telechurch', reads os.uptime() and the Windows RebootPending / WindowsUpdate registry keys, and writes last_seen_at, updated_at, an adaptive heartbeat and a host block. It contacts nothing remote. READER: tools/factory/build-tracker.cjs line 877 finds this exact row by id and renders node.host on the board - so blanking this entry would have broken the board's host panel, which is why it was not blanked. All evidence above this line, dated 2026-04-29 to 2026-04-30, IS genuine Zo tandem history and is kept as history; the live beat is a different mechanism that reused the row.
- Notes:
  - 2026-04-30T12:07:57.302Z: Added decompress, emit-contract, forge-auto-capture, interlink, and script-dictionary to Scriptionary; resynced artifact forge files to guard against empty artifacts drift
  - 2026-04-30T12:15:55.355Z: local-intake-runner and inbox-automation now match Alliance compression behavior
  - 2026-09-12T04:06:55.020Z: OUTPOST ROSTER, as of this pass: one. This is it. alliance, apostlej and codex-script-factory are all retired above, and the machine reached through the GitHub @claude channel could not be registered because nothing on disk establishes it - no @claude workflow exists in any repo on this drive. See .refer-factory/zo-method-harvest.json, section `outpost_roster`, for exactly what would be needed to add it. An honest roster of one beats a roster of two where one is invented.

