import * as fs from "node:fs";
import * as path from "node:path";

export interface BootstrapDryRunInput {
  workspace_root: string;
  repo_purpose: string;
  framework: string;
}

export interface BootstrapDryRunReport extends BootstrapDryRunInput {
  would_create: string[];
  would_update: string[];
  would_skip: string[];
  unsafe_overwrites: string[];
  required_confirmation: boolean;
}

const bootstrapTargets = [
  "REFER.OS",
  "refer.app",
  ".refer-factory",
  ".refer-factory/adapter.json",
  ".refer-factory/metrics.json",
  "public/assets/plan/refer.plan.json",
];

export function createBootstrapDryRun(
  input: BootstrapDryRunInput,
): BootstrapDryRunReport {
  const root = path.resolve(input.workspace_root);
  const report: BootstrapDryRunReport = {
    ...input,
    workspace_root: root,
    would_create: [],
    would_update: [],
    would_skip: [],
    unsafe_overwrites: [],
    required_confirmation: false,
  };

  for (const target of bootstrapTargets) {
    const absoluteTarget = path.resolve(root, target);
    if (!isWithin(root, absoluteTarget)) {
      report.unsafe_overwrites.push(target);
      continue;
    }

    if (!fs.existsSync(absoluteTarget)) {
      report.would_create.push(target);
      continue;
    }

    if (target === ".refer-factory/metrics.json") {
      report.would_update.push(target);
    } else {
      report.would_skip.push(target);
    }
  }

  report.required_confirmation = report.unsafe_overwrites.length > 0;
  return report;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
