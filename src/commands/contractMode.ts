import * as vscode from "vscode";
import {
  readReferChatModeState,
  setPersistentContractMode,
} from "../contracts/referChatMode";

export async function contractModeOnCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a target workspace before enabling REFER legacy intake-session tracking.",
    );
    return;
  }

  setPersistentContractMode(workspaceRoot, true);
  await vscode.window.showInformationMessage(
    "REFER legacy intake-session tracking is on. This is not execution authority.",
  );
}

export async function contractModeOffCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a target workspace before disabling REFER legacy intake-session tracking.",
    );
    return;
  }

  setPersistentContractMode(workspaceRoot, false);
  await vscode.window.showInformationMessage(
    "REFER legacy intake-session tracking is off.",
  );
}

export async function contractModeToggleCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a target workspace before toggling REFER legacy intake-session tracking.",
    );
    return;
  }

  const current = readReferChatModeState(workspaceRoot);
  const next = setPersistentContractMode(
    workspaceRoot,
    !current.persistent_contract_mode,
  );
  await vscode.window.showInformationMessage(
    `REFER legacy intake-session tracking is ${next.persistent_contract_mode ? "on" : "off"}. This is not execution authority.`,
  );
}
