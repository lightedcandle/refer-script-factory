#!/usr/bin/env node
/**
 * Domain Script Registry
 *
 * Builds a domain-scoped index of scripts that agents should check before
 * improvising. This complements the provider-neutral TypeScript source registry in
 * src/contracts/scriptFactory.ts; it tracks operational scripts for the active
 * chat surface, hive, and Zo bootstrap sibling.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const JSON_FILE = ".refer-factory/script-registry.json";
const MD_FILE = ".refer-factory/script-registry.md";

const DOMAINS = [
  {
    id: "refer-script-factory",
    label: "REFER Script Factory",
    scope: "Provider-neutral TypeScript source and doctrine, plus current host-adapter registrations.",
    authority: "src/contracts/scriptFactory.ts",
    check_first: ["src/contracts/scriptFactory.ts", "docs/script-legend.md", "package.json"],
    scripts: [
      {
        id: "refer.extension.script-registry",
        command: "source registry",
        entrypoint: "src/contracts/scriptFactory.ts",
        purpose: "Authoritative provider-neutral script contract registry with accurately labeled current host-adapter entries.",
        status: "active",
      },
    ],
  },
  {
    id: "chat-surface",
    label: "Current Chat Surface",
    scope: "Token tracking, script-use logging, current-context reset, and chat-surface self-observation.",
    authority: ".refer-factory/script-registry.json",
    check_first: ["docs/chat-surface-scripts.md", "scripts/chat-surface/", "package.json"],
    scripts: [
      {
        id: "chat.tokens",
        command: "npm run tokens:chat",
        entrypoint: "scripts/chat-surface/token-useage.mjs",
        purpose: "Log current Codex chat usage with 4 characters = 1 token estimates.",
        status: "active",
      },
      {
        id: "chat.tokens.reset",
        command: "npm run tokens:reset-chat",
        entrypoint: "scripts/chat-surface/token-useage.mjs",
        purpose: "Log a context ceiling marker and start the current context total fresh.",
        status: "active",
      },
      {
        id: "chat.tokens.script",
        command: "npm run tokens:script",
        entrypoint: "scripts/chat-surface/token-useage.mjs",
        purpose: "Record reusable script execution in the same usage ledger.",
        status: "active",
      },
      {
        id: "chat.tokens.backfill",
        command: "npm run tokens:backfill-chat",
        entrypoint: "scripts/chat-surface/token-useage.mjs",
        purpose: "Backfill zero-count current-chat ledger records with manual estimates.",
        status: "active",
      },
      {
        id: "chat.tokens.audit",
        command: "npm run tokens:audit-chat",
        entrypoint: "scripts/chat-surface/token-useage.mjs",
        purpose: "Report zero-count current-chat records that need measured or manual usage.",
        status: "active",
      },
    ],
  },
  {
    id: "hive",
    label: "Hive Director",
    scope: "Cross-node identity, hive build plan, node heartbeat, and ratification status.",
    authority: ".refer-factory/hive-node-registry.json",
    check_first: ["docs/hive-build-plan.md", ".refer-factory/hive-node-registry.md", "scripts/hive/"],
    scripts: [
      {
        id: "hive.node-registry",
        command: "npm run hive:registry",
        entrypoint: "scripts/hive/hive-node-registry.mjs",
        purpose: "Render the current hive node map from the JSON registry.",
        status: "active",
      },
      {
        id: "hive.node-upsert",
        command: "npm run hive:registry:upsert",
        entrypoint: "scripts/hive/hive-node-registry.mjs",
        purpose: "Add or update a hive/factory node with role, account, datasets, scripts, and state.",
        status: "active",
      },
      {
        id: "hive.node-heartbeat",
        command: "npm run hive:registry:heartbeat",
        entrypoint: "scripts/hive/hive-node-registry.mjs",
        purpose: "Record node liveness, status, and ratification evidence.",
        status: "active",
      },
      {
        id: "hive.backlog",
        command: "npm run hive:backlog",
        entrypoint: "scripts/hive/hive-director.mjs",
        purpose: "Render the typed hive backlog and contract queue.",
        status: "active",
      },
      {
        id: "hive.contract",
        command: "npm run hive:contract",
        entrypoint: "scripts/hive/hive-director.mjs",
        purpose: "Emit a root-authoritative hive contract from a backlog item.",
        status: "active",
      },
      {
        id: "hive.dispatch",
        command: "npm run hive:dispatch",
        entrypoint: "scripts/hive/hive-director.mjs",
        purpose: "Dispatch a typed hive contract through the appropriate node lane and record evidence.",
        status: "active",
      },
      {
        id: "hive.validate-talkback",
        command: "npm run hive:validate-talkback",
        entrypoint: "scripts/hive/hive-director.mjs",
        purpose: "Validate decoded talkback against the typed hive contract before ratification.",
        status: "active",
      },
      {
        id: "hive.build-intake",
        command: "npm run hive:build-intake",
        entrypoint: "scripts/hive/hive-build-intake.mjs",
        purpose: "Emit and dispatch governed build-intake envelopes so Zo route changes originate from typed intake evidence.",
        status: "active",
      },
      {
        id: "hive.deployment-pack",
        command: "npm run hive:deployment-pack",
        entrypoint: "scripts/hive/hive-node-deployment-pack.mjs",
        purpose: "Build a non-mutating deployment checklist for staging and ratifying a hive node.",
        status: "active",
      },
      {
        id: "hive.ratify-routes",
        command: "npm run hive:ratify-routes",
        entrypoint: "scripts/hive/hive-route-ratifier.mjs",
        purpose: "Capture live zo.space route state for a hive node and record upstream ratification evidence.",
        status: "active",
      },
    ],
  },
  {
    id: "alliance-hub",
    label: "Alliance Hub",
    scope: "Telechurchlive Alliance app source, Cloudflare Pages/Functions, Supabase migrations, SMS routing, formula/retrieval flows.",
    authority: "alliance-hub/AGENTS.md",
    check_first: [
      "alliance-hub/AGENTS.md",
      "alliance-hub/package.json",
      "alliance-hub/tools/",
      "alliance-hub/scripts/sms/",
      "alliance-hub/supabase/migrations/",
      "alliance-hub/docs/records-split-sequence.md",
    ],
    scripts: [
      {
        id: "alliance.hub.check",
        command: "npm --prefix alliance-hub run check",
        entrypoint: "alliance-hub/tools/check.mjs",
        purpose: "Verify required app files, SMS registry, inbound route behavior, form intake, and conversation routing.",
        status: "active",
      },
      {
        id: "alliance.hub.sms.validate",
        command: "npm --prefix alliance-hub run sms:validate",
        entrypoint: "alliance-hub/tools/sms-script-factory.mjs",
        purpose: "Validate the Alliance SMS script registry before changing SMS routing behavior.",
        status: "active",
      },
      {
        id: "alliance.hub.sms.route",
        command: "npm --prefix alliance-hub run sms:route -- --registered --text \"profile\"",
        entrypoint: "alliance-hub/tools/sms-script-factory.mjs",
        purpose: "Run focused SMS router probes against scripts/sms/router.mjs and registry.json.",
        status: "active",
      },
      {
        id: "alliance.hub.deploy.dry",
        command: "npm --prefix alliance-hub run deploy:dry",
        entrypoint: "alliance-hub/tools/deploy.mjs",
        purpose: "Build the Cloudflare Pages deploy packet from .env.alliance without deploying production.",
        status: "active",
      },
      {
        id: "alliance.hub.deploy.cloudflare",
        command: "npm --prefix alliance-hub run deploy",
        entrypoint: "alliance-hub/tools/deploy.mjs",
        purpose: "Deploy Alliance Hub to Cloudflare Pages only after explicit 'push to Cloudflare' or 'push all' approval.",
        status: "guarded",
      },
      {
        id: "alliance.hub.records.split",
        command: "source migrations",
        entrypoint: "alliance-hub/supabase/migrations/20260528164951_wave1_records_split.sql",
        purpose: "Record the verified alliance_records split method: keyed table first, legacy STI fallback during verification, mirror/backfill where needed.",
        status: "active",
      },
    ],
  },
  {
    id: "refer-zo-bootstrap",
    label: "REFER Zo Bootstrap",
    scope: "Zo computer bootstrap, file/API tandem, compression, dispatch, talkback, datasets, and live ratification.",
    authority: "refer-zo-bootstrap/scripts/factory/script-registry.json",
    check_first: [
      "refer-zo-bootstrap/AGENTS.md",
      "refer-zo-bootstrap/docs/file-transport-tandem.md",
      "refer-zo-bootstrap/scripts/factory/script-registry.json",
      "refer-zo-bootstrap/package.json",
    ],
    scripts: [
      {
        id: "zo.dispatch-contract",
        command: "npm --prefix refer-zo-bootstrap run dispatch:contract",
        entrypoint: "refer-zo-bootstrap/scripts/factory/dispatch-contract.mjs",
        purpose: "Ship a contract to Zo, optionally trigger the runner, and fetch talkback.",
        status: "active",
      },
      {
        id: "zo.sync-tandem-runtime",
        command: "npm --prefix refer-zo-bootstrap run tandem:sync-runtime",
        entrypoint: "refer-zo-bootstrap/scripts/factory/sync-tandem-runtime-to-zo.mjs",
        purpose: "Sync known tandem runtime files to a Zo computer through MCP/file API.",
        status: "active",
      },
      {
        id: "zo.codec-self-test",
        command: "npm --prefix refer-zo-bootstrap run codec:self-test",
        entrypoint: "refer-zo-bootstrap/scripts/factory/compression-codec.mjs",
        purpose: "Verify bidirectional machine compression/decompression before transport use.",
        status: "active",
      },
      {
        id: "zo.contract-runner",
        command: "npm --prefix refer-zo-bootstrap run contract:run-once",
        entrypoint: "refer-zo-bootstrap/scripts/factory/contract-inbox-runner.mjs",
        purpose: "Run one Zo-side inbox contract and emit talkback.",
        status: "active",
      },
      {
        id: "zo.adaptive-heartbeat",
        command: "node refer-zo-bootstrap/scripts/factory/heartbeat.mjs --status",
        entrypoint: "refer-zo-bootstrap/scripts/factory/heartbeat.mjs",
        purpose: "Run/status the Zo node-local adaptive heartbeat, tightening during work and relaxing up to a 24-hour dormant pulse.",
        status: "active",
      },
    ],
  },
];

function parseArgs(argv) {
  return {
    command: argv[0] || "build",
    json: argv.includes("--json"),
  };
}

function buildRegistry() {
  const packageScripts = readPackageScripts("package.json");
  const alliancePackageScripts = readPackageScripts("alliance-hub/package.json");
  const zoPackageScripts = readPackageScripts("refer-zo-bootstrap/package.json");
  return {
    schema: "refer.domain-script-registry.v1",
    updated_at: new Date().toISOString(),
    rule:
      "Before direct work, identify the domain and check that domain's registry/check_first surfaces for an existing script.",
    domains: DOMAINS.map((domain) => ({
      ...domain,
      discovered_package_scripts:
        domain.id === "refer-zo-bootstrap" ? zoPackageScripts : domain.id === "alliance-hub" ? alliancePackageScripts : domain.id === "refer-script-factory" ? packageScripts : [],
    })),
  };
}

function readPackageScripts(path) {
  if (!existsSync(path)) return [];
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  return Object.entries(parsed.scripts || {}).map(([name, command]) => ({ name, command }));
}

function writeRegistry(registry) {
  mkdirSync(dirname(JSON_FILE), { recursive: true });
  writeFileSync(JSON_FILE, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  writeFileSync(MD_FILE, renderMarkdown(registry), "utf8");
}

function renderMarkdown(registry) {
  const lines = [
    "# Domain Script Registry",
    "",
    `Updated: ${registry.updated_at}`,
    "",
    registry.rule,
    "",
    "## Domain Routing",
    "",
    "| Domain | Scope | Authority | Check First |",
    "|---|---|---|---|",
    ...registry.domains.map(
      (domain) =>
        `| ${cell(domain.label)} | ${cell(domain.scope)} | \`${cell(domain.authority)}\` | ${domain.check_first
          .map((item) => `\`${cell(item)}\``)
          .join("<br>")} |`,
    ),
    "",
    "## Scripts",
    "",
  ];
  for (const domain of registry.domains) {
    lines.push(`### ${domain.label}`, "");
    lines.push("| Script | Command | Entrypoint | Purpose | Status |");
    lines.push("|---|---|---|---|---|");
    for (const script of domain.scripts) {
      lines.push(
        `| \`${cell(script.id)}\` | \`${cell(script.command)}\` | \`${cell(script.entrypoint)}\` | ${cell(script.purpose)} | ${cell(script.status)} |`,
      );
    }
    if (domain.discovered_package_scripts?.length) {
      lines.push("", "Package scripts discovered in this domain:", "");
      for (const script of domain.discovered_package_scripts) {
        lines.push(`- \`${script.name}\`: \`${script.command}\``);
      }
    }
    lines.push("");
  }
  lines.push("## Files", "", `- JSON: \`${relative(process.cwd(), JSON_FILE) || JSON_FILE}\``, `- Markdown: \`${relative(process.cwd(), MD_FILE) || MD_FILE}\``, "");
  return `${lines.join("\n")}\n`;
}

function cell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function printUsage() {
  console.log(`Usage:
  npm run scripts:registry
  npm run scripts:registry -- --json

Outputs:
  ${resolve(JSON_FILE)}
  ${resolve(MD_FILE)}`);
}

const args = parseArgs(process.argv.slice(2));
try {
  if (args.command === "build") {
    const registry = buildRegistry();
    writeRegistry(registry);
    if (args.json) console.log(JSON.stringify(registry, null, 2));
    else console.log(`Wrote ${resolve(JSON_FILE)} and ${resolve(MD_FILE)}`);
  } else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}
