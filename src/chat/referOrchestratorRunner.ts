import {
  appendReferChatTurn,
  createReferChatSession,
  readLatestReferChatSession,
  writeReferChatSession,
} from "../contracts/referChatSession";
import {
  markContractTurnComplete,
  markTemporaryContractActive,
  readReferChatModeState,
  setPersistentContractMode,
} from "../contracts/referChatMode";
import { writeReferIntakeRecord } from "../contracts/referIntake";
import {
  createNeverCancelledToken,
  outputForSession,
  runReferCoreOrchestratorPrompt,
  type ReferOrchestratorRunResult,
} from "../core/orchestration/referOrchestratorRunner";
import type { ReferRuntimeTurn } from "../core/ports/runtime";
import { appendProcessEvent } from "../telemetry/processEvents";
import type { ReferCancellationToken, ReferPromptModel } from "./referPromptModel";

export { createNeverCancelledToken, outputForSession };
export type { ReferOrchestratorRunResult };

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
  return runReferCoreOrchestratorPrompt({
    prompt: input.prompt,
    model: input.model,
    token: input.token,
    workspace: {
      handleControlPrompt: (prompt) => handleControlPrompt(prompt, input.workspaceRoot),
      beginIntake(record) {
        markTemporaryContractActive(input.workspaceRoot);
        return writeReferIntakeRecord(input.workspaceRoot, record);
      },
      writeTurn: (turn) => writeSessionTurn(input.workspaceRoot, turn),
      completeTurn: () => markContractTurnComplete(input.workspaceRoot),
    },
    events: {
      emit: (event) => appendProcessEvent(event, input.workspaceRoot),
    },
    output: input.onProgress ? { progress: input.onProgress } : undefined,
  });
}

function handleControlPrompt(prompt: string, workspaceRoot: string): string | null {
  const normalized = prompt.trim().toLowerCase();
  if (normalized === "on") {
    setPersistentContractMode(workspaceRoot, true);
    return "REFER legacy intake-session tracking is on. This is not execution authority.";
  }

  if (normalized === "off") {
    setPersistentContractMode(workspaceRoot, false);
    return "REFER legacy intake-session tracking is off.";
  }

  if (normalized === "status") {
    const state = readReferChatModeState(workspaceRoot);
    return `REFER legacy intake-session tracking is ${state.persistent_contract_mode ? "on" : "off"}. Active runtime state: ${state.active_contract_mode}. This is not execution authority.`;
  }

  return null;
}

function writeSessionTurn(workspaceRoot: string, turn: ReferRuntimeTurn): void {
  const session = readLatestReferChatSession(workspaceRoot) ?? createReferChatSession();
  const updatedSession = appendReferChatTurn(session, {
    raw_input_ref: turn.record.contract.raw_input_ref,
    contract_id: turn.record.contract.contract_id,
    contract: turn.record.contract,
    resolution: turn.resolution,
    assistant_output: turn.assistantOutput,
    progress: turn.progress,
  });
  writeReferChatSession(workspaceRoot, updatedSession);
}
