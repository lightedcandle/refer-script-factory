import * as fs from "node:fs";
import * as path from "node:path";
import { fullUniversalLawFiles } from "./lawManifest";

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

export interface BootstrapTarget {
  path: string;
  kind: "directory" | "file";
  update_existing: boolean;
}

export const bootstrapTargets: BootstrapTarget[] = [
  { path: "REFER.OS", kind: "directory", update_existing: false },
  ...fullUniversalLawFiles.map((fileName) => ({
    path: `REFER.OS/${fileName}`,
    kind: "file" as const,
    update_existing: true,
  })),
  { path: "refer.app", kind: "directory", update_existing: false },
  { path: "AGENTS.md", kind: "file", update_existing: true },
  { path: ".refer-factory", kind: "directory", update_existing: false },
  {
    path: ".refer-factory/agent-profile.json",
    kind: "file",
    update_existing: true,
  },
  {
    path: ".refer-factory/adapter.json",
    kind: "file",
    update_existing: false,
  },
  {
    path: ".refer-factory/metrics.json",
    kind: "file",
    update_existing: true,
  },
  {
    path: ".refer-factory/codebases.json",
    kind: "file",
    update_existing: true,
  },
  {
    path: ".refer-factory/plan/refer.plan.json",
    kind: "file",
    update_existing: false,
  },
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
    const absoluteTarget = path.resolve(root, target.path);
    if (!isWithin(root, absoluteTarget)) {
      report.unsafe_overwrites.push(target.path);
      continue;
    }

    if (!fs.existsSync(absoluteTarget)) {
      report.would_create.push(target.path);
      continue;
    }

    if (target.update_existing) {
      report.would_update.push(target.path);
    } else {
      report.would_skip.push(target.path);
    }
  }

  report.required_confirmation = report.unsafe_overwrites.length > 0;
  return report;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
