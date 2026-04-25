import { BootstrapApplyReport } from "./apply";
import { BootstrapDryRunReport } from "./dryRun";
import { ProcessEvent } from "../telemetry/processEvents";

export interface BootstrapProcessEventOptions {
  id_prefix: string;
  started_at: string;
  elapsed_ms: number;
}

export function createBootstrapDryRunEvent(
  report: BootstrapDryRunReport,
  options: BootstrapProcessEventOptions,
): ProcessEvent {
  const blocked = report.unsafe_overwrites.length > 0;
  return {
    id: `${options.id_prefix}-dry-run`,
    script_name: "bootstrap-dry-run",
    status: blocked ? "blocked" : "completed",
    started_at: options.started_at,
    elapsed_ms: options.elapsed_ms,
    dominant_gear: "factory",
    output_target: "dry-run report",
    efficiency_state: blocked ? "blocked" : "normal",
    message: `Dry-run: create ${report.would_create.length}, update ${report.would_update.length}, skip ${report.would_skip.length}.`,
    error: blocked
      ? `Unsafe overwrite targets: ${report.unsafe_overwrites.join(", ")}`
      : null,
  };
}

export function createBootstrapApplyEvent(
  report: BootstrapApplyReport,
  options: BootstrapProcessEventOptions,
): ProcessEvent {
  const blocked = report.unsafe_overwrites.length > 0;
  return {
    id: `${options.id_prefix}-apply`,
    script_name: "bootstrap-apply",
    status: blocked ? "blocked" : "completed",
    started_at: options.started_at,
    elapsed_ms: options.elapsed_ms,
    dominant_gear: "factory",
    output_target: "workspace bootstrap files",
    efficiency_state: blocked ? "blocked" : "normal",
    message: `Apply: created ${report.created.length}, updated ${report.updated.length}, skipped ${report.skipped.length}.`,
    error: blocked
      ? `Unsafe overwrite targets: ${report.unsafe_overwrites.join(", ")}`
      : null,
  };
}

export function createBootstrapCancelledEvent(
  options: BootstrapProcessEventOptions,
): ProcessEvent {
  return {
    id: `${options.id_prefix}-cancelled`,
    script_name: "bootstrap-apply",
    status: "blocked",
    started_at: options.started_at,
    elapsed_ms: options.elapsed_ms,
    dominant_gear: "factory",
    output_target: "workspace bootstrap files",
    efficiency_state: "blocked",
    message: "Bootstrap apply cancelled after dry-run review.",
    error: "user cancelled",
  };
}
