#!/usr/bin/env node
/**
 * Hive Director
 *
 * Maintains the root Script Factory backlog and emits typed contracts for
 * hive nodes. Zo-specific dispatch stays delegated to refer-zo-bootstrap.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const BACKLOG_FILE = ".refer-factory/hive-backlog.json";
const REPORT_FILE = ".refer-factory/hive-backlog.md";
const CONTRACT_OUTBOX = ".refer-factory/hive-contracts/outbox";
const VALIDATION_DIR = ".refer-factory/hive-validations";
const PROCESS_STATE_FILE = ".refer-factory/process-state.json";
const RECENT_EVENT_LIMIT = 50;

const DEFAULT_BACKLOG = {
  schema: "refer.hive.backlog.v1",
  updated_at: "",
  purpose: "Track hive work as typed contracts before dispatching to factory nodes.",
  templates: [
    {
      id: "hive-feature",
      purpose: "Build a provider-neutral hive capability in the root Script Factory.",
      default_mode: "BUILD",
    },
    {
      id: "zo-runtime-fix",
      purpose: "Repair or verify Zo-specific runtime behavior in refer-zo-bootstrap or a live Zo node.",
      default_mode: "VERIFY",
    },
    {
      id: "factory-doctrine-promotion",
      purpose: "Promote a provider-neutral lesson from a Zo lane back into root doctrine.",
      default_mode: "RATIFY",
    },
    {
      id: "ratification-test",
      purpose: "Ask a node to prove a behavior and return talkback evidence.",
      default_mode: "VERIFY",
    },
  ],
  items: [],
};

function parseArgs(argv) {
  const args = {
    command: argv[0] || "report",
    id: "",
    title: "",
    template: "ratification-test",
    node: "telechurch",
    instance: "",
    priority: "normal",
    status: "queued",
    mode: "",
    summary: "",
    scope: "",
    outOfScope: "secrets,production mutation without explicit approval",
    acceptance: "",
    evidence: "",
    note: "",
    operations: [],
    talkback: "",
    dryRun: false,
    trigger: false,
    fetch: false,
    json: false,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--id" && value) args.id = value, i += 1;
    else if (key === "--title" && value) args.title = value, i += 1;
    else if (key === "--template" && value) args.template = value, i += 1;
    else if (key === "--node" && value) args.node = value, i += 1;
    else if (key === "--instance" && value) args.instance = value, i += 1;
    else if (key === "--priority" && value) args.priority = value, i += 1;
    else if (key === "--status" && value) args.status = value, i += 1;
    else if (key === "--mode" && value) args.mode = value, i += 1;
    else if (key === "--summary" && value) args.summary = value, i += 1;
    else if (key === "--scope" && value) args.scope = value, i += 1;
    else if (key === "--out-of-scope" && value) args.outOfScope = value, i += 1;
    else if (key === "--acceptance" && value) args.acceptance = value, i += 1;
    else if (key === "--evidence" && value) args.evidence = value, i += 1;
    else if (key === "--note" && value) args.note = value, i += 1;
    else if (key === "--operation" && value) args.operations.push(value), i += 1;
    else if (key === "--talkback" && value) args.talkback = value, i += 1;
    else if (key === "--dry-run") args.dryRun = true;
    else if (key === "--trigger") args.trigger = true;
    else if (key === "--fetch") args.fetch = true;
    else if (key === "--json") args.json = true;
  }
  return args;
}

function readBacklog() {
  if (!existsSync(BACKLOG_FILE)) return structuredClone(DEFAULT_BACKLOG);
  const parsed = JSON.parse(readFileSync(BACKLOG_FILE, "utf8"));
  return {
    ...DEFAULT_BACKLOG,
    ...parsed,
    templates: parsed.templates?.length ? parsed.templates : DEFAULT_BACKLOG.templates,
    items: parsed.items || [],
  };
}

function writeBacklog(backlog) {
  backlog.updated_at = new Date().toISOString();
  mkdirSync(dirname(BACKLOG_FILE), { recursive: true });
  writeFileSync(BACKLOG_FILE, `${JSON.stringify(sortBacklog(backlog), null, 2)}\n`, "utf8");
  writeFileSync(REPORT_FILE, renderReport(sortBacklog(backlog)), "utf8");
}

function initBacklog() {
  const backlog = readBacklog();
  writeBacklog(backlog);
  return backlog;
}

function addItem(args) {
  if (!args.title) throw new Error("add requires --title");
  if (!args.summary) throw new Error("add requires --summary");
  const backlog = readBacklog();
  const template = findTemplate(backlog, args.template);
  const now = new Date().toISOString();
  const hash = createHash("sha256").update(`${args.title}\n${args.summary}`, "utf8").digest("hex").slice(0, 10);
  const id = args.id || `hive.task.${stamp()}.${hash}`;
  if (backlog.items.some((item) => item.id === id)) throw new Error(`Backlog item already exists: ${id}`);
  const item = {
    id,
    schema: "refer.hive.backlog-item.v1",
    created_at: now,
    updated_at: now,
    title: args.title,
    template: template.id,
    target_node: args.node,
    target_instance: args.instance || args.node,
    priority: args.priority,
    status: args.status,
    mode: args.mode || template.default_mode,
    summary: args.summary,
    scope: splitList(args.scope),
    out_of_scope: splitList(args.outOfScope),
    acceptance: splitList(args.acceptance, ";"),
    execution: parseOperations(args.operations),
    contract_path: "",
    dispatches: [],
    evidence: [],
    notes: args.note ? [entry(args.note, now)] : [],
  };
  backlog.items.push(item);
  writeBacklog(backlog);
  return item;
}

function emitContract(args) {
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const contract = buildContract(backlog, item);
  const path = writeContract(contract);
  item.contract_path = path;
  item.status = item.status === "queued" ? "contracted" : item.status;
  item.updated_at = new Date().toISOString();
  if (args.note) item.notes = [...(item.notes || []), entry(args.note, item.updated_at)];
  writeBacklog(backlog);
  return { item, contract, path };
}

function dispatchItem(args) {
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const contract = buildContract(backlog, item);
  const contractPath = writeContract(contract);
  const instance = args.instance || item.target_instance || item.target_node;
  const dispatchArgs = [
    "scripts/factory/dispatch-contract.mjs",
    "--instance",
    instance,
    "--mode",
    item.mode || "VERIFY",
    "--file",
    resolve(contractPath),
  ];
  if (args.dryRun) dispatchArgs.push("--dry-run");
  if (args.trigger) dispatchArgs.push("--trigger");
  if (args.fetch) dispatchArgs.push("--fetch");

  const output = execFileSync(process.execPath, dispatchArgs, {
    cwd: "refer-zo-bootstrap",
    encoding: "utf8",
  });
  const result = JSON.parse(output);
  const now = new Date().toISOString();
  item.contract_path = contractPath;
  item.updated_at = now;
  item.status = args.dryRun ? "dispatch_dry_run" : args.fetch ? "talkback_fetched" : "dispatched";
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
    },
  ];
  if (result.ok) {
    item.evidence = [
      ...(item.evidence || []),
      entry(
        args.dryRun
          ? `dry-run dispatch path verified for ${instance}`
          : args.fetch
            ? `dispatch and talkback fetch completed for ${instance}`
            : `contract dispatched to ${instance}`,
        now,
      ),
    ];
  }
  writeBacklog(backlog);
  recordHeartbeat(item, instance, result, args);
  return { item, dispatch: result };
}

function recordItem(args) {
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const now = new Date().toISOString();
  item.updated_at = now;
  if (args.status) item.status = args.status;
  if (args.evidence) item.evidence = [...(item.evidence || []), entry(args.evidence, now)];
  if (args.note) item.notes = [...(item.notes || []), entry(args.note, now)];
  writeBacklog(backlog);
  return item;
}

function validateTalkback(args) {
  const backlog = readBacklog();
  const item = findItem(backlog, args.id);
  const contractPath = item.contract_path || join(CONTRACT_OUTBOX, `${safeName(item.id)}.json`);
  if (!existsSync(contractPath)) throw new Error(`Missing contract file: ${contractPath}`);
  const talkbackPath = args.talkback || defaultTalkbackPath(item.id);
  if (!existsSync(talkbackPath)) throw new Error(`Missing decoded talkback file: ${talkbackPath}`);
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  const decoded = JSON.parse(readFileSync(talkbackPath, "utf8"));
  const packet = decoded.packet || decoded;
  const checks = runValidationChecks(contract, packet);
  const ok = checks.every((check) => check.ok);
  const now = new Date().toISOString();
  const report = {
    schema: "refer.hive.talkback-validation.v1",
    ok,
    contract_id: contract.contract_id,
    item_id: item.id,
    created_at: now,
    contract_path: contractPath,
    talkback_path: talkbackPath,
    checks,
  };
  mkdirSync(VALIDATION_DIR, { recursive: true });
  const reportPath = join(VALIDATION_DIR, `${safeName(item.id)}.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  item.updated_at = now;
  item.validation = {
    ok,
    report_path: reportPath,
    validated_at: now,
    failed_checks: checks.filter((check) => !check.ok).map((check) => check.id),
  };
  item.evidence = [
    ...(item.evidence || []),
    entry(ok ? `talkback validation passed: ${reportPath}` : `talkback validation failed: ${reportPath}`, now),
  ];
  item.status = ok ? "ratified" : "blocked";
  if (!ok) {
    item.notes = [
      ...(item.notes || []),
      entry(`Validation failed checks: ${item.validation.failed_checks.join(", ")}`, now),
    ];
  }
  writeBacklog(backlog);
  return { item, validation: report };
}

function defaultTalkbackPath(id) {
  return join("refer-zo-bootstrap", "datasets", "tandem-talkback", "inbox", `${safeName(id)}.decoded.json`);
}

function runValidationChecks(contract, talkback) {
  const checks = [];
  const evidence = Array.isArray(talkback.evidence) ? talkback.evidence : [];
  const blockers = Array.isArray(talkback.blockers) ? talkback.blockers : [];
  checks.push(check("contract-id", talkback.contract_id === contract.contract_id, `expected ${contract.contract_id}, got ${talkback.contract_id || "missing"}`));
  checks.push(check("status-done", talkback.status === "done", `expected status done, got ${talkback.status || "missing"}`));
  checks.push(check("no-blockers", blockers.length === 0, blockers.join("; ") || "no blockers"));
  for (const required of ["decoded_transport:zo_task", "runner:contract-inbox-runner"]) {
    checks.push(check(`evidence:${required}`, evidence.includes(required), `missing evidence ${required}`));
  }
  if (contract.build_intake) {
    checks.push(check("evidence:build-intake", evidence.includes("build_intake:recorded"), "missing build_intake:recorded evidence"));
    checks.push(
      check(
        "build-intake-result",
        talkback.build_intake?.ok === true,
        `expected build_intake.ok=true, got ${talkback.build_intake?.ok ?? "missing"}`,
      ),
    );
    checks.push(
      check(
        "build-intake-activity-path",
        Boolean(talkback.build_intake?.activity_path),
        "missing build_intake.activity_path",
      ),
    );
  }
  if (contract.execution?.operations?.length) {
    checks.push(check("evidence:executor", evidence.includes("executor:zo.bounded.v1"), "missing executor:zo.bounded.v1 evidence"));
    checks.push(check("executor", talkback.execution?.executor === "zo.bounded.v1", `got ${talkback.execution?.executor || "missing"}`));
    checks.push(check("execution-mode", talkback.execution?.mode === "non_mutating", `got ${talkback.execution?.mode || "missing"}`));
    const actualOps = Array.isArray(talkback.execution?.operations) ? talkback.execution.operations : [];
    checks.push(check("operation-count", actualOps.length === contract.execution.operations.length, `expected ${contract.execution.operations.length}, got ${actualOps.length}`));
    contract.execution.operations.forEach((expected, index) => {
      const actual = actualOps[index];
      checks.push(check(`operation:${index}:op`, actual?.op === expected.op, `expected ${expected.op}, got ${actual?.op || "missing"}`));
      checks.push(check(`operation:${index}:ok`, actual?.ok === true, `operation ${index} did not return ok=true`));
      if (expected.path) checks.push(check(`operation:${index}:path`, actual?.path === expected.path, `expected ${expected.path}, got ${actual?.path || "missing"}`));
      if (expected.op === "file_exists") checks.push(check(`operation:${index}:exists`, actual?.exists === true, "file_exists did not return exists=true"));
      if (expected.op === "list_dir") checks.push(check(`operation:${index}:entries`, Array.isArray(actual?.entries) && actual.entries.length > 0, "list_dir returned no entries"));
      if (expected.op === "read_json") checks.push(check(`operation:${index}:json`, actual?.json && typeof actual.json === "object", "read_json returned no JSON object"));
    });
  }
  return checks;
}

function check(id, ok, detail) {
  return { id, ok: Boolean(ok), detail: ok ? "passed" : detail };
}

function buildContract(backlog, item) {
  const template = findTemplate(backlog, item.template);
  return {
    schema: "refer.hive.contract.v1",
    contract_id: item.id,
    created_at: new Date().toISOString(),
    owner_factory: "refer-script-factory",
    authority: "typed_contract",
    template: template.id,
    target_node: item.target_node,
    target_instance: item.target_instance,
    mode: item.mode,
    priority: item.priority,
    task: item.summary,
    scope: item.scope || [],
    out_of_scope: item.out_of_scope || [],
    acceptance: item.acceptance || [],
    execution: item.execution?.operations?.length ? item.execution : undefined,
    required_talkback: {
      schema: "refer.hive.talkback.v1",
      include: ["ok", "contract_id", "node", "summary", "evidence", "limits", "next"],
    },
    ratification_rule:
      "Talkback is evidence only; source changes plus local verification remain ratification.",
  };
}

function writeContract(contract) {
  mkdirSync(CONTRACT_OUTBOX, { recursive: true });
  const safeId = safeName(contract.contract_id);
  const path = join(CONTRACT_OUTBOX, `${safeId}.json`);
  writeFileSync(path, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  return path;
}

function recordHeartbeat(item, instance, result, args) {
  const status = args.dryRun ? "ratifying" : result.ok ? "ratifying" : "blocked";
  const evidence = result.ok
    ? `hive director ${args.dryRun ? "dry-run " : ""}dispatch recorded for ${item.id}`
    : `hive director dispatch failed for ${item.id}`;
  try {
    execFileSync(
      process.execPath,
      [
        "scripts/hive/hive-node-registry.mjs",
        "heartbeat",
        "--id",
        instance,
        "--status",
        status,
        "--activity",
        "recent_activity",
        "--evidence",
        evidence,
      ],
      { cwd: process.cwd(), stdio: "ignore" },
    );
  } catch {
    // The backlog remains authoritative even if a node registry update fails.
  }
}

function findTemplate(backlog, id) {
  const template = backlog.templates.find((entry) => entry.id === id);
  if (!template) throw new Error(`Unknown template "${id}"`);
  return template;
}

function findItem(backlog, id) {
  if (!id) throw new Error("command requires --id");
  const item = backlog.items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown hive backlog item "${id}"`);
  return item;
}

function splitList(value, separator = ",") {
  return String(value || "")
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOperations(values) {
  const operations = values.map((value, index) => {
    const [op, ...rest] = String(value).split(":");
    const path = rest.join(":");
    if (!op) throw new Error(`Invalid operation at index ${index}`);
    if (op === "echo") return { op, text: path || "hello from hive director" };
    if (["file_exists", "list_dir", "read_json"].includes(op)) {
      if (!path) throw new Error(`Operation ${op} requires a path`);
      return { op, path };
    }
    throw new Error(`Unsupported hive operation "${op}"`);
  });
  return operations.length
    ? {
        executor: "zo.bounded.v1",
        mode: "non_mutating",
        operations,
      }
    : { executor: "zo.bounded.v1", mode: "non_mutating", operations: [] };
}

function sortBacklog(backlog) {
  return {
    ...backlog,
    items: [...(backlog.items || [])].sort((a, b) => {
      const statusCompare = String(a.status).localeCompare(String(b.status));
      if (statusCompare) return statusCompare;
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    }),
  };
}

function entry(value, ts) {
  return { ts, value };
}

function stamp() {
  return new Date().toISOString().replace(/[-:.]/g, "").replace("Z", "Z");
}

function safeName(value) {
  return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function renderReport(backlog) {
  const lines = [
    "# Hive Backlog",
    "",
    `Updated: ${backlog.updated_at}`,
    "",
    backlog.purpose,
    "",
    "## Templates",
    "",
    "| Template | Mode | Purpose |",
    "|---|---|---|",
    ...backlog.templates.map((template) => `| \`${cell(template.id)}\` | \`${cell(template.default_mode)}\` | ${cell(template.purpose)} |`),
    "",
    "## Items",
    "",
  ];
  if (!backlog.items.length) {
    lines.push("_No hive backlog items yet._", "");
  } else {
    lines.push("| ID | Status | Node | Priority | Mode | Title |", "|---|---|---|---|---|---|");
    for (const item of backlog.items) {
      lines.push(
        `| \`${cell(item.id)}\` | ${cell(item.status)} | \`${cell(item.target_node)}\` | ${cell(item.priority)} | \`${cell(item.mode)}\` | ${cell(item.title)} |`,
      );
    }
    lines.push("");
    for (const item of backlog.items) {
      lines.push(`### ${item.title}`, "");
      lines.push(`- ID: \`${item.id}\``);
      lines.push(`- Contract: ${item.contract_path ? `\`${item.contract_path}\`` : "_not emitted_"}`);
      lines.push(`- Summary: ${item.summary}`);
      if (item.acceptance?.length) lines.push(`- Acceptance: ${item.acceptance.join("; ")}`);
      if (item.dispatches?.length) {
        const latest = item.dispatches[item.dispatches.length - 1];
        lines.push(
          `- Latest dispatch: ${latest.ts} to \`${latest.instance}\` (${latest.dry_run ? "dry-run" : "live"}, ok=${latest.ok})`,
        );
      }
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
  }
  lines.push(
    "## Commands",
    "",
    "```powershell",
    "npm run hive:backlog",
    'npm run hive:backlog:add -- --title "Verify Telechurch talkback" --summary "Run a non-mutating ratification test" --acceptance "talkback returned;registry updated"',
    'npm run hive:backlog:add -- --title "List Zo factory scripts" --summary "Run a bounded remote list_dir operation" --operation "list_dir:/home/workspace/refer-zo-bootstrap/scripts/factory"',
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
  npm run hive:backlog
  npm run hive:backlog:init
  npm run hive:backlog:add -- --title "..." --summary "..."
  npm run hive:contract -- --id <item-id>
  npm run hive:dispatch -- --id <item-id> [--dry-run] [--trigger] [--fetch]
  npm run hive:validate-talkback -- --id <item-id> [--talkback <decoded.json>]
  npm run hive:record -- --id <item-id> [--status ...] [--evidence ...] [--note ...]

Outputs:
  ${resolve(BACKLOG_FILE)}
  ${resolve(REPORT_FILE)}
  ${resolve(CONTRACT_OUTBOX)}
  ${resolve(VALIDATION_DIR)}`);
}

const args = parseArgs(process.argv.slice(2));
const startedAt = new Date().toISOString();
try {
  let result;
  if (args.command === "init") result = initBacklog();
  else if (args.command === "report") result = initBacklog();
  else if (args.command === "add") result = addItem(args);
  else if (args.command === "contract") result = emitContract(args);
  else if (args.command === "dispatch") result = dispatchItem(args);
  else if (args.command === "validate-talkback") result = validateTalkback(args);
  else if (args.command === "record") result = recordItem(args);
  else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
  appendProcessEvent(createProcessEvent(args, startedAt, "completed", result));
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else if (args.command === "report" || args.command === "init") console.log(`Wrote ${resolve(BACKLOG_FILE)} and ${resolve(REPORT_FILE)}`);
  else console.log(JSON.stringify(result, null, 2));
} catch (error) {
  appendProcessEvent(createProcessEvent(args, startedAt, "failed", null, error));
  console.error(error?.message || String(error));
  process.exit(1);
}

function createProcessEvent(args, startedAt, status, result, error = null) {
  const elapsedMs = Date.now() - Date.parse(startedAt);
  const idPart = result?.item?.id || result?.id || args.id || stamp();
  return {
    id: `hive-director.${args.command}.${safeName(idPart)}.${Date.now()}`,
    script_name: `hive-director:${args.command}`,
    status,
    started_at: startedAt,
    elapsed_ms: elapsedMs,
    dominant_gear: "factory",
    output_target:
      args.command === "dispatch"
        ? `${BACKLOG_FILE}; refer-zo-bootstrap/datasets/tandem-dispatch/reports`
        : BACKLOG_FILE,
    efficiency_state: status === "failed" ? "blocked" : "normal",
    message:
      status === "failed"
        ? `Hive director ${args.command} failed.`
        : `Hive director ${args.command} completed.`,
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
