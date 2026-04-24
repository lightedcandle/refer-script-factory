import * as vscode from "vscode";
import { createBootstrapDryRun } from "../bootstrap/dryRun";

export async function initializeRepoCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before running REFER: Initialize Repo.",
    );
    return;
  }

  const repoPurpose =
    (await vscode.window.showInputBox({
      title: "Repo purpose",
      prompt: "Describe what this repo is for.",
      value: "REFER-enabled application repo",
    })) ?? "REFER-enabled application repo";

  const framework =
    (await vscode.window.showInputBox({
      title: "Framework/runtime",
      prompt: "Example: Angular, React, Python service, generic",
      value: "generic",
    })) ?? "generic";

  const report = createBootstrapDryRun({
    workspace_root: workspaceRoot,
    repo_purpose: repoPurpose,
    framework,
  });

  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(report, null, 2),
  });
  await vscode.window.showTextDocument(doc);
}
