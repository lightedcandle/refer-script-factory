# Known Limits And Constraints

This ledger records constraints discovered while running the Script Factory, Zo bootstrap, tandem dispatch, and chat-surface scripts.

Update this file whenever a tool, provider, transport path, script, runner, or packet hits a limit. The goal is to turn one failure into reusable factory knowledge.

## Record Format

- Date:
- Domain/provider:
- Operation:
- Symptom:
- Likely cause:
- Mitigation:
- Script/doc now encoding mitigation:
- Verification:

## Observed Limits

### Windows Command-Line Payload Length

- Date: 2026-04-29
- Domain/provider: Windows PowerShell / Node process launch
- Operation: uploading multiple Zo files by passing base64 JSON payloads as command-line arguments
- Symptom: `Program 'node.exe' failed to run: The filename or extension is too long`
- Likely cause: command-line argument exceeded Windows process creation length limits
- Mitigation: do not pass large file contents through command-line args; use a reusable Node script that sends MCP request bodies directly
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs`
- Verification: `npm run tandem:sync-runtime -- --instance telechurch --check`

### Zo Chat Token Cost

- Date: 2026-04-29
- Domain/provider: Zo chat
- Operation: Codex-to-Zo contract and ratification workflow
- Symptom: full Zo chat responses consume paid/limited tokens
- Likely cause: chat is model-mediated and returns verbose text unless constrained
- Mitigation: use Zo Files/MCP file transport for contracts and talkback; use chat only for tiny activation or persona/rule judgment
- Script/doc now encoding mitigation: `refer-zo-bootstrap/docs/file-transport-tandem.md`, `refer-zo-bootstrap/scripts/factory/dispatch-contract.mjs`
- Verification: `npm run dispatch:contract -- --instance telechurch --task "prove full tandem dispatch command after readback normalization" --trigger --fetch`

### Exact Token Counts Not Locally Exposed

- Date: 2026-04-29
- Domain/provider: Codex chat and spawned agents
- Operation: token-use tracking
- Symptom: local scripts cannot read exact provider token counts for the current chat window or spawned agents
- Likely cause: provider usage metadata is not exposed to the local repo scripts
- Mitigation: track `source=measured|estimated|manual`; estimate by `4 characters = 1 token` when exact counts are unavailable
- Script/doc now encoding mitigation: `scripts/chat-surface/token-useage.mjs`, `docs/chat-surface-scripts.md`
- Verification: `npm run tokens:summary`

### Nested Repository Boundary

- Date: 2026-04-29
- Domain/provider: Git / local workspace
- Operation: working on `refer-script-factory` with nested `refer-zo-bootstrap`
- Symptom: same branch names across repos can be mistaken for shared history
- Likely cause: nested sibling repo has independent `.git`, remotes, branches, and status
- Mitigation: run `git rev-parse --show-toplevel` when target repo is ambiguous; commit and push each repo separately
- Script/doc now encoding mitigation: root `AGENTS.md`, `docs/cross-factory-orchestration.md`
- Verification: `git status --short` in each repo root

### Full Zo Tandem Runtime Sync Can Timeout

- Date: 2026-04-29
- Domain/provider: Zo MCP / runtime sync
- Operation: syncing the full tandem runtime preset to Telechurch Zo
- Symptom: local command timed out after about 244 seconds
- Likely cause: many sequential MCP writes plus remote syntax check exceeded the local command timeout/latency window
- Mitigation: use narrow file sync for small changes: `npm run tandem:sync-runtime -- --instance telechurch --file <path> --check`
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs`
- Verification: `npm run tandem:sync-runtime -- --instance telechurch --file scripts/factory/backfill-zo-local-usage.mjs --check`

### Verification Scripts Can Miss Runtime Files

