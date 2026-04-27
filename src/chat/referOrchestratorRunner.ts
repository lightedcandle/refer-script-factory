import {
  appendReferChatTurn,
  createReferChatSession,
  readLatestReferChatSession,
  writeReferChatSession,
} from "../contracts/referChatSession";
import {
  createReferIntakeRecord,
  ReferIntakeContract,
  writeReferIntakeRecord,
} from "../contracts/referIntake";
import {
  markContractTurnComplete,
  markTemporaryContractActive,
  readReferChatModeState,
  setPersistentContractMode,
} from "../contracts/referChatMode";
import { ReferResolutionEnvelope } from "../contracts/referOrchestrator";
import { appendProcessEvent } from "../telemetry/processEvents";
import { createReferChatEvent } from "./referProcessEvents";
import { runReferResolutionLoop } from "./referResolutionLoop";
import type { ReferCancellationToken, ReferPromptModel } from "./referPromptModel";

export interface ReferOrchestratorRunResult {
  ok: boolean;
  prompt: string;
  contract_id: string | null;
  raw_input_ref: string | null;
  absolute_record_path: string | null;
  provider_label: string;
  output: string;
  resolution: ReferResolutionEnvelope | null;
  progress: string[];
  error: string | null;
}

export interface ReferOrchestratorRunInput {
  workspaceRoot: string;
  prompt: string;
  model: ReferPromptModel;
  token: ReferCancellationToken;
  onProgress?: (message: string) => void;
}

export async function runReferOrchestratorPrompt(
  input: ReferOrchestratorRunInput,
): Promise<ReferOrchestratorRunResult> {
  const progress: string[] = [];
  const reportProgress = (message: string) => {
    progress.push(message);
    input.onProgress?.(message);
  };

  const controlOutput = handleControlPrompt(input.prompt, input.workspaceRoot);
  if (controlOutput) {
    return {
      ok: true,
      prompt: input.prompt,
      contract_id: null,
      raw_input_ref: null,
      absolute_record_path: null,
      provider_label: "REFER control",
      output: controlOutput,
      resolution: null,
      progress,
      error: null,
    };
  }

  markTemporaryContractActive(input.workspaceRoot);
  const record = createReferIntakeRecord(input.prompt);
  const absoluteRecordPath = writeReferIntakeRecord(input.workspaceRoot, record);
  const startedAt = new Date();

  appendProcessEvent(
    createReferChatEvent({
      contractId: record.contract.contract_id,
      phase: "intake",
      startedAt,
      message: "REFER chat intake stored raw prompt and compact contract.",
      outputTarget: record.contract.raw_input_ref,
    }),
    input.workspaceRoot,
  );
  reportProgress("REFER stored the raw prompt and started the bounded resolution loop.");
  reportProgress(`REFER model provider: ${input.model.label}.`);

  try {
    appendProcessEvent(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "provider",
        startedAt: new Date(),
        message: "REFER selected model provider.",
        providerLabel: input.model.label,
      }),
      input.workspaceRoot,
    );

    const finalEnvelope = await runReferResolutionLoop({
      model: input.model,
      contract: record.contract,
      rawInput: record.raw_input,
      token: input.token,
      onProgress: reportProgress,
      onPass: ({ pass, envelope, decision }) => {
        appendProcessEvent(
          createReferChatEvent({
            contractId: record.contract.contract_id,
            phase: "pass",
            pass,
            startedAt: new Date(),
            message: "REFER orchestrator pass completed.",
            envelope,
            decision,
          }),
          input.workspaceRoot,
        );
      },
    });

    appendProcessEvent(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "terminal",
        startedAt: new Date(),
        message: "REFER chat cycle reached terminal state.",
        envelope: finalEnvelope,
      }),
      input.workspaceRoot,
    );

    const output = outputForSession(finalEnvelope);
    writeSessionTurn(input.workspaceRoot, record.contract, finalEnvelope, output, progress);
    return {
      ok: true,
      prompt: input.prompt,
      contract_id: record.contract.contract_id,
      raw_input_ref: record.contract.raw_input_ref,
      absolute_record_path: absoluteRecordPath,
      provider_label: input.model.label,
      output,
      resolution: finalEnvelope,
      progress,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    appendProcessEvent(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "failure",
        startedAt: new Date(),
        message: "REFER chat cycle failed before terminal resolution.",
        error: message,
      }),
      input.workspaceRoot,
    );
    return {
      ok: false,
      prompt: input.prompt,
      contract_id: record.contract.contract_id,
      raw_input_ref: record.contract.raw_input_ref,
      absolute_record_path: absoluteRecordPath,
      provider_label: input.model.label,
      output: "",
      resolution: null,
      progress,
      error: message,
    };
  } finally {
    markContractTurnComplete(input.workspaceRoot);
  }
}

export function createNeverCancelledToken(): ReferCancellationToken {
  return {
    isCancellationRequested: false,
    onCancellationRequested() {
      return { dispose() {} };
    },
  };
}

export function outputForSession(envelope: ReferResolutionEnvelope): string {
  switch (envelope.resolution_state) {
    case "resolved_as_is":
      return envelope.answer || "Resolved.";
    case "needs_more_info":
      return `REFER needs more information: ${envelope.missing_fields.join(", ") || "unspecified"}.`;
    case "needs_script":
      return `REFER needs a script route: ${envelope.script_gap || "unspecified"}.`;
    case "blocked_by_policy_or_scope":
      return `REFER blocked this request: ${envelope.blocked_reason || "unspecified"}.`;
    case "failed_with_reason":
      return `REFER failed: ${envelope.failed_reason || "unspecified"}.`;
  }
}

function handleControlPrompt(prompt: string, workspaceRoot: string): string | null {
  const normalized = prompt.trim().toLowerCase();
  if (normalized === "on") {
    setPersistentContractMode(workspaceRoot, true);
    return "REFER persistent contract mode is on.";
  }

  if (normalized === "off") {
    setPersistentContractMode(workspaceRoot, false);
    return "REFER persistent contract mode is off.";
  }

  if (normalized === "status") {
    const state = readReferChatModeState(workspaceRoot);
    return `REFER contract mode is ${state.persistent_contract_mode ? "on" : "off"}. Active state: ${state.active_contract_mode}.`;
  }

  return null;
}

function writeSessionTurn(
  workspaceRoot: string,
  contract: ReferIntakeContract,
  resolution: ReferResolutionEnvelope,
  assistantOutput: string,
  progress: string[],
): void {
  const session = readLatestReferChatSession(workspaceRoot) ?? createReferChatSession();
  const updatedSession = appendReferChatTurn(session, {
    raw_input_ref: contract.raw_input_ref,
    contract_id: contract.contract_id,
    contract,
    resolution,
    assistant_output: assistantOutput,
    progress,
  });
  writeReferChatSession(workspaceRoot, updatedSession);
}
