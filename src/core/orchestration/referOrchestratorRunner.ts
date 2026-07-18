import {
  createReferIntakeRecord,
  type ReferIntakeRecord,
} from "../contracts/referIntake";
import type { ReferResolutionEnvelope } from "../contracts/referOrchestrator";
import type {
  ReferOutputPort,
  ReferProcessEventPort,
  ReferRuntimeWorkspacePort,
} from "../ports/runtime";
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

export interface ReferCoreOrchestratorRunInput {
  prompt: string;
  model: ReferPromptModel;
  token: ReferCancellationToken;
  workspace: ReferRuntimeWorkspacePort;
  events: ReferProcessEventPort;
  output?: ReferOutputPort;
  now?: () => Date;
}

export async function runReferCoreOrchestratorPrompt(
  input: ReferCoreOrchestratorRunInput,
): Promise<ReferOrchestratorRunResult> {
  const progress: string[] = [];
  const now = input.now ?? (() => new Date());
  const reportProgress = (message: string) => {
    progress.push(message);
    input.output?.progress(message);
  };

  const controlOutput = input.workspace.handleControlPrompt(input.prompt);
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

  const record = createReferIntakeRecord(input.prompt, now());
  const absoluteRecordPath = input.workspace.beginIntake(record);
  const startedAt = now();

  input.events.emit(
    createReferChatEvent({
      contractId: record.contract.contract_id,
      phase: "intake",
      startedAt,
      message: "REFER chat intake stored the raw prompt and intake envelope.",
      outputTarget: record.contract.raw_input_ref,
    }),
  );
  reportProgress("REFER stored the raw prompt and started the bounded resolution loop.");
  reportProgress(`REFER host-provided model: ${input.model.label}.`);

  try {
    input.events.emit(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "provider",
        startedAt: now(),
        message: "REFER selected the host-provided model.",
        providerLabel: input.model.label,
      }),
    );

    const finalEnvelope = await runReferResolutionLoop({
      model: input.model,
      contract: record.contract,
      rawInput: record.raw_input,
      token: input.token,
      onProgress: reportProgress,
      onPass: ({ pass, envelope, decision }) => {
        input.events.emit(
          createReferChatEvent({
            contractId: record.contract.contract_id,
            phase: "pass",
            pass,
            startedAt: now(),
            message: "REFER orchestrator pass completed.",
            envelope,
            decision,
          }),
        );
      },
    });

    input.events.emit(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "terminal",
        startedAt: now(),
        message: "REFER chat cycle reached terminal state.",
        envelope: finalEnvelope,
      }),
    );

    const output = outputForSession(finalEnvelope);
    input.workspace.writeTurn({
      record,
      resolution: finalEnvelope,
      assistantOutput: output,
      progress,
    });
    return successResult(input, record, absoluteRecordPath, finalEnvelope, output, progress);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.events.emit(
      createReferChatEvent({
        contractId: record.contract.contract_id,
        phase: "failure",
        startedAt: now(),
        message: "REFER chat cycle failed before terminal resolution.",
        error: message,
      }),
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
    input.workspace.completeTurn();
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

function successResult(
  input: ReferCoreOrchestratorRunInput,
  record: ReferIntakeRecord,
  absoluteRecordPath: string,
  resolution: ReferResolutionEnvelope,
  output: string,
  progress: string[],
): ReferOrchestratorRunResult {
  return {
    ok: true,
    prompt: input.prompt,
    contract_id: record.contract.contract_id,
    raw_input_ref: record.contract.raw_input_ref,
    absolute_record_path: absoluteRecordPath,
    provider_label: input.model.label,
    output,
    resolution,
    progress,
    error: null,
  };
}