- Date: 2026-04-29
- Domain/provider: Zo bootstrap npm checks
- Operation: editing `refer-zo-bootstrap/scripts/factory/heartbeat.mjs`
- Symptom: `heartbeat.mjs` had a syntax-invalid header but `npm run check` did not catch it
- Likely cause: the file was not included in the Zo bootstrap `check` script
- Mitigation: add runtime files touched by hive automation to `npm run check`
- Script/doc now encoding mitigation: `refer-zo-bootstrap/package.json`
- Verification: `npm --prefix refer-zo-bootstrap run check`

### Tandem Runtime Sync Loads Dotenv Token Files

- Date: 2026-04-29
- Domain/provider: Zo MCP / runtime sync
- Operation: syncing a single updated Telechurch runtime file while `.env.master` was the active IDE file
- Symptom: the reusable sync script resolves Zo tokens by loading `.env.local` and `.env.master`
- Likely cause: `refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs` has its own token resolver for standalone use
- Mitigation: when secret-file reads must be avoided, use an already-connected MCP file tool or provide the token through process environment without printing it; do not inspect or print `.env*`
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`, `refer-zo-bootstrap/docs/known-limits-and-constraints.md`
- Verification: Telechurch `create_or_rewrite_file` upload of `contract-inbox-runner.mjs` followed by remote `node --check`

### Token Ledger Backfills Are Not Concurrent-Safe

- Date: 2026-04-29
- Domain/provider: chat-surface token ledger
- Operation: running multiple `tokens:backfill-chat` commands in parallel against `.refer-factory/chat-surface/token-useage.jsonl`
- Symptom: one backfill update was overwritten by another because each command read and rewrote the full ledger
- Likely cause: JSONL rewrite commands do not lock the ledger file
- Mitigation: run token ledger writes sequentially; do not parallelize `tokens:backfill-*` commands
- Script/doc now encoding mitigation: `docs/chat-surface-scripts.md`, `docs/known-limits-and-constraints.md`
- Verification: reran the missed `tokens:backfill-chat` command sequentially and `npm run tokens:audit-chat` returned zero active unmeasured records

### Zo MCP Node Handshakes Need Bounded Timeouts

- Date: 2026-04-29
- Domain/provider: Zo MCP / registered hive nodes
- Operation: checking Alliance MCP tools before staging the registered node
- Symptom: `tools/zo-mcp.mjs list-tools --instance alliance` timed out locally after about 124 seconds
- Likely cause: the helper did not bound fetch calls, so unreachable or slow node handshakes could consume the entire command window
- Mitigation: use `--timeout-ms` on `refer-zo-bootstrap/tools/zo-mcp.mjs` for node handshakes and record blocked node evidence in the hive registry
- Script/doc now encoding mitigation: `refer-zo-bootstrap/tools/zo-mcp.mjs`, `.refer-factory/hive-node-registry.md`
- Verification: `node --check refer-zo-bootstrap/tools/zo-mcp.mjs`

### Nested Zo Scripts Do Not See Root-Only Computer Tokens

- Date: 2026-04-29
- Domain/provider: Windows PowerShell / nested Zo bootstrap repo
- Operation: syncing the Alliance deployment pack with `npm --prefix refer-zo-bootstrap run tandem:sync-runtime -- --instance alliance`
- Symptom: sync failed with `Missing Zo token. Set ZO_COMPUTER_ALLIANCE` even though the root MCP helper could reach Alliance
- Likely cause: npm ran the nested script from `refer-zo-bootstrap`, whose dotenv loader checks that repo's `.env.local` / `.env.master`, not the root workspace `.env.master`
- Mitigation: provide the computer token through process environment for that command without printing it, or place the non-committed node token in the nested repo's ignored local env file
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`, `refer-zo-bootstrap/docs/known-limits-and-constraints.md`
- Verification: process-env bridged `tandem:sync-runtime -- --instance alliance --preset all --check --json` completed successfully

### Direct Zo Builds Can Bypass Hive Intake Telemetry

