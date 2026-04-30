import type { ReferIntakeContract } from "./referIntake";

export type ReferResolutionState =
  | "resolved_as_is"
  | "needs_more_info"
  | "needs_script"
  | "blocked_by_policy_or_scope"
  | "failed_with_reason";

export type ReferNextAction =
  | "return_final"
  | "scan_raw_input"
  | "ask_user"
  | "emit_script_request"
  | "stop_blocked"
  | "stop_failed";

export interface ReferResolutionEnvelope {
  resolution_state: ReferResolutionState;
  answer: string;
  missing_fields: string[];
  script_gap: string;
  blocked_reason: string;
  failed_reason: string;
}

export interface ReferLoopDecision {
  next_action: ReferNextAction;
  terminal: boolean;
  reason: string;
}

export const maxReferOrchestratorPasses = 3;

export function createOrchestratorPrompt(input: {
  contract: ReferIntakeContract;
  pass: number;
  rawInput?: string;
  previousEnvelope?: ReferResolutionEnvelope;
}): string {
  const rawSection = input.rawInput
    ? `\nRaw input fallback is now authorized for this pass. Use it only to fill missing fields from the prior compact contract.\n\nRAW_INPUT:\n${input.rawInput}`
    : "";
  const previousSection = input.previousEnvelope
    ? `\nPrevious resolution envelope:\n${JSON.stringify(input.previousEnvelope, null, 2)}`
    : "";

  return `You are the REFER bounded orchestrator. Resolve the request only through the programmed states.

Rules:
- Prefer the compact contract over raw input.
- If a script route is selected, the AI watcher executes and inspects it; submit expected/observed results to compact_contract.routing.execution_gate.
- Do not create selector/resolver scripts for script selection. Use existing registry, readiness records, lineage, and flags.
- A functional gate verdict means the script is ready for future script-first use; mismatches are AI repair work, not another routing script.
- If the compact contract is enough, answer with resolution_state "resolved_as_is".
- If required fields are missing and raw_input_ref may clarify them, answer "needs_more_info" with missing_fields.
- If no existing route/script can do the work, answer "needs_script" with script_gap.
- If the request is unsafe or outside scope, answer "blocked_by_policy_or_scope" with blocked_reason.
- If execution fails for a concrete reason, answer "failed_with_reason" with failed_reason.
- Return only valid JSON matching this shape:
{
  "resolution_state": "resolved_as_is | needs_more_info | needs_script | blocked_by_policy_or_scope | failed_with_reason",
  "answer": "user-facing answer or empty string",
  "missing_fields": [],
  "script_gap": "",
  "blocked_reason": "",
  "failed_reason": ""
}

Pass: ${input.pass}
Compact contract:
${JSON.stringify(input.contract, null, 2)}${previousSection}${rawSection}`;
}

export function parseResolutionEnvelope(
  modelText: string,
): ReferResolutionEnvelope {
  const parsed = JSON.parse(extractJsonObject(modelText)) as Partial<ReferResolutionEnvelope>;
  if (!isResolutionState(parsed.resolution_state)) {
    throw new Error("Model response did not include a valid resolution_state.");
  }

  return {
    resolution_state: parsed.resolution_state,
    answer: parsed.answer ?? "",
    missing_fields: Array.isArray(parsed.missing_fields)
      ? parsed.missing_fields.map(String)
      : [],
    script_gap: parsed.script_gap ?? "",
    blocked_reason: parsed.blocked_reason ?? "",
    failed_reason: parsed.failed_reason ?? "",
  };
}

export function decideReferNextAction(input: {
  envelope: ReferResolutionEnvelope;
  pass: number;
  rawInputAvailable: boolean;
  rawInputAlreadyUsed: boolean;
}): ReferLoopDecision {
  switch (input.envelope.resolution_state) {
    case "resolved_as_is":
      return {
        next_action: "return_final",
        terminal: true,
        reason: "The compact contract resolved the request.",
      };
    case "needs_more_info":
      if (
        input.rawInputAvailable &&
        !input.rawInputAlreadyUsed &&
        input.pass < maxReferOrchestratorPasses
      ) {
        return {
          next_action: "scan_raw_input",
          terminal: false,
          reason: "The model requested missing fields that may exist in raw input.",
        };
      }

      return {
        next_action: "ask_user",
        terminal: true,
        reason: "Raw input was insufficient or already used.",
      };
    case "needs_script":
      return {
        next_action: "emit_script_request",
        terminal: true,
        reason: "A missing repeatable script route is required.",
      };
    case "blocked_by_policy_or_scope":
      return {
        next_action: "stop_blocked",
        terminal: true,
        reason: "The request is blocked by policy or scope.",
      };
    case "failed_with_reason":
      return {
        next_action: "stop_failed",
        terminal: true,
        reason: "The run failed with a concrete reason.",
      };
  }
}

function extractJsonObject(value: string): string {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object.");
  }

  return value.slice(start, end + 1);
}

function isResolutionState(
  value: unknown,
): value is ReferResolutionState {
  return (
    value === "resolved_as_is" ||
    value === "needs_more_info" ||
    value === "needs_script" ||
    value === "blocked_by_policy_or_scope" ||
    value === "failed_with_reason"
  );
}
