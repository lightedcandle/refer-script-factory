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

### Local Wrangler Runtime Compatibility Date Lag

- Date: 2026-05-01
- Domain/provider: Cloudflare Wrangler Pages local dev
- Operation: starting `alliance-hub` locally with `npx wrangler pages dev public --port 8788`
- Symptom: Wrangler warned that the installed local Workers Runtime only supports compatibility date `2025-12-02` and fell back from requested date `2026-05-01`
- Likely cause: installed `wrangler` / local runtime version lags the current calendar compatibility date
- Mitigation: pin/pass an explicit supported compatibility date for local testing or upgrade Wrangler before relying on features newer than `2025-12-02`
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: local server still compiled and listened on `http://127.0.0.1:8788`

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

### Parallel PowerShell Reads Can Hit Paging-File Limits

- Date: 2026-04-30
- Domain/provider: Windows PowerShell / chat surface
- Operation: reading multiple factory docs in parallel with `Get-Content`
- Symptom: PowerShell failed to load `System.Management.Automation` and reported `The paging file is too small for this operation to complete`
- Likely cause: concurrent PowerShell process startup exceeded the available interactive paging/memory budget
- Mitigation: use lighter single commands such as `cmd /c type` or run file reads sequentially when the chat host is memory-constrained
- Script/doc now encoding mitigation: `docs/known-limits-and-constraints.md`
- Verification: subsequent single `cmd /c type` and targeted Node/MCP commands completed successfully

### Zo Read File Can Truncate Long Generated Manifests

- Date: 2026-05-01
- Domain/provider: Zo MCP / Alliance script artifacts
- Operation: reading generated Phase 3 modal manifests from Zo Files with `read_file`
- Symptom: manifest output was returned as head/tail text and JSON parsing failed with `Bad control character in string literal`
- Likely cause: large generated JSON containing multiline JSX exceeded the Zo file read display budget
- Mitigation: for deterministic bridge work, generate large scoped manifests in the app scope and feed the local manifest directory to a generic route-manifest bridge; use Zo `read_file` only for small evidence files
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scripts/factory/route-manifest-bridge.mjs`, `refer-zo-bootstrap/docs/scoped-app-boundary.md`
- Verification: `npm run route:manifest-bridge -- --instance alliance --dry-run --json --manifest-command "node scopes/alliance/phase3-manifest.mjs" --manifest-dir <scoped manifest dir>` completed after switching away from Zo manifest readback

### Zo Managed Service Entrypoints Are Not Shell Commands

- Date: 2026-05-01
- Domain/provider: Zo managed services / Alliance Zo Site
- Operation: restarting the public `alliance` site service
- Symptom: entrypoint `NODE_ENV=production bun run server.ts` crashed and the public URL returned HTTP 520
- Likely cause: supervisord executes service entrypoints directly rather than through a shell, so inline environment assignments are not interpreted
- Mitigation: use a direct command such as `bun run server.ts`, and run `bun run build` from the scoped site sync script before restarting the service
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scopes/alliance/sync-site-to-zo.mjs`, this ledger
- Verification: `service_doctor` for `alliance` reported `RUNNING`, `port: 51303`, and `code: up to date`

### Sequential Phase Status/Next Dependencies

- Date: 2026-05-01
- Domain/provider: REFER scoped Alliance scripts
- Operation: running `alliance:phase5-status` and `alliance:phase5-next` concurrently
- Symptom: `phase5-next` reported stale gaps because it read `phase5-status-latest.json` before the status script rewrote it
- Likely cause: next-action sensors that depend on latest status artifacts are not concurrency-safe
- Mitigation: run status scripts before next scripts when the next script reads the status artifact
- Script/doc now encoding mitigation: this ledger
- Verification: reran `npm run alliance:phase5-next` after `npm run alliance:phase5-status`; packet returned `ready_for_next_phase: true`

### Supabase Secrets Cannot Use SUPABASE_ Prefix

