#!/usr/bin/env node
/**
 * Hive Build Intake
 *
 * Emits and dispatches governed build-intake contracts for Zo hive nodes.
 * This is the route-change origin lane: future app changes should cite the
 * typed intake contract before route mutation starts.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const BACKLOG_FILE = ".refer-factory/hive-backlog.json";
const REPORT_FILE = ".refer-factory/hive-backlog.md";
const OUTBOX = ".refer-factory/hive-build-intake/outbox";
const PROCESS_STATE_FILE = ".refer-factory/process-state.json";
const RECENT_EVENT_LIMIT = 50;

function parseArgs(argv) {
  const args = {
    command: argv[0] || "help",
    id: "",
    instance: "",
    routes: [],
    summary: "",
    dryRun: false,
    trigger: false,
    fetch: false,
    json: false,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--id" && value) args.id = value, i += 1;
    else if (key === "--instance" && value) args.instance = value, i += 1;
    else if (key === "--routes" && value) args.routes = splitList(value), i += 1;
    else if (key === "--summary" && value) args.summary = value, i += 1;
    else if (key === "--dry-run") args.dryRun = true;
    else if (key === "--trigger") args.trigger = true;
    else if (key === "--fetch") args.fetch = true;
    else if (key === "--json") args.json = true;
  }
  return args;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readBacklog() {
  if (!existsSync(BACKLOG_FILE)) throw new Error(`Missing backlog file: ${BACKLOG_FILE}`);
  return JSON.parse(readFileSync(BACKLOG_FILE, "utf8"));
}

function writeBacklog(backlog) {
  backlog.updated_at = new Date().toISOString();
  writeFileSync(BACKLOG_FILE, `${JSON.stringify(backlog, null, 2)}\n`, "utf8");
  writeFileSync(REPORT_FILE, renderBacklogReport(backlog), "utf8");
}

function findItem(backlog, id) {
  if (!id) throw new Error("command requires --id");
  const item = (backlog.items || []).find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown hive backlog item "${id}"`);
  return item;
}

function emit(args) {
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const routes = args.routes.length ? args.routes : inferRoutes(item);
  if (!routes.length) throw new Error("build intake requires --routes");
  const contract = buildContract(item, routes, args);
  const path = writeContract(contract);
  const now = new Date().toISOString();
  item.updated_at = now;
  item.contract_path = path;
  item.status = item.status === "queued" ? "intake_contracted" : item.status;
  item.evidence = [
    ...(item.evidence || []),
    { ts: now, value: `build intake contract emitted: ${path}` },
  ];
  item.notes = [
    ...(item.notes || []),
    {
      ts: now,
      value: "Future route changes for this item must originate from the build_intake block and return talkback plus route ratification.",
    },
  ];
  writeBacklog(backlog);
  return { item, contract, path };
}

function dispatch(args) {
  const emitted = emit(args);
  const instance = args.instance || emitted.item.target_instance || emitted.item.target_node;
  const dispatchArgs = [
    "scripts/factory/dispatch-contract.mjs",
    "--instance",
    instance,
    "--mode",
    emitted.item.mode || "BUILD",
    "--file",
    resolve(emitted.path),
  ];
  if (args.dryRun) dispatchArgs.push("--dry-run");
  if (args.trigger) dispatchArgs.push("--trigger");
  if (args.fetch) dispatchArgs.push("--fetch");
  const output = execFileSync(process.execPath, dispatchArgs, {
    cwd: "refer-zo-bootstrap",
    encoding: "utf8",
  });
  const result = JSON.parse(output);
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const now = new Date().toISOString();
  item.updated_at = now;
  item.status = args.dryRun ? "intake_dispatch_dry_run" : args.fetch ? "intake_recorded" : "intake_dispatched";
  item.dispatches = [
    ...(item.dispatches || []),
    {
      ts: now,
      instance,
      dry_run: args.dryRun,
      trigger: args.trigger,
      fetch: args.fetch,
      ok: Boolean(result.ok),
      contract_id: result.contract_id,
      report_path: result.report_path,
      lane: "build_intake",
    },
  ];
  item.evidence = [
    ...(item.evidence || []),
    {
      ts: now,
      value: args.dryRun
        ? `build intake dispatch dry-run verified for ${instance}`
        : args.fetch
          ? `build intake recorded on ${instance}; talkback fetched`
          : `build intake dispatched to ${instance}`,
    },
  ];
  writeBacklog(backlog);
  return { item, dispatch: result };
}

function buildContract(item, routes, args) {
  const summary = args.summary || item.summary;
  return {
    schema: "refer.hive.contract.v1",
    contract_id: item.id,
    created_at: new Date().toISOString(),
    owner_factory: "refer-script-factory",
    authority: "typed_contract",
    template: item.template,
    target_node: item.target_node,
    target_instance: args.instance || item.target_instance || item.target_node,
    mode: item.mode || "BUILD",
    priority: item.priority || "normal",
    task: summary,
    scope: item.scope || [],
    out_of_scope: item.out_of_scope || [],
    acceptance: item.acceptance || [],
    build_intake: {
      schema: "refer.zo.build-intake.v1",
      change_id: item.id,
      summary,
      routes,
      route_policy: "Route mutation must follow this typed intake and return talkback, route ratification, and usage evidence.",
      evidence_required: ["typed intake", "talkback", "route ratification", "usage record"],
      next: "Use this intake record as the required origin for subsequent Alliance route changes.",
    },
    required_talkback: {
      schema: "refer.hive.talkback.v1",
      include: ["ok", "contract_id", "node", "summary", "evidence", "build_intake", "limits", "next"],
    },
    ratification_rule:
      "Build intake proves governed origin only; route mutation still requires route ratification before source is ratified.",
  };
}

function inferRoutes(item) {
  const text = `${item.summary || ""} ${(item.acceptance || []).join(" ")}`;
  const matches = text.match(/\/[a-zA-Z0-9_/-]*/g) || [];
  return [...new Set(matches)];
}

