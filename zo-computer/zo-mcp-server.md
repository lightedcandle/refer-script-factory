# Zo Computer MCP Server Configuration

**Source:** `docs.zocomputer.com/mcp-server`
**Captured:** 2026-04-20

## Why use Zo as an MCP server?
- Files & shell — read, write, search, run commands
- Integrations — Gmail, Calendar, Notion, Linear, Airtable, Dropbox, Spotify
- Capabilities — web browsing, image generation, scheduled tasks, texting, emailing
- Fully yours — root access, persistent storage, install anything you want

## Quick Start Configuration

To use Zo's MCP server:
1. Go to **Settings > Advanced** in Zo and create an access token.
2. The MCP endpoint URL is: `https://api.zo.computer/mcp`
3. The auth header format is: `Authorization: Bearer zo_sk_your_key_here`

## Client-Specific Configurations

### Claude Code
Run the following command:
```bash
claude mcp add --transport http zo https://api.zo.computer/mcp \
  --header "Authorization: Bearer zo_sk_your_key_here"
```
Or edit `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "zo": {
      "type": "http",
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_your_key_here"
      }
    }
  }
}
```

### Claude Desktop
Edit your Claude Desktop config file:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following:
```json
{
  "mcpServers": {
    "zo": {
      "command": "npx",
      "args": [
        "mcp-remote@latest",
        "https://api.zo.computer/mcp",
        "--header",
        "Authorization: Bearer zo_sk_your_key_here"
      ]
    }
  }
}
```

### Cursor
Edit `~/.cursor/mcp.json` or configure in the UI:
```json
{
  "mcpServers": {
    "zo": {
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_your_key_here"
      }
    }
  }
}
```

### Zed
Edit `~/.config/zed/settings.json`:
```json
{
  "context_servers": {
    "zo": {
      "settings": {},
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_your_key_here"
      }
    }
  }
}
```

### OpenCode
Edit `opencode.json`:
```json
{
  "mcp": {
    "zo": {
      "type": "remote",
      "url": "https://api.zo.computer/mcp",
      "headers": {
        "Authorization": "Bearer zo_sk_your_key_here"
      }
    }
  }
}
```

### Gemini CLI
Run the following command:
```bash
gemini mcp add zo https://api.zo.computer/mcp --transport http --scope user \
  -H "Authorization: Bearer zo_sk_your_key_here"
```
Or edit `~/.gemini/settings.json`:
```json
{
  "mcpServers": {
    "zo": {
      "url": "https://api.zo.computer/mcp",
      "type": "http",
      "headers": {
        "Authorization": "Bearer zo_sk_your_key_here"
      }
    }
  }
}
```

### Codex
Run the following command:
```bash
codex mcp add zo -- npx -y mcp-remote https://api.zo.computer/mcp \
  --header "Authorization:Bearer zo_sk_your_key_here" --transport http-only
```
Or edit `~/.codex/config.toml`:
```toml
[mcp_servers.zo]
command = "npx"
args = ["-y", "mcp-remote", "https://api.zo.computer/mcp", "--header", "Authorization:Bearer zo_sk_your_key_here", "--transport", "http-only"]
```

### Other MCP Clients (npx mcp-remote fallback)
If your client doesn't natively support remote HTTP endpoints via Bearer token, you can bridge it locally using the `mcp-remote` NPM package:
```bash
npx -y mcp-remote https://api.zo.computer/mcp \
  --header "Authorization:Bearer zo_sk_your_key_here" \
  --transport http-only
```
Add this as a "command-based" or "stdio" MCP server passing `npx` as the command and the rest as arguments.

## Available tools
Once connected, all Zo tools (see `zo-tools-reference.md`) should report via the MCP protocol.

## Local Helper

Universal helper path:

```bash
node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools
```

The helper initializes a streamable HTTP MCP session, calls `tools/list` or `tools/call`, reads the selected instance token, and logs metadata to:

```text
E:/refer/zo-computer/usage/zo-mcp-usage.jsonl
```

Instance selection:

```bash
node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools --instance refer
node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools --instance telechurch
node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools --instance jamaicaeats
```

Token lookup:

- `--instance refer` reads `ZO_COMPUTER_REFER`, then falls back to `ZO_ACCESS_TOKEN` or `ZO_COMPUTER`.
- `--instance telechurch` reads `ZO_COMPUTER_TELECHURCH`.
- `--instance jamaicaeats` reads `ZO_COMPUTER_JAMAICAEATS`.
- Other instance names resolve to `ZO_COMPUTER_<INSTANCE>`.

