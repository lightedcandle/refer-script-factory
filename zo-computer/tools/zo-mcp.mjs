#!/usr/bin/env node
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";

const MCP_URL = "https://api.zo.computer/mcp";
const PROTOCOL_VERSION = "2024-11-05";
const LEDGER_PATH = "E:/refer/zo-computer/usage/zo-mcp-usage.jsonl";

function parseDotEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function loadEnv() {
  const candidates = [
    ".env.local",
    ".env.master",
  ];
  let env = {};
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    env = { ...env, ...parseDotEnv(await readFile(file, "utf8")) };
  }
  return { ...env, ...process.env };
}

function parseArgs(argv) {
  const args = {
    command: "",
    tool: "",
    instance: "refer",
    argumentsJson: "{}",
    argumentsBase64: "",
    ledger: LEDGER_PATH,
    noLog: false,
    json: false,
  };

  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--instance" && argv[i + 1]) args.instance = argv[++i];
    else if (arg === "--args" && argv[i + 1]) args.argumentsJson = argv[++i];
    else if (arg === "--args64" && argv[i + 1]) args.argumentsBase64 = argv[++i];
    else if (arg === "--ledger" && argv[i + 1]) args.ledger = argv[++i];
    else if (arg === "--no-log") args.noLog = true;
    else if (arg === "--json") args.json = true;
    else rest.push(arg);
  }

  args.command = rest[0] || "";
  args.tool = rest[1] || "";
  return args;
}

function printUsage() {
  console.error(`Usage:
  node E:/refer/zo-computer/tools/zo-mcp.mjs list-tools [--instance refer|telechurch|jamaicaeats] [--json]
  node E:/refer/zo-computer/tools/zo-mcp.mjs call <tool_name> --instance refer|telechurch|jamaicaeats --args '{"key":"value"}' [--json]
  node E:/refer/zo-computer/tools/zo-mcp.mjs call <tool_name> --instance refer|telechurch|jamaicaeats --args64 <base64-json> [--json]

Examples:
  node tools/zo-mcp.mjs call run_bash_command --args '{"cmd":"pwd"}' --json
  node tools/zo-mcp.mjs call list_files --args '{"path":"<detected Zo Files root>"}' --json`);
}

function resolveToken(env, instance) {
  const normalized = String(instance || "refer").trim().toLowerCase();
  if (normalized === "telechurch") {
    return {
      token: env.ZO_COMPUTER_TELECHURCH,
      envName: "ZO_COMPUTER_TELECHURCH",
      instance: normalized,
    };
  }
  if (normalized === "refer") {
    return {
      token: env.ZO_COMPUTER_REFER || env.ZO_ACCESS_TOKEN || env.ZO_COMPUTER,
      envName: env.ZO_COMPUTER_REFER
        ? "ZO_COMPUTER_REFER"
        : env.ZO_ACCESS_TOKEN
          ? "ZO_ACCESS_TOKEN"
          : "ZO_COMPUTER",
      instance: normalized,
    };
  }
  const envName = `ZO_COMPUTER_${normalized.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`;
  return { token: env[envName], envName, instance: normalized };
}

async function logUsage(path, event) {
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(event)}\n`, "utf8");
}

async function rpc(headers, method, params, id) {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { parse_error: text.slice(0, 500) };
  }
  return { response, json, text };
}

async function initialize(token) {
  const baseHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": PROTOCOL_VERSION,
  };

  const init = await rpc(
    baseHeaders,
    "initialize",
    {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "refer-zo-mcp-helper", version: "0.1.0" },
    },
    1,
  );

  const sessionId =
    init.response.headers.get("mcp-session-id") ||
    init.response.headers.get("Mcp-Session-Id");

  if (!init.response.ok || !sessionId) {
    throw new Error(
      `MCP initialize failed: status=${init.response.status} body=${init.text.slice(0, 500)}`,
    );
  }

  const headers = { ...baseHeaders, "mcp-session-id": sessionId };

  try {
    await fetch(MCP_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {},
      }),
    });
  } catch {
    // Some clients ignore notification failures; tool calls still determine success.
  }

  return { headers, init: init.json };
}

function extractTextContent(result) {
  const content = result?.content;
  if (!Array.isArray(content)) return "";
  return content
    .map((item) => (item?.type === "text" ? item.text : JSON.stringify(item)))
    .join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.command || (args.command === "call" && !args.tool)) {
    printUsage();
    process.exit(2);
  }

  let toolArgs = {};
  try {
    const source = args.argumentsBase64
      ? Buffer.from(args.argumentsBase64, "base64").toString("utf8")
      : args.argumentsJson;
    toolArgs = JSON.parse(source);
  } catch (err) {
    console.error(`Invalid tool arguments JSON: ${err?.message || String(err)}`);
    process.exit(2);
  }

  const env = await loadEnv();
  const tokenInfo = resolveToken(env, args.instance);
  const token = tokenInfo.token;
  if (!token) {
    console.error(`Missing Zo token. Set ${tokenInfo.envName}.`);
    process.exit(2);
  }

  const started = performance.now();
  let status = 0;
  let ok = false;
  let output = null;
  let error = "";

  try {
    const { headers } = await initialize(token);
    const method = args.command === "list-tools" ? "tools/list" : "tools/call";
    const params =
      args.command === "list-tools"
        ? {}
        : { name: args.tool, arguments: toolArgs };
    const call = await rpc(headers, method, params, 2);
    status = call.response.status;
    ok = call.response.ok && !call.json?.error && !call.json?.result?.isError;
    output = call.json;
    if (call.json?.error) error = JSON.stringify(call.json.error).slice(0, 500);
    if (call.json?.result?.isError) {
      error = extractTextContent(call.json.result).slice(0, 500);
    }
    if (!call.response.ok && !error) error = call.text.slice(0, 500);
  } catch (err) {
    error = err?.message || String(err);
  }

  const durationMs = Math.round(performance.now() - started);
  if (!args.noLog) {
    await logUsage(resolve(args.ledger), {
      ts: new Date().toISOString(),
      endpoint: "/mcp",
      instance: tokenInfo.instance,
      command: args.command,
      tool: args.tool,
      status,
      ok,
      duration_ms: durationMs,
      argument_keys: Object.keys(toolArgs),
      error: error ? error.slice(0, 240) : "",
    });
  }

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          ok,
          status,
          duration_ms: durationMs,
          instance: tokenInfo.instance,
          result: output,
        },
        null,
        2,
      ),
    );
  } else if (ok) {
    if (args.command === "list-tools") {
      const names = output?.result?.tools?.map((tool) => tool.name) || [];
      console.log(names.join("\n"));
    } else {
      console.log(extractTextContent(output?.result) || JSON.stringify(output, null, 2));
    }
  } else {
    console.error(error || `Zo MCP request failed with status ${status}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
