import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import { bootstrapLawReferences } from "../bootstrap/lawPack";
import { referLawToc } from "../bootstrap/lawToc";
import { cockpitStyles, escapeHtml, panelTitle } from "./html";

export class BootstrapLibraryPanel implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    bindOpenDocumentMessages(webviewView, bootstrapLawReferences);

    const bootstrapRows = bootstrapLawReferences
      .map((reference, index) => renderReference(reference, index === 0, "found"))
      .join("");

    webviewView.webview.html = `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body>
  <main class="surface">
    ${panelTitle("Bootstrap Library", "archive")}
    <p class="summary">Inspectable REFER bootstrap source references. Active repo governance lives in AGENTS.md and .refer-factory after install.</p>
    <section class="process-list" aria-label="Bootstrap law library">${bootstrapRows}</section>
  </main>
  ${libraryScript()}
</body>
</html>`;
  }
}

export class ReferLibraryPanel implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    const references = referLawReferences(this.context.extensionUri.fsPath);
    bindOpenDocumentMessages(webviewView, references);
    const rows = renderReferenceGroups(references);

    webviewView.webview.html = `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body>
  <main class="surface">
    ${panelTitle("Refer Library", "book")}
    <p class="summary">Dormant REFER.OS reference documents available for review or later rule-to-script compilation. Active governance comes from Script Factory and Smart Intake scripts.</p>
    <section class="process-list" aria-label="Dormant REFER.OS library">${rows}</section>
  </main>
  ${libraryScript()}
</body>
</html>`;
  }
}

interface RenderableReference {
  title: string;
  source: string;
  required: boolean;
  description: string;
  sequence?: number;
  group?: string;
  status?: string;
}

function bindOpenDocumentMessages(
  webviewView: vscode.WebviewView,
  references: RenderableReference[],
): void {
  webviewView.webview.onDidReceiveMessage(async (message) => {
    if (message?.type !== "open-doc" || typeof message.source !== "string") {
      return;
    }

    const reference = references.find((item) => item.source === message.source);
    if (!reference) {
      await vscode.window.showWarningMessage(
        "REFER blocked an unknown library document request.",
      );
      return;
    }

    if (!fs.existsSync(reference.source)) {
      await vscode.window.showWarningMessage(
        `REFER library document not found: ${reference.source}`,
      );
      return;
    }

    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(reference.source),
    );
    await vscode.window.showTextDocument(document, { preview: true });
  });
}

function renderReference(
  reference: RenderableReference,
  open: boolean,
  availableStatus: string,
): string {
  const available = fs.existsSync(reference.source);
  const status = available
    ? availableStatus
    : reference.required
      ? "missing"
      : "optional";
  const preview = available
    ? readPreview(reference.source)
    : "Document is not available at this path.";
  return `<details class="library-row" ${open ? "open" : ""}>
  <summary class="library-summary">
    <span class="process-name">${reference.sequence ? `${visualSequence(reference.sequence)} · ` : ""}${escapeHtml(reference.title)}</span>
    ${status === "canonical" ? "" : `<span class="badge">${escapeHtml(status)}</span>`}
  </summary>
  <div class="process-message">${escapeHtml(reference.description)}</div>
  <div class="library-path">${escapeHtml(reference.source)}</div>
  <pre class="library-preview">${escapeHtml(preview)}</pre>
  <button class="secondary library-open" data-source="${escapeHtml(reference.source)}"${available ? "" : " disabled"}>Open Document</button>
</details>`;
}

function visualSequence(sequence: number): string {
  return String(Math.floor(sequence / 10));
}

function renderReferenceGroups(references: RenderableReference[]): string {
  const groups = new Map<string, RenderableReference[]>();
  for (const reference of references) {
    const group = reference.group ?? "Reference";
    groups.set(group, [...(groups.get(group) ?? []), reference]);
  }
  return [...groups.entries()]
    .map(
      ([group, items]) => `<section class="library-group">
  <h2>${escapeHtml(group)}</h2>
  <section class="process-list" aria-label="${escapeHtml(group)}">${items
    .map((reference) =>
      renderReference(reference, false, reference.status ?? "ready"),
    )
    .join("")}</section>
</section>`,
    )
    .join("");
}

function referLawReferences(extensionRoot: string): RenderableReference[] {
  const lawRoot = path.join(extensionRoot, "unscripted-laws", "REFER.OS");
  if (!fs.existsSync(lawRoot)) {
    return [];
  }
  const ordered = referLawToc
    .filter((entry) => fs.existsSync(path.join(lawRoot, entry.file)))
    .map((entry) => ({
      title: entry.title,
      source: path.join(lawRoot, entry.file),
      required: false,
      description: `${entry.summary} (${entry.file})`,
      sequence: entry.sequence,
      group: entry.group,
      status: entry.status,
    }));
  const known = new Set(referLawToc.map((entry) => entry.file));
  const uncatalogued = fs
    .readdirSync(lawRoot)
    .filter((fileName) => fileName.endsWith(".md") && !known.has(fileName))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName, index) => ({
      title: titleForLawFile(fileName),
      source: path.join(lawRoot, fileName),
      required: false,
      description: `Uncatalogued dormant REFER.OS reference document. (${fileName})`,
      sequence: 990 + index,
      group: "Uncatalogued",
      status: "reference",
    }));
  return [...ordered, ...uncatalogued];
}

function titleForLawFile(fileName: string): string {
  const stem = fileName.replace(/\.md$/i, "").replace(/^refer\./i, "");
  const aliases: Record<string, string> = {
    md: "Overview",
    os: "Operating System",
    qc: "Quality Control",
    cli: "CLI",
    api: "API",
    og: "Open Graph",
    "provider.codex": "Provider: Codex",
    "provider.chatgpt": "Provider: ChatGPT",
    "provider.cli": "Provider: CLI",
    "compiler.md": "Compiler",
    "spirit-runtime": "Spirit Runtime",
    "systems.security": "Systems Security",
    "law.index": "Law Index",
    "law.crossref": "Law Cross-Reference",
  };
  if (aliases[stem]) {
    return aliases[stem];
  }
  return stem
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((part) =>
      part.length <= 3 && part === part.toLowerCase()
        ? part.toUpperCase()
        : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
    .join(" ");
}

function libraryScript(): string {
  return `<script>
    const vscode = acquireVsCodeApi();
    document.querySelectorAll(".library-open").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({ type: "open-doc", source: button.dataset.source });
      });
    });
  </script>`;
}

function readPreview(source: string): string {
  const content = fs.readFileSync(source, "utf8").trim();
  if (content.length <= 1400) {
    return content;
  }

  return `${content.slice(0, 1400).trimEnd()}\n\n...`;
}
