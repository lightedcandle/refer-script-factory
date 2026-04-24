import * as vscode from "vscode";
import { createSendContractDraft } from "../commands/emitSendContract";

export class ChatPanel implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const draft = createSendContractDraft();
    webviewView.webview.options = { enableScripts: false };
    webviewView.webview.html = `<!doctype html>
<html lang="en">
<body style="font-family: system-ui, sans-serif; padding: 16px;">
  <h1 style="font-size: 18px;">Governed Chat</h1>
  <p>This first slice emits a Send Contract draft. Live model orchestration is out of scope.</p>
  <pre style="white-space: pre-wrap;">${escapeHtml(JSON.stringify(draft, null, 2))}</pre>
</body>
</html>`;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}
