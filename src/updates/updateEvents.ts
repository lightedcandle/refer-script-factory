import { ProcessEvent } from "../telemetry/processEvents";
import { UpdateApplyReport, UpdateCheckResult } from "./updateTypes";

export function createUpdateCheckEvent(
  result: UpdateCheckResult,
  startedAt: Date,
): ProcessEvent {
  return {
    id: `update-check-${startedAt.getTime()}`,
    script_name: "update-check",
    status: result.up_to_date ? "completed" : "queued",
    started_at: startedAt.toISOString(),
    elapsed_ms: Date.now() - startedAt.getTime(),
    dominant_gear: "factory",
    output_target: "update manifest",
    efficiency_state: result.up_to_date ? "normal" : "capital-burn",
    message: result.up_to_date
      ? "REFER update check complete: no updates."
      : `REFER update available: ${result.pending_artifacts.length} artifact(s).`,
    error: null,
  };
}

export function createUpdateApplyEvent(
  report: UpdateApplyReport,
  startedAt: Date,
): ProcessEvent {
  return {
    id: `update-apply-${startedAt.getTime()}`,
    script_name: "update-apply",
    status: report.failed.length > 0 ? "failed" : "completed",
    started_at: startedAt.toISOString(),
    elapsed_ms: Date.now() - startedAt.getTime(),
    dominant_gear: "factory",
    output_target: "REFER.OS update sync",
    efficiency_state: report.failed.length > 0 ? "blocked" : "normal",
    message: `REFER update apply: ${report.applied.length} applied, ${report.skipped.length} skipped.`,
    error:
      report.failed.length > 0
        ? report.failed.map((failure) => `${failure.id}: ${failure.error}`).join("; ")
        : null,
  };
}
