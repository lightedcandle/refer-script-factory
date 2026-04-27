import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  agentContextPath,
  codebaseTreePath,
  scanCodebaseTree,
  writeAgentContext,
  writeCodebaseTree,
} from "../contracts/codebaseTree";
import { scriptLegendPath, writeScriptLegend } from "../contracts/scriptLegend";
import { appendProcessEvent } from "../telemetry/processEvents";

export async function scanCodebaseCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before running REFER: Scan Codebase.",
    );
    return;
  }

  const startedAt = new Date();
  appendProcessEvent(
    {
      id: `codebase-scan-${startedAt.getTime()}-running`,
      script_name: "codebase-scan",
      status: "running",
      started_at: startedAt.toISOString(),
      elapsed_ms: 0,
      dominant_gear: "factory",
      output_target: codebaseTreePath(workspaceRoot),
      efficiency_state: "capital-burn",
      message: "Scanning codebase tree.",
      error: null,
    },
    workspaceRoot,
  );

  try {
    const tree = scanCodebaseTree(workspaceRoot, startedAt);
    const treePath = writeCodebaseTree(workspaceRoot, tree);
    writeAgentContext(workspaceRoot, tree);
    writeScriptLegend(workspaceRoot);
    appendProcessEvent(
      {
        id: `codebase-scan-${startedAt.getTime()}-completed`,
        script_name: "codebase-scan",
        status: "completed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: treePath,
        efficiency_state: "capital-burn",
        message: `Codebase scan completed with ${tree.summary.file_count} files and ${tree.summary.directory_count} directories.`,
        error: null,
      },
      workspaceRoot,
    );

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(treePath));
    await vscode.window.showTextDocument(document, { preview: true });
    await vscode.window.showInformationMessage(
      `REFER codebase scan complete. Agent context: ${agentContextPath(workspaceRoot)}. Script legend: ${scriptLegendPath(workspaceRoot)}`,
    );
  } catch (error) {
    appendProcessEvent(
      {
        id: `codebase-scan-${startedAt.getTime()}-failed`,
        script_name: "codebase-scan",
        status: "failed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: codebaseTreePath(workspaceRoot),
        efficiency_state: "blocked",
        message: "Codebase scan failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      workspaceRoot,
    );
    await vscode.window.showErrorMessage(
      `REFER codebase scan failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function viewCodebaseTreeCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before viewing the REFER codebase tree.",
    );
    return;
  }

  const target = codebaseTreePath(workspaceRoot);
  if (!fs.existsSync(target)) {
    await vscode.window.showWarningMessage(
      "No REFER codebase tree exists yet. Run REFER: Scan Codebase first.",
    );
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(target));
  await vscode.window.showTextDocument(document, { preview: true });
}
