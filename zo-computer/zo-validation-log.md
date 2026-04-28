# Zo Computer Validation Log

Last updated: 2026-04-20
Status: Active

## Purpose

This file records hands-on validation separate from scraped or documented claims.

## Evidence Rules

- Each entry must include a date.
- Distinguish `Observed in UI`, `Tested`, and `Inferred from docs`.
- Record failures and limitations, not just successes.

## Entries

### 2026-04-20 - Desktop settings observation

- Type: Observed in UI
- Instance: `refer`
- Evidence:
  - desktop shell visible
  - left nav includes Home, Files, Chats, Automations, Space, Skills, Computer, Terminal, Hosting, Datasets
  - settings tabs include AI, Channels, Integrations, UX, Advanced
  - visible channel rows include Chat, Text, Email, Telegram
- Conclusion:
  - Zo has a real desktop control surface with channel-aware AI settings
  - this does not by itself prove API, MCP, browser control, or multi-instance orchestration

### 2026-04-20 - Browser-use limitation from docs

- Type: Inferred from docs
- Source: https://docs.zocomputer.com/integrations
- Evidence:
  - Zo docs state that Zo cannot currently take actions in its browser
- Conclusion:
  - browser task execution should not be treated as confirmed without further testing

### 2026-04-21 - Zo API token and ask validation

- Type: Tested
- Instance: `refer`
- Local secret key name: `ZO_COMPUTER`
- Evidence:
  - `GET https://api.zo.computer/models/available` returned `200`
  - response listed 9 available models
  - `POST https://api.zo.computer/zo/ask` returned `200`
  - minimal validation prompt returned `OK`
  - response included a conversation id
- Conclusion:
  - local Zo API token is valid
  - model listing endpoint is live
  - non-streaming ask endpoint is live
  - MCP connection remains unverified separately

### 2026-04-21 - Free-tier usage visibility check

- Type: Tested
- Instance: `refer`
- Evidence:
  - Asked Zo whether it could report current account-specific free-tier usage or remaining daily AI credits.
  - Zo responded that it could not independently verify billing status or remaining daily AI credits from chat/API context.
  - Zo provided account UI routes for manual checking:
    - `/?t=account&s=usage`
    - `/?t=account&s=usage&d=this-cycle`
    - `/?t=account&s=usage&d=past`
    - `/?t=account&s=credits`
    - `/?t=account&s=payment`
    - `/?t=account`
- Conclusion:
  - remaining daily AI credits are not currently visible through the tested chat/API path
  - usage should be checked in the Zo account UI before running broader setup/testing
  - use low-quota setup practices while on Free tier
  - user later observed that the usage view appears to track chat usage more than full computer/resource usage

### 2026-04-21 - Local usage ledger established

- Type: Tooling
- Evidence:
  - Created a local Zo API helper in the Telechurch repo: `tools/zo-ask.mjs`
  - Created usage folder: `E:\refer\zo-computer\usage`
  - Usage ledger path: `E:\refer\zo-computer\usage\zo-api-usage.jsonl`
- Conclusion:
  - future Zo API calls made through the helper can be locally tracked
  - ledger estimates prompt/output size without storing secrets or full prompt/output by default

### 2026-04-21 - Remote Zo file creation via API

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Asked Zo to create `REFER/refer-instance-notes.md`
  - Zo responded: `CREATED - saved file 'REFER/refer-instance-notes.md'`
- Conclusion:
  - Zo API path can trigger file-creation behavior inside the Zo workspace
  - follow-up UI or API readback should confirm the file exists and content matches

### 2026-04-21 - Zo workspace folder structure

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - User confirmed `REFER/refer-instance-notes.md` exists in the Zo UI.
  - Asked Zo to create:
    - `REFER/Validation`
    - `REFER/Templates`
    - `REFER/Skills`
  - Zo responded that requested folders are in place.
- Conclusion:
  - Zo can create workspace folders through the API path
  - `refer` now has a minimal durable workspace structure

### 2026-04-21 - Zo-side initialization validation note

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Created `REFER/Validation/2026-04-21-initialization-validation.md`
  - Zo responded that the file was saved exactly at the requested path.
