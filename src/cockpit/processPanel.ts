import * as vscode from "vscode";
import { sampleProcessEvents } from "../telemetry/processEvents";

export class ProcessPanel implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: false };
    const rows = sampleProcessEvents
      .map(
        (event) => `<tr>
  <td>${event.script_name}</td>
  <td>${event.status}</td>
  <td>${event.elapsed_ms}ms</td>
  <td>${event.dominant_gear}</td>
  <td>${event.efficiency_state}</td>
</tr>`,
      )
      .join("");
    webviewView.webview.html = `<!doctype html>
<html lang="en">
<body style="font-family: system-ui, sans-serif; padding: 16px;">
  <h1 style="font-size: 18px;">Factory Process</h1>
  <table>
    <thead><tr><th>Script</th><th>Status</th><th>Elapsed</th><th>Gear</th><th>Efficiency</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
  }
}
