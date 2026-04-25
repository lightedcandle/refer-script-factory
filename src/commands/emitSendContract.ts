import * as vscode from "vscode";
import { createSendContractDraft } from "../contracts/sendContract";
export { SendContractDraft, createSendContractDraft } from "../contracts/sendContract";

export async function emitSendContractCommand() {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "active-workspace";
  const draft = createSendContractDraft(workspaceRoot);
  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(draft, null, 2),
  });
  await vscode.window.showTextDocument(doc);
}