- Conclusion:
  - Zo can maintain its own internal validation notes.
  - `refer` now has both external REFER validation records and Zo-side workspace validation records.

### 2026-04-21 - Low-quota prompt template

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Created `REFER/Templates/low-quota-operating-prompt.md`
  - Zo responded that the file was written exactly as requested.
- Conclusion:
  - `refer` now has a reusable prompt template for budget-aware operation on Free tier.

### 2026-04-21 - Staged documentation discipline skill draft

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Created `REFER/Skills/refer-documentation-discipline.SKILL.md`
  - Zo responded that the file was written at the requested path.
- Conclusion:
  - `refer` now has a staged skill draft for REFER documentation discipline.
  - This is not yet confirmed as an installed or active Zo skill.

### 2026-04-21 - REFER workspace tree readback

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Asked Zo to list the `REFER` tree without modifying files.
  - Zo returned:
    - `REFER/Skills/refer-documentation-discipline.SKILL.md`
    - `REFER/Templates/low-quota-operating-prompt.md`
    - `REFER/Validation/2026-04-21-initialization-validation.md`
    - `REFER/refer-instance-notes.md`
- Conclusion:
  - API-side readback confirms the expected initial `REFER` workspace structure.

### 2026-04-21 - Live Zo computer specs observation

- Type: Observed in UI
- Instance: `refer`
- Evidence:
  - CPU: 3 cores
  - CPU clock: 1.8 GHz
  - architecture: x86_64
  - OS: Linux 6.12
  - processes: 18
  - memory: 1.0 GB / 4.0 GB, 26.0%, 3.0 GB free
  - uptime: 2h 25m
  - hostnames / addresses:
    - `refer.zo.computer`
    - `refer.zo.space`
    - `refer@zo.computer`
  - UI note: specs can change dynamically depending on workloads and plan.
- Conclusion:
  - `refer` currently presents as a lightweight Linux x86_64 environment on Free tier.
  - specs should be treated as observed point-in-time state, not guaranteed allocation.

### 2026-04-21 - Read-only shell validation

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Prompted command:
  - `pwd && uname -a && ls -la REFER`
- Evidence:
  - command completed without errors
  - current directory returned: `/home/workspace`
  - `uname -a` returned: `Linux modal 4.4.0 #1 SMP Sun Jan 10 15:06:54 PST 2016 x86_64 GNU/Linux`
  - `REFER` listing included:
    - `Skills`
    - `Templates`
    - `Validation`
    - `refer-instance-notes.md`
- Conclusion:
  - Zo API path can trigger read-only shell commands.
  - `/home/workspace` is confirmed as the active workspace path.
  - Shell-reported kernel differs from the UI-reported `Linux 6.12`; keep both as observed evidence until reconciled.

### 2026-04-21 - Active Skills path inspection

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Zo reported active skills use top-level layout: `/home/workspace/Skills/<skill-dir>/SKILL.md`
  - Zo reported there is no top-level `/home/workspace/Skills` folder yet.
  - Zo reported `REFER/Skills/refer-documentation-discipline.SKILL.md` is not in the active-skill layout.
- Conclusion:
  - `REFER/Skills/refer-documentation-discipline.SKILL.md` is staged documentation, not an active Zo skill.
  - Activation should use `Skills/refer-documentation-discipline/SKILL.md`.

### 2026-04-21 - Active documentation discipline skill installed

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Created `Skills/refer-documentation-discipline/SKILL.md`
  - Read-only verification listed:
    - `Skills/refer-documentation-discipline/SKILL.md`
- Conclusion:
  - first active Zo skill is installed at the documented top-level Skills path
  - activation behavior still needs a later behavioral test

### 2026-04-21 - Documentation discipline skill behavior test

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Prompt explicitly requested use of `refer-documentation-discipline` if applicable.
  - Zo returned the requested structure:
    - Status
    - Confirmed
    - Observed
    - Inferred
    - Unknowns
    - Next action
  - Zo treated `Zo can become our full multi-instance VIPC control plane` as an unverified capability statement, not a confirmed fact.
