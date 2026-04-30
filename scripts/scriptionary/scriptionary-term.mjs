import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidateDir = path.join(root, ".refer-factory", "scriptionary", "term-candidates");
const legendSource = path.join(root, "src", "contracts", "scriptLegend.ts");

function idStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function slug(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "term";
}

function parseArgs() {
  const args = process.argv.slice(3);
  const parsed = {
    term: "",
    plain: "",
    meaning: "",
    use: "",
    kind: "Term",
    effect: "",
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--term") {
      parsed.term = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--plain") {
      parsed.plain = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--meaning") {
      parsed.meaning = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--use") {
      parsed.use = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--kind") {
      parsed.kind = args[index + 1] ?? "Term";
      index += 1;
    } else if (arg === "--effect") {
      parsed.effect = args[index + 1] ?? "";
      index += 1;
    }
  }
  if (!parsed.term) throw new Error("--term is required");
  parsed.plain ||= parsed.term;
  parsed.meaning ||= `${parsed.term} is a discovered Script Factory vocabulary candidate.`;
  parsed.use ||= `Use ${parsed.term} only after it is defined, categorized, and promoted.`;
  parsed.effect ||= "New vocabulary became a reusable system effect or feature.";
  return parsed;
}

function termExists(term) {
  if (!fs.existsSync(legendSource)) return false;
  const source = fs.readFileSync(legendSource, "utf8");
  return new RegExp(`term:\\s*${JSON.stringify(term)}`).test(source);
}

function buildCandidate(args, status = "candidate") {
  const duplicate = termExists(args.term);
  return {
    schema_version: 1,
    candidate_id: `scriptionary.${slug(args.term)}.${idStamp()}`,
    created_at: new Date().toISOString(),
    term: args.term,
    plain_name: args.plain,
    meaning: args.meaning,
    deterministic_use: args.use,
    kind: args.kind,
    observed_effect: args.effect,
    sequence: {
      rank: "SEQ-L",
      sub_sequence: [],
      conditional_action: duplicate ? "block" : status === "promoted" ? "promote" : "continue",
    },
    status: duplicate ? "duplicate" : status,
  };
}

function writeMarkdown(candidate, target) {
  const lines = [
    "# Scriptionary Term Candidate",
    "",
    `Generated: ${candidate.created_at}`,
    `Candidate: ${candidate.candidate_id}`,
    `Status: ${candidate.status}`,
    `Kind: ${candidate.kind}`,
    "",
    `## ${candidate.term}`,
    `Plain English: ${candidate.plain_name}`,
    "",
    "## Meaning",
    candidate.meaning,
    "",
    "## Deterministic Use",
    candidate.deterministic_use,
    "",
    "## Observed Effect",
    candidate.observed_effect,
    "",
  ];
  fs.writeFileSync(target, lines.join("\n"), "utf8");
}

function writeCandidate(candidate) {
  fs.mkdirSync(candidateDir, { recursive: true });
  const jsonPath = path.join(candidateDir, "latest.json");
  const mdPath = path.join(candidateDir, "latest.md");
  const candidatePath = path.join(candidateDir, `${candidate.candidate_id}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
  fs.writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
  writeMarkdown(candidate, mdPath);
  return { jsonPath, mdPath, candidatePath };
}

function termObject(candidate) {
  return `      {
        term: ${JSON.stringify(candidate.term)},
        plain_name: ${JSON.stringify(candidate.plain_name)},
        meaning:
          ${JSON.stringify(candidate.meaning)},
        deterministic_use:
          ${JSON.stringify(candidate.deterministic_use)},
      },
`;
}

function promote(candidate) {
  if (candidate.status === "duplicate") {
    throw new Error(`Term already exists: ${candidate.term}`);
  }
  const source = fs.readFileSync(legendSource, "utf8");
  const marker = "      {\n        term: \"Script Factory\",";
  if (!source.includes(marker)) {
    throw new Error("Could not find Script Factory insertion marker in scriptLegend.ts");
  }
  const next = source.replace(marker, `${termObject(candidate)}${marker}`);
  fs.writeFileSync(legendSource, next, "utf8");
  const promoted = {
    ...candidate,
    status: "promoted",
    sequence: {
      ...candidate.sequence,
      conditional_action: "promote",
    },
  };
  writeCandidate(promoted);
  return promoted;
}

function report() {
  const latest = path.join(candidateDir, "latest.json");
  if (!fs.existsSync(latest)) {
    console.log("No scriptionary term candidate found.");
    return;
  }
  const candidate = JSON.parse(fs.readFileSync(latest, "utf8"));
  console.log(`${candidate.candidate_id} | ${candidate.term} | ${candidate.kind} | ${candidate.status}`);
}

const command = process.argv[2] ?? "candidate";

if (command === "candidate") {
  const candidate = buildCandidate(parseArgs());
  const paths = writeCandidate(candidate);
  console.log(`Wrote ${paths.jsonPath}`);
  console.log(`Wrote ${paths.mdPath}`);
  console.log(`Wrote ${paths.candidatePath}`);
} else if (command === "promote") {
  const candidate = buildCandidate(parseArgs());
  const promoted = promote(candidate);
  console.log(`Promoted ${promoted.term}`);
} else if (command === "sample") {
  console.log(
    JSON.stringify(
      buildCandidate({
        term: "Example Effect",
        plain: "Example Reusable Effect",
        meaning: "A sample term candidate used to validate the scriptionary term schema.",
        use: "Use only for tests and examples.",
        kind: "Term",
        effect: "A reusable term was discovered.",
      }),
      null,
      2,
    ),
  );
} else if (command === "report") {
  report();
} else {
  throw new Error(`Unknown command: ${command}`);
}
