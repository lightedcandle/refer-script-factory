import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  readLatestReferChatSession,
  referChatSessionPath,
  ReferChatSession,
} from "../contracts/referChatSession";
import {
  defaultReferChatModeState,
  readReferChatModeState,
  ReferChatModeState,
} from "../contracts/referChatMode";
import { cockpitStyles, escapeHtml, panelTitle } from "./html";

export class ContractChatPanel implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this.refresh();
    webviewView.webview.onDidReceiveMessage((message) => {
      void this.handleMessage(message);
    });
  }

  private async handleMessage(message: unknown): Promise<void> {
    if (!isReaderMessage(message)) {
      return;
    }

    if (message.type === "refresh") {
      this.refresh();
      return;
    }

    if (message.type === "open-session") {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const session = workspaceRoot ? readLatestReferChatSession(workspaceRoot) : null;
      if (!workspaceRoot || !session) {
        await vscode.window.showWarningMessage("No REFER contract chat session exists yet.");
        return;
      }

      const filePath = referChatSessionPath(workspaceRoot, session.session_id);
      if (!fs.existsSync(filePath)) {
        await vscode.window.showWarningMessage("REFER contract chat session file is missing.");
        return;
      }

      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
      await vscode.window.showTextDocument(document, { preview: true });
    }
  }

  private refresh(): void {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const session = workspaceRoot ? readLatestReferChatSession(workspaceRoot) : null;
    const mode = workspaceRoot
      ? readReferChatModeState(workspaceRoot)
      : defaultReferChatModeState();
    if (this.view) {
      this.view.webview.html = renderReader(session, mode);
    }
  }
}

function renderReader(
  session: ReferChatSession | null,
  mode: ReferChatModeState,
): string {
  return `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body class="chat-history-body">
  <main class="surface">
    ${panelTitle("@Refer Chat History", "chat")}
    <details class="reader-controls">
      <summary>Controls</summary>
      <div class="reader-controls-body">
        ${renderModeLights(mode)}
        <div class="composer-actions">
          <div class="reader-actions">
            <button type="button" class="secondary" id="refresh">
              <svg class="button-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M13.5 2.5v4h-4"></path>
                <path d="M12.3 5A5 5 0 1 0 13 9"></path>
              </svg>
              <span>Refresh</span>
            </button>
            <button type="button" id="open-session"${session ? "" : " disabled"}>View in VS Code</button>
          </div>
        </div>
        <p class="summary">Send prompts using native VS Code Chat with @refer. Responses appear below.</p>
      </div>
    </details>
    <div class="reader-separator" aria-hidden="true"></div>
    <section class="process-list" aria-label="Contract chat turns">
      ${renderThinkingState(mode)}
      ${session ? renderTurns(session) : renderEmptyState()}
    </section>
  </main>
  <script>
    const vscode = acquireVsCodeApi();
    document.getElementById("refresh").addEventListener("click", () => {
      vscode.postMessage({ type: "refresh" });
    });
    document.getElementById("open-session")?.addEventListener("click", () => {
      vscode.postMessage({ type: "open-session" });
    });
    const history = document.querySelector(".process-list");
    if (history) {
      history.scrollTop = history.scrollHeight;
    }
    ${mode.active_contract_mode !== "idle" ? "setInterval(() => vscode.postMessage({ type: 'refresh' }), 1500);" : ""}
  </script>
</body>
</html>`;
}

function renderModeLights(mode: ReferChatModeState): string {
  const idleActive = mode.active_contract_mode === "idle";
  const tempActive = mode.active_contract_mode === "temporary";
  const persistentActive = mode.active_contract_mode === "persistent";
  return `<section class="mode-lights" aria-label="Contract mode">
  ${modeLight("Idle", idleActive, "idle")}
  ${modeLight("Temp", tempActive, "temporary")}
  ${modeLight("On", persistentActive, "persistent")}
</section>`;
}

function modeLight(label: string, active: boolean, kind: string): string {
  return `<div class="mode-light ${active ? "active" : ""} ${escapeHtml(kind)}">
  <span class="mode-dot" aria-hidden="true"></span>
  <span>${escapeHtml(label)}</span>
</div>`;
}

function renderThinkingState(mode: ReferChatModeState): string {
  if (mode.active_contract_mode === "idle") {
    return "";
  }

  return `<article class="process-row thinking-row" aria-live="polite">
  <div class="thinking-mark" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div>
    <div class="process-name">Thinking</div>
    <div class="summary">REFER is resolving the active contract turn.</div>
  </div>
</article>`;
}

function renderTurns(session: ReferChatSession): string {
  if (session.turns.length === 0) {
    return renderEmptyState();
  }

  return session.turns
    .map((turn) => {
      const userText =
        turn.contract.active_contract.relevant_excerpt ||
        turn.contract.active_contract.intent ||
        turn.raw_input_ref;
      return `<article class="process-row contract-turn">
  <details class="chat-part chat-in">
    <summary>
      <span class="chat-speaker">👨‍💻 You</span>
      <span class="chat-preview">${escapeHtml(compactPreview(userText))}</span>
    </summary>
    <div class="message-body chat-content">${escapeHtml(userText)}</div>
  </details>
  <details class="chat-part chat-out" open>
    <summary>
      <span class="chat-speaker">🤖 @refer</span>
      <span class="chat-preview">${escapeHtml(compactPreview(turn.assistant_output))}</span>
    </summary>
    <div class="message-body chat-content contract-output">${escapeHtml(turn.assistant_output)}</div>
  </details>
  <details class="chat-part chat-machine contract-machine">
    <summary>
      <span class="chat-speaker">💻 Details</span>
      <span class="chat-preview">${escapeHtml(turn.turn_id)}</span>
    </summary>
    <div class="process-meta contract-meta" aria-label="Contract turn metadata">
      <div><span>Turn</span><code>${escapeHtml(turn.turn_id)}</code></div>
      <div><span>Time</span><code>${escapeHtml(turn.created_at)}</code></div>
      <div><span>Contract</span><code>${escapeHtml(turn.contract_id)}</code></div>
      <div><span>Raw</span><code>${escapeHtml(turn.raw_input_ref)}</code></div>
    </div>
    ${turn.progress.length > 0 ? `<pre>${escapeHtml(turn.progress.join("\n"))}</pre>` : ""}
  </details>
  <footer class="contract-footer">
    <time class="contract-timestamp" datetime="${escapeHtml(turn.created_at)}">${escapeHtml(formatTurnTimestamp(turn.created_at))}</time>
  </footer>
</article>`;
    })
    .join("");
}

function compactPreview(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= 96) {
    return normalized || "empty";
  }

  return `${normalized.slice(0, 93).trimEnd()}...`;
}

function formatTurnTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function renderEmptyState(): string {
  return `<article class="process-row">
  <div class="process-head">
    <div class="process-name">No contract turns yet</div>
    <span class="badge">reader</span>
  </div>
  <div class="process-message">Use native VS Code chat with @refer. This panel reads the saved contract-track transcript.</div>
</article>`;
}

function isReaderMessage(
  value: unknown,
): value is { type: "refresh" | "open-session" } {
  return (
    typeof value === "object" &&
    value !== null &&
    ((value as { type?: unknown }).type === "refresh" ||
      (value as { type?: unknown }).type === "open-session")
  );
}