- Conclusion:
  - behavioral activation is consistent with the installed skill's intended discipline
  - this is first successful behavior-level validation of an active Zo skill

### 2026-04-21 - Remote file update and readback

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Asked Zo to append an `Active Skill Validation` section to `REFER/Validation/2026-04-21-initialization-validation.md`
  - Zo responded `UPDATED`
  - Read-only tail check confirmed the appended section exists
- Conclusion:
  - Zo API path can update existing workspace files.
  - readback confirms updates can be validated without manual UI inspection.

### 2026-04-21 - Automatic skill activation probe

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Prompt did not explicitly name `refer-documentation-discipline`.
  - Prompt asked Zo to document a readiness claim for setup notes.
  - Zo responded with a validation-oriented structure and classified the claim as provisional / not independently verified.
  - Zo did not use the exact installed skill output pattern (`Confirmed`, `Observed`, `Inferred`, `Unknowns`, `Next action`).
- Conclusion:
  - automatic behavior appears directionally aligned with the skill discipline
  - exact automatic skill activation is not proven
  - explicitly naming the skill remains safer when evidence-boundary behavior is required

### 2026-04-21 - MCP endpoint and tool inventory

- Type: Tested
- Instance: `refer`
- Method: direct streamable HTTP MCP probe
- Evidence:
  - `POST https://api.zo.computer/mcp` initialize returned `200`
  - server returned a session id
  - server reported:
    - name: `zo-tools`
    - version: `1.0.0`
    - protocol version: `2024-11-05`
  - `tools/list` returned 83 tools
  - live tool inventory recorded in `zo-mcp-tool-inventory.md`
- Conclusion:
  - Zo MCP endpoint is authenticated and reachable
  - remote MCP tool list is verified
  - direct tool execution through MCP still needs a controlled read-only call test

### 2026-04-21 - Direct MCP read-only tool call

- Type: Tested
- Instance: `refer`
- Method: direct MCP `tools/call`
- Tool: `read_file`
- Evidence:
  - first call with argument `path` failed because schema expects `target_file`
  - second call with relative `target_file` failed because absolute paths are required
  - third call succeeded with:
    - `target_file=/home/workspace/REFER/refer-instance-notes.md`
    - `text_read_entire_file=true`
  - response returned the expected file content and file reference
- Conclusion:
  - direct read-only MCP tool execution is confirmed
  - Zo MCP file tools require absolute `/home/workspace/...` paths

### 2026-04-21 - Gmail integration metadata read

- Type: Tested
- Instance: `refer`
- Method: direct MCP `tools/call`
- Tools:
  - `list_app_tools`
  - `use_app_gmail`
- Evidence:
  - `list_app_tools` confirmed Gmail accounts connected:
    - `agentcalvinanderson@gmail.com`
    - `lightedcandle2018@gmail.com`
  - `gmail-find-email` with `metadataOnly=true`, `maxResults=1`, and `email=lightedcandle2018@gmail.com` returned one message.
  - Most recent metadata returned:
    - sender: `Apostle Joel <notifications@github.com>`
    - subject: `[lightedcandle/telechurch-e2e] Run failed: Policy - main (4c885bb)`
    - date: `2026-04-21T02:01:49.000Z`
- Conclusion:
  - Zo can bridge Codex to connected Gmail account metadata through MCP.
  - full body/content access was not requested or validated in this step.

### 2026-04-21 - Direct MCP list and controlled write

- Type: Tested
- Instance: `refer`
- Method: direct MCP `tools/call`
- Tools:
  - `list_files`
  - `create_or_rewrite_file`
  - `read_file`
- Evidence:
  - first `list_files` call with `target_directory` failed because schema expects `path`
  - second `list_files` call succeeded with:
    - `path=/home/workspace/REFER`
  - returned workspace entries:
    - `/home/workspace/REFER/Skills/refer-documentation-discipline.SKILL.md`
    - `/home/workspace/REFER/Templates/low-quota-operating-prompt.md`
    - `/home/workspace/REFER/Validation/2026-04-21-initialization-validation.md`
    - `/home/workspace/REFER/refer-instance-notes.md`
  - `create_or_rewrite_file` succeeded with:
    - `target_file=/home/workspace/REFER/Validation/2026-04-21-mcp-controlled-write.md`
  - readback via `read_file` returned the expected Markdown content and file reference
