#!/usr/bin/env node
/**
 * Hive Node Registry
 *
 * Tracks Zo computers and factory nodes that participate in the hive proving
 * loop. This is a local source-of-truth artifact for build direction; live Zo
 * instances can ratify entries through tandem contracts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const REGISTRY_FILE = ".refer-factory/hive-node-registry.json";
const REPORT_FILE = ".refer-factory/hive-node-registry.md";

const DEFAULT_REGISTRY = {
  schema: "refer.hive.node-registry.v1",
  updated_at: "",
  purpose:
    "Track hive-capable factory and Zo computer nodes, their roles, deployment state, and ratification evidence.",
  nodes: [],
};

function parseArgs(argv) {
  const args = {
    command: argv[0] || "report",
    id: "",
    name: "",
    kind: "zo_computer",
    role: "",
    account: "",
    instance: "",
    status: "planned",
    transport: "file_api_tandem",
    persona: "unknown",
    rules: "unknown",
    datasets: "",
    scripts: "",
    evidence: "",
    note: "",
    activity: "",
    heartbeatPolicy: "",
    output: "text",
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--id" && value) args.id = value, i += 1;
    else if (key === "--name" && value) args.name = value, i += 1;
    else if (key === "--kind" && value) args.kind = value, i += 1;
    else if (key === "--role" && value) args.role = value, i += 1;
    else if (key === "--account" && value) args.account = value, i += 1;
    else if (key === "--instance" && value) args.instance = value, i += 1;
    else if (key === "--status" && value) args.status = value, i += 1;
    else if (key === "--transport" && value) args.transport = value, i += 1;
    else if (key === "--persona" && value) args.persona = value, i += 1;
    else if (key === "--rules" && value) args.rules = value, i += 1;
    else if (key === "--datasets" && value) args.datasets = value, i += 1;
    else if (key === "--scripts" && value) args.scripts = value, i += 1;
    else if (key === "--evidence" && value) args.evidence = value, i += 1;
    else if (key === "--note" && value) args.note = value, i += 1;
    else if (key === "--activity" && value) args.activity = value, i += 1;
    else if (key === "--heartbeat-policy" && value) args.heartbeatPolicy = value, i += 1;
    else if (key === "--json") args.output = "json";
  }
  return args;
}

function readRegistry() {
  if (!existsSync(REGISTRY_FILE)) return { ...DEFAULT_REGISTRY, nodes: [] };
  return normalizeRegistry(JSON.parse(readFileSync(REGISTRY_FILE, "utf8")));
}

function normalizeRegistry(registry) {
  return {
    ...registry,
    nodes: (registry.nodes || []).map((node) => ({
      ...node,
      heartbeat: node.heartbeat || nextHeartbeat(null, node.status, node.status === "planned" ? "planned" : "watch", "adaptive"),
    })),
  };
}

function writeRegistry(registry) {
  registry.updated_at = new Date().toISOString();
  mkdirSync(dirname(REGISTRY_FILE), { recursive: true });
  writeFileSync(REGISTRY_FILE, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  writeFileSync(REPORT_FILE, renderReport(registry), "utf8");
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function upsertNode(args) {
  const registry = readRegistry();
  const id = args.id || args.instance || slug(args.name);
  if (!id) throw new Error("upsert requires --id, --instance, or --name");
  const now = new Date().toISOString();
  const existing = registry.nodes.find((node) => node.id === id);
  const base = existing || {
    id,
    created_at: now,
    evidence: [],
    notes: [],
    datasets: [],
    scripts: [],
  };
  const next = {
    ...base,
    name: args.name || base.name || id,
    kind: args.kind || base.kind,
    role: args.role || base.role || "",
    account: args.account || base.account || "",
    instance: args.instance || base.instance || id,
    status: args.status || base.status || "planned",
    transport: args.transport || base.transport || "file_api_tandem",
    persona: args.persona || base.persona || "unknown",
    rules: args.rules || base.rules || "unknown",
    last_seen_at: now,
    updated_at: now,
    datasets: mergeUnique(base.datasets, splitList(args.datasets)),
    scripts: mergeUnique(base.scripts, splitList(args.scripts)),
    heartbeat: nextHeartbeat(base.heartbeat, args.status, args.activity, args.heartbeatPolicy),
    evidence: args.evidence ? [...(base.evidence || []), evidence(args.evidence, now)] : base.evidence || [],
    notes: args.note ? [...(base.notes || []), note(args.note, now)] : base.notes || [],
  };
  registry.nodes = existing
    ? registry.nodes.map((node) => (node.id === id ? next : node))
    : [...registry.nodes, next];
  writeRegistry(sortRegistry(registry));
  return next;
}

function heartbeatNode(args) {
  const registry = readRegistry();
  const id = args.id || args.instance;
  if (!id) throw new Error("heartbeat requires --id or --instance");
  const node = registry.nodes.find((entry) => entry.id === id || entry.instance === id);
  if (!node) throw new Error(`Unknown hive node "${id}"`);
  const now = new Date().toISOString();
  node.last_seen_at = now;
  node.status = args.status || node.status || "active";
  node.heartbeat = nextHeartbeat(node.heartbeat, node.status, args.activity, args.heartbeatPolicy);
  node.updated_at = now;
  if (args.evidence) node.evidence = [...(node.evidence || []), evidence(args.evidence, now)];
  if (args.note) node.notes = [...(node.notes || []), note(args.note, now)];
  writeRegistry(sortRegistry(registry));
  return node;
}

function initRegistry() {
  const registry = readRegistry();
  if (!registry.nodes.some((node) => node.id === "telechurch")) {
    registry.nodes.push({
      id: "telechurch",
      name: "Telechurch Zo",
      kind: "zo_computer",
      role: "first hive proving node",
      account: "zo:telechurch",
      instance: "telechurch",
      status: "ratifying",
      transport: "file_api_tandem",
      persona: "installed",
      rules: "installed",
      datasets: ["tandem-contracts", "tandem-talkback", "tandem-dispatch", "tandem-usage"],
      scripts: ["contract-inbox-runner", "ship-contract-to-zo", "fetch-zo-talkback", "dispatch-contract"],
      evidence: [evidence("live tandem dispatch verified through file/API lane", new Date().toISOString())],
      notes: [note("Zo chat should stay minimal; use Files/API contracts and talkback.", new Date().toISOString())],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      heartbeat: nextHeartbeat(null, "ratifying", "recent_activity", "adaptive"),
    });
  }
  if (!registry.nodes.some((node) => node.id === "codex-script-factory")) {
    registry.nodes.push({
      id: "codex-script-factory",
      name: "Codex Script Factory",
      kind: "codex_factory",
      role: "director and provider-neutral doctrine source",
      account: "lightedcandle2018@gmail.com",
      instance: "refer-script-factory",
      status: "active",
      transport: "local_scripts",
      persona: "AGENTS.md",
      rules: "law/REFER.OS",
      datasets: ["chat-surface-token-useage", "hive-node-registry"],
      scripts: ["token-useage", "hive-node-registry"],
      evidence: [evidence("local token dashboard and script-first ledger active", new Date().toISOString())],
      notes: [note("Promote provider-neutral lessons from Zo back into this repo.", new Date().toISOString())],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      heartbeat: nextHeartbeat(null, "active", "active_build", "adaptive"),
    });
  }
  writeRegistry(sortRegistry(registry));
  return registry;
}

const HEARTBEAT_INTERVALS = {
  active_build: 5 * 60 * 1000,
  ratifying: 15 * 60 * 1000,
  watch: 60 * 60 * 1000,
  idle: 6 * 60 * 60 * 1000,
  dormant: 24 * 60 * 60 * 1000,
};

function nextHeartbeat(existing, status, activity, policyName) {
  const policy = policyName || existing?.policy || "adaptive";
  const nowMs = Date.now();
  const mode = classifyHeartbeatMode(status, activity);
  const intervalMs = HEARTBEAT_INTERVALS[mode] || HEARTBEAT_INTERVALS.watch;
  return {
    policy,
    mode,
    activity: activity || existing?.activity || "",
    interval_ms: intervalMs,
    interval_label: formatDuration(intervalMs),
    max_interval_ms: HEARTBEAT_INTERVALS.dormant,
    max_interval_label: formatDuration(HEARTBEAT_INTERVALS.dormant),
    next_due_at: new Date(nowMs + intervalMs).toISOString(),
  };
}

function classifyHeartbeatMode(status, activity) {
  const value = `${status || ""} ${activity || ""}`.toLowerCase();
  if (/\b(active_build|building|dispatch|running|busy|hot)\b/.test(value)) return "active_build";
  if (/\b(ratifying|verify|testing|recent_activity)\b/.test(value)) return "ratifying";
  if (/\b(watch|planned|staging|pending|ready)\b/.test(value)) return "watch";
  if (/\b(idle|stable|quiet)\b/.test(value)) return "idle";
  if (/\b(dormant|retired|sleep|sleeping|archived)\b/.test(value)) return "dormant";
  return "watch";
}

function formatDuration(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

function sortRegistry(registry) {
  return {
    ...registry,
    nodes: [...registry.nodes].sort((a, b) => String(a.id).localeCompare(String(b.id))),
  };
}

function mergeUnique(a, b) {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}

function evidence(value, ts) {
  return { ts, value };
}

function note(value, ts) {
  return { ts, value };
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderReport(registry) {
  const lines = [
    "# Hive Node Registry",
    "",
    `Updated: ${registry.updated_at || new Date().toISOString()}`,
    "",
    registry.purpose,
    "",
    "| Node | Kind | Role | Status | Account | Instance | Last Seen | Next Pulse | Transport | Persona | Rules |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...registry.nodes.map(
      (node) =>
        `| ${cell(node.name || node.id)} | ${cell(node.kind)} | ${cell(node.role)} | ${cell(node.status)} | ${cell(node.account)} | ${cell(node.instance)} | ${cell(node.last_seen_at)} | ${cell(heartbeatSummary(node.heartbeat))} | ${cell(node.transport)} | ${cell(node.persona)} | ${cell(node.rules)} |`,
    ),
    "",
    "## Node Details",
    "",
  ];
  for (const node of registry.nodes) {
    lines.push(`### ${node.name || node.id}`, "");
    lines.push(`- ID: \`${node.id}\``);
    lines.push(`- Datasets: ${(node.datasets || []).map((item) => `\`${item}\``).join(", ") || "none"}`);
    lines.push(`- Scripts: ${(node.scripts || []).map((item) => `\`${item}\``).join(", ") || "none"}`);
    if (node.heartbeat) {
      lines.push(
        `- Heartbeat: \`${node.heartbeat.mode}\` every \`${node.heartbeat.interval_label}\` (max \`${node.heartbeat.max_interval_label}\`), next due \`${node.heartbeat.next_due_at}\``,
      );
    }
    const latestEvidence = (node.evidence || []).slice(-3);
    if (latestEvidence.length) {
      lines.push("- Evidence:");
      for (const item of latestEvidence) lines.push(`  - ${item.ts}: ${item.value}`);
    }
    const latestNotes = (node.notes || []).slice(-3);
    if (latestNotes.length) {
      lines.push("- Notes:");
      for (const item of latestNotes) lines.push(`  - ${item.ts}: ${item.value}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function heartbeatSummary(heartbeat) {
  if (!heartbeat) return "";
  return `${heartbeat.mode} / ${heartbeat.interval_label} / ${heartbeat.next_due_at}`;
}

function cell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function printUsage() {
  console.log(`Usage:
  npm run hive:registry:init
  npm run hive:registry
  npm run hive:registry:upsert -- --id alliance --name "Alliance Zo" --account zo:alliance --role "application build node"
  npm run hive:registry:heartbeat -- --id telechurch --status ratifying --activity recent_activity --evidence "dispatch verified"

Files:
  ${REGISTRY_FILE}
  ${REPORT_FILE}`);
}

const args = parseArgs(process.argv.slice(2));
try {
  let result;
  if (args.command === "init") result = initRegistry();
  else if (args.command === "upsert") result = upsertNode(args);
  else if (args.command === "heartbeat") result = heartbeatNode(args);
  else if (args.command === "report") {
    const registry = readRegistry();
    writeRegistry(sortRegistry(registry));
    result = readRegistry();
  } else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
  if (args.output === "json") console.log(JSON.stringify(result, null, 2));
  else console.log(`Wrote ${resolve(REGISTRY_FILE)} and ${resolve(REPORT_FILE)}`);
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}
