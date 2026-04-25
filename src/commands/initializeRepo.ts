import * as vscode from "vscode";
import { applyBootstrap } from "../bootstrap/apply";
import { createBootstrapDryRun } from "../bootstrap/dryRun";
import {
  createBootstrapApplyEvent,
  createBootstrapCancelledEvent,
  createBootstrapDryRunEvent,
} from "../bootstrap/processEvents";
import {
  createApplyHealthSnapshot,
  createCancelledHealthSnapshot,
  createDryRunHealthSnapshot,
  setBootstrapHealthSnapshot,
} from "../telemetry/bootstrapHealth";
import { appendProcessEvent } from "../telemetry/processEvents";

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

  const startedAt = new Date();
  const eventPrefix = `bootstrap-${startedAt.getTime()}`;
  const report = createBootstrapDryRun({
    workspace_root: workspaceRoot,
    repo_purpose: repoPurpose,
    framework,
  });
  setBootstrapHealthSnapshot(createDryRunHealthSnapshot(report));
  appendProcessEvent(
    createBootstrapDryRunEvent(report, {
      id_prefix: eventPrefix,
      started_at: startedAt.toISOString(),
      elapsed_ms: Date.now() - startedAt.getTime(),
    }),
    workspaceRoot,
  );

  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(report, null, 2),
  });
  await vscode.window.showTextDocument(doc);

  const apply = await vscode.window.showWarningMessage(
    "Apply REFER bootstrap to this workspace? Existing agent instructions keep their content; REFER adds or updates only its bounded governance block.",
    { modal: true },
    "Apply Bootstrap",
  );

  if (apply !== "Apply Bootstrap") {
    setBootstrapHealthSnapshot(createCancelledHealthSnapshot(report));
    appendProcessEvent(
      createBootstrapCancelledEvent({
        id_prefix: eventPrefix,
        started_at: new Date().toISOString(),
        elapsed_ms: 0,
      }),
      workspaceRoot,
    );
    return;
  }

  const applyStartedAt = new Date();
  const applyReport = applyBootstrap(
    {
      workspace_root: workspaceRoot,
      repo_purpose: repoPurpose,
      framework,
    },
    { update_existing: true },
  );
  setBootstrapHealthSnapshot(createApplyHealthSnapshot(applyReport));
  appendProcessEvent(
    createBootstrapApplyEvent(applyReport, {
      id_prefix: eventPrefix,
      started_at: applyStartedAt.toISOString(),
      elapsed_ms: Date.now() - applyStartedAt.getTime(),
    }),
    workspaceRoot,
  );

  const applyDoc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(applyReport, null, 2),
  });
  await vscode.window.showTextDocument(applyDoc);
}