- Conclusion:
  - direct MCP directory listing is confirmed for the Zo workspace
  - direct MCP controlled file creation is confirmed inside `/home/workspace/REFER/Validation`
  - this validates low-risk write capability only; broader writes still require explicit target paths and scope discipline

### 2026-04-21 - Universal MCP helper and low-risk tool expansion

- Type: Tested
- Instance: `refer`
- Method: `E:\refer\zo-computer\tools\zo-mcp.mjs`
- Evidence:
  - created universal helper outside any app repo
  - helper successfully ran `list-tools`
  - helper writes metadata to `E:\refer\zo-computer\usage\zo-mcp-usage.jsonl`
  - added `--args64` after PowerShell stripped JSON quotes in direct `--args` calls
  - helper syntax check passed with `node --check`
  - `tool_docs` succeeded for:
    - `run_bash_command`
    - `grep_search`
  - `run_bash_command` succeeded with harmless command:
    - `pwd && whoami && uname -s`
    - `cwd=/home/workspace`
  - observed shell output:
    - `/home/workspace`
    - `root`
    - `Linux`
  - `grep_search` first failed with a filesystem-style `location`; tool semantics require `USER`, `CONVERSATION`, or `ALL_CONVERSATIONS`
  - corrected `grep_search` with `location=USER` completed successfully and returned `No files found` for the tested query
- Conclusion:
  - Zo MCP access is now repeatable through a local universal helper
  - safe shell command execution is confirmed
  - `grep_search` is confirmed as a Zo-index/location search, not direct filesystem path search
  - future MCP calls should use `tool_docs` first when argument semantics are unclear

### 2026-04-21 - Persistent Codex MCP registration

- Type: Configured
- Instance: `refer`
- Method: local Codex MCP config
- Evidence:
  - created wrapper:
    - `E:\refer\zo-computer\tools\zo-mcp-remote.ps1`
  - wrapper reads token from `.env.master` at runtime:
    - `ZO_ACCESS_TOKEN`
    - fallback `ZO_COMPUTER`
  - wrapper starts:
    - `npx -y mcp-remote https://api.zo.computer/mcp --transport http-only`
  - updated:
    - `C:\Users\agent\.codex\config.toml`
  - added config section:
    - `[mcp_servers.zo]`
  - PowerShell parse check passed
  - `npx --version` returned `11.6.2`
- Conclusion:
  - persistent Codex MCP registration is configured without embedding the Zo token
  - active availability inside Codex still needs confirmation from a fresh session or MCP reload

### 2026-04-21 - Persistent Codex MCP registration confirmed

- Type: Tested
- Instance: `refer`
- Method: fresh Codex session MCP tool call
- Tool:
  - `mcp__zo__list_files`
- Evidence:
  - Zo MCP tools appeared in the Codex tool surface as `mcp__zo__*`
  - read-only call succeeded with:
    - `path=/home/workspace/REFER`
  - response returned the expected entries:
    - `/home/workspace/REFER/Skills/refer-documentation-discipline.SKILL.md`
    - `/home/workspace/REFER/Templates/low-quota-operating-prompt.md`
    - `/home/workspace/REFER/Validation/2026-04-21-initialization-validation.md`
    - `/home/workspace/REFER/Validation/2026-04-21-mcp-controlled-write.md`
    - `/home/workspace/REFER/refer-instance-notes.md`
- Conclusion:
  - persistent Codex MCP registration is confirmed in a fresh Codex session
  - the wrapper-based config works without embedding the Zo token in Codex config

### 2026-04-21 - Claude Desktop and Cursor MCP client entries

