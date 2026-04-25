import * as vscode from "vscode";
import { DashboardPanel } from "./cockpit/dashboardPanel";
import { BootstrapLibraryPanel, ReferLibraryPanel } from "./cockpit/libraryPanel";
import { ProcessPanel } from "./cockpit/processPanel";
import { initializeRepoCommand } from "./commands/initializeRepo";
import { emitSendContractCommand } from "./commands/emitSendContract";
import { emitScriptDnaSeedCommand } from "./commands/emitScriptDnaSeed";
import { emitScriptBlueprintCommand } from "./commands/emitScriptBlueprint";
import {
  applyUpdateCommand,
  checkForUpdatesCommand,
  checkForUpdatesOnActivation,
} from "./commands/updateSync";
import {
  refreshCodebasesCommand,
  refreshCodebasesOnActivation,
} from "./commands/refreshCodebases";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "refer.dashboard",
      new DashboardPanel(),
    ),
    vscode.window.registerWebviewViewProvider(
      "refer.process",
      new ProcessPanel(),
    ),
    vscode.window.registerWebviewViewProvider(
      "refer.library",
      new BootstrapLibraryPanel(context),
    ),
    vscode.window.registerWebviewViewProvider(
      "refer.referLibrary",
      new ReferLibraryPanel(context),
    ),
    vscode.commands.registerCommand(
      "refer.initializeRepo",
      initializeRepoCommand,
    ),
    vscode.commands.registerCommand(
      "refer.emitSendContract",
      emitSendContractCommand,
    ),
    vscode.commands.registerCommand(
      "refer.emitScriptBlueprint",
      emitScriptBlueprintCommand,
    ),
    vscode.commands.registerCommand(
      "refer.emitScriptDnaSeed",
      emitScriptDnaSeedCommand,
    ),
    vscode.commands.registerCommand(
      "refer.refreshCodebases",
      refreshCodebasesCommand,
    ),
    vscode.commands.registerCommand("refer.checkForUpdates", () =>
      checkForUpdatesCommand(context),
    ),
    vscode.commands.registerCommand("refer.applyUpdate", () =>
      applyUpdateCommand(context),
    ),
  );
  refreshCodebasesOnActivation();
  void checkForUpdatesOnActivation(context);
}

export function deactivate() {
  // No runtime resources are held in the first slice.
}
