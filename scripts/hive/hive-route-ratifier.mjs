#!/usr/bin/env node
/**
 * Hive Route Ratifier
 *
 * Captures zo.space route state for a hive node and writes durable evidence.
 * This is the upstream rectification step for builds that happened through Zo
 * route tools before a full Script Factory intake runner was installed.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const OUT_DIR = ".refer-factory/hive-route-ratifications";
const BACKLOG_FILE = ".refer-factory/hive-backlog.json";

function parseArgs(argv) {
  const args = {
    instance: "alliance",
    itemId: "",
    expected: [],
    includeSource: false,
    output: "text",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--instance" && value) args.instance = value, i += 1;
    else if (key === "--id" && value) args.itemId = value, i += 1;
    else if (key === "--expected" && value) args.expected = splitList(value), i += 1;
    else if (key === "--include-source") args.includeSource = true;
    else if (key === "--json") args.output = "json";
  }
  return args;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function mcpCall(instance, tool, toolArgs) {
  const args64 = Buffer.from(JSON.stringify(toolArgs), "utf8").toString("base64");
  const output = execFileSync(
    process.execPath,
    ["refer-zo-bootstrap/tools/zo-mcp.mjs", "call", tool, "--instance", instance, "--args64", args64, "--timeout-ms", "45000", "--json"],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  return JSON.parse(output);
}

function extractText(result) {
  const content = result?.result?.result?.content;
  if (!Array.isArray(content)) return "";
  return content.map((item) => (item?.type === "text" ? item.text : JSON.stringify(item))).join("\n");
}

function parseRouteLines(text) {
  const trimmed = String(text || "").trim();
  let lines = [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) lines = parsed.map(String);
  } catch {
    lines = trimmed.split(/\r?\n/);
  }
  return lines
    .map((line) => {
      const path = line.match(/path='([^']+)'/)?.[1] || line.match(/path="([^"]+)"/)?.[1] || "";
      const routeType = line.match(/route_type='([^']+)'/)?.[1] || line.match(/route_type="([^"]+)"/)?.[1] || "";
      const publicValue = line.match(/public=([^\s]+)/)?.[1] || "";
      return path ? { path, route_type: routeType, public: publicValue } : null;
    })
    .filter(Boolean);
}

function safeName(value) {
  return String(value || "route-ratification").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function writeReport(report) {
  mkdirSync(OUT_DIR, { recursive: true });
  const base = `${safeName(report.item_id || report.instance)}.${report.created_at.replace(/[-:.]/g, "").replace("Z", "Z")}`;
  const jsonPath = join(OUT_DIR, `${base}.json`);
  const mdPath = join(OUT_DIR, `${base}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");
  return { jsonPath, mdPath };
}

function renderMarkdown(report) {
  const lines = [
    `# Hive Route Ratification: ${report.instance}`,
    "",
    `Created: ${report.created_at}`,
    "",
    `- Item: \`${report.item_id || "none"}\``,
    `- OK: \`${report.ok}\``,
    "",
    "## Routes",
    "",
    "| Path | Type | Public |",
    "|---|---|---|",
    ...report.routes.map((route) => `| \`${route.path}\` | \`${route.route_type || ""}\` | \`${route.public || ""}\` |`),
    "",
    "## Expected",
    "",
    "| Path | Present |",
    "|---|---|",
    ...report.expected.map((entry) => `| \`${entry.path}\` | \`${entry.present}\` |`),
    "",
  ];
  if (report.blockers.length) {
    lines.push("## Blockers", "", ...report.blockers.map((blocker) => `- ${blocker}`), "");
  }
  if (report.route_sources?.length) {
    lines.push("## Source Probes", "", "| Path | OK | Chars |", "|---|---:|---:|");
    for (const source of report.route_sources) {
      lines.push(`| \`${source.path}\` | \`${source.ok}\` | ${source.chars || 0} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function updateBacklog(itemId, report, files) {
  if (!itemId || !existsSync(BACKLOG_FILE)) return;
  const backlog = JSON.parse(readFileSync(BACKLOG_FILE, "utf8"));
  const item = (backlog.items || []).find((entry) => entry.id === itemId);
  if (!item) return;
  const now = report.created_at;
  item.updated_at = now;
  item.status = report.ok ? "route_ratified" : "blocked";
  item.evidence = [
    ...(item.evidence || []),
    {
      ts: now,
      value: `route ratification ${report.ok ? "passed" : "failed"}: ${files.jsonPath}`,
    },
  ];
  if (report.blockers.length) {
    item.notes = [
      ...(item.notes || []),
      {
        ts: now,
        value: `Route ratification blockers: ${report.blockers.join("; ")}`,
      },
    ];
  }
  backlog.updated_at = now;
  writeFileSync(BACKLOG_FILE, `${JSON.stringify(backlog, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const listed = mcpCall(args.instance, "list_space_routes", {});
  const routes = parseRouteLines(extractText(listed));
  const routePaths = new Set(routes.map((route) => route.path));
  const expected = args.expected.map((path) => ({ path, present: routePaths.has(path) }));
  const blockers = [];
  for (const entry of expected) {
    if (!entry.present) blockers.push(`missing_route:${entry.path}`);
  }

  const routeSources = [];
  if (args.includeSource) {
    for (const route of routes) {
      const source = mcpCall(args.instance, "get_space_route", { path: route.path });
      const text = extractText(source);
      routeSources.push({
        path: route.path,
        ok: Boolean(source.ok && text),
        chars: text.length,
      });
    }
  }

  const report = {
    schema: "refer.hive.route-ratification.v1",
    created_at: new Date().toISOString(),
    instance: args.instance,
    item_id: args.itemId,
    ok: blockers.length === 0,
    expected,
    routes,
    route_sources: routeSources,
    blockers,
    evidence: [
      `list_space_routes:${args.instance}`,
      args.includeSource ? "get_space_route:queried" : "get_space_route:skipped",
    ],
  };
  const files = writeReport(report);
  report.files = files;
  updateBacklog(args.itemId, report, files);

  if (args.output === "json") console.log(JSON.stringify(report, null, 2));
  else console.log(renderMarkdown(report));
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});