- Type: Configured
- Instance: `refer`
- Method: local client MCP config
- Evidence:
  - created Claude Desktop config:
    - `C:\Users\agent\AppData\Roaming\Claude\claude_desktop_config.json`
  - created Cursor config:
    - `C:\Users\agent\.cursor\mcp.json`
  - both configs register MCP server name:
    - `zo`
  - both configs call the existing token-safe wrapper:
    - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File E:\refer\zo-computer\tools\zo-mcp-remote.ps1`
  - JSON validation passed for both config files
- Conclusion:
  - Claude Desktop and Cursor have local Zo MCP client entries configured
  - configs do not embed the Zo token
  - active availability still requires restarting each client and validating from inside that client

### 2026-04-21 - Zo-built Space route POC

- Type: Tested
- Instance: `refer`
- Method: Zo chat request plus MCP inspection
- Routes:
  - `/telechurchadmin`
  - `/api/auth/exchange`
  - `/api/me`
  - `/api/tenants/:tenantId/summary`
  - `/api/tenants/:tenantId/audit`
- Evidence:
  - Asked Zo chat to build a Telechurch Admin remote operator POC from its side.
  - Local request timed out after four minutes, but MCP route inspection showed Zo completed the page and all four API stubs.
  - `read_webpage` confirmed `/telechurchadmin` renders a Telechurch Admin remote operator POC.
  - `read_webpage` confirmed these live API stubs return JSON:
    - `/api/me`
    - `/api/tenants/demo/summary`
    - `/api/tenants/demo/audit`
  - `get_space_errors` returned no route errors.
- Conclusion:
  - Zo can create a multi-route Space POC through chat/tool execution.
  - The generated routes correctly avoid secrets, direct DB access, checkout, email sending, and real Telechurch API calls.
  - Design quality is usable for a POC, but route code should still be reviewed before any production bridge is wired.

### 2026-04-21 - Telechurch Zo computer initialization

- Type: Configured and tested
- Instance: `telechurch`
- Method: explicit instance selection through local MCP helpers
- Environment key:
  - `ZO_COMPUTER_TELECHURCH`
- Evidence:
  - `list-tools --instance telechurch` succeeded.
  - Zo chat identified the handle as `telechurch`.
  - Zo chat identified the public Space URL as `https://telechurch.zo.space`.
  - Initial `list_space_routes` returned an empty route list before setup.
  - Initial `get_space_settings` returned empty/default settings before setup.
  - Workspace scaffold was created under `/home/workspace/TELECHURCH`.
  - `list_files` confirmed:
    - `/home/workspace/TELECHURCH/Skills`
    - `/home/workspace/TELECHURCH/Templates`
    - `/home/workspace/TELECHURCH/Validation/2026-04-21-initialization-validation.md`
    - `/home/workspace/TELECHURCH/telechurch-admin-route-map.md`
    - `/home/workspace/TELECHURCH/telechurch-instance-notes.md`
    - `/home/workspace/TELECHURCH/telechurch-vipc-operating-rules.md`
  - Persona created and set active:
    - `Telechurch Ministry Operator`
  - Six operating rules were created for Telechurch authority, coaching-first behavior, secret handling, tenant-scoped requests, confirmation boundaries, and stub/sandbox/production labeling.
  - Space settings updated:
    - title: `Telechurch Admin`
    - description: `Telechurch ministry admin and VIPC operator surface.`
    - noindex: `true`
- Conclusion:
  - `telechurch` is a separate initialized Zo computer from `refer`.
  - It is suitable for Telechurch-specific operator experiments without mixing state into the `refer` instance.

### 2026-04-21 - Telechurch Zo Space admin POC

- Type: Tested
- Instance: `telechurch`
- Method: direct MCP route creation plus HTTP readback
- Routes:
  - `/admin`
  - `/console`
  - `/api/auth/exchange`
  - `/api/me`
  - `/api/tenants/:tenantId/summary`
  - `/api/tenants/:tenantId/audit`