- Date: 2026-04-29
- Domain/provider: Alliance Zo / zo.space route editing
- Operation: starting the Alliance Hub app shell build
- Symptom: zo.space routes appeared on Alliance, but the root hive app-shell item still had no dispatch, no intake contract, no Skills directory, and only the prior tandem ratification dataset files
- Likely cause: work was started through direct Zo route tools or chat-mediated build activity rather than the root hive director and Script Factory intake lane
- Mitigation: before mutating app builds, install or dispatch a governed Alliance build runner that writes intake contracts, route-change evidence, talkback, and token usage back to the hive datasets
- Script/doc now encoding mitigation: `.refer-factory/hive-backlog.md`, `docs/known-limits-and-constraints.md`
- Verification: Alliance `list_space_routes` showed partial routes while `.refer-factory/hive-backlog.json` had no app-shell dispatch record

### Hive Registry Writes Are Not Concurrent-Safe

- Date: 2026-04-29
- Domain/provider: root hive registry
- Operation: running multiple `hive:registry:heartbeat` commands in parallel
- Symptom: one node heartbeat can overwrite another because each command reads and rewrites the full `.refer-factory/hive-node-registry.json`
- Likely cause: the registry writer has no file lock or append-only event merge
- Mitigation: run hive registry writes sequentially; if parallel writes happen, inspect `npm run hive:registry -- --json` and reapply missing evidence
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: rechecked registry after parallel heartbeat writes and reapplied the Telechurch rectification evidence sequentially

### Large Zo Runtime Syncs Can Exceed Short Command Timeouts

- Date: 2026-04-30
- Domain/provider: Zo MCP / tandem runtime sync
- Operation: syncing the expanded Alliance tandem runtime after adding base atomic forge scripts
- Symptom: `npm --prefix refer-zo-bootstrap run tandem:sync-runtime -- --instance alliance --check --json` exceeded a 180 second local command timeout before returning
- Likely cause: expanded runtime bundle uploads many files through MCP `create_or_rewrite_file`; the operation completed only when given a longer local command timeout
- Mitigation: use a longer timeout for full runtime bundle syncs, or sync small corrections with repeated `--file <path>` uploads
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: reran full sync with a 360 second timeout successfully, then used narrow `--file` syncs for `script-registry.json` and `auto-chunker.mjs`

### Zo Talkback Fetch Must Handle Current MCP Read Shape

- Date: 2026-04-30
- Domain/provider: Zo MCP / tandem talkback fetch
- Operation: fetching Telechurch talkback for `hive.task.telechurch.refer-factory-static-visualizer.20260430`
- Symptom: `fetch-zo-talkback.mjs` reported no talkback content even though `list_files` and direct `read_file` showed the talkback files existed
- Likely cause: the helper expected `result.result.result.content`, while the current MCP helper response exposes content at `result.result.content`
- Mitigation: support both response shapes in the fetch helper before treating a read as empty
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scripts/factory/fetch-zo-talkback.mjs`, `docs/known-limits-and-constraints.md`
- Verification: rerun compressed fetch for the Telechurch visualizer contract and validate decoded talkback

### Large Zo Full-Bundle Syncs Can Terminate Internally

- Date: 2026-04-30
- Domain/provider: Zo MCP / tandem runtime sync
- Operation: syncing the full updated tandem runtime bundle to Alliance with `--preset all --check --json`
- Symptom: MCP upload failed with `create_or_rewrite_file failed: modal-http: internal error: function was terminated by signal`
- Likely cause: full-bundle upload size/duration exceeded a provider execution limit during repeated `create_or_rewrite_file` calls
- Mitigation: sync changed files narrowly with repeated `--file <path>` arguments, then run `--check`
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: narrow changed-file Alliance sync completed and remote syntax check returned `returncode=0`

### Nested Zo Token Files Can Drift From Root Tokens

- Date: 2026-04-30
- Domain/provider: Zo MCP / nested Zo bootstrap repo
- Operation: syncing Telechurch with `sync-tandem-runtime-to-zo.mjs --instance telechurch --check`
- Symptom: the nested repo token returned `Authentication failed: 401: Invalid API key`, while the parent private token succeeded
- Likely cause: ignored nested `.env.local` / `.env.master` can become stale independently from the root private token source
- Mitigation: when a nested token fails, inject the current parent token into the process environment without printing it, then update the ignored nested token file out of band if desired
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`, `refer-zo-bootstrap/docs/known-limits-and-constraints.md`
- Verification: parent-token bridged Telechurch sync completed with remote syntax check `returncode=0`

