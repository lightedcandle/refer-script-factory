import * as vscode from "vscode";
import { DashboardPanel } from "./cockpit/dashboardPanel";
import { ChatPanel } from "./cockpit/chatPanel";
import { ProcessPanel } from "./cockpit/processPanel";
import { initializeRepoCommand } from "./commands/initializeRepo";
import { emitSendContractCommand } from "./commands/emitSendContract";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "refer.dashboard",
      new DashboardPanel(),
    ),
    vscode.window.registerWebviewViewProvider("refer.chat", new ChatPanel()),
    vscode.window.registerWebviewViewProvider(
      "refer.process",
      new ProcessPanel(),
    ),
    vscode.commands.registerCommand(
      "refer.initializeRepo",
      initializeRepoCommand,
    ),
    vscode.commands.registerCommand(
      "refer.emitSendContract",
      emitSendContractCommand,
    ),
  );
}

export function deactivate() {
  // No runtime resources are held in the first slice.
}