- Evidence:
  - `list_space_routes --instance telechurch` returned all six routes.
  - `https://telechurch.zo.space/admin` rendered the ministry admin guided starter page.
  - `https://telechurch.zo.space/console` returned `200 text/html`.
  - `https://telechurch.zo.space/api/me` returned stub operator JSON.
  - `https://telechurch.zo.space/api/tenants/demo/summary` returned stub tenant summary JSON.
  - `https://telechurch.zo.space/api/tenants/demo/audit` returned stub audit JSON.
  - `get_space_errors --instance telechurch` returned `errors=[] count=0`.
  - Residual server log included an `ENOENT` for `./dist/index.html`; routes still rendered and no route errors were reported.
- Conclusion:
  - The Telechurch Zo Space POC is live and isolated from the previous `refer.zo.space/telechurchadmin` experiment.
  - Current routes are intentionally read-only/stubbed and do not touch Telechurch auth, DB, billing, email, contacts, or production data.

### 2026-04-21 - REFER Zo intake router skill installed

- Type: Tested
- Instance: `refer`
- Method: `E:\refer\zo-computer\tools\zo-mcp.mjs` using `run_bash_command` and `list_files`
- Evidence:
  - Installed `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
  - Synced `/home/workspace/Skills/telechurch-figma-design-driver/SKILL.md`
  - Read-only listing returned:
    - `/home/workspace/Skills/refer-documentation-discipline/SKILL.md`
    - `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
    - `/home/workspace/Skills/telechurch-figma-design-driver/SKILL.md`
- Conclusion:
  - The `refer` Zo instance now has an active-path intake router skill available.
  - Behavioral activation still needs a focused prompt test.

### 2026-04-21 - REFER Zo intake router compact response probe

- Type: Tested
- Instance: `refer`
- Method: `POST /zo/ask` through `tools/zo-ask.mjs`
- Evidence:
  - Prompt explicitly invoked `refer-zo-intake-router`.
  - Zo returned a compact fenced packet with:
    - `MODE: Capability Check`
    - evidence fields
    - `NEXT_TEST`
  - Follow-up refinement added a rule that `CONFIRMED` must contain verified facts, not a restatement of the request.
  - The revised local skill was resynced to `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`.
- Conclusion:
  - Explicit invocation of the intake router produces the intended compact shape.
  - Automatic skill activation remains unproven and should be tested separately.

### 2026-04-21 - Telechurch Zo intake router skill installed

- Type: Tested
- Instance: `telechurch`
- Method: `E:\refer\zo-computer\tools\zo-mcp.mjs` using `run_bash_command` and `list_files`
- Evidence:
  - Synced `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
  - Synced `/home/workspace/Skills/telechurch-figma-design-driver/SKILL.md`
  - Read-only listing returned:
    - `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
    - `/home/workspace/Skills/telechurch-figma-design-driver/SKILL.md`
    - existing Telechurch skills for admin setup, legal consent guard, and mobile site QA
- Conclusion:
  - The `telechurch` Zo instance now has the same intake router and Telechurch design-driver skill path available.
  - Behavioral activation on `telechurch` still needs a focused prompt test.

### 2026-04-21 - Universal/scoped Zo design skill split

- Type: Tested
- Instances: `refer`, `telechurch`
- Method: `E:\refer\zo-computer\tools\zo-mcp.mjs` using `run_bash_command` and `list_files`
- Evidence:
  - Mirrored user-created `zo-design-driver` into durable source at `E:\refer\zo-computer\skills\zo-design-driver\SKILL.md`.
  - Reduced `telechurch-figma-design-driver` to a scoped Telechurch overlay depending on `zo-design-driver`.
  - Updated `refer-zo-intake-router` so:
    - general visual/UI work routes to `zo-design-driver`
    - Telechurch visual/UI work routes to `zo-design-driver`, then `telechurch-figma-design-driver`
  - Synced active `refer` Zo skills. Read-only listing returned:
    - `/home/workspace/Skills/refer-documentation-discipline/SKILL.md`
    - `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
    - `/home/workspace/Skills/zo-design-driver/SKILL.md`
  - Synced active `telechurch` Zo skills. Read-only listing returned:
    - `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
    - `/home/workspace/Skills/zo-design-driver/SKILL.md`
    - `/home/workspace/Skills/telechurch-figma-design-driver/SKILL.md`
