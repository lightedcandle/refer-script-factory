import fs from "node:fs";
import path from "node:path";
import { resolveAuthority } from "../reference/authority-resolver.mjs";

const root = process.cwd();

function normalize(value) {
  return String(value ?? "").trim();
}

function slug(value) {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "rule";
}

function idStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function readSource(args) {
  if (args.source) {
    const sourcePath = path.resolve(root, args.source);
    const relative = path.relative(root, sourcePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("source escapes workspace root");
    }
    return {
      kind: "document",
      path: args.source,
      text: fs.readFileSync(sourcePath, "utf8"),
    };
  }
  return {
    kind: "prompt",
    path: null,
    text: args.rule || "User provided a rule.",
  };
}

function classify(text, explicitDomain = "") {
  const haystack = `${explicitDomain} ${text}`.toLowerCase();
  if (haystack.includes("smart intake") || haystack.includes("script factory") || haystack.includes("kernel")) {
    return { classification: "kernel_rule", domain: explicitDomain || "script-factory" };
  }
  if (haystack.includes("stripe") || haystack.includes("checkout") || haystack.includes("payment")) {
    return { classification: "domain_rule", domain: "stripe" };
  }
  if (haystack.includes("cloudflare") || haystack.includes("worker") || haystack.includes("pages")) {
    return { classification: "provider_rule", domain: "cloudflare" };
  }
  if (haystack.includes("openai") || haystack.includes("model") || haystack.includes("chatgpt")) {
    return { classification: "provider_rule", domain: "openai" };
  }
  if (haystack.includes("ui") || haystack.includes("design") || haystack.includes("button") || haystack.includes("layout")) {
    return { classification: "user_method_rule", domain: explicitDomain || "ui" };
  }
  if (explicitDomain) {
    return { classification: "project_rule", domain: explicitDomain };
  }
  return { classification: "inactive_source", domain: "local" };
}

