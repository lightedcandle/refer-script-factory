import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();

function loadScriptEntries() {
  const compiled = path.join(root, "dist", "src", "contracts", "scriptFactory.js");
  if (!fs.existsSync(compiled)) {
    throw new Error("dist scriptFactory.js missing. Run npm run compile first.");
  }
  return require(compiled).scriptFactoryEntries;
}

function metadataFor(entry) {
  const id = entry.script_id;
  if (entry.surface === "request-type") {
    return {
      script_class: "Request Type",
      sequence_rank: "SEQ-B",
      forge_id: "request-intake-forge",
      reads: ["user:intent"],
      writes: ["refer.intake"],
      locks: [],
    };
  }
  if (id.includes("chat.pipeline") || id.includes("orchestrate") || id.includes("refer.server")) {
    return {
      script_class: "Sequencer Script",
      sequence_rank: "SEQ-E",
      forge_id: id.includes("server") ? "server-endpoint-forge" : "refer-chat-forge",
      reads: [".refer-factory/**", "user:intent"],
      writes: [".refer-factory/chat/sessions/**", ".refer-factory/process-state.json"],
      locks: [".refer-factory/chat"],
    };
  }
  if (id.includes("resolution.loop") || id.includes("context.picker")) {
    return {
      script_class: "Resolver Script",
      sequence_rank: id.includes("context") ? "SEQ-D" : "SEQ-I",
      forge_id: "refer-chat-forge",
      reads: [".refer-factory/codebase-tree.json", ".refer-factory/agent-context.md"],
      writes: id.includes("context") ? [".refer-factory/context-packs/**"] : [".refer-factory/chat/sessions/**"],
      locks: [],
    };
  }
  if (id.includes("scan") || id.includes("scriptographer") || id.includes("view")) {
    return {
      script_class: "Reference Script",
      sequence_rank: "SEQ-D",
      forge_id: "local-context-forge",
      reads: ["src/**", "docs/**", "schemas/**", "resources/**"],
      writes: [".refer-factory/**"],
      locks: [".refer-factory/context"],
    };
  }
  if (id.includes("authority")) {
    return {
      script_class: "Reference Script",
      sequence_rank: "SEQ-D",
      forge_id: "authority-resolver-forge",
      reads: ["docs/**", "unscripted-laws/REFER.OS/**", "user:intent"],
      writes: [".refer-factory/authority/**"],
      locks: [".refer-factory/authority"],
    };
  }
  if (id.includes("doctrine")) {
    return {
      script_class: "Forge Script",
      sequence_rank: "SEQ-F",
      forge_id: "doctrine-compiler-forge",
      reads: ["natural-rule-intake", "docs/**", "unscripted-laws/REFER.OS/**", ".refer-factory/authority/**"],
      writes: [".refer-factory/doctrine-candidates/**"],
      locks: [".refer-factory/doctrine-candidates"],
    };
  }
  if (id.includes("scriptionary")) {
    return {
      script_class: "Governing Script",
      sequence_rank: "SEQ-L",
      forge_id: "scriptionary-term-forge",
      reads: ["src/contracts/scriptLegend.ts", ".refer-factory/scriptionary/**"],
      writes: ["src/contracts/scriptLegend.ts", ".refer-factory/scriptionary/**", ".refer-factory/script-legend.md"],
      locks: ["src/contracts/scriptLegend.ts", ".refer-factory/script-legend.md"],
    };
  }
  if (id.includes("legend")) {
    return {
      script_class: "Governing Script",
      sequence_rank: "SEQ-A",
      forge_id: "script-legend-forge",
      reads: ["src/contracts/scriptLegend.ts", "src/contracts/scriptFactory.ts"],
      writes: [".refer-factory/script-legend.md"],
      locks: [".refer-factory/script-legend.md"],
    };
  }
  if (id.includes("initializeRepo") || id.includes("Update")) {
    return {
      script_class: "Installer Script",
      sequence_rank: "SEQ-G",
      forge_id: id.includes("Update") ? "update-forge" : "bootstrap-forge",
      reads: ["package.json", "unscripted-laws/REFER.OS/**"],
      writes: [".refer-factory/**", "AGENTS.md", "REFER.OS/**"],
      locks: ["workspace-bootstrap"],
    };
  }
  if (id.startsWith("npm.")) {
    return {
      script_class: "Validator Script",
      sequence_rank: "SEQ-I",
      forge_id: "verification-forge",
      reads: ["src/**", "test/**", "schemas/**", "package.json"],
      writes: ["dist/**"],
      locks: ["dist"],
    };
  }
  return {
    script_class: "Function Script",
    sequence_rank: "SEQ-G",
    forge_id: "script-factory-kernel-forge",
    reads: [".refer-factory/**"],
    writes: [".refer-factory/**"],
    locks: [],
  };
}

export function buildScriptClassRegistry(now = new Date()) {
  const entries = loadScriptEntries().map((entry) => {
    const meta = metadataFor(entry);
    return {
      script_id: entry.script_id,
      label: entry.label,
      script_class: meta.script_class,
      sequence_rank: meta.sequence_rank,
      forge_id: meta.forge_id,
      reads: meta.reads,
      writes: meta.writes,
      locks: meta.locks,
      source_authority: ["src/contracts/scriptFactory.ts", "docs/script-legend.md"],
      effect_contract: {
        intended_effect: entry.does,
        allowed_boundary: entry.detail,
      },
      status: "ready",
    };
  });

  return {
    schema_version: 1,
    generated_at: now.toISOString(),
    entries,
  };
}

function writeMarkdown(registry, target) {
  const lines = [
    "# Script Class Registry",
    "",
    `Generated: ${registry.generated_at}`,
    "",
    "| Script | Class | Sequence | Forge | Status |",
    "| --- | --- | --- | --- | --- |",
    ...registry.entries.map(
      (entry) =>
        `| \`${entry.script_id}\` | ${entry.script_class} | ${entry.sequence_rank} | \`${entry.forge_id}\` | ${entry.status} |`,
    ),
    "",
  ];
  fs.writeFileSync(target, lines.join("\n"), "utf8");
}

function writeRegistry(registry) {
  const dir = path.join(root, ".refer-factory");
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "script-class-registry.json");
  const mdPath = path.join(dir, "script-class-registry.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  writeMarkdown(registry, mdPath);
  return { jsonPath, mdPath };
}

function report(registry) {
  console.log(`Script class entries: ${registry.entries.length}`);
  const byClass = new Map();
  for (const entry of registry.entries) {
    byClass.set(entry.script_class, (byClass.get(entry.script_class) ?? 0) + 1);
  }
  for (const [scriptClass, count] of [...byClass.entries()].sort()) {
    console.log(`${scriptClass}: ${count}`);
  }
}

const command = process.argv[2] ?? "build";
const registry = buildScriptClassRegistry();

if (command === "build") {
  const paths = writeRegistry(registry);
  console.log(`Wrote ${paths.jsonPath}`);
  console.log(`Wrote ${paths.mdPath}`);
} else if (command === "report") {
  report(registry);
} else {
  throw new Error(`Unknown command: ${command}`);
}
