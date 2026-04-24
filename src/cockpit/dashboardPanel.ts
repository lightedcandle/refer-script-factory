import * as vscode from "vscode";
import { calculateMetrics, sampleMetricInput } from "../telemetry/metrics";

export class DashboardPanel implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const metrics = calculateMetrics(sampleMetricInput);
    webviewView.webview.options = { enableScripts: false };
    webviewView.webview.html = renderDashboard(metrics);
  }
}

function renderDashboard(metrics: ReturnType<typeof calculateMetrics>): string {
  const secondary = metrics.secondary_gears.join(", ") || "none";
  return `<!doctype html>
<html lang="en">
<body style="font-family: system-ui, sans-serif; padding: 16px;">
  <h1 style="font-size: 18px;">REFER Dashboard</h1>
  <dl>
    <dt>Response MPG</dt><dd>${metrics.response_mpg.toFixed(2)}</dd>
    <dt>Codebase MPG</dt><dd>${metrics.codebase_mpg.toFixed(2)}</dd>
    <dt>Terrain Drag</dt><dd>${metrics.terrain_drag}</dd>
    <dt>Dominant Gear</dt><dd>${metrics.dominant_gear}</dd>
    <dt>Secondary Gears</dt><dd>${secondary}</dd>
    <dt>Repo Health</dt><dd>${metrics.repo_health_score}/100</dd>
  </dl>
</body>
</html>`;
}
