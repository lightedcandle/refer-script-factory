# Zo Usage Tracking

Last updated: 2026-04-21
Status: Active

## Purpose

This folder stores local usage records for Zo API/MCP testing so we can estimate practical limits over time.

## Current Ledger

- `zo-api-usage.jsonl`
- `zo-mcp-usage.jsonl`

## Rules

- Never store Zo access tokens.
- Do not store full prompts or full outputs by default.
- Record enough metadata to estimate usage:
  - timestamp
  - endpoint
  - model
  - request status
  - duration
  - approximate prompt/output size
  - whether a conversation id was returned

## Current Helper

API ask helper from the Telechurch repo:

```bash
node tools/zo-ask.mjs "Access validation only. Reply OK."
```

The helper reads `ZO_ACCESS_TOKEN` or `ZO_COMPUTER` from local env files and appends usage metadata to:

```text
E:/refer/zo-computer/usage/zo-api-usage.jsonl
```

Universal MCP helper:

```bash
node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools
```

For shell-safe complex arguments, prefer base64 JSON:

```powershell
$json = '{"path":"/home/workspace/REFER"}'
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
node E:/refer/zo-computer/tools/zo-mcp.mjs call list_files --args64 $b64 --json
```

The helper reads `ZO_ACCESS_TOKEN` or `ZO_COMPUTER` from local env files and appends MCP usage metadata to:

```text
E:/refer/zo-computer/usage/zo-mcp-usage.jsonl
```

Persistent MCP wrapper:

```text
E:/refer/zo-computer/tools/zo-mcp-remote.ps1
```

This wrapper is used by the Codex MCP config and reads the token at runtime instead of storing it in `C:\Users\agent\.codex\config.toml`.
