import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  runScriptographer,
  scriptographerReportPath,
  writeScriptographerReport,
} from "../contracts/scriptographer";
import { appendProcessEvent } from "../telemetry/processEvents";

export async function runScriptographerCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before running REFER: Run Scriptographer.",
    );
    return;
  }

  const startedAt = new Date();
  appendProcessEvent(
    {
      id: `scriptographer-${startedAt.getTime()}-running`,
      script_name: "scriptographer",
      status: "running",
      started_at: startedAt.toISOString(),
      elapsed_ms: 0,
      dominant_gear: "factory",
      output_target: scriptographerReportPath(workspaceRoot),
      efficiency_state: "capital-burn",
      message: "Discovering and classifying factory vocabulary.",
      error: null,
    },
    workspaceRoot,
  );

  try {
    const report = runScriptographer(workspaceRoot, startedAt);
    const reportPath = writeScriptographerReport(workspaceRoot, report);
    appendProcessEvent(
      {
        id: `scriptographer-${startedAt.getTime()}-completed`,
        script_name: "scriptographer",
        status: report.summary.unratified > 0 ? "blocked" : "completed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: reportPath,
        efficiency_state: report.summary.unratified > 0 ? "blocked" : "return",
        message: `Scriptographer found ${report.summary.unratified} unratified candidate${report.summary.unratified === 1 ? "" : "s"}.`,
        error: null,
      },
      workspaceRoot,
    );

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(reportPath));
    await vscode.window.showTextDocument(document, { preview: true });
    await vscode.window.showInformationMessage(
      `REFER Scriptographer complete. ${report.summary.unratified} unratified candidate${report.summary.unratified === 1 ? "" : "s"} found.`,
    );
  } catch (error) {
    appendProcessEvent(
      {
        id: `scriptographer-${startedAt.getTime()}-failed`,
        script_name: "scriptographer",
        status: "failed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: scriptographerReportPath(workspaceRoot),
        efficiency_state: "blocked",
        message: "Scriptographer failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      workspaceRoot,
    );
    await vscode.window.showErrorMessage(
      `REFER Scriptographer failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function viewScriptographerReportCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before viewing the REFER Scriptographer report.",
    );
    return;
  }

  const target = scriptographerReportPath(workspaceRoot);
  if (!fs.existsSync(target)) {
    await vscode.window.showWarningMessage(
      "No REFER Scriptographer report exists yet. Run REFER: Run Scriptographer first.",
    );
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(target));
  await vscode.window.showTextDocument(document, { preview: true });
}
