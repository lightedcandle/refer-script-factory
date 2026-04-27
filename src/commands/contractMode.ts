import * as vscode from "vscode";
import {
  readReferChatModeState,
  setPersistentContractMode,
} from "../contracts/referChatMode";

export async function contractModeOnCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before enabling REFER persistent contract mode.",
    );
    return;
  }

  setPersistentContractMode(workspaceRoot, true);
  await vscode.window.showInformationMessage(
    "REFER persistent contract mode is on.",
  );
}

export async function contractModeOffCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before disabling REFER persistent contract mode.",
    );
    return;
  }

  setPersistentContractMode(workspaceRoot, false);
  await vscode.window.showInformationMessage(
    "REFER persistent contract mode is off.",
  );
}

export async function contractModeToggleCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before toggling REFER persistent contract mode.",
    );
    return;
  }

  const current = readReferChatModeState(workspaceRoot);
  const next = setPersistentContractMode(
    workspaceRoot,
    !current.persistent_contract_mode,
  );
  await vscode.window.showInformationMessage(
    `REFER persistent contract mode is ${next.persistent_contract_mode ? "on" : "off"}.`,
  );
}
