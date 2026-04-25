import * as vscode from "vscode";
import { appendProcessEvent } from "../telemetry/processEvents";
import { createUpdateApplyEvent, createUpdateCheckEvent } from "../updates/updateEvents";
import {
  applyReferUpdate,
  checkForReferUpdates,
  UpdateContext,
} from "../updates/updateSync";

export async function checkForUpdatesCommand(
  extensionContext: vscode.ExtensionContext,
) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before checking REFER updates.",
    );
    return;
  }

  const startedAt = new Date();
  const result = await checkForReferUpdates(updateContext(extensionContext, workspaceRoot));
  appendProcessEvent(createUpdateCheckEvent(result, startedAt), workspaceRoot);
  if (result.up_to_date) {
    await vscode.window.showInformationMessage("REFER is up to date.");
    return;
  }

  const preview = result.pending_artifacts
    .slice(0, 8)
    .map((artifact) => `${artifact.kind}: ${artifact.target_path} -> ${artifact.version}`)
    .join("\n");
  const action = await vscode.window.showInformationMessage(
    `REFER updates available (${result.pending_artifacts.length}).\n${preview}`,
    { modal: false },
    "Apply Update",
    "Later",
  );
  if (action === "Apply Update") {
    await applyUpdateCommand(extensionContext);
  }
}

export async function applyUpdateCommand(
  extensionContext: vscode.ExtensionContext,
) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before applying REFER updates.",
    );
    return;
  }

  const context = updateContext(extensionContext, workspaceRoot);
  const check = await checkForReferUpdates(context);
  if (check.up_to_date) {
    await vscode.window.showInformationMessage("REFER is already up to date.");
    return;
  }

  const confirmation = await vscode.window.showWarningMessage(
    `Apply ${check.pending_artifacts.length} REFER update artifact(s)? Existing targets are backed up under .refer-factory/updates before replacement.`,
    { modal: true },
    "Apply Update",
  );
  if (confirmation !== "Apply Update") {
    return;
  }

  const startedAt = new Date();
  const report = await applyReferUpdate(context, check);
  appendProcessEvent(createUpdateApplyEvent(report, startedAt), workspaceRoot);
  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(report, null, 2),
  });
  await vscode.window.showTextDocument(doc);

  if (report.failed.length > 0) {
    await vscode.window.showErrorMessage(
      `REFER update completed with ${report.failed.length} failure(s).`,
    );
  } else if (report.requires_restart) {
    await vscode.window.showInformationMessage(
      "REFER update applied. Reload VS Code to complete extension-level changes.",
    );
  } else {
    await vscode.window.showInformationMessage("REFER update applied.");
  }
}

export async function checkForUpdatesOnActivation(
  extensionContext: vscode.ExtensionContext,
) {
  const config = vscode.workspace.getConfiguration("refer");
  if (!config.get<boolean>("autoCheckUpdates", true)) {
    return;
  }
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return;
  }
  const result = await checkForReferUpdates(updateContext(extensionContext, workspaceRoot));
  if (!result.up_to_date) {
    const startedAt = new Date();
    appendProcessEvent(createUpdateCheckEvent(result, startedAt), workspaceRoot);
    const action = await vscode.window.showInformationMessage(
      `REFER updates are available (${result.pending_artifacts.length}).`,
      "Apply Update",
      "Later",
    );
    if (action === "Apply Update") {
      await applyUpdateCommand(extensionContext);
    }
  }
}

function updateContext(
  extensionContext: vscode.ExtensionContext,
  workspaceRoot: string,
): UpdateContext {
  const config = vscode.workspace.getConfiguration("refer");
  return {
    extensionRoot: extensionContext.extensionUri.fsPath,
    workspaceRoot,
    channel: config.get("updateChannel", "stable"),
    manifestUrl: config.get("updateManifestUrl", "") || undefined,
  };
}
