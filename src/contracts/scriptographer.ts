import * as fs from "node:fs";
import * as path from "node:path";
import { scriptFactoryEntries } from "./scriptFactory";
import { createScriptLegend } from "./scriptLegend";

export type ScriptographerClassification =
  | "term"
  | "factory-layer-label"
  | "registered-script-label"
  | "script-action-label"
  | "cockpit-view-label"
  | "entrypoint-label"
  | "unclassified";

export interface ScriptographerCandidate {
  name: string;
  classification: ScriptographerClassification;
  source: string;
  ratified: boolean;
  repair_hint: string;
}

export interface ScriptographerReport {
  schema_version: 1;
  generated_at: string;
  summary: {
    total: number;
    ratified: number;
    unratified: number;
  };
  candidates: ScriptographerCandidate[];
}

export function scriptographerReportPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "scriptographer-report.json");
}

export function runScriptographer(
  workspaceRoot: string,
  generatedAt = new Date(),
): ScriptographerReport {
  const legend = createScriptLegend();
  const terms = new Set(legend.terms.map((term) => term.term));
  const taxonomy = new Map(
    legend.taxonomy.map((category) => [category.name, new Set(category.allowed_values)]),
  );
  const entrypoints = new Set(scriptFactoryEntries.map((entry) => entry.entrypoint));
  const candidates = dedupeCandidates([
    ...legend.terms.map((term) =>
      candidate(term.term, "term", "src/contracts/scriptLegend.ts terms", terms.has(term.term)),
    ),
    ...scriptFactoryEntries.map((entry) =>
      candidate(
        entry.label,
        "registered-script-label",
        `src/contracts/scriptFactory.ts ${entry.script_id}`,
        taxonomy.get("Registered Script Label")?.has(entry.label) ?? false,
      ),
    ),
    ...factoryLayerCandidates(taxonomy),
    ...packageJsonCandidates(workspaceRoot, taxonomy, entrypoints),
  ]);

  return {
    schema_version: 1,
    generated_at: generatedAt.toISOString(),
    summary: {
      total: candidates.length,
      ratified: candidates.filter((item) => item.ratified).length,
      unratified: candidates.filter((item) => !item.ratified).length,
    },
    candidates,
  };
}

export function writeScriptographerReport(
  workspaceRoot: string,
  report: ScriptographerReport,
): string {
  const target = scriptographerReportPath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return target;
}

function factoryLayerCandidates(
  taxonomy: Map<string, Set<string>>,
): ScriptographerCandidate[] {
  const values = taxonomy.get("Factory Layer Label") ?? new Set<string>();
  return [...values].map((name) =>
    candidate(name, "factory-layer-label", "Script Legend Factory Layer Label taxonomy", true),
  );
}

function packageJsonCandidates(
  workspaceRoot: string,
  taxonomy: Map<string, Set<string>>,
  entrypoints: Set<string>,
): ScriptographerCandidate[] {
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    contributes?: {
      commands?: { title?: string }[];
      views?: Record<string, { name?: string }[]>;
      viewsContainers?: { activitybar?: { name?: string; title?: string }[] };
    };
  };
  const cockpitLabels = taxonomy.get("Cockpit View Label") ?? new Set<string>();
  const viewNames = Object.values(packageJson.contributes?.views ?? {})
    .flat()
    .map((view) => view.name)
    .filter((name): name is string => Boolean(name));
  const activityLabels =
    packageJson.contributes?.viewsContainers?.activitybar?.flatMap((item) =>
      [item.name, item.title].filter((name): name is string => Boolean(name)),
    ) ?? [];
  const commandTitles =
    packageJson.contributes?.commands
      ?.map((command) => command.title)
      .filter((title): title is string => Boolean(title)) ?? [];

  return [
    ...[...viewNames, ...activityLabels].map((name) =>
      candidate(
        name,
        "cockpit-view-label",
        "package.json contributes.views",
        cockpitLabels.has(name),
      ),
    ),
    ...commandTitles.map((name) =>
      candidate(
        name,
        "entrypoint-label",
        "package.json contributes.commands",
        entrypoints.has(name),
      ),
    ),
  ];
}

function candidate(
  name: string,
  classification: ScriptographerClassification,
  source: string,
  ratified: boolean,
): ScriptographerCandidate {
  return {
    name,
    classification,
    source,
    ratified,
    repair_hint: ratified
      ? "No repair needed."
      : "Ratify this name in the Script Legend, bind it to a Script Factory entry, or rename the source to an existing governed name.",
  };
}

function dedupeCandidates(candidates: ScriptographerCandidate[]): ScriptographerCandidate[] {
  const seen = new Set<string>();
  const result: ScriptographerCandidate[] = [];
  for (const item of candidates) {
    const key = `${item.classification}\u0000${item.name}\u0000${item.source}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(item);
  }
  return result.sort((a, b) =>
    `${a.classification}:${a.name}:${a.source}`.localeCompare(
      `${b.classification}:${b.name}:${b.source}`,
    ),
  );
}