- Date: 2026-05-01
- Domain/provider: Supabase CLI / Edge Functions
- Operation: deploying Alliance `alliance-record-write` Edge Function secrets
- Symptom: `supabase secrets set` skipped `SUPABASE_SERVICE_ROLE_KEY` with `Env name cannot start with SUPABASE_`
- Likely cause: Supabase reserves the `SUPABASE_` env prefix for platform-provided variables
- Mitigation: set `SERVICE_ROLE_KEY` as the Edge Function service role secret and keep direct service role credentials out of Zo; Zo calls the function with anon-key authorization
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scopes/alliance/supabase-edge-deploy.mjs`
- Verification: `npm run alliance:supabase-edge-deploy -- --deploy`; `npm run alliance:supabase-probe -- --instance alliance`

### Telechurch E2E Git Status Can Fail On Corrupt/Missing Tree

- Date: 2026-05-01
- Domain/provider: Git / `E:\telechurch-e2e`
- Operation: checking Telechurch E2E worktree status after staging an Alliance Edge Function copy
- Symptom: `git status --short` failed with `fatal: unable to read tree (...)`
- Likely cause: the local Telechurch E2E repository has a missing or corrupt Git object
- Mitigation: do not rely on that repo's Git status until the object store is repaired or the repo is recloned; keep Alliance authoritative source under `refer-zo-bootstrap/scopes/alliance/`
- Script/doc now encoding mitigation: this ledger
- Verification: Alliance Edge Function source is tracked in `refer-zo-bootstrap/scopes/alliance/supabase/functions/alliance-record-write/index.ts` and deploy artifact records the copied Telechurch path

### Android Device Must Be Visible To ADB Before Install

- Date: 2026-05-01
- Domain/provider: Android Debug Bridge / chat surface
- Operation: installing `alliance-android-sms-bridge` on a USB-connected phone
- Symptom: `adb devices -l` returned no connected devices after restarting the ADB daemon
- Likely cause: USB debugging is not enabled or authorized, the screen is locked before RSA authorization, or the USB cable/connection is charge-only
- Mitigation: enable Developer Options and USB debugging, accept the phone's RSA authorization prompt, use a data-capable cable, then rerun `adb devices -l` before `adb install -r app\build\outputs\apk\debug\app-debug.apk`
- Script/doc now encoding mitigation: this ledger
- Verification: after device authorization, `adb devices -l` saw `SM_G781V`; `adb install -r app\build\outputs\apk\debug\app-debug.apk` passed; `/health` returned `{"ok":true,"service":"alliance-sms-bridge"}` through `adb forward tcp:8787 tcp:8787`

### Wrangler Does Not Expose Cloudflare Tunnel In This Install

- Date: 2026-05-01
- Domain/provider: Cloudflare CLI / Windows chat surface
- Operation: exposing the Alliance SMS dispatcher through Cloudflare
- Symptom: `wrangler tunnel --help` and `npx wrangler tunnel quick-start http://localhost:8788 --help` showed the Workers command list and no tunnel command
- Likely cause: installed Wrangler version/surface does not include the Tunnel quick-start command in this environment
- Mitigation: install and use `cloudflared` directly for Cloudflare Tunnel; Cloudflare docs support `cloudflared tunnel --url http://localhost:8788` for development quick tunnels
- Script/doc now encoding mitigation: `alliance-android-sms-bridge/README.md`, this ledger
- Verification: `winget install --id Cloudflare.cloudflared -e` installed `cloudflared` version `2025.8.1`; quick tunnel reached the dispatcher and preserved token auth

### Installed Cloudflared May Not Refresh PATH In Existing Shell

- Date: 2026-05-01
- Domain/provider: Winget / Windows PATH
- Operation: invoking `cloudflared` immediately after Winget install
- Symptom: `Get-Command cloudflared` returned no result in the existing PowerShell session
- Likely cause: PATH changes from MSI/Winget install were not applied to the already-running shell
- Mitigation: call `C:\Program Files (x86)\cloudflared\cloudflared.exe` directly or open a new shell before using `cloudflared`
- Script/doc now encoding mitigation: this ledger
- Verification: direct executable path started a Cloudflare quick tunnel successfully

### Windows SpawnSync Can Reject Npx Cmd From Deploy Script

