# Hive Node Registry

Updated: 2026-04-30T20:30:49.859Z

Track hive-capable factory and Zo computer nodes, their roles, deployment state, and ratification evidence.

| Node | Kind | Role | Status | Account | Instance | Last Seen | Next Pulse | Transport | Persona | Rules |
|---|---|---|---|---|---|---|---|---|---|---|
| Alliance Zo | zo_computer | multi-scope Zo hive node; current ratified scope includes Alliance application build | active | zo:alliance | alliance | 2026-04-30T12:15:54.631Z | ratifying / 15m / 2026-04-30T12:30:54.632Z | file_api_tandem | unknown | unknown |
| ApostleJ Zo Hive | zo_computer | original hive deployment and distribution node; historical source for early hive files and Alliance deployment path | active | zo:apostlej | apostlej | 2026-04-30T12:15:56.209Z | ratifying / 15m / 2026-04-30T12:30:56.210Z | file_api_tandem | governance-synced | governance-synced |
| Codex Script Factory | codex_factory | director and provider-neutral doctrine source | active | lightedcandle2018@gmail.com | refer-script-factory | 2026-04-29T17:09:16.543Z | watch / 1h / 2026-04-29T18:23:36.720Z | local_scripts | AGENTS.md | unscripted-laws/REFER.OS |
| Telechurch Zo | zo_computer | first hive proving node | active | zo:telechurch | telechurch | 2026-04-30T12:15:55.355Z | ratifying / 15m / 2026-04-30T12:30:55.357Z | file_api_tandem | unknown | unknown |

## Node Details

### Alliance Zo

- ID: `alliance`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-activity`, `node-scope`, `local-intake`, `script-registry`, `evolution-log`, `script-artifacts`, `build-traces`
- Scripts: `contract-inbox-runner`, `dispatch-contract`, `ship-contract-to-zo`, `fetch-zo-talkback`, `sync-tandem-runtime-to-zo`, `node-scope`, `local-script-registry`, `local-intake-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`, `page-add`, `section-add`, `card-add`, `button-add`, `field-add`, `text-add`, `form-add`, `scan-workspace`, `auto-chunker`, `draft-promotion-runner`
- Heartbeat: `ratifying` every `15m` (max `24h`), next due `2026-04-30T12:30:54.632Z`
- Evidence:
  - 2026-04-30T04:34:18.553Z: portable dispatcher fix synced to Alliance; remote syntax check returncode=0
  - 2026-04-30T11:47:10.718Z: root scripts/hive communication layer synced to Alliance; remote syntax check returncode=0
  - 2026-04-30T12:15:54.631Z: Alliance local intake compression verified in place: scripts import encode/decode, codec self-test passed, sx1 round-trip ok ratio about 0.50, empty inbox automation reported compression=sx1
- Notes:
  - 2026-04-30T04:34:18.553Z: Upstream hive/cell package builder now works from Windows source before deployment
  - 2026-04-30T11:47:10.718Z: Hive communication gap closed at contract paths scripts/hive/api.mjs, dispatcher.mjs, receive.mjs, talkback.mjs
  - 2026-04-30T12:15:54.631Z: Alliance was ahead of repo for local-intake compression; source was ported from verified behavior

### ApostleJ Zo Hive

- ID: `apostlej`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-traces`, `script-registry`, `script-artifacts`, `evolution-log`
- Scripts: `contract-inbox-runner`, `ship-contract-to-zo`, `fetch-zo-talkback`, `dispatch-contract`, `local-script-registry`, `local-intake-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`, `draft-promotion-runner`
- Heartbeat: `ratifying` every `15m` (max `24h`), next due `2026-04-30T12:30:56.210Z`
- Evidence:
  - 2026-04-30T04:34:20.115Z: portable dispatcher fix synced to ApostleJ; remote syntax check returncode=0
  - 2026-04-30T11:47:13.660Z: root scripts/hive communication layer synced to ApostleJ; remote syntax check returncode=0
  - 2026-04-30T12:15:56.209Z: ApostleJ received local-intake compression fix; remote syntax check and sx1 round-trip passed ratio about 0.50
- Notes:
  - 2026-04-30T04:34:20.115Z: ApostleJ carries the cross-platform dispatcher used for upstream bundle creation
  - 2026-04-30T11:47:13.660Z: ApostleJ carries root scripts/hive shims plus factory hive implementation fixes
  - 2026-04-30T12:15:56.209Z: local-intake-runner and inbox-automation now match Alliance compression behavior

### Codex Script Factory

- ID: `codex-script-factory`
- Datasets: `chat-surface-token-useage`, `hive-node-registry`
- Scripts: `token-useage`, `hive-node-registry`
- Heartbeat: `watch` every `1h` (max `24h`), next due `2026-04-29T18:23:36.720Z`
- Evidence:
  - 2026-04-29T17:09:16.543Z: local token dashboard and script-first ledger active
- Notes:
  - 2026-04-29T17:09:16.543Z: Promote provider-neutral lessons from Zo back into this repo.

### Telechurch Zo

- ID: `telechurch`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-traces`, `script-registry`, `script-artifacts`, `evolution-log`
- Scripts: `contract-inbox-runner`, `ship-contract-to-zo`, `fetch-zo-talkback`, `dispatch-contract`, `local-script-registry`, `local-intake-runner`, `draft-promotion-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`
- Heartbeat: `ratifying` every `15m` (max `24h`), next due `2026-04-30T12:30:55.357Z`
- Evidence:
  - 2026-04-30T12:02:13.060Z: Telechurch Scriptionary catalog gap closed; artifact forges and atomic-common catalogued; remote syntax check returncode=0
  - 2026-04-30T12:07:57.302Z: Telechurch Scriptionary second gap pass validated remotely: count=30, missing=[], pending=[], updated=2026-04-30T12:15:00.000Z
  - 2026-04-30T12:15:55.355Z: Telechurch received local-intake compression fix; remote syntax check and sx1 round-trip passed ratio about 0.50
- Notes:
  - 2026-04-30T12:02:13.060Z: Scriptionary now has no pending statuses, includes artifact forge entries, and clarifies scan-workspace artifact vs train-car wrapper
  - 2026-04-30T12:07:57.302Z: Added decompress, emit-contract, forge-auto-capture, interlink, and script-dictionary to Scriptionary; resynced artifact forge files to guard against empty artifacts drift
  - 2026-04-30T12:15:55.355Z: local-intake-runner and inbox-automation now match Alliance compression behavior

