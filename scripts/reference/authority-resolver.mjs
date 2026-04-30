import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();

const knownAuthorities = [
  {
    domain: "stripe",
    match: ["stripe", "checkout", "payment", "subscription", "billing"],
    references: [
      {
        id: "stripe.docs",
        label: "Stripe Documentation",
        authority_class: "external",
        url: "https://docs.stripe.com/",
        source_path: null,
        scope: "Stripe API, Checkout, Billing, payments, and integration patterns.",
      },
      {
        id: "stripe.api",
        label: "Stripe API Reference",
        authority_class: "external",
        url: "https://docs.stripe.com/api",
        source_path: null,
        scope: "Stripe API object and endpoint reference.",
      },
    ],
  },
  {
    domain: "openai",
    match: ["openai", "chatgpt", "responses api", "assistant", "model"],
    references: [
      {
        id: "openai.docs",
        label: "OpenAI Documentation",
        authority_class: "external",
        url: "https://platform.openai.com/docs",
        source_path: null,
        scope: "OpenAI API and model integration reference.",
      },
    ],
  },
  {
    domain: "cloudflare",
    match: ["cloudflare", "workers", "pages", "r2", "durable object"],
    references: [
      {
        id: "cloudflare.docs",
        label: "Cloudflare Developer Docs",
        authority_class: "external",
        url: "https://developers.cloudflare.com/",
        source_path: null,
        scope: "Cloudflare Workers, Pages, R2, and platform services.",
      },
    ],
  },
  {
    domain: "script-factory",
    match: ["script factory", "refer", "forge", "script registry", "smart intake"],
    references: [
      {
        id: "script-factory.doctrine",
        label: "Factory System Doctrine",
        authority_class: "local",
        url: null,
        source_path: "docs/factory-system-doctrine.md",
        scope: "Provider-neutral Script Factory doctrine.",
      },
      {
        id: "script-factory.legend",
        label: "Script Legend",
        authority_class: "local",
        url: null,
        source_path: "docs/script-legend.md",
        scope: "Script Factory vocabulary, sequence, and deterministic rules.",
      },
    ],
  },
];

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function idStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

export function resolveAuthority(intent, explicitDomain = "") {
  const haystack = normalize(`${explicitDomain} ${intent}`);
  const matched = knownAuthorities.find((authority) =>
    authority.match.some((needle) => haystack.includes(needle)),
  );
  const now = new Date().toISOString();
  const domain = explicitDomain || matched?.domain || "unknown";

  if (matched) {
    return {
      schema_version: 1,
      authority_packet_id: `authority.${matched.domain}.${idStamp()}`,
      created_at: now,
      intent,
      domain: matched.domain,
      authority_state: matched.references.some((ref) => ref.authority_class === "external")
        ? "official"
        : "local",
      references: matched.references,
      created_authority: {
        required: false,
        reason: "",
        experiment_path: null,
      },
      lineage: {
        sequence_rank: "SEQ-D",
        script_id: "refer.authority.resolve",
        evidence: matched.references.map((reference) => reference.id),
      },
    };
  }

  return {
    schema_version: 1,
    authority_packet_id: `authority.created.${idStamp()}`,
    created_at: now,
    intent,
    domain,
    authority_state: "created",
    references: [
      {
        id: "created.local-experiment",
        label: "Created Local Authority Experiment",
        authority_class: "created",
        url: null,
        source_path: `.refer-factory/authority/experiments/${domain}.md`,
        scope: "Local experimental authority until an official or ratified local source exists.",
      },
    ],
    created_authority: {
      required: true,
      reason: "No known official or local authority matched the intent.",
      experiment_path: `.refer-factory/authority/experiments/${domain}.md`,
    },
    lineage: {
      sequence_rank: "SEQ-D",
      script_id: "refer.authority.resolve",
      evidence: ["created.local-experiment"],
    },
  };
}

function writeMarkdown(packet, target) {
  const lines = [
    "# Authority Reference Packet",
    "",
    `Generated: ${packet.created_at}`,
    `Intent: ${packet.intent}`,
    `Domain: ${packet.domain}`,
    `State: ${packet.authority_state}`,
    "",
    "| Reference | Class | URL | Source | Scope |",
    "| --- | --- | --- | --- | --- |",
    ...packet.references.map(
      (reference) =>
        `| ${reference.label} | ${reference.authority_class} | ${reference.url ?? ""} | ${reference.source_path ?? ""} | ${reference.scope} |`,
    ),
    "",
  ];
  fs.writeFileSync(target, lines.join("\n"), "utf8");
}

function writePacket(packet) {
  const dir = path.join(root, ".refer-factory", "authority");
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "latest.json");
  const mdPath = path.join(dir, "latest.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  writeMarkdown(packet, mdPath);
  return { jsonPath, mdPath };
}

function parseArgs() {
  const args = process.argv.slice(3);
  const parsed = { intent: "", domain: "" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--intent") {
      parsed.intent = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--domain") {
      parsed.domain = args[index + 1] ?? "";
      index += 1;
    }
  }
  if (!parsed.intent) {
    parsed.intent = args.join(" ") || "script factory";
  }
  return parsed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const command = process.argv[2] ?? "resolve";

  if (command === "resolve") {
    const args = parseArgs();
    const packet = resolveAuthority(args.intent, args.domain);
    const paths = writePacket(packet);
    console.log(`Wrote ${paths.jsonPath}`);
    console.log(`Wrote ${paths.mdPath}`);
  } else if (command === "sample") {
    console.log(JSON.stringify(resolveAuthority("Build Stripe checkout", "stripe"), null, 2));
  } else if (command === "report") {
    const file = path.join(root, ".refer-factory", "authority", "latest.json");
    if (!fs.existsSync(file)) {
      console.log("No authority packet found.");
    } else {
      const packet = JSON.parse(fs.readFileSync(file, "utf8"));
      console.log(`${packet.authority_packet_id} | ${packet.domain} | ${packet.authority_state}`);
      for (const reference of packet.references) {
        console.log(`${reference.id}: ${reference.url ?? reference.source_path}`);
      }
    }
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}
