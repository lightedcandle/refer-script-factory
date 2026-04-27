import * as vscode from "vscode";
import { ContractChatPanel } from "./cockpit/contractChatPanel";
import { DashboardPanel } from "./cockpit/dashboardPanel";
import { BootstrapLibraryPanel, ReferLibraryPanel } from "./cockpit/libraryPanel";
import { ProcessPanel } from "./cockpit/processPanel";
import { ScriptFactoryPanel } from "./cockpit/scriptFactoryPanel";

import { initializeRepoCommand } from "./commands/initializeRepo";
import {
  contractModeOffCommand,
  contractModeOnCommand,
  contractModeToggleCommand,
} from "./commands/contractMode";
import { emitSendContractCommand } from "./commands/emitSendContract";
import { emitScriptDnaSeedCommand } from "./commands/emitScriptDnaSeed";
import { emitScriptBlueprintCommand } from "./commands/emitScriptBlueprint";
import {
  scanCodebaseCommand,
  viewCodebaseTreeCommand,
} from "./commands/scanCodebase";
import {
  scanFactoryGapsCommand,
  viewFactoryGapsCommand,
} from "./commands/scanFactoryGaps";
import {
  runScriptographerCommand,
  viewScriptographerReportCommand,
} from "./commands/runScriptographer";
import {
  applyUpdateCommand,
  checkForUpdatesCommand,
  checkForUpdatesOnActivation,
} from "./commands/updateSync";
import {
  refreshCodebasesCommand,
  refreshCodebasesOnActivation,
} from "./commands/refreshCodebases";
import { registerReferChatParticipant } from "./chat/referParticipant";

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
    vscode.window.registerWebviewViewProvider(
      "refer.scriptFactory",
      new ScriptFactoryPanel(),
    ),

    vscode.window.registerWebviewViewProvider(
      "refer.chat",
      new ContractChatPanel(),
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
    vscode.commands.registerCommand(
      "refer.scanCodebase",
      scanCodebaseCommand,
    ),
    vscode.commands.registerCommand(
      "refer.viewCodebaseTree",
      viewCodebaseTreeCommand,
    ),
    vscode.commands.registerCommand(
      "refer.scanFactoryGaps",
      scanFactoryGapsCommand,
    ),
    vscode.commands.registerCommand(
      "refer.viewFactoryGaps",
      viewFactoryGapsCommand,
    ),
    vscode.commands.registerCommand(
      "refer.runScriptographer",
      runScriptographerCommand,
    ),
    vscode.commands.registerCommand(
      "refer.viewScriptographerReport",
      viewScriptographerReportCommand,
    ),
    vscode.commands.registerCommand("refer.checkForUpdates", () =>
      checkForUpdatesCommand(context),
    ),
    vscode.commands.registerCommand("refer.applyUpdate", () =>
      applyUpdateCommand(context),
    ),
    vscode.commands.registerCommand(
      "refer.contractModeOn",
      contractModeOnCommand,
    ),
    vscode.commands.registerCommand(
      "refer.contractModeOff",
      contractModeOffCommand,
    ),
    vscode.commands.registerCommand(
      "refer.contractModeToggle",
      contractModeToggleCommand,
    ),
    registerReferChatParticipant(context),
  );

  try {
    refreshCodebasesOnActivation();
  } catch (error) {
    console.warn("REFER auto-refresh failed during activation.", error);
  }

  void checkForUpdatesOnActivation(context).catch((error: unknown) => {
    console.warn("REFER update check failed during activation.", error);
  });
}

export function deactivate() {
  // No runtime resources are held in the first slice.
}
