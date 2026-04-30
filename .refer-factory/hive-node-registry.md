# Hive Node Registry

Updated: 2026-04-30T01:35:27.422Z

Track hive-capable factory and Zo computer nodes, their roles, deployment state, and ratification evidence.

| Node | Kind | Role | Status | Account | Instance | Last Seen | Next Pulse | Transport | Persona | Rules |
|---|---|---|---|---|---|---|---|---|---|---|
| Alliance Zo | zo_computer | multi-scope Zo hive node; current ratified scope includes Alliance application build | active | zo:alliance | alliance | 2026-04-30T01:35:27.404Z | active_build / 5m / 2026-04-30T01:40:27.405Z | file_api_tandem | governance-synced | governance-synced |
| Codex Script Factory | codex_factory | director and provider-neutral doctrine source | active | lightedcandle2018@gmail.com | refer-script-factory | 2026-04-29T17:09:16.543Z | watch / 1h / 2026-04-29T18:23:36.720Z | local_scripts | AGENTS.md | law/REFER.OS |
| Telechurch Zo | zo_computer | first hive proving node | active | zo:telechurch | telechurch | 2026-04-29T22:02:17.150Z | ratifying / 15m / 2026-04-29T22:17:17.151Z | file_api_tandem | installed | installed |

## Node Details

### Alliance Zo

- ID: `alliance`
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`, `build-activity`, `node-scope`, `local-intake`, `script-registry`, `evolution-log`, `script-artifacts`
- Scripts: `contract-inbox-runner`, `dispatch-contract`, `ship-contract-to-zo`, `fetch-zo-talkback`, `sync-tandem-runtime-to-zo`, `node-scope`, `local-script-registry`, `local-intake-runner`, `inbox-automation`, `registry-doctor`, `evolution-loop`, `page-add`, `section-add`, `card-add`, `button-add`, `field-add`, `text-add`, `form-add`, `scan-workspace`, `auto-chunker`
- Heartbeat: `active_build` every `5m` (max `24h`), next due `2026-04-30T01:40:27.405Z`
- Evidence:
  - 2026-04-30T01:16:45.306Z: Alliance REFER skills, startup rules, REFER law directory, and active VIPC startup persona verified.
  - 2026-04-30T01:35:09.469Z: Alliance base atomic forge pack synced and registry doctor reported missing_executable_count=0.
  - 2026-04-30T01:35:27.404Z: Alliance base atomic forge pack executable and registered.
- Notes:
  - 2026-04-30T00:31:47.423Z: Restored active node metadata after registering Script Factory datasets/scripts.
  - 2026-04-30T01:02:20.300Z: Restored active node metadata after registering self-evolution loop.
  - 2026-04-30T01:35:26.712Z: Restored active node metadata after registering base atomic forge pack.

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
- Datasets: `tandem-contracts`, `tandem-talkback`, `tandem-dispatch`, `tandem-usage`
- Scripts: `contract-inbox-runner`, `ship-contract-to-zo`, `fetch-zo-talkback`, `dispatch-contract`
- Heartbeat: `ratifying` every `15m` (max `24h`), next due `2026-04-29T22:17:17.151Z`
- Evidence:
  - 2026-04-29T21:24:54.389Z: Telechurch MCP handshake succeeded with bounded timeout on 2026-04-29
  - 2026-04-29T22:01:24.917Z: hive director dispatch recorded for hive.task.telechurch.route-rectification-ratification.20260429
  - 2026-04-29T22:02:17.150Z: Telechurch cross-ratified route-build rectification pattern via hive.task.telechurch.route-rectification-ratification.20260429
- Notes:
  - 2026-04-29T17:09:16.543Z: Zo chat should stay minimal; use Files/API contracts and talkback.
  - 2026-04-29T21:24:54.389Z: Existing Telechurch transport and bounded-execution ratification remains valid; fresh MCP reachability confirmed.
  - 2026-04-29T22:02:17.150Z: Updated tandem doctrine synced and validated with bounded talkback.

