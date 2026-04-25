import { BootstrapApplyReport } from "../bootstrap/apply";
import { BootstrapDryRunReport } from "../bootstrap/dryRun";
import { scoreRepoHealth } from "./repoHealth";

export type BootstrapHealthPhase = "none" | "dry-run" | "applied" | "cancelled";

export interface BootstrapHealthSnapshot {
  phase: BootstrapHealthPhase;
  workspace_root: string | null;
  repo_purpose: string | null;
  framework: string | null;
  create_count: number;
  update_count: number;
  skip_count: number;
  unsafe_overwrite_count: number;
  repo_health_score: number;
}

const emptySnapshot: BootstrapHealthSnapshot = {
  phase: "none",
  workspace_root: null,
  repo_purpose: null,
  framework: null,
  create_count: 0,
  update_count: 0,
  skip_count: 0,
  unsafe_overwrite_count: 0,
  repo_health_score: 100,
};

let currentSnapshot = emptySnapshot;

export function getBootstrapHealthSnapshot(): BootstrapHealthSnapshot {
  return { ...currentSnapshot };
}

export function setBootstrapHealthSnapshot(
  snapshot: BootstrapHealthSnapshot,
): void {
  currentSnapshot = { ...snapshot };
}

export function createDryRunHealthSnapshot(
  report: BootstrapDryRunReport,
): BootstrapHealthSnapshot {
  return {
    phase: "dry-run",
    workspace_root: report.workspace_root,
    repo_purpose: report.repo_purpose,
    framework: report.framework,
    create_count: report.would_create.length,
    update_count: report.would_update.length,
    skip_count: report.would_skip.length,
    unsafe_overwrite_count: report.unsafe_overwrites.length,
    repo_health_score: scoreBootstrapHealth({
      create_count: report.would_create.length,
      update_count: report.would_update.length,
      unsafe_overwrite_count: report.unsafe_overwrites.length,
    }),
  };
}

export function createApplyHealthSnapshot(
  report: BootstrapApplyReport,
): BootstrapHealthSnapshot {
  return {
    phase: "applied",
    workspace_root: report.dry_run.workspace_root,
    repo_purpose: report.dry_run.repo_purpose,
    framework: report.dry_run.framework,
    create_count: report.created.length,
    update_count: report.updated.length,
    skip_count: report.skipped.length,
    unsafe_overwrite_count: report.unsafe_overwrites.length,
    repo_health_score: scoreBootstrapHealth({
      create_count: report.created.length,
      update_count: report.updated.length,
      unsafe_overwrite_count: report.unsafe_overwrites.length,
    }),
  };
}

export function createCancelledHealthSnapshot(
  report: BootstrapDryRunReport,
): BootstrapHealthSnapshot {
  return {
    ...createDryRunHealthSnapshot(report),
    phase: "cancelled",
  };
}

function scoreBootstrapHealth(input: {
  create_count: number;
  update_count: number;
  unsafe_overwrite_count: number;
}): number {
  return scoreRepoHealth({
    dirtyFiles: input.update_count,
    failingChecks: input.unsafe_overwrite_count,
    missingAnchors: input.create_count,
  });
}
