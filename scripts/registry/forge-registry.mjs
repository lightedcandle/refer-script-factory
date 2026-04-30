import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadScriptClassRegistry() {
  const file = path.join(root, ".refer-factory", "script-class-registry.json");
  if (!fs.existsSync(file)) {
    throw new Error("script-class-registry.json missing. Run node scripts/registry/script-class-registry.mjs build first.");
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function buildForgeRegistry(now = new Date()) {
  const scriptRegistry = loadScriptClassRegistry();
  const grouped = new Map();
  for (const entry of scriptRegistry.entries) {
    const existing = grouped.get(entry.forge_id) ?? {
      forge_id: entry.forge_id,
      label: labelForForge(entry.forge_id),
      forge_family: familyForForge(entry.forge_id),
      generated_script_classes: new Set(),
      authority_refs: new Set(),
      status: "stable",
      modification_status: "none",
      fixtures: [],
      lineage_packets: [],
      generated_scripts: [],
    };
    existing.generated_script_classes.add(entry.script_class);
    for (const authority of entry.source_authority) existing.authority_refs.add(authority);
    existing.generated_scripts.push(entry.script_id);
    grouped.set(entry.forge_id, existing);
  }

  return {
    schema_version: 1,
    generated_at: now.toISOString(),
    forges: [...grouped.values()]
      .sort((a, b) => a.forge_id.localeCompare(b.forge_id))
      .map((forge) => ({
        ...forge,
        generated_script_classes: [...forge.generated_script_classes].sort(),
        authority_refs: [...forge.authority_refs].sort(),
      })),
  };
}

function labelForForge(forgeId) {
  return forgeId
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function familyForForge(forgeId) {
  if (forgeId.includes("chat")) return "Chat Orchestration";
  if (forgeId.includes("context") || forgeId.includes("legend")) return "Local Context";
  if (forgeId.includes("bootstrap") || forgeId.includes("update")) return "Installer";
  if (forgeId.includes("verification")) return "Verification";
  if (forgeId.includes("server")) return "Server";
  if (forgeId.includes("request")) return "Smart Intake";
  return "Script Factory Kernel";
}

function writeMarkdown(registry, target) {
  const lines = [
    "# Forge Registry",
    "",
    `Generated: ${registry.generated_at}`,
    "",
    "| Forge | Family | Status | Modification | Scripts |",
    "| --- | --- | --- | --- | --- |",
    ...registry.forges.map(
      (forge) =>
        `| \`${forge.forge_id}\` | ${forge.forge_family} | ${forge.status} | ${forge.modification_status} | ${forge.generated_scripts.length} |`,
    ),
    "",
  ];
  fs.writeFileSync(target, lines.join("\n"), "utf8");
}

function writeRegistry(registry) {
  const dir = path.join(root, ".refer-factory");
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "forge-registry.json");
  const mdPath = path.join(dir, "forge-registry.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  writeMarkdown(registry, mdPath);
  return { jsonPath, mdPath };
}

const command = process.argv[2] ?? "build";
const registry = buildForgeRegistry();

if (command === "build") {
  const paths = writeRegistry(registry);
  console.log(`Wrote ${paths.jsonPath}`);
  console.log(`Wrote ${paths.mdPath}`);
} else if (command === "report") {
  console.log(`Forges: ${registry.forges.length}`);
  for (const forge of registry.forges) {
    console.log(`${forge.forge_id}: ${forge.generated_scripts.length} scripts`);
  }
} else {
  throw new Error(`Unknown command: ${command}`);
}
