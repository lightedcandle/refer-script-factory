import * as vscode from "vscode";
import { cockpitStyles, escapeHtml } from "./html";
import {
  getProcessEvents,
  getProcessState,
  onProcessEventsChanged,
  ProcessEvent,
  ProcessState,
} from "../telemetry/processEvents";

export class ProcessPanel implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const state = workspaceRoot ? getProcessState(workspaceRoot) : null;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body>
  <main class="surface">
    <h1>Factory Process</h1>
    <p class="summary">Current process state, bounded recent events, and daily history.</p>
    <section aria-label="Process state" id="process-state">${state ? renderProcessState(state) : ""}</section>
    <section class="process-list" aria-label="Process events" id="process-list">${renderRows(getProcessEvents(workspaceRoot))}</section>
  </main>
  <script>
    const state = document.getElementById("process-state");
    const list = document.getElementById("process-list");
    window.addEventListener("message", (event) => {
      if (event.data?.type !== "process-events") {
        return;
      }
      state.innerHTML = event.data.stateHtml;
      list.innerHTML = event.data.html;
    });
  </script>
</body>
</html>`;

    const unsubscribe = onProcessEventsChanged(() => {
      void webviewView.webview.postMessage({
        type: "process-events",
        stateHtml: workspaceRoot ? renderProcessState(getProcessState(workspaceRoot)) : "",
        html: renderRows(getProcessEvents(workspaceRoot)),
      });
    });
    webviewView.onDidDispose(unsubscribe);
  }
}

function renderProcessState(state: ProcessState): string {
  const lastEvent = state.current.last_event;
  const latestDay = state.daily_history.at(-1);
  const latestDayText = latestDay
    ? `${latestDay.date} (${latestDay.total})`
    : "none";

  return `<div class="metric-grid">
  ${summaryMetric("Total", String(state.current.total))}
  ${summaryMetric("Completed", String(state.current.by_status.completed))}
  ${summaryMetric("Failed", String(state.current.by_status.failed))}
  ${summaryMetric("Latest day", latestDayText)}
</div>
${lastEvent ? `<p class="summary">Last event: ${escapeHtml(lastEvent.script_name)} / ${escapeHtml(lastEvent.status)}</p>` : ""}
${renderDailyHistory(state)}`;
}

function renderDailyHistory(state: ProcessState): string {
  if (state.daily_history.length === 0) {
    return "";
  }

  const rows = state.daily_history
    .slice(-7)
    .reverse()
    .map(
      (day) => `<article class="process-row">
  <div class="process-head">
    <div class="process-name">${escapeHtml(day.date)}</div>
    <span class="badge">${day.total}</span>
  </div>
  <div class="process-meta">
    <div>${day.elapsed_ms}ms</div>
    <div>${day.by_status.completed} done</div>
    <div>${day.by_status.failed} failed</div>
  </div>
</article>`,
    )
    .join("");

  return `<h2>Daily History</h2><section class="process-list" aria-label="Daily process history">${rows}</section>`;
}

function summaryMetric(label: string, value: string): string {
  return `<div class="metric" role="group" aria-label="${escapeHtml(label)}">
  <div class="label">${escapeHtml(label)}</div>
  <div class="value small">${escapeHtml(value)}</div>
</div>`;
}

function renderRows(events: ProcessEvent[]): string {
  return events
    .map(
      (event) => `<article class="process-row">
  <div class="process-head">
    <div class="process-name">${escapeHtml(event.script_name)}</div>
    <span class="badge">${escapeHtml(event.status)}</span>
  </div>
  <div class="process-message">${escapeHtml(event.message)}</div>
  ${event.error ? `<div class="process-error">${escapeHtml(event.error)}</div>` : ""}
  <div class="process-meta">
    <div>${event.elapsed_ms}ms</div>
    <div>${escapeHtml(event.dominant_gear)}</div>
    <div>${escapeHtml(event.efficiency_state)}</div>
  </div>
</article>`,
    )
    .join("");
}
