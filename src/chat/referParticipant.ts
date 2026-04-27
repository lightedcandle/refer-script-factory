import * as vscode from "vscode";
import {
  appendReferChatTurn,
  createReferChatSession,
  readLatestReferChatSession,
  writeReferChatSession,
} from "../contracts/referChatSession";
import {
  createReferIntakeRecord,
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
import { createConfiguredReferPromptModel } from "./referModelProvider";
import { createReferChatEvent } from "./referProcessEvents";
import { runReferResolutionLoop } from "./referResolutionLoop";

const PARTICIPANT_ID = "refer-script-factory.refer";

export function registerReferChatParticipant(
  context: vscode.ExtensionContext,
): vscode.Disposable {
  const output = vscode.window.createOutputChannel("REFER Chat");
  output.appendLine(`Registering native VS Code Chat participant: ${PARTICIPANT_ID}`);

  if (!vscode.chat?.createChatParticipant) {
    output.appendLine("VS Code Chat participant API is unavailable in this Extension Host.");
    return output;
  }

  const participant = vscode.chat.createChatParticipant(
    PARTICIPANT_ID,
    async (request, _chatContext, response, token) => {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!workspaceRoot) {
        response.markdown(
          "Open a workspace before using REFER intake so the raw prompt can be stored locally.",
        );
        return;
      }

      if (handleContractModePrompt(request.prompt, workspaceRoot, response)) {
        return;
      }

      markTemporaryContractActive(workspaceRoot);
      const record = createReferIntakeRecord(request.prompt);
      const absoluteRecordPath = writeReferIntakeRecord(workspaceRoot, record);
      const startedAt = new Date();
      appendProcessEvent(
        createReferChatEvent({
          contractId: record.contract.contract_id,
          phase: "intake",
          startedAt,
          message: "REFER chat intake stored raw prompt and compact contract.",
          outputTarget: record.contract.raw_input_ref,
        }),
        workspaceRoot,
      );

      response.progress("REFER stored the raw prompt and started the bounded resolution loop.");
      response.markdown(
        `REFER intake contract: \`${record.contract.contract_id}\`\n\nRaw prompt stored at \`${record.contract.raw_input_ref}\`.`,
      );

      try {
        const referModel = createConfiguredReferPromptModel(request.model);
        response.progress(`REFER model provider: ${referModel.label}.`);
        response.markdown(`\n\nREFER model provider: \`${referModel.label}\`.`);
        response.progress("Thinking...");
        appendProcessEvent(
          createReferChatEvent({
            contractId: record.contract.contract_id,
            phase: "provider",
            startedAt: new Date(),
            message: "REFER selected model provider.",
            providerLabel: referModel.label,
          }),
          workspaceRoot,
        );
        const finalEnvelope = await runReferResolutionLoop({
            model: referModel,
            contract: record.contract,
            rawInput: record.raw_input,
            token,
            onProgress: (message) => response.progress(message),
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
                workspaceRoot,
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
          workspaceRoot,
        );

        response.markdown(`\n\n---\n\n${renderEnvelope(finalEnvelope)}`);
        const session = readLatestReferChatSession(workspaceRoot) ?? createReferChatSession();
        const updatedSession = appendReferChatTurn(session, {
          raw_input_ref: record.contract.raw_input_ref,
          contract_id: record.contract.contract_id,
          contract: record.contract,
          resolution: finalEnvelope,
          assistant_output: outputForSession(finalEnvelope),
          progress: [],
        });
        writeReferChatSession(workspaceRoot, updatedSession);
      } catch (error) {
        appendProcessEvent(
          createReferChatEvent({
            contractId: record.contract.contract_id,
            phase: "failure",
            startedAt: new Date(),
            message: "REFER chat cycle failed before terminal resolution.",
            error: error instanceof Error ? error.message : String(error),
          }),
          workspaceRoot,
        );
        response.markdown(
          `\n\nREFER created the compact contract, but the bounded loop failed. Raw intake record: \`${absoluteRecordPath}\`.\n\n${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        markContractTurnComplete(workspaceRoot);
      }
    },
  );

  participant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "resources",
    "refer.svg",
  );
  output.appendLine("Native VS Code Chat participant registered as @refer.");

  return vscode.Disposable.from(participant, output);
}

function handleContractModePrompt(
  prompt: string,
  workspaceRoot: string,
  response: vscode.ChatResponseStream,
): boolean {
  const normalized = prompt.trim().toLowerCase();
  if (normalized === "on") {
    setPersistentContractMode(workspaceRoot, true);
    response.markdown("REFER persistent contract mode is on.");
    return true;
  }

  if (normalized === "off") {
    setPersistentContractMode(workspaceRoot, false);
    response.markdown("REFER persistent contract mode is off.");
    return true;
  }

  if (normalized === "status") {
    const state = readReferChatModeState(workspaceRoot);
    response.markdown(
      `REFER contract mode is ${state.persistent_contract_mode ? "on" : "off"}. Active state: \`${state.active_contract_mode}\`.`,
    );
    return true;
  }

  return false;
}

function outputForSession(envelope: ReferResolutionEnvelope): string {
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

function renderEnvelope(envelope: ReferResolutionEnvelope): string {
  switch (envelope.resolution_state) {
    case "resolved_as_is":
      return envelope.answer || "Resolved.";
    case "needs_more_info":
      return `REFER needs more information before it can resolve this.\n\nMissing fields: ${formatList(envelope.missing_fields)}`;
    case "needs_script":
      return `REFER needs a script route before this can be repeatable.\n\nScript gap: ${envelope.script_gap || "unspecified"}`;
    case "blocked_by_policy_or_scope":
      return `REFER blocked this request.\n\nReason: ${envelope.blocked_reason || "unspecified"}`;
    case "failed_with_reason":
      return `REFER failed to resolve this request.\n\nReason: ${envelope.failed_reason || "unspecified"}`;
  }
}

function formatList(values: string[]): string {
  if (values.length === 0) {
    return "unspecified";
  }

  return values.map((value) => `\`${value}\``).join(", ");
}
