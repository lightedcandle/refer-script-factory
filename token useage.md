# Token Useage

> Counts may be measured, estimated, or manual. When exact provider token usage is unavailable, the script estimates `4 characters = 1 token` and marks `source=estimated`.

Updated: 2026-04-30T02:40:28.199Z

## Totals

| Lane | Calls | Input | Output | Total | Agents |
|---|---:|---:|---:|---:|---|
| Script Factory spawned agent | 1 | 0 | 0 | 0 | Harvey / 019dd9d1-a47f-7911-b64d-69e45624dbc7 |
| Zo Bootstrap spawned agent | 94 | 287655 | 49219 | 336874 | Mendel / 019dd9d1-b5fc-7213-9959-e1717d1a4a65<br>ship-contract-to-zo<br>dispatch-contract<br>contract-inbox-runner<br>sync-tandem-runtime-to-zo<br>fetch-zo-talkback<br>Script sync-tandem-runtime-to-zo<br>Script ship-contract-to-zo<br>Script fetch-zo-talkback<br>Script dispatch-contract<br>Script contract-inbox-runner<br>Script local-intake-runner<br>Script inbox-automation<br>Script registry-doctor<br>Script evolution-loop |
| Current Chat window | 39 | 5945 | 8036 | 13981 | Codex<br>Script token-useage<br>Script hive-node-registry<br>Script domain-script-registry<br>Script adaptive-heartbeat<br>Current Chat window<br>Codex: Chat<br>current-chat |
| Zo local chat | 2 | 0 | 0 | 0 | Telechurch-Zo<br>Zo local chat |
| **All tracked** | **136** | **293600** | **57255** | **350855** | |

## Recent Activity

| Time | Lane | Agent | Account | In | Out | Source | Status | Note |
|---|---|---|---|---:|---:|---|---|---|
| 2026-04-30T02:40:28.183Z | Zo Bootstrap spawned agent | Script fetch-zo-talkback | lightedcandle2018@gmail.com | 30 | 370 | estimated | done | fetched compressed Zo talkback through file/API lane |
| 2026-04-30T02:39:15.982Z | Zo Bootstrap spawned agent | Script fetch-zo-talkback | lightedcandle2018@gmail.com | 30 | 288 | estimated | done | fetched compressed Zo talkback through file/API lane |
| 2026-04-30T02:36:05.553Z | Zo Bootstrap spawned agent | Script dispatch-contract | lightedcandle2018@gmail.com | 679 | 504 | estimated | failed | dispatch loop shipped and triggered runner |
| 2026-04-30T02:36:05.323Z | Zo Bootstrap spawned agent | Script ship-contract-to-zo | lightedcandle2018@gmail.com | 986 | 209 | estimated | failed | contract shipped through Zo Files and runner triggered |
| 2026-04-30T02:35:25.406Z | Zo Bootstrap spawned agent | Script ship-contract-to-zo | lightedcandle2018@gmail.com | 986 | 209 | estimated | failed | contract shipped through Zo Files and runner triggered |
| 2026-04-30T02:04:11.355Z | Current Chat window | Codex: Chat | digitizedbusiness@gmail.com | 0 | 0 | manual | reset | context ceiling reached |
| 2026-04-30T01:35:39.323Z | Current Chat window | current-chat | lightedcandle2018@gmail.com | 0 | 0 | estimated | done | Packaged executable base atomic Script Factory forges and ratified them live on Alliance. |
| 2026-04-30T01:34:09.157Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 2415 | 71 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T01:33:41.811Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 1442 | 74 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T01:33:18.607Z | Zo Bootstrap spawned agent | Script registry-doctor | lightedcandle2018@gmail.com | 2163 | 597 | estimated | done | audited registry |
| 2026-04-30T01:32:34.192Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 32148 | 1674 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T01:30:25.327Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 32148 | 1674 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |

## Lanes

- Script Factory spawned agent: Codex-side delegated/subagent work for `refer-script-factory`.
- Zo Bootstrap spawned agent: delegated/subagent work for `refer-zo-bootstrap`.
- Current Chat window: this human-facing Codex chat surface.
- Zo local chat: live Zo chat usage. Prefer file/API tandem and keep this near zero.

## Ledger

Visual dashboard: `token useage.html`
Detailed records: `.refer-factory/chat-surface/token-useage.jsonl`

## Audit

Current-chat zero-count non-reset records: 10
Current-chat records after last reset/account switch with zero counts: 0

