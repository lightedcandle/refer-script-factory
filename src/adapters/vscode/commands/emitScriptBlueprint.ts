import * as vscode from "vscode";
import { createScriptBlueprint } from "../../../core/contracts/scriptBlueprint";
export { ScriptBlueprint, createScriptBlueprint } from "../../../core/contracts/scriptBlueprint";

export async function emitScriptBlueprintCommand() {
  const blueprint = createScriptBlueprint();
  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(blueprint, null, 2),
  });
  await vscode.window.showTextDocument(doc);
}
