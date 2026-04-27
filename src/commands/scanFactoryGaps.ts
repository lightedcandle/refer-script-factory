import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  factoryGapReportPath,
  scanFactoryGaps,
  writeFactoryGapReport,
} from "../contracts/factoryGaps";
import { appendProcessEvent } from "../telemetry/processEvents";

export async function scanFactoryGapsCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before running REFER: Scan Factory Gaps.",
    );
    return;
  }

  const startedAt = new Date();
  appendProcessEvent(
    {
      id: `factory-gap-scan-${startedAt.getTime()}-running`,
      script_name: "factory-gap-scan",
      status: "running",
      started_at: startedAt.toISOString(),
      elapsed_ms: 0,
      dominant_gear: "factory",
      output_target: factoryGapReportPath(workspaceRoot),
      efficiency_state: "capital-burn",
      message: "Scanning factory system gaps.",
      error: null,
    },
    workspaceRoot,
  );

  try {
    const report = scanFactoryGaps(workspaceRoot, startedAt);
    const reportPath = writeFactoryGapReport(workspaceRoot, report);
    appendProcessEvent(
      {
        id: `factory-gap-scan-${startedAt.getTime()}-completed`,
        script_name: "factory-gap-scan",
        status: report.summary.errors > 0 ? "blocked" : "completed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: reportPath,
        efficiency_state: report.summary.errors > 0 ? "blocked" : "return",
        message: `Factory gap scan found ${report.summary.total} gap${report.summary.total === 1 ? "" : "s"}.`,
        error: null,
      },
      workspaceRoot,
    );

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(reportPath));
    await vscode.window.showTextDocument(document, { preview: true });
    await vscode.window.showInformationMessage(
      `REFER factory gap scan complete. ${report.summary.total} gap${report.summary.total === 1 ? "" : "s"} found.`,
    );
  } catch (error) {
    appendProcessEvent(
      {
        id: `factory-gap-scan-${startedAt.getTime()}-failed`,
        script_name: "factory-gap-scan",
        status: "failed",
        started_at: startedAt.toISOString(),
        elapsed_ms: Date.now() - startedAt.getTime(),
        dominant_gear: "factory",
        output_target: factoryGapReportPath(workspaceRoot),
        efficiency_state: "blocked",
        message: "Factory gap scan failed.",
        error: error instanceof Error ? error.message : String(error),
      },
      workspaceRoot,
    );
    await vscode.window.showErrorMessage(
      `REFER factory gap scan failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function viewFactoryGapsCommand(): Promise<void> {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    await vscode.window.showWarningMessage(
      "Open a workspace before viewing REFER factory gaps.",
    );
    return;
  }

  const target = factoryGapReportPath(workspaceRoot);
  if (!fs.existsSync(target)) {
    await vscode.window.showWarningMessage(
      "No REFER factory gap report exists yet. Run REFER: Scan Factory Gaps first.",
    );
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(target));
  await vscode.window.showTextDocument(document, { preview: true });
}
