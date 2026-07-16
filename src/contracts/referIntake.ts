import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Legacy compatibility name for the serialized intake envelope.
 * This type and its contract-shaped field names do not represent or authorize a
 * ratified REFER Execution Contract. Renaming the API is deferred.
 */
export interface ReferIntakeContract {
  contract_id: string;
  created_at: string;
  raw_input_ref: string;
  raw_input_sha256: string;
  raw_input_chars: number;
  active_contract: {
    intent: string;
    relevant_excerpt: string;
    prompt_focus: "compact_contract";
  };
  routing: {
    station_route: string[];
    model_prompt_policy: "send_compact_contract_only";
    fallback_rule: string;
    execution_gate: {
      gate_id: "failure_detector";
      command: "npm run failure:detect";
      applies_to: "ai_watched_script_result_verdict";
      bypass_policy: "direct_execution_is_ungoverned";
      rerun_policy: "ai_watcher_reruns_and_resubmits_verdict";
      ai_boundary: "ai_watcher_executes_scripts_and_repairs";
      readiness_policy: "functional_verdict_marks_script_ready_for_future_script_first_use";
    };
  };
}

export interface ReferIntakeRecord {
  /** Legacy compatibility field containing the non-authorizing intake envelope. */
  contract: ReferIntakeContract;
  raw_input: string;
}

export function createReferIntakeRecord(
  rawPrompt: string,
  now = new Date(),
): ReferIntakeRecord {
  const normalizedPrompt = rawPrompt.trim();
  const hash = crypto
    .createHash("sha256")
    .update(normalizedPrompt, "utf8")
    .digest("hex");
  const shortHash = hash.slice(0, 12);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const rawInputRef = `.refer-factory/intake/${stamp}-${shortHash}.json`;

  return {
    contract: {
      contract_id: `refer.intake.${stamp}.${shortHash}`,
      created_at: now.toISOString(),
      raw_input_ref: rawInputRef,
      raw_input_sha256: hash,
      raw_input_chars: normalizedPrompt.length,
      active_contract: {
        intent: inferIntent(normalizedPrompt),
        relevant_excerpt: excerpt(normalizedPrompt, 700),
        prompt_focus: "compact_contract",
      },
      routing: {
        station_route: [
          "REFER Intake",
          "Prompt Wash",
          "Intake Envelope",
          "Host-Provided Model",
        ],
        model_prompt_policy: "send_compact_contract_only",
        fallback_rule:
          "Use raw_input_ref only when the intake envelope is ambiguous or insufficient.",
        execution_gate: {
          gate_id: "failure_detector",
          command: "npm run failure:detect",
          applies_to: "ai_watched_script_result_verdict",
          bypass_policy: "direct_execution_is_ungoverned",
          rerun_policy: "ai_watcher_reruns_and_resubmits_verdict",
          ai_boundary: "ai_watcher_executes_scripts_and_repairs",
          readiness_policy: "functional_verdict_marks_script_ready_for_future_script_first_use",
        },
      },
    },
    raw_input: normalizedPrompt,
  };
}

export function writeReferIntakeRecord(
  workspaceRoot: string,
  record: ReferIntakeRecord,
): string {
  const absolutePath = path.join(workspaceRoot, record.contract.raw_input_ref);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(
    absolutePath,
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
  return absolutePath;
}

export function createModelPrompt(contract: ReferIntakeContract): string {
  return `You are processing a REFER intake envelope stored under legacy compatibility field names. This envelope is not execution authority. Do not ask for or infer from the raw human prompt unless the intake envelope is insufficient. Use the raw_input_ref only as an audit/fallback pointer.

${JSON.stringify(contract, null, 2)}`;
}

function inferIntent(prompt: string): string {
  const firstLine = prompt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return "empty_intake";
  }

  return excerpt(firstLine, 160);
}

function excerpt(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars - 15).trimEnd()} [truncated]`;
}
