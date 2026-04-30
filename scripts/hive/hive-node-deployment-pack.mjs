#!/usr/bin/env node
/**
 * Hive Node Deployment Pack
 *
 * Builds a source-side deployment checklist for a hive node from the node
 * registry. The pack is intentionally non-mutating: it names the files,
 * datasets, checks, and ratification contracts required before a new Zo
 * computer can be treated as staged.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const REGISTRY_FILE = ".refer-factory/hive-node-registry.json";
const PACK_DIR = ".refer-factory/hive-deployment-packs";

const TANDEM_RUNTIME_FILES = [
  "scripts/factory/compression-codec.mjs",
  "scripts/factory/token-log-bridge.mjs",
  "scripts/factory/contract-inbox-runner.mjs",
  "scripts/factory/backfill-zo-local-usage.mjs",
  "docs/file-transport-tandem.md",
  "datasets/tandem-contracts/README.md",
  "datasets/tandem-contracts/datapackage.json",
  "datasets/tandem-talkback/README.md",
  "datasets/tandem-talkback/datapackage.json",
  "datasets/tandem-dispatch/README.md",
  "datasets/tandem-dispatch/datapackage.json",
  "datasets/tandem-usage/README.md",
  "datasets/tandem-usage/datapackage.json",
];

const GOVERNANCE_FILES = [
  "AGENTS.md",
  "docs/file-transport-tandem.md",
  "docs/known-limits-and-constraints.md",
  "docs/parallel-factory-orchestration.md",
  "docs/factory-topology.md",
  "law/REFER.OS/refer.factory.md",
  "law/REFER.OS/refer.zo.md",
];

function parseArgs(argv) {
  const args = {
    command: argv[0] || "build",
    id: "alliance",
    remoteRoot: "/home/workspace",
    json: false,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--id" && value) args.id = value, i += 1;
    else if (key === "--remote-root" && value) args.remoteRoot = value, i += 1;
    else if (key === "--json") args.json = true;
  }
  return args;
}

function readRegistry() {
  if (!existsSync(REGISTRY_FILE)) throw new Error(`Missing hive registry: ${REGISTRY_FILE}`);
  return JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));
}

function findNode(registry, id) {
  const node = (registry.nodes || []).find((entry) => entry.id === id || entry.instance === id);
  if (!node) throw new Error(`Unknown hive node "${id}"`);
  return node;
}

function buildPack(args) {
  const registry = readRegistry();
  const node = findNode(registry, args.id);
  const remoteRoot = args.remoteRoot.replace(/\/+$/g, "");
  const files = [...new Set([...TANDEM_RUNTIME_FILES, ...GOVERNANCE_FILES])].map((path) => {
    const local = join("refer-zo-bootstrap", path);
    return {
      local,
      remote: `${remoteRoot}/refer-zo-bootstrap/${path.replace(/\\/g, "/")}`,
      exists: existsSync(local),
      kind: path.startsWith("datasets/") ? "dataset-metadata" : path.startsWith("docs/") ? "doc" : "runtime",
    };
  });
  const missing = files.filter((file) => !file.exists).map((file) => file.local);
  const pack = {
    schema: "refer.hive.node-deployment-pack.v1",
    created_at: new Date().toISOString(),
    node: {
      id: node.id,
      name: node.name,
      kind: node.kind,
      role: node.role,
      account: node.account,
      instance: node.instance,
      status: node.status,
      transport: node.transport,
      persona: node.persona,
      rules: node.rules,
    },
    authority: {
      source_repo: "refer-script-factory",
      zo_repo: "refer-zo-bootstrap",
      registry: REGISTRY_FILE,
    },
    required_datasets: [
      "datasets/tandem-contracts/inbox",
      "datasets/tandem-contracts/outbox",
      "datasets/tandem-talkback/inbox",
      "datasets/tandem-talkback/outbox",
      "datasets/tandem-dispatch/reports",
      "datasets/tandem-usage",
    ],
    required_files: files,
    local_missing_files: missing,
    remote_health_checks: [
      "cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/compression-codec.mjs",
      "cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/token-log-bridge.mjs",
      "cd /home/workspace/refer-zo-bootstrap && node --check scripts/factory/contract-inbox-runner.mjs",
      "cd /home/workspace/refer-zo-bootstrap && node scripts/factory/compression-codec.mjs self-test",
    ],
    local_commands: {
      syntax: "npm --prefix refer-zo-bootstrap run check",
      codec: "npm --prefix refer-zo-bootstrap run codec:self-test",
      sync_runtime: `npm --prefix refer-zo-bootstrap run tandem:sync-runtime -- --instance ${node.instance} --preset all --check`,
      dry_dispatch: `npm run hive:dispatch -- --id <ratification-item-id> --dry-run`,
      live_dispatch: `npm run hive:dispatch -- --id <ratification-item-id> --trigger --fetch`,
      validate_talkback: `npm run hive:validate-talkback -- --id <ratification-item-id>`,
      heartbeat: `npm run hive:registry:heartbeat -- --id ${node.id} --status ratifying --activity recent_activity --evidence "deployment pack ratification passed"`,
    },
    ratification_contracts: [
      {
        title: `Ratify ${node.name} transport`,
        template: "ratification-test",
        operation: "file_exists:/home/workspace/refer-zo-bootstrap/package.json",
        acceptance: [
          "contract ships through file/API lane",
          "talkback returns status done",
          "talkback validates with root hive director",
        ],
      },
      {
        title: `Ratify ${node.name} bounded execution`,
        template: "ratification-test",
        operations: [
          "file_exists:/home/workspace/refer-zo-bootstrap/package.json",
          "list_dir:/home/workspace/refer-zo-bootstrap/scripts/factory",
        ],
        acceptance: [
          "executor:zo.bounded.v1 evidence returned",
          "file_exists returns true",
          "list_dir returns factory script entries",
        ],
      },
    ],
    ready_to_stage: missing.length === 0 && node.status !== "blocked",
    next: missing.length
      ? "add missing local deployment files before attempting node sync"
      : "sync runtime to node, run remote checks, dispatch ratification contracts, validate talkback, then update hive registry",
  };
  writePack(pack);
  return pack;
}

function writePack(pack) {
  mkdirSync(PACK_DIR, { recursive: true });
  const stem = safeName(pack.node.id);
  const jsonPath = join(PACK_DIR, `${stem}.json`);
  const mdPath = join(PACK_DIR, `${stem}.md`);
  writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(pack), "utf8");
  pack.files = { json: jsonPath, markdown: mdPath };
}

function renderMarkdown(pack) {
  const lines = [
    `# Hive Node Deployment Pack: ${pack.node.name}`,
    "",
    `Created: ${pack.created_at}`,
    "",
    "## Node",
    "",
    `- ID: \`${pack.node.id}\``,
    `- Instance: \`${pack.node.instance}\``,
    `- Account: \`${pack.node.account}\``,
    `- Status: \`${pack.node.status}\``,
    `- Role: ${pack.node.role}`,
    `- Transport: \`${pack.node.transport}\``,
    `- Ready to stage: \`${pack.ready_to_stage}\``,
    "",
    "## Required Datasets",
    "",
    ...pack.required_datasets.map((dataset) => `- \`${dataset}\``),
    "",
    "## Required Files",
    "",
    "| Exists | Kind | Local | Remote |",
    "|---|---|---|---|",
    ...pack.required_files.map(
      (file) => `| ${file.exists ? "yes" : "no"} | ${file.kind} | \`${cell(file.local)}\` | \`${cell(file.remote)}\` |`,
    ),
    "",
  ];
  if (pack.local_missing_files.length) {
    lines.push("## Missing Local Files", "", ...pack.local_missing_files.map((file) => `- \`${file}\``), "");
  }
  lines.push(
    "## Remote Health Checks",
    "",
    ...pack.remote_health_checks.map((check) => `- \`${cell(check)}\``),
    "",
    "## Local Commands",
    "",
    ...Object.entries(pack.local_commands).map(([name, command]) => `- ${name}: \`${cell(command)}\``),
    "",
    "## Ratification Contracts",
    "",
  );
  for (const contract of pack.ratification_contracts) {
    lines.push(`### ${contract.title}`, "", `- Template: \`${contract.template}\``);
    if (contract.operation) lines.push(`- Operation: \`${contract.operation}\``);
    if (contract.operations) lines.push(`- Operations: ${contract.operations.map((op) => `\`${op}\``).join(", ")}`);
    lines.push(`- Acceptance: ${contract.acceptance.join("; ")}`, "");
  }
  lines.push("## Next", "", pack.next, "");
  return `${lines.join("\n")}\n`;
}

function safeName(value) {
  return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function cell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function printUsage() {
  console.log(`Usage:
  npm run hive:deployment-pack -- --id alliance

Outputs:
  ${resolve(PACK_DIR)}`);
}

const args = parseArgs(process.argv.slice(2));
try {
  if (args.command === "build") {
    const pack = buildPack(args);
    if (args.json) console.log(JSON.stringify(pack, null, 2));
    else console.log(`Wrote ${resolve(PACK_DIR, `${safeName(pack.node.id)}.json`)} and ${resolve(PACK_DIR, `${safeName(pack.node.id)}.md`)}`);
  } else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}
