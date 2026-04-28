# Zo MCP Tool Inventory

Last updated: 2026-04-21
Verification status: Tested
Instance: `refer`

## Purpose

This file records the live tool names exposed by the Zo MCP server for the `refer` instance.

## MCP Probe Result

- Endpoint: `https://api.zo.computer/mcp`
- Server name: `zo-tools`
- Server version: `1.0.0`
- Protocol returned by server: `2024-11-05`
- Tool count: 83

## Tools

- `change_hardware`
- `connect_telegram`
- `create_agent`
- `create_automation`
- `create_or_rewrite_file`
- `create_persona`
- `create_rule`
- `create_stripe_payment_link`
- `create_stripe_price`
- `create_stripe_product`
- `create_website`
- `delete_agent`
- `delete_automation`
- `delete_persona`
- `delete_rule`
- `delete_space_asset`
- `delete_space_route`
- `delete_user_service`
- `edit_agent`
- `edit_automation`
- `edit_file`
- `edit_file_llm`
- `edit_image`
- `edit_persona`
- `edit_rule`
- `find_similar_links`
- `generate_d2_diagram`
- `generate_image`
- `generate_video`
- `get_automation`
- `get_space_errors`
- `get_space_route`
- `get_space_route_history`
- `get_space_settings`
- `grep_search`
- `image_search`
- `list_agents`
- `list_app_tools`
- `list_automations`
- `list_files`
- `list_personas`
- `list_rules`
- `list_space_assets`
- `list_space_routes`
- `list_stripe_orders`
- `list_stripe_payment_links`
- `list_user_services`
- `maps_search`
- `open_webpage`
- `proxy_local_service`
- `read_file`
- `read_webpage`
- `redo_space_route`
- `register_user_service`
- `restart_space_server`
- `run_bash_command`
- `run_parallel_cmds`
- `run_sequential_cmds`
- `save_webpage`
- `send_email_to_user`
- `send_sms_to_user`
- `service_doctor`
- `set_active_persona`
- `tool_docs`
- `transcribe_audio`
- `transcribe_video`
- `undo_space_route`
- `update_space_asset`
- `update_space_route`
- `update_space_settings`
- `update_stripe_orders`
- `update_stripe_payment_link`
- `update_stripe_product`
- `update_user_service`
- `update_user_settings`
- `use_app_gmail`
- `use_app_google_calendar`
- `use_app_google_drive`
- `use_webpage`
- `view_webpage`
- `web_research`
- `web_search`
- `x_search`

## Safety Notes

This tool surface includes high-impact capabilities:

- shell execution
- file writes
- website/service creation
- hardware changes
- email/SMS sending
- Stripe commerce actions
- Google app access

Treat direct MCP access as privileged operator access to the `refer` Zo instance.

## Local Helper

Created and validated on 2026-04-21:

- `E:\refer\zo-computer\tools\zo-mcp.mjs`

Supported commands:

- `list-tools`
- `call <tool_name>`

Argument passing:

- `--args` accepts raw JSON when the calling shell preserves quotes.
- `--args64` accepts base64-encoded JSON and is preferred from PowerShell.

Usage is logged to:

- `E:\refer\zo-computer\usage\zo-mcp-usage.jsonl`

## Persistent Codex MCP Entry

Configured on 2026-04-21.

- Wrapper:
  - `E:\refer\zo-computer\tools\zo-mcp-remote.ps1`
- Codex config:
  - `C:\Users\agent\.codex\config.toml`
- Config entry:
  - `[mcp_servers.zo]`

The wrapper reads the Zo token at runtime from `.env.master`; no token is stored in the Codex config. A fresh Codex session may be required before the MCP server appears as an active tool provider.

## Tested Tool Notes

### `read_file`

Tested on 2026-04-21.

- Required argument: `target_file`
- Path must be absolute.
- Confirmed working example:
  - `/home/workspace/REFER/refer-instance-notes.md`

### `list_files`

Tested on 2026-04-21.

- Required argument: `path`
- `target_directory` is not accepted.
- Confirmed working example:
  - `/home/workspace/REFER`
- Returned the expected `REFER` workspace directories and files.

### `create_or_rewrite_file`

Tested on 2026-04-21 with a controlled validation marker.

- Required argument: `target_file`
- Optional/used argument: `content`
- Path must be absolute.
- Confirmed working example:
  - `/home/workspace/REFER/Validation/2026-04-21-mcp-controlled-write.md`
- Readback was confirmed with `read_file`.
- Scope rule: use only for explicitly targeted low-risk workspace writes unless the user grants broader authority.

### `tool_docs`

Tested on 2026-04-21.

- Required argument: `tool_name`
- Confirmed working examples:
  - `run_bash_command`
  - `grep_search`
- Use this before exercising tools with unclear argument semantics.

### `grep_search`

Tested on 2026-04-21.

- Required argument: `query`
- `location` is not a filesystem path.
- Valid `location` values observed through tool error/docs:
  - `USER`
  - `CONVERSATION`
  - `ALL_CONVERSATIONS`
- Optional arguments include:
  - `case_sensitive`
  - `exclude_pattern`
  - `include_pattern`
  - `search_kind`
- Confirmed call with `location=USER` completed successfully and returned `No files found` for the tested query.

### `run_bash_command`

Tested on 2026-04-21 with harmless inspection only.

- Required argument: `cmd`
- Optional argument: `cwd`
- Confirmed command:
  - `pwd && whoami && uname -s`
- Confirmed output:
  - `/home/workspace`
  - `root`
  - `Linux`
- Scope rule: shell execution is high-impact. Use read-only commands first and avoid destructive commands unless explicitly authorized.

### `use_app_gmail`

Tested on 2026-04-21 for metadata-only access.

- `list_app_tools` confirmed Gmail accounts:
  - `agentcalvinanderson@gmail.com`
  - `lightedcandle2018@gmail.com`
- `use_app_gmail` requires:
  - `tool_name`
  - `configured_props`
  - optional/separate `email` when multiple accounts are connected
- `configured_props` should be passed as a JSON string.
- Confirmed read-only metadata test:
  - `tool_name=gmail-find-email`
  - `email=lightedcandle2018@gmail.com`
  - `configured_props={"q":"in:anywhere","metadataOnly":true,"maxResults":1,"includeSpamTrash":false}`
