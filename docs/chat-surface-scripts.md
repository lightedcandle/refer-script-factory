# Chat Surface Scripts

## Purpose

The current Codex chat is also an instantiated factory surface. It should learn from its own work instead of only editing the product repos.

This collection is for small scripts that help the chat surface run like a Script Factory:

- track token use by lane;
- record spawned-agent work;
- compare direct chat against contract/compressed lanes;
- keep Zo chat usage visible and low;
- produce durable summaries after context compaction.

The chat-surface domain is registered in `.refer-factory/script-registry.json` and `.refer-factory/script-registry.md`. Regenerate the domain registry after changing these scripts:

```powershell
npm run scripts:registry
```

## Token Useage

Human-readable summary:

```text
token useage.md
```

Visual dashboard:

```text
token useage.html
```

Detailed ledger:

```text
.refer-factory/chat-surface/token-useage.jsonl
```

Commands:

```powershell
npm run tokens:summary
npm run tokens:chat -- --input-chars 1200 --output-chars 800 --note "casual chat"
npm run tokens:chat -- --input-text "user prompt" --output-text "assistant response" --note "casual chat"
npm run tokens:reset-chat -- --ceiling-tokens 12000 --note "context ceiling reached"
npm run tokens:zo-chat -- --zo-computer telechurch --input-chars 80 --output-chars 200 --note "minimal Zo activation"
npm run tokens:log -- --lane current_chat_window --input-chars 1200 --output-chars 800 --note "implemented token ledger"
npm run tokens:log -- --lane script_factory_spawned_agent --agent Harvey --agent-id 019... --input-tokens 1000 --output-tokens 500 --source manual
npm run tokens:script -- --script dispatch-contract --lane zo_bootstrap_spawned_agent --account codex-main --input-chars 1200 --output-chars 800 --note "script run"
npm run tokens:backfill-zo -- --zo-computer telechurch
npm run tokens:backfill-chat -- --account digitizedbusiness@gmail.com --scope active --input-tokens 300 --output-tokens 600 --source manual
npm run tokens:audit-chat
```

Supported lanes:

- `script_factory_spawned_agent`
- `zo_bootstrap_spawned_agent`
- `current_chat_window`
- `zo_local_chat`

## Counting Rule

Use exact provider token counts when available and set `--source measured`.

When exact counts are unavailable, use the working factory rule: `4 characters = 1 token`. Estimated counts are for direction and drift control, not billing precision.

## Account Tracking

The current Codex account tracked by default is:

```text
lightedcandle2018@gmail.com
```

Override it with `--account`, or set one of these environment variables before running scripts:

```powershell
$env:REFER_TOKEN_ACCOUNT="codex-main"
$env:CODEX_ACCOUNT="codex-main"
```

The HTML dashboard shows account in Recent Activity.

For Zo computers, scope usage by computer name instead of a single total Zo chat bucket:

```powershell
npm run tokens:log -- --lane zo_local_chat --zo-computer telechurch --input-chars 80 --output-chars 200 --note "minimal activation"
npm run tokens:log -- --lane zo_local_chat --zo-computer alliance --input-chars 80 --output-chars 200 --note "minimal activation"
```

The tracker stores those as accounts like `zo:telechurch` and surfaces a horizontal Zo Computers summary in the HTML dashboard.

Backfill existing unscoped Zo chat records:

```powershell
npm run tokens:backfill-zo -- --zo-computer telechurch
```

## Spawn Tracking

Every spawned or simulated worker should be logged with:

- lane;
- agent name;
- agent id when known;
- parent/director when useful;
- contract id when work came from a contract;
- input/output token counts or character estimates;
- status;
- one short note.

Zo local chat should normally stay close to zero. Prefer `refer-zo-bootstrap/docs/file-transport-tandem.md` for contract and talkback transfer.

## Script Tracking

Script executions should use the same recent activity table. Log them with `tokens:script`; the tracker renders the Agent column as `Script <script name>`.

The HTML dashboard formats recent activity time as local `MMM/DD HH:MM:SS`. Agent category icons:

- `⚙️` script execution
- `🤖` current chat window
- `🧩` spawned/delegated agent lane
- `💬` Zo local chat

Examples:

```powershell
npm run tokens:script -- --script sync-tandem-runtime-to-zo --lane zo_bootstrap_spawned_agent --input-chars 46916 --output-chars 1036 --note "synced governance preset"
npm run tokens:script -- --script token-useage --lane current_chat_window --input-chars 300 --output-chars 900 --note "refreshed dashboard"
```

## Automatic Script Logging

The Zo bootstrap tandem scripts call the root token ledger automatically when the repo is nested under `refer-script-factory`:

- `scripts/factory/ship-contract-to-zo.mjs`
- `scripts/factory/contract-inbox-runner.mjs`
- `scripts/factory/fetch-zo-talkback.mjs`
- `scripts/factory/dispatch-contract.mjs`

These records are estimates based on `4 characters = 1 token`, unless a future provider exposes measured usage.

## Casual Chat Tracking

Casual chat is not automatically intercepted by this repo. Use:

```powershell
npm run tokens:chat -- --input-chars <user_chars> --output-chars <assistant_chars> --note "casual chat"
```

Or let the script count characters from explicit text:

```powershell
npm run tokens:chat -- --input-text "user prompt" --output-text "assistant response" --note "casual chat"
```

If a current-chat record is logged without input/output counts, the dashboard marks it as unmeasured and `tokens:audit-chat` reports zero-count current-chat records:

```powershell
npm run tokens:audit-chat
```

Backfill current-chat rows with manual estimates instead of editing JSONL directly:

```powershell
npm run tokens:backfill-chat -- --account digitizedbusiness@gmail.com --scope active --input-tokens 300 --output-tokens 600 --source manual
npm run tokens:backfill-chat -- --account digitizedbusiness@gmail.com --note-contains "deployment pack" --input-tokens 120 --output-tokens 220 --source manual
```

`--scope active` targets zero-count current-chat records after the last reset for that account. Use `--scope all` only when deliberately repairing older ledger history.

Run token ledger writes sequentially. Backfill commands rewrite the ledger after reading it, so parallel backfills can overwrite one another.

The HTML dashboard shows a Current Context section for `Codex: Chat` by account. A reset marker starts that context total over, even when the same account keeps being used:

```powershell
npm run tokens:reset-chat -- --account lightedcandle2018@gmail.com --ceiling-tokens <current_total> --note "context ceiling reached"
```

The static HTML cannot write to the local ledger directly from the browser. Its reset button copies the exact command that logs the ceiling and starts the next context segment.

Zo chat should be scoped to the target computer:

```powershell
npm run tokens:zo-chat -- --zo-computer telechurch --input-chars <prompt_chars> --output-chars <response_chars> --note "Zo chat"
```
