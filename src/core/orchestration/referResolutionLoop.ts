import type { ReferPromptModel, ReferCancellationToken } from "./referPromptModel";
import type { ReferIntakeContract } from "../contracts/referIntake";
import {
  createOrchestratorPrompt,
  decideReferNextAction,
  maxReferOrchestratorPasses,
  parseResolutionEnvelope,
  ReferLoopDecision,
  ReferResolutionEnvelope,
} from "../contracts/referOrchestrator";

export interface ReferResolutionLoopInput {
  model: ReferPromptModel;
  contract: ReferIntakeContract;
  rawInput: string;
  token: ReferCancellationToken;
  onProgress?: (message: string) => void;
  onPass?: (event: {
    pass: number;
    envelope: ReferResolutionEnvelope;
    decision: ReferLoopDecision;
  }) => void;
}

export async function runReferResolutionLoop(
  input: ReferResolutionLoopInput,
): Promise<ReferResolutionEnvelope> {
  let pass = 1;
  let rawInputAlreadyUsed = false;
  let previousEnvelope: ReferResolutionEnvelope | undefined;

  while (pass <= maxReferOrchestratorPasses) {
    const prompt = createOrchestratorPrompt({
      contract: input.contract,
      pass,
      rawInput: rawInputAlreadyUsed ? input.rawInput : undefined,
      previousEnvelope,
    });
    const text = await input.model.sendPrompt(prompt, input.token);
    const envelope = tryParseResolutionEnvelope(text);
    const decision = decideReferNextAction({
      envelope,
      pass,
      rawInputAvailable: input.rawInput.length > 0,
      rawInputAlreadyUsed,
    });

    input.onProgress?.(
      `REFER pass ${pass}: ${envelope.resolution_state} (${decision.next_action}).`,
    );
    input.onPass?.({ pass, envelope, decision });

    if (decision.next_action === "scan_raw_input") {
      previousEnvelope = envelope;
      rawInputAlreadyUsed = true;
      pass += 1;
      continue;
    }

    return envelope;
  }

  return {
    resolution_state: "failed_with_reason",
    answer: "",
    missing_fields: [],
    script_gap: "",
    blocked_reason: "",
    failed_reason: "REFER exceeded the bounded resolution loop.",
  };
}

function tryParseResolutionEnvelope(text: string): ReferResolutionEnvelope {
  try {
    return parseResolutionEnvelope(text);
  } catch (error) {
    return {
      resolution_state: "failed_with_reason",
      answer: "",
      missing_fields: [],
      script_gap: "",
      blocked_reason: "",
      failed_reason: `Model did not return a valid REFER resolution envelope. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