- Conclusion:
  - `refer` is now platform-agnostic for design by default.
  - Telechurch-specific design guidance remains scoped to the `telechurch` instance and local scoped skill.
  - Automatic chained activation of universal + scoped skills still needs a focused behavior test.

### 2026-04-22 - JamaicaEats Zo VIPC bootstrap

- Type: Configured and tested
- Instance: `jamaicaeats`
- Method: `E:\refer\zo-computer\tools\zo-mcp.mjs` with `--instance jamaicaeats`
- Environment key:
  - `ZO_COMPUTER_JAMAICAEATS`
- Local repo connection:
  - `E:\jamaicaeats`
  - `E:\jamaicaeats\AGENTS.md`
  - `E:\jamaicaeats\docs\jamaicaeats-feature-blueprint.md`
- Evidence before setup:
  - `list-tools --instance jamaicaeats` succeeded.
  - `get_space_settings --instance jamaicaeats` returned empty/default settings.
  - `list_space_routes --instance jamaicaeats` returned an empty route list.
  - `list_personas --instance jamaicaeats` returned an empty list.
  - `list_rules --instance jamaicaeats` returned an empty list.
  - `/home/workspace` contained only default Zo starter files before bootstrap.
- Workspace scaffold created:
  - `/home/workspace/JAMAICAEATS/jamaicaeats-instance-notes.md`
  - `/home/workspace/JAMAICAEATS/jamaicaeats-vipc-operating-rules.md`
  - `/home/workspace/JAMAICAEATS/jamaicaeats-repo-connection-map.md`
  - `/home/workspace/JAMAICAEATS/Templates/codex-handoff-prompt.md`
  - `/home/workspace/JAMAICAEATS/Validation/2026-04-22-initialization-validation.md`
- Skills installed:
  - `/home/workspace/Skills/refer-zo-intake-router/SKILL.md`
  - `/home/workspace/Skills/zo-design-driver/SKILL.md`
  - `/home/workspace/Skills/jamaicaeats-vipc-driver/SKILL.md`
  - `/home/workspace/Skills/jamaicaeats-design-driver/SKILL.md`
- Persona and rules:
  - Created and activated persona: `JamaicaEats VIPC Operator`
  - Created rules for intake/design chain, repo authority, no secrets, no production mutation, and stub/sandbox/production labeling.
- Space settings:
  - title: `JamaicaEats VIPC`
  - description: `JamaicaEats repo-connected VIPC operator and design bootstrap.`
  - noindex: `true`
- Routes:
  - `/operator`
  - `/console`
  - `/api/repo/context`
  - `/api/stores/demo/summary`
- Validation:
  - `list_space_routes --instance jamaicaeats` returned all four routes.
  - `list_files /home/workspace/Skills --instance jamaicaeats` returned all four skill folders.
  - `https://jamaicaeats.zo.space/operator` rendered and was readable.
  - `https://jamaicaeats.zo.space/api/repo/context` returned stub JSON with `connectedToProduction:false`.
  - `get_space_errors --instance jamaicaeats` returned `errors=[] count=0`.
- Conclusion:
  - `jamaicaeats` is now a separate initialized Zo VIPC bootstrap connected by policy and documentation to `E:\jamaicaeats`.
  - The bootstrap includes intake, universal design, scoped JamaicaEats design, and operator/repo driver skills.
  - Current routes are intentionally stubbed and do not touch JamaicaEats auth, Supabase, Cloudflare, Stripe, maps, email, store/menu/order/customer/driver data, DNS, or production deploys.

### 2026-04-22 - Telechurch Zo auth bridge regression contract

- Type: Tested and documented
- Instance: `telechurch`
- Method:
  - Zo chat through `node tools/zo-ask.mjs --instance telechurch`
  - Live route checks against `https://telechurch.zo.space`
  - Real browser click test with Playwright from `https://telechurch.zo.space/login`