- Date: 2026-05-01
- Domain/provider: Windows PowerShell / Node child_process / Supabase CLI
- Operation: deploying Alliance `alliance-sms-relay` from `sms-relay-deploy.mjs`
- Symptom: direct `spawnSync("npx.cmd", ...)` returned `spawnSync npx.cmd EINVAL` even though `npx supabase --version` worked from the shell
- Likely cause: Windows child process invocation/path handling around `npx.cmd` in this environment
- Mitigation: invoke `npx` with `shell: true` from the deploy helper and sanitize inherited environment values before spawning
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scopes/alliance/sms-relay-deploy.mjs`, this ledger
- Verification: `npm run alliance:sms-relay-deploy -- --deploy` successfully set secrets and deployed `alliance-sms-relay`

### Supabase Edge Relay Needs No JWT Verification When Phone Is The Client

- Date: 2026-05-01
- Domain/provider: Supabase Edge Functions / Android phone relay
- Operation: calling `alliance-sms-relay` directly from HTTP clients without an anon-key Authorization header
- Symptom: initial function calls returned `401 Unauthorized` before route code executed
- Likely cause: Supabase Edge Function JWT verification was enabled by default
- Mitigation: deploy `alliance-sms-relay` with `--no-verify-jwt` and enforce the function's own `X-Dispatcher-Token` gate
- Script/doc now encoding mitigation: `refer-zo-bootstrap/scopes/alliance/sms-relay-deploy.mjs`
- Verification: `/health` and `/sms/send` worked without Supabase JWT headers while unauthorized relay calls still require `X-Dispatcher-Token`

### Zo Alliance Site Publish Tool May Be Unavailable

- Date: 2026-05-01
- Domain/provider: Zo MCP / Alliance site publish
- Operation: publishing the synced Alliance site after adding `/a/{token}` profile intake form
- Symptom: `npm run alliance:site-sync -- --publish` built and synced the site but returned `Tool 'publish_site' not found`
- Likely cause: this Zo instance MCP surface does not expose the publish tool even though file write and build tools are available
- Mitigation: treat `alliance:site-sync` build success as source/build verification, but use the currently configured hosting/publish path outside this tool surface before relying on public profile links
- Script/doc now encoding mitigation: this ledger, `refer-zo-bootstrap/scopes/alliance/sync-site-to-zo.mjs`
- Verification: `bun run build` passed on the Zo site root during sync; publish step returned missing tool

### Cloudflare Wildcard Worker Routes Can Capture Pages Custom Domains

- Date: 2026-05-01
- Domain/provider: Cloudflare Workers / Pages custom domains
- Operation: routing `alliance.telechurchlive.com` to a new Cloudflare Pages project
- Symptom: DNS CNAME and Pages custom domain were created, but requests still returned a `302` to `https://telechurchlive.com/...`
- Likely cause: an existing Worker route for `*.telechurchlive.com/*` matched the new subdomain before the Pages custom domain could serve it
- Mitigation: create a more specific Worker route with `script: null` for `alliance.telechurchlive.com/*` to bypass the wildcard Worker and let Pages own the hostname
- Script/doc now encoding mitigation: `alliance-hub/tools/deploy.mjs`, this ledger
- Verification: after the bypass route, `https://alliance.telechurchlive.com/api/profile-intake/session/{signed-token}` returned `200` from the Alliance Pages Function

### Android Debug Build Needs Explicit JBR In This Shell

- Date: 2026-05-01
- Domain/provider: Windows PowerShell / Android Gradle build
- Operation: rebuilding `alliance-android-sms-bridge` from the chat shell
- Symptom: `.\gradlew.bat assembleDebug` failed with `JAVA_HOME is not set and no 'java' command could be found in your PATH`
- Likely cause: Android Studio's bundled JBR is installed but not exported into this PowerShell session
- Mitigation: set `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr` and prepend `%JAVA_HOME%\bin` for the build command
- Script/doc now encoding mitigation: this ledger
- Verification: the debug APK rebuilt and installed after setting the local command environment; `/health` returned `{"ok":true,"service":"alliance-sms-bridge"}` through `adb forward tcp:8787 tcp:8787`

### Older PowerShell Lacks SkipHttpErrorCheck

- Date: 2026-05-01
- Domain/provider: Windows PowerShell / HTTP verification
- Operation: checking deployed Cloudflare Pages API error responses
- Symptom: `Invoke-WebRequest -SkipHttpErrorCheck` failed because the parameter was unavailable
- Likely cause: this shell is running a Windows PowerShell version before that parameter was added
- Mitigation: use `try/catch`, read `Exception.Response`, and inspect the status/body from the caught response
- Script/doc now encoding mitigation: this ledger
- Verification: caught-response checks returned HTTP `400` for an invalid profile token, HTTP `404` for a missing profile edit-link request, and HTTP `401` for the protected Alliance SMS factory gaps endpoint without an admin token

### Windows PowerShell Does Not Support Bash-Style Command Chaining

- Date: 2026-05-01
- Domain/provider: Windows PowerShell / shell verification
- Operation: running two `node --check` commands in one line
- Symptom: `&&` failed with `The token '&&' is not a valid statement separator in this version`
- Likely cause: this shell is Windows PowerShell rather than a newer PowerShell/core or bash shell
- Mitigation: run checks as separate shell commands or use PowerShell-native sequencing
- Script/doc now encoding mitigation: this ledger
- Verification: rerunning `node --check alliance-hub/public/app.js` and `node --check alliance-hub/functions/api/profile-intake/start.js` as separate commands passed

### Local Wrangler Runtime Can Lag Requested Compatibility Date

- Date: 2026-05-01
- Domain/provider: Cloudflare Wrangler / Pages local preview
- Operation: starting `alliance-hub` with `npx wrangler pages dev public --port 8788`
- Symptom: Wrangler 4.53.0 started successfully but warned that the installed local Workers Runtime supports compatibility date `2025-12-02` while the preview requested `2026-05-01`
- Likely cause: the local Wrangler/runtime package is older than the current date used by the preview command
- Mitigation: treat local preview as UI/API smoke verification, and upgrade Wrangler before relying on compatibility-date-specific runtime behavior
- Script/doc now encoding mitigation: this ledger
- Verification: local Pages preview still compiled and reported ready on `http://127.0.0.1:8788`
