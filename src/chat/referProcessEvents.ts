import type {
  ReferLoopDecision,
  ReferResolutionEnvelope,
} from "../contracts/referOrchestrator";
import type { ProcessEvent, ProcessStatus } from "../telemetry/processEvents";

export function createReferChatEvent(input: {
  contractId: string;
  phase: "intake" | "provider" | "pass" | "terminal" | "failure";
  startedAt: Date;
  message: string;
  status?: ProcessStatus;
  outputTarget?: string;
  efficiencyState?: string;
  error?: string | null;
  pass?: number;
  providerLabel?: string;
  envelope?: ReferResolutionEnvelope;
  decision?: ReferLoopDecision;
}): ProcessEvent {
  const suffix = input.pass ? `-pass-${input.pass}` : "";
  const state = input.envelope?.resolution_state;
  const action = input.decision?.next_action;
  const detail = [
    state ? `state=${state}` : "",
    action ? `action=${action}` : "",
    input.providerLabel ? `provider=${input.providerLabel}` : "",
  ].filter(Boolean);

  return {
    id: `refer-chat-${input.phase}${suffix}-${input.startedAt.getTime()}`,
    script_name: "refer-chat",
    status: input.status ?? statusForPhase(input.phase, input.envelope),
    started_at: input.startedAt.toISOString(),
    elapsed_ms: Math.max(Date.now() - input.startedAt.getTime(), 0),
    dominant_gear: "orchestrator",
    output_target: input.outputTarget ?? input.contractId,
    efficiency_state:
      input.efficiencyState ?? efficiencyForPhase(input.phase, input.envelope),
    message: detail.length > 0 ? `${input.message} (${detail.join(", ")})` : input.message,
    error: input.error ?? null,
  };
}

function statusForPhase(
  phase: "intake" | "provider" | "pass" | "terminal" | "failure",
  envelope?: ReferResolutionEnvelope,
): ProcessStatus {
  if (phase === "failure") {
    return "failed";
  }
  if (phase === "intake" || phase === "provider" || phase === "pass") {
    return "running";
  }
  if (envelope?.resolution_state === "blocked_by_policy_or_scope") {
    return "blocked";
  }
  if (envelope?.resolution_state === "failed_with_reason") {
    return "failed";
  }
  return "completed";
}

function efficiencyForPhase(
  phase: "intake" | "provider" | "pass" | "terminal" | "failure",
  envelope?: ReferResolutionEnvelope,
): string {
  if (phase === "failure" || envelope?.resolution_state === "failed_with_reason") {
    return "blocked";
  }
  if (envelope?.resolution_state === "needs_script") {
    return "capital-burn";
  }
  return "normal";
}