- Evidence:
  - Zo confirmed `/login` uses a plain anchor:
    - `href="/api/auth/begin?return_to=/onboarding"`
  - Zo confirmed `/api/auth/begin?return_to=/onboarding` returns a `302` to:
    - `https://telechurchlive.com/auth/authorize?...`
  - Zo confirmed `/auth/callback` now attempts exchange and fails gracefully on fake code/state instead of merely displaying code/state.
  - Zo confirmed `/api/auth/exchange` keeps token exchange server-side and returns `405` for GET.
  - Initial curl/HEAD checks against Telechurch edge were insufficient: they proved `/auth/authorize` worked but missed the real browser failure.
  - Real browser click reproduced the failure:
    - Zo -> `/api/auth/begin`
    - Telechurch `/auth/authorize`
    - Telechurch `/login?redirect=/auth/authorize...`
    - Angular SPA client routing swallowed `/auth/authorize` and landed at `https://telechurchlive.com/?response_type=code...`
  - Telechurch fix: SPA redirect layer must use `window.location.assign(...)` when target starts with `/auth/authorize`, because `/auth/authorize` is a Cloudflare Pages Function, not an Angular route.
  - Post-fix browser verification no longer ended at Telechurch root with OAuth params; logged-out expected stop is:
    - `https://telechurchlive.com/login?redirect=%2Fauth%2Fauthorize...`
- Documentation updates:
  - `E:\Telechurch-e2e-v2\AGENTS.md`
  - `E:\Telechurch-e2e-v2\agent.md`
  - `E:\Telechurch-e2e-v2\refer.app\refer.telechurch.auth.md`
  - Telechurch Zo workspace docs:
    - `TELECHURCH/telechurch-vipc-operating-rules.md`
    - `TELECHURCH/telechurch-instance-notes.md`
    - `TELECHURCH/telechurch-onboarding-source-brief.md`
  - Refer Zo durable contract:
    - `E:\refer\zo-computer\telechurch-zo-admin-build-contract.md`
- Conclusion:
  - Future Telechurch Zo auth work must verify with real browser navigation from Zo, not only curl/HEAD.
  - Zo Space docs/conventions provide route-shape guidance (`API Routes` for begin/exchange, `Page Routes` for callback), but Telechurch-specific OAuth/PKCE and Angular/Cloudflare routing behavior remain app-owned.

### 2026-04-22 - Telechurch Sentinel tandem bridge skill

- Type: Tested and documented
- Instance: `telechurch`
- Method:
  - Created Zo workspace skill `/home/workspace/Skills/telechurch-sentinel-tandem/SKILL.md`.
  - Asked Zo through `node tools/zo-ask.mjs --instance telechurch` to use the skill and return the `Tandem Progress Bridge` shape.
- Evidence:
  - Zo returned `MODE: Tandem Progress Bridge`.
  - Zo returned `STATUS: Understood`.
  - Zo stated that it stays in analysis/recommendation mode while Telechurch remains canonical authority for execution.
  - Follow-up peer posture check returned `STATUS: Confirmed. Zo is a capable peer in its own domain; Telechurch remains canonical runtime authority.`
  - Zo confirmed it may critique Codex assumptions, propose better schemas/contracts, build safe Zo-domain artifacts when authorized, and ask for evidence.
- Doctrine:
  - Zo is a capable peer in its own domain, not a passive task runner.
  - Build-time loop: Codex asks Zo, Zo returns progress/blockers/needs, Codex applies governed changes, verifies, and reports back when Zo needs the result.
  - Runtime loop: `Telechurch -> Cloudflare webhook -> Zo -> Cloudflare webhook -> Telechurch`.
  - Zo command packets are requests only; Telechurch executes only allowlisted, preprogrammed, audited actions.
- Updated references:
  - `E:\Telechurch-e2e-v2\refer.app\refer.telechurch.sentinel.md`
  - `E:\Telechurch-e2e-v2\.codex\skills\telechurch-zo-tandem\SKILL.md`
  - `E:\Telechurch-e2e-v2\AGENTS.md`
  - `E:\Telechurch-e2e-v2\agent.md`
  - `E:\refer.os\REFER.OS\refer.zo.md`
  - `E:\refer\zo-computer\skills\refer-zo-intake-router\SKILL.md`