function extractInvariant(text) {
  const compact = normalize(text).replace(/\s+/g, " ");
  const sentences = compact.split(/(?<=[.!?])\s+/).filter(Boolean);
  const candidate =
    sentences.find((line) => /\b(must|should|always|never|require|prefer|use|do not|don't)\b/i.test(line)) ??
    sentences[0] ??
    compact;
  return candidate.slice(0, 500);
}

function triggerFor(classification, domain, invariant) {
  if (classification === "kernel_rule") return "script factory smart intake deterministic governance";
  if (classification === "domain_rule" || classification === "provider_rule") return `${domain} ${slug(invariant).replace(/-/g, " ")}`;
  if (classification === "user_method_rule") return `user method ${domain}`;
  if (classification === "project_rule") return `project ${domain}`;
  return "manual activation";
}

function scriptClassFor(classification, domain) {
  if (classification === "kernel_rule") return "Governing Script";
  if (classification === "domain_rule" || classification === "provider_rule") return "Domain Script";
  if (domain === "ui") return "UI Script";
  if (classification === "inactive_source") return "Validator Script";
  return "Resolver Script";
}

function buildCandidate(source, args) {
  const invariant = extractInvariant(source.text);
  const { classification, domain } = classify(source.text, args.domain);
  const authorityPacket = resolveAuthority(`${args.rule ?? ""} ${invariant}`, domain);
  const scriptClass = scriptClassFor(classification, domain);
  const candidateSlug = slug(`${domain}-${invariant}`);
  const now = new Date().toISOString();

  return {
    schema_version: 1,
    candidate_id: `doctrine.${candidateSlug}.${idStamp()}`,
    created_at: now,
    source: {
      kind: source.kind,
      path: source.path,
      excerpt: invariant,
    },
    natural_rule_intake: {
      received_as: source.kind === "document" ? "uploaded_or_pointed_document" : "prompt_rule",
      user_label_required: false,
    },
    classification,
    domain,
    activation_trigger: triggerFor(classification, domain, invariant),
    invariant,
    authority_packet: authorityPacket,
    script_blueprint: {
      script_id: `candidate.${candidateSlug}`,
      script_class: scriptClass,
      intended_effect: `Enforce or apply rule: ${invariant}`,
      allowed_boundary: "Candidate only. No active governance until fixtures pass and registry promotion occurs.",
      reads: source.path ? [source.path, ".refer-factory/authority/latest.json"] : ["natural-rule-intake", ".refer-factory/authority/latest.json"],
      writes: [".refer-factory/doctrine-candidates/**"],
      locks: [`.refer-factory/doctrine-candidates/${candidateSlug}`],
    },
    fixtures: [
      {
        id: `${candidateSlug}.positive`,
        given: `A request matching trigger: ${triggerFor(classification, domain, invariant)}`,
        expect: `Candidate rule applies: ${invariant}`,
      },
      {
        id: `${candidateSlug}.inactive-until-promoted`,
        given: "Candidate has not been promoted.",
        expect: "Rule remains inactive and does not control builds.",
      },
    ],
    sequence: {
      rank: "SEQ-F",
      sub_sequence: ["SEQ-F"],
      conditional_action: "continue",
    },
    status: "candidate",
  };
}

function writeMarkdown(candidate, target) {
  const lines = [
    "# Doctrine Candidate",
    "",
    `Generated: ${candidate.created_at}`,
    `Candidate: ${candidate.candidate_id}`,
    `Classification: ${candidate.classification}`,
    `Domain: ${candidate.domain}`,
    `Status: ${candidate.status}`,
    "",
    "## Invariant",
    candidate.invariant,
    "",
    "## Activation Trigger",
    candidate.activation_trigger,
    "",
    "## Script Blueprint",
    `- Script: \`${candidate.script_blueprint.script_id}\``,
    `- Class: ${candidate.script_blueprint.script_class}`,
    `- Intended effect: ${candidate.script_blueprint.intended_effect}`,
    `- Boundary: ${candidate.script_blueprint.allowed_boundary}`,
    "",
    "## Fixtures",
    ...candidate.fixtures.map((fixture) => `- ${fixture.id}: ${fixture.expect}`),
    "",
  ];
  fs.writeFileSync(target, lines.join("\n"), "utf8");
}

function writeCandidate(candidate) {
  const dir = path.join(root, ".refer-factory", "doctrine-candidates");
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "latest.json");
  const mdPath = path.join(dir, "latest.md");
  const candidatePath = path.join(dir, `${candidate.candidate_id}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
  fs.writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
  writeMarkdown(candidate, mdPath);
  return { jsonPath, mdPath, candidatePath };
}

function parseArgs() {
  const args = process.argv.slice(3);
  const parsed = { rule: "", source: "", domain: "" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--rule") {
      parsed.rule = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--source") {
      parsed.source = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--domain") {
      parsed.domain = args[index + 1] ?? "";
      index += 1;
    }
  }
  if (!parsed.rule && !parsed.source) {
    parsed.rule = args.join(" ") || "Rules should be compiled before they become active.";
  }
  return parsed;
}

export function compileDoctrine(args) {
  const source = readSource(args);
  return buildCandidate(source, args);
}

const command = process.argv[2] ?? "compile";

if (command === "compile") {
  const candidate = compileDoctrine(parseArgs());
  const paths = writeCandidate(candidate);
  console.log(`Wrote ${paths.jsonPath}`);
  console.log(`Wrote ${paths.mdPath}`);
  console.log(`Wrote ${paths.candidatePath}`);
} else if (command === "sample") {
  console.log(JSON.stringify(compileDoctrine({ rule: "Stripe checkout must use official Stripe docs before script generation.", domain: "stripe" }), null, 2));
} else if (command === "report") {
  const file = path.join(root, ".refer-factory", "doctrine-candidates", "latest.json");
  if (!fs.existsSync(file)) {
    console.log("No doctrine candidate found.");
  } else {
    const candidate = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`${candidate.candidate_id} | ${candidate.classification} | ${candidate.domain} | ${candidate.status}`);
    console.log(candidate.invariant);
  }
} else {
  throw new Error(`Unknown command: ${command}`);
}