PowerShell note: prefer `--args64` for tool arguments so JSON quoting survives the shell boundary.

Persistent Codex MCP wrapper:

```text
E:\refer\zo-computer\tools\zo-mcp-remote.ps1
```

Registered in:

```text
C:\Users\agent\.codex\config.toml
```

The config calls the wrapper instead of storing the token. The wrapper reads the selected `ZO_COMPUTER_*` key from `.env.master` and starts `mcp-remote`.

Current Codex MCP entries:

- `zo`: default `refer` instance
- `zo_telechurch`: explicit `telechurch` instance

Claude Desktop config:

```text
C:\Users\agent\AppData\Roaming\Claude\claude_desktop_config.json
```

Cursor config:

```text
C:\Users\agent\.cursor\mcp.json
```

Both client configs call the same token-safe wrapper instead of embedding the Zo token. Each now has both:

- `zo`
- `zo_telechurch`

## Verified on 2026-04-21

- Endpoint authenticated successfully with the `refer` Zo token.
- `initialize` returned status `200`.
- Server reported:
  - name: `zo-tools`
  - version: `1.0.0`
  - protocol version: `2024-11-05`
- `tools/list` returned 83 tools.
- Direct read-only tool call succeeded with `read_file`.
- Direct directory listing succeeded with `list_files`.
- Direct controlled write succeeded with `create_or_rewrite_file`.
- Universal helper created and validated at `E:\refer\zo-computer\tools\zo-mcp.mjs`.
- `tool_docs` succeeded for `run_bash_command` and `grep_search`.
- Harmless `run_bash_command` succeeded with `pwd && whoami && uname -s` in `/home/workspace`.
- `grep_search` succeeded with `location=USER`; it returned `No files found` for the tested query.
- Persistent Codex MCP config added through `zo-mcp-remote.ps1`; wrapper parse check passed.
- Fresh Codex session exposed `mcp__zo__*` tools and `mcp__zo__list_files` succeeded for `/home/workspace/REFER`.
- Claude Desktop and Cursor MCP config files were created with JSON-valid, wrapper-based `zo` entries.
- Helper and wrapper now support explicit `--instance refer|telechurch` routing.
- `telechurch` was validated with the `ZO_COMPUTER_TELECHURCH` key.
- Codex, Claude Desktop, and Cursor were configured with separate `zo_telechurch` MCP entries.

Tool inventory:

- `E:\refer\zo-computer\zo-mcp-tool-inventory.md`

Read-only tool call notes:

- `read_file` expects `target_file`, not `path`.
- `target_file` must be absolute.
- confirmed working path format:
  - `/home/workspace/REFER/refer-instance-notes.md`

Directory listing notes:

- `list_files` expects `path`, not `target_directory`.
- confirmed working path:
  - `/home/workspace/REFER`

Controlled write notes:

- `create_or_rewrite_file` expects:
  - `target_file`
  - `content`
- confirmed controlled write path:
  - `/home/workspace/REFER/Validation/2026-04-21-mcp-controlled-write.md`
- readback confirmed with `read_file`.

Search and shell notes:

- `tool_docs` expects `tool_name`.
- `grep_search` does not accept filesystem paths in `location`.
- `grep_search.location` must be one of:
  - `USER`
  - `CONVERSATION`
  - `ALL_CONVERSATIONS`
- `run_bash_command` expects:
  - `cmd`
  - optional `cwd`
- confirmed harmless shell output:
  - cwd: `/home/workspace`
  - user: `root`
  - kernel family: `Linux`

## Validation Checklist Next Steps

- [x] Verify endpoint and auth flow live
- [x] Verify one successful connection from a local MCP client/probe
- [x] Confirm the remote MCP tool list
- [x] Test one read-only MCP tool call
- [x] Test one directory listing through direct MCP tooling
- [x] Test one low-risk write operation through direct MCP tooling
- [x] Create and validate a reusable local MCP helper
- [x] Test `tool_docs`
- [x] Test one harmless shell command
- [x] Test `grep_search` with valid `location`
- [x] Configure a persistent Codex MCP client entry without exposing token
- [x] Confirm Zo MCP tools appear in a fresh Codex session after reload
- [x] Configure Claude/Cursor client entries if needed
