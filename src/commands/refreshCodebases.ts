import * as vscode from "vscode";
import {
  refreshCodebaseRegistry,
  writeCodebaseRegistry,
} from "../bootstrap/codebases";

export async function refreshCodebasesCommand() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before refreshing REFER codebases.",
    );
    return;
  }

  const registry = refreshCodebaseRegistry(workspaceRoot);
  writeCodebaseRegistry(workspaceRoot, registry);

  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(registry, null, 2),
  });
  await vscode.window.showTextDocument(doc);
  await vscode.window.showInformationMessage(
    `REFER codebase registry refreshed (${registry.codebases.length} entr${registry.codebases.length === 1 ? "y" : "ies"}).`,
  );
}

export function refreshCodebasesOnActivation(): void {
  const config = vscode.workspace.getConfiguration("refer");
  if (!config.get<boolean>("autoRefreshCodebases", true)) {
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    return;
  }

  const registry = refreshCodebaseRegistry(workspaceRoot);
  writeCodebaseRegistry(workspaceRoot, registry);
}
