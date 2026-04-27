import * as fs from "node:fs";
import * as path from "node:path";
import { scriptFactoryEntries } from "./scriptFactory";
import { createScriptLegend } from "./scriptLegend";
import { runScriptographer } from "./scriptographer";

export type FactoryGapSeverity = "info" | "warning" | "error";
export type FactoryGapCategory =
  | "terminology"
  | "registry"
  | "command"
  | "artifact"
  | "status"
  | "self-healing";

export interface FactoryGap {
  id: string;
  severity: FactoryGapSeverity;
  category: FactoryGapCategory;
  title: string;
  detail: string;
  repair_hint: string;
}

export interface FactoryGapReport {
  schema_version: 1;
  generated_at: string;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
  gaps: FactoryGap[];
}

export function factoryGapReportPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "factory-gaps.json");
}

export function scanFactoryGaps(workspaceRoot: string, generatedAt = new Date()): FactoryGapReport {
  const gaps: FactoryGap[] = [
    ...scanTerminologyGaps(),
    ...scanRegistryGaps(),
    ...scanCommandGaps(workspaceRoot),
    ...scanCockpitViewLabelGaps(workspaceRoot),
    ...scanScriptographerGaps(workspaceRoot),
    ...scanArtifactGaps(workspaceRoot),
    ...scanStatusGaps(),
  ];

  return {
    schema_version: 1,
    generated_at: generatedAt.toISOString(),
    summary: {
      total: gaps.length,
      errors: gaps.filter((gap) => gap.severity === "error").length,
      warnings: gaps.filter((gap) => gap.severity === "warning").length,
      info: gaps.filter((gap) => gap.severity === "info").length,
    },
    gaps,
  };
}

export function writeFactoryGapReport(workspaceRoot: string, report: FactoryGapReport): string {
  const target = factoryGapReportPath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return target;
}

function scanTerminologyGaps(): FactoryGap[] {
  const legend = createScriptLegend();
  const terms = new Set(legend.terms.map((term) => term.term));
  const requiredTerms = [
    "Forge",
    "Script Forge",
    "Factory System",
    "Self-Healing",
    "Local-First Maturity",
  ];

  return requiredTerms
    .filter((term) => !terms.has(term))
    .map((term) => ({
      id: `terminology.missing.${slug(term)}`,
      severity: "warning",
      category: "terminology",
      title: `Missing terminology: ${term}`,
      detail: `${term} is part of the factory doctrine but is not present in the Script Legend.`,
      repair_hint: "Add the term to src/contracts/scriptLegend.ts so generated legends stay aligned with doctrine.",
    }));
}

function scanRegistryGaps(): FactoryGap[] {
  const gaps: FactoryGap[] = [];
  const ids = new Set(scriptFactoryEntries.map((entry) => entry.script_id));
  const legend = createScriptLegend();
  const registeredScriptLabels = new Set(
    legend.taxonomy.find((category) => category.name === "Registered Script Label")?.allowed_values ?? [],
  );

  for (const entry of scriptFactoryEntries) {
    if (!registeredScriptLabels.has(entry.label)) {
      gaps.push({
        id: `registry.unlisted-label.${entry.script_id}`,
        severity: "error",
        category: "registry",
        title: `Script label is not in legend: ${entry.label}`,
        detail: `${entry.script_id} uses the label ${entry.label}, but that label is not listed in the Script Legend Registered Script Label taxonomy.`,
        repair_hint: "Add the label to src/contracts/scriptLegend.ts or rename the registry entry to an existing governed label.",
      });
    }

    if (entry.surface !== "request-type") {
      if (!entry.script_kind) {
        gaps.push({
          id: `registry.missing-kind.${entry.script_id}`,
          severity: "error",
          category: "registry",
          title: `Missing script kind: ${entry.label}`,
          detail: `${entry.script_id} is runnable but does not declare Single Script or Multi Script.`,
          repair_hint: "Set script_kind or allow the default metadata helper to supply one.",
        });
      }

      if (!entry.input_points || !entry.exit_points) {
        gaps.push({
          id: `registry.missing-flow.${entry.script_id}`,
          severity: "error",
          category: "registry",
          title: `Missing input or exit points: ${entry.label}`,
          detail: `${entry.script_id} must say where information enters and where results go.`,
          repair_hint: "Add input_points and exit_points using only Scripts, User, Agent, and Repo.",
        });
      }
    }

    if (entry.script_kind === "Multi Script") {
      const children = entry.child_scripts ?? [];
      if (children.length === 0) {
        gaps.push({
          id: `registry.missing-children.${entry.script_id}`,
          severity: "error",
          category: "registry",
          title: `Missing child scripts: ${entry.label}`,
          detail: `${entry.script_id} is a Multi Script but does not list child_scripts.`,
          repair_hint: "Add child_scripts in execution or conceptual order.",
        });
      }

      for (const child of children) {
        if (!ids.has(child)) {
          gaps.push({
            id: `registry.unknown-child.${entry.script_id}.${child}`,
            severity: "error",
            category: "registry",
            title: `Unknown child script: ${child}`,
            detail: `${entry.script_id} lists ${child}, but that script_id is not registered.`,
            repair_hint: "Register the child script or correct the child_scripts entry.",
          });
        }
      }
    }
  }

  return gaps;
}