function writeContract(contract) {
  mkdirSync(OUTBOX, { recursive: true });
  const safeId = safeName(contract.contract_id);
  const path = join(OUTBOX, `${safeId}.json`);
  writeFileSync(path, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  return path;
}

function safeName(value) {
  return String(value || "build-intake").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function renderBacklogReport(backlog) {
  const lines = [
    "# Hive Backlog",
    "",
    `Updated: ${backlog.updated_at}`,
    "",
    backlog.purpose || "Track hive work as typed contracts before dispatching to factory nodes.",
    "",
    "## Templates",
    "",
    "| Template | Mode | Purpose |",
    "|---|---|---|",
    ...(backlog.templates || []).map((template) => `| \`${cell(template.id)}\` | \`${cell(template.default_mode)}\` | ${cell(template.purpose)} |`),
    "",
    "## Items",
    "",
    "| ID | Status | Node | Priority | Mode | Title |",
    "|---|---|---|---|---|---|",
  ];
  for (const item of backlog.items || []) {
    lines.push(
      `| \`${cell(item.id)}\` | ${cell(item.status)} | \`${cell(item.target_node)}\` | ${cell(item.priority)} | \`${cell(item.mode)}\` | ${cell(item.title)} |`,
    );
  }
  lines.push("");
  for (const item of backlog.items || []) {
    lines.push(`### ${item.title}`, "");
    lines.push(`- ID: \`${item.id}\``);
    lines.push(`- Contract: ${item.contract_path ? `\`${item.contract_path}\`` : "_not emitted_"}`);
    lines.push(`- Summary: ${item.summary}`);
    if (item.acceptance?.length) lines.push(`- Acceptance: ${item.acceptance.join("; ")}`);
    if (item.evidence?.length) {
      lines.push("- Evidence:");
      for (const evidence of item.evidence.slice(-5)) lines.push(`  - ${evidence.ts}: ${evidence.value}`);
    }
    if (item.notes?.length) {
      lines.push("- Notes:");
      for (const note of item.notes.slice(-5)) lines.push(`  - ${note.ts}: ${note.value}`);
    }
    lines.push("");
  }
  lines.push(
    "## Commands",
    "",
    "```powershell",
    "npm run hive:backlog",
    "npm run hive:build-intake -- emit --id <item-id> --routes \"/,/organizations,/people\"",
    "npm run hive:build-intake -- dispatch --id <item-id> --routes \"/,/organizations,/people\" --dry-run",
    "npm run hive:contract -- --id <item-id>",
    "npm run hive:dispatch -- --id <item-id> --dry-run",
    "npm run hive:validate-talkback -- --id <item-id>",
    "```",
    "",
  );
  return `${lines.join("\n")}\n`;
}

function cell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function printUsage() {
  console.log(`Usage:
  npm run hive:build-intake -- emit --id <item-id> --routes "/,/organizations"
  npm run hive:build-intake -- dispatch --id <item-id> --routes "/,/organizations" [--dry-run] [--trigger] [--fetch]

Outputs:
  ${resolve(OUTBOX)}`);
}

const args = parseArgs(process.argv.slice(2));
const startedAt = new Date().toISOString();
try {
  let result;
  if (args.command === "emit") result = emit(args);
  else if (args.command === "dispatch") result = dispatch(args);
  else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
  appendProcessEvent(createProcessEvent(args, startedAt, "completed", result));
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else console.log(JSON.stringify(result, null, 2));
} catch (error) {
  appendProcessEvent(createProcessEvent(args, startedAt, "failed", null, error));
  console.error(error?.message || String(error));
  process.exit(1);
}

function createProcessEvent(args, startedAt, status, result, error = null) {
  const elapsedMs = Date.now() - Date.parse(startedAt);
  const idPart = result?.item?.id || args.id || Date.now();
  return {
    id: `hive-build-intake.${args.command}.${safeName(idPart)}.${Date.now()}`,
    script_name: `hive-build-intake:${args.command}`,
    status,
    started_at: startedAt,
    elapsed_ms: elapsedMs,
    dominant_gear: "factory",
    output_target: OUTBOX,
    efficiency_state: status === "failed" ? "blocked" : "normal",
    message:
      status === "failed"
        ? `Hive build intake ${args.command} failed.`
        : `Hive build intake ${args.command} completed.`,
    error: error ? error?.message || String(error) : null,
  };
}

function appendProcessEvent(event) {
  const state = existsSync(PROCESS_STATE_FILE)
    ? JSON.parse(readFileSync(PROCESS_STATE_FILE, "utf8"))
    : emptyProcessState();
  const next = collapseProcessEvents(state, [event]);
  mkdirSync(dirname(PROCESS_STATE_FILE), { recursive: true });
  writeFileSync(PROCESS_STATE_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function collapseProcessEvents(state, events) {
  const current = {
    last_event: state.current?.last_event || null,
    by_status: { ...emptyStatusCounts(), ...(state.current?.by_status || {}) },
    by_script: { ...(state.current?.by_script || {}) },
    total: state.current?.total || 0,
  };
  const daily = new Map(
    (state.daily_history || []).map((entry) => [
      entry.date,
      {
        ...entry,
        by_status: { ...emptyStatusCounts(), ...(entry.by_status || {}) },
        by_script: { ...(entry.by_script || {}) },
      },
    ]),
  );
  const recent = [...(state.recent || [])];
  for (const event of events) {
    current.last_event = event;
    current.total += 1;
    current.by_status[event.status] += 1;
    current.by_script[event.script_name] = (current.by_script[event.script_name] || 0) + 1;
    const date = event.started_at.slice(0, 10);
    const day = daily.get(date) || {
      date,
      total: 0,
      by_status: emptyStatusCounts(),
      by_script: {},
      elapsed_ms: 0,
      last_event_id: null,
    };
    day.total += 1;
    day.by_status[event.status] += 1;
    day.by_script[event.script_name] = (day.by_script[event.script_name] || 0) + 1;
    day.elapsed_ms += event.elapsed_ms;
    day.last_event_id = event.id;
    daily.set(date, day);
    recent.push(event);
  }
  return {
    current,
    recent: recent.slice(-RECENT_EVENT_LIMIT),
    daily_history: Array.from(daily.values()).sort((a, b) => b.date.localeCompare(a.date)),
  };
}

function emptyProcessState() {
  return {
    current: {
      last_event: null,
      by_status: emptyStatusCounts(),
      by_script: {},
      total: 0,
    },
    recent: [],
    daily_history: [],
  };
}

function emptyStatusCounts() {
  return { queued: 0, running: 0, blocked: 0, failed: 0, completed: 0 };
}
