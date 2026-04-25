import * as vscode from "vscode";
import { createScriptDnaSeed } from "../contracts/scriptDna";
export { ScriptDnaSpec, createScriptDnaSeed } from "../contracts/scriptDna";

export async function emitScriptDnaSeedCommand() {
  const title =
    (await vscode.window.showInputBox({
      title: "Script seed title",
      prompt: "Name the repeated artifact or route this seed script should produce.",
      value: "Custom Artifact Script",
    })) ?? "Custom Artifact Script";

  const seed = createScriptDnaSeed(title);
  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(seed, null, 2),
  });
  await vscode.window.showTextDocument(doc);
}