function scanCommandGaps(workspaceRoot: string): FactoryGap[] {
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return [
      {
        id: "command.package-json-missing",
        severity: "error",
        category: "command",
        title: "package.json is missing",
        detail: "Command contributions cannot be verified without package.json.",
        repair_hint: "Restore package.json or run the scanner from the extension workspace root.",
      },
    ];
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    contributes?: { commands?: { command?: string }[] };
  };
  const contributedCommands = new Set(
    packageJson.contributes?.commands?.map((command) => command.command).filter(Boolean) ?? [],
  );

  return scriptFactoryEntries
    .filter((entry) => entry.surface === "vscode-command" && !contributedCommands.has(entry.script_id))
    .map((entry) => ({
      id: `command.not-contributed.${entry.script_id}`,
      severity: "error",
      category: "command",
      title: `Command is not contributed: ${entry.label}`,
      detail: `${entry.script_id} appears in the Script Factory registry but not in package.json contributes.commands.`,
      repair_hint: "Add the command to package.json and register it in src/extension.ts.",
    }));
}

function scanCockpitViewLabelGaps(workspaceRoot: string): FactoryGap[] {
  const packageJsonPath = path.join(workspaceRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    contributes?: { views?: Record<string, { name?: string }[]> };
  };
  const legend = createScriptLegend();
  const governedViewLabels = new Set(
    legend.taxonomy.find((category) => category.name === "Cockpit View Label")?.allowed_values ?? [],
  );
  const viewLabels = Object.values(packageJson.contributes?.views ?? {})
    .flat()
    .map((view) => view.name)
    .filter((name): name is string => Boolean(name));

  return viewLabels
    .filter((label) => !governedViewLabels.has(label))
    .map((label) => ({
      id: `terminology.unlisted-cockpit-view-label.${slug(label)}`,
      severity: "error",
      category: "terminology",
      title: `Cockpit view label is not in legend: ${label}`,
      detail: `${label} appears in package.json contributes.views but is not listed in the Script Legend Cockpit View Label taxonomy.`,
      repair_hint: "Add the view label to src/contracts/scriptLegend.ts or rename package.json to an existing governed label.",
    }));
}

function scanScriptographerGaps(workspaceRoot: string): FactoryGap[] {
  return runScriptographer(workspaceRoot)
    .candidates.filter((candidate) => !candidate.ratified)
    .map((candidate) => ({
      id: `self-healing.unratified-name.${slug(candidate.classification)}.${slug(candidate.name)}`,
      severity: "warning",
      category: "self-healing",
      title: `Unratified ${candidate.classification}: ${candidate.name}`,
      detail: `${candidate.name} was discovered in ${candidate.source} but is not ratified for that classification.`,
      repair_hint: candidate.repair_hint,
    }));
}

function scanArtifactGaps(workspaceRoot: string): FactoryGap[] {
  const expectedArtifacts = [
    ".refer-factory/codebase-tree.json",
    ".refer-factory/agent-context.md",
    ".refer-factory/script-legend.md",
    ".refer-factory/scriptographer-report.json",
  ];

  return expectedArtifacts
    .filter((relativePath) => !fs.existsSync(path.join(workspaceRoot, relativePath)))
    .map((relativePath) => ({
      id: `artifact.missing.${relativePath.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
      severity: "info",
      category: "artifact",
      title: `Missing generated artifact: ${relativePath}`,
      detail: `${relativePath} is expected for local-first operation but does not exist yet.`,
      repair_hint: "Run REFER: Scan Codebase to refresh local context artifacts.",
    }));
}

function scanStatusGaps(): FactoryGap[] {
  const knownStatusBackedScripts = new Set([
    "refer.chat.pipeline",
    "refer.orchestrate.chat",
    "refer.chat.participant",
    "refer.resolution.loop",
    "refer.server.chat",
    "refer.initializeRepo",
    "refer.scriptographer",
    "refer.runScriptographer",
    "refer.viewScriptographerReport",
    "refer.scan.codebase",
    "refer.scanCodebase",
    "refer.scan.factoryGaps",
    "refer.scanFactoryGaps",
    "refer.emitSendContract",
    "refer.checkForUpdates",
    "refer.applyUpdate",
  ]);

  return scriptFactoryEntries
    .filter((entry) => entry.surface !== "request-type")
    .filter((entry) => !knownStatusBackedScripts.has(entry.script_id))
    .map((entry) => ({
      id: `status.unmapped.${entry.script_id}`,
      severity: "info",
      category: "status",
      title: `No status mapping: ${entry.label}`,
      detail: `${entry.script_id} has no known process-event mapping, so its Script Factory light may stay gray.`,
      repair_hint: "Emit process events for the script or add its process name to the Script Factory status mapper.",
    }));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