### Hive Dispatcher Packaging Must Be Cross-Platform

- Date: 2026-04-30
- Domain/provider: Zo bootstrap packaging / Windows PowerShell
- Operation: building the upstream hive bundle with `node scripts/factory/hive/dispatcher.mjs package --type=hive`
- Symptom: packaging failed because Unix `cp` was not available on Windows
- Likely cause: dispatcher used shell-specific `cp` and `find` instead of Node filesystem APIs, and its repo root resolved to `scripts/`
- Mitigation: package through Node `cpSync`/recursive traversal, use a temp directory outside the repo, and keep only `tar` as the archive command
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scripts/factory/hive/dispatcher.mjs`, this ledger
- Verification: hive and cell packages built successfully on Windows

### Alliance Bootstrap Verify Can Exceed Chat Command Timeout

- Date: 2026-04-30
- Domain/provider: Zo MCP / Alliance bootstrap verification
- Operation: `node tools/vipc-bootstrap.mjs --profile alliance --instance alliance --mode verify`
- Symptom: local command timed out before returning a verifier result
- Likely cause: full bootstrap verification can take longer than the current chat command timeout or wait on slow MCP file/API calls
- Mitigation: verify live build state with bounded MCP probes (`list_space_routes`, `get_space_errors`, targeted `get_space_route`, and `list_files`) while rerunning full bootstrap verification with a longer out-of-band timeout when needed
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`, `refer-zo-bootstrap/docs/known-limits-and-constraints.md`
- Verification: Alliance MCP probes returned app routes, clean space errors, route source for `/` and `/organizations`, and workspace files including `Skills/`, `REFER.OS/`, datasets, and `refer-zo-bootstrap/`

### Alliance MCP Tool Discovery Can Exceed Chat Command Timeout

- Date: 2026-04-30
- Domain/provider: Zo MCP / Alliance live verification
- Operation: `node refer-zo-bootstrap\tools\zo-mcp.mjs list-tools --instance alliance`
- Symptom: local command timed out after 30 seconds before returning the tool list; the paired non-mutating bootstrap verify also timed out after 120 seconds
- Likely cause: Alliance MCP discovery/verification can wait on slow live API calls and exceed short interactive command budgets
- Mitigation: use targeted, bounded MCP calls for the specific evidence needed, and reserve full `list-tools` / `vipc-bootstrap --mode verify` for longer-running verification windows
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: local `npm run test` passed; Alliance live verification was not ratified in this chat turn because both non-mutating commands timed out

### Parallel Node Verification Can Exhaust Chat Heap

- Date: 2026-04-30
- Domain/provider: Windows PowerShell / Node verification
- Operation: running root `npm run test` and nested `npm --prefix refer-zo-bootstrap run check` concurrently from the chat surface
- Symptom: both Node processes terminated with V8 out-of-memory errors during compile/check startup
- Likely cause: concurrent TypeScript compilation and long `node --check` chains exceeded the available interactive Node heap/memory budget
- Mitigation: run Node-heavy verification sequentially, and set `NODE_OPTIONS=--max-old-space-size=4096` when the chat host has enough memory
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: sequential reruns passed with `NODE_OPTIONS=--max-old-space-size=4096`: root `npm run test` and nested `npm --prefix refer-zo-bootstrap run check`
