# Token Useage

> Counts may be measured, estimated, or manual. When exact provider token usage is unavailable, the script estimates `4 characters = 1 token` and marks `source=estimated`.

Updated: 2026-04-30T20:31:14.021Z

## Totals

| Lane | Calls | Input | Output | Total | Agents |
|---|---:|---:|---:|---:|---|
| Script Factory spawned agent | 1 | 0 | 0 | 0 | Harvey / 019dd9d1-a47f-7911-b64d-69e45624dbc7 |
| Zo Bootstrap spawned agent | 143 | 911113 | 82108 | 993221 | Mendel / 019dd9d1-b5fc-7213-9959-e1717d1a4a65<br>ship-contract-to-zo<br>dispatch-contract<br>contract-inbox-runner<br>sync-tandem-runtime-to-zo<br>fetch-zo-talkback<br>Script sync-tandem-runtime-to-zo<br>Script ship-contract-to-zo<br>Script fetch-zo-talkback<br>Script dispatch-contract<br>Script contract-inbox-runner<br>Script local-intake-runner<br>Script inbox-automation<br>Script registry-doctor<br>Script evolution-loop<br>Script draft-promotion-runner |
| Current Chat window | 39 | 5945 | 8036 | 13981 | Codex<br>Script token-useage<br>Script hive-node-registry<br>Script domain-script-registry<br>Script adaptive-heartbeat<br>Current Chat window<br>Codex: Chat<br>current-chat |
| Zo local chat | 2 | 0 | 0 | 0 | Telechurch-Zo<br>Zo local chat |
| **All tracked** | **185** | **917058** | **90144** | **1007202** | |

## Recent Activity

| Time | Lane | Agent | Account | In | Out | Source | Status | Note |
|---|---|---|---|---:|---:|---|---|---|
| 2026-04-30T12:15:12.850Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 4588 | 112 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T12:15:02.426Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 4588 | 112 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T12:14:38.043Z | Zo Bootstrap spawned agent | Script local-intake-runner | lightedcandle2018@gmail.com | 8 | 382 | estimated | done | local prompt converted to scoped script-factory intake |
| 2026-04-30T12:14:37.913Z | Zo Bootstrap spawned agent | Script local-intake-runner | lightedcandle2018@gmail.com | 8 | 382 | estimated | done | local prompt converted to scoped script-factory intake |
| 2026-04-30T12:14:37.885Z | Zo Bootstrap spawned agent | Script inbox-automation | lightedcandle2018@gmail.com | 0 | 0 | estimated | done | local intake inbox automation tick |
| 2026-04-30T12:07:34.845Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 14830 | 667 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T12:05:25.463Z | Zo Bootstrap spawned agent | Script registry-doctor | lightedcandle2018@gmail.com | 4126 | 1074 | estimated | done | audited registry |
| 2026-04-30T12:02:06.713Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 2758 | 73 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T12:01:41.707Z | Zo Bootstrap spawned agent | Script registry-doctor | lightedcandle2018@gmail.com | 4126 | 1074 | estimated | done | audited registry |
| 2026-04-30T11:46:23.634Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 15879 | 396 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T11:46:23.036Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 15879 | 396 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |
| 2026-04-30T11:46:21.984Z | Zo Bootstrap spawned agent | Script sync-tandem-runtime-to-zo | lightedcandle2018@gmail.com | 15879 | 396 | estimated | done | synced tandem runtime to Zo and ran remote syntax check |

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

