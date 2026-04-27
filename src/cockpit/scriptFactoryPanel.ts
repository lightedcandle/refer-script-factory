import * as vscode from "vscode";
import { cockpitStyles, panelTitle } from "./html";
import { scriptFactoryEntries } from "../contracts/scriptFactory";
import { createScriptLegend } from "../contracts/scriptLegend";
import { scriptInoculationRegistry } from "../contracts/scriptInoculation";
import { getProcessState, onProcessEventsChanged } from "../telemetry/processEvents";

interface TreeNode {
  label: string;
  description?: string;
  children?: TreeNode[];
  open?: boolean;
}

export class ScriptFactoryPanel implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _disposables: vscode.Disposable[] = [];

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtmlForWebview();

    // Actuator: Handle messages from webview to run commands
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === "runScript" && message.scriptId) {
        const entry = scriptFactoryEntries.find(e => e.script_id === message.scriptId);
        if (entry && entry.entrypoint.startsWith("refer.")) {
          vscode.commands.executeCommand(entry.entrypoint);
        }
      }
    });

    // Bridge: Listen for process events and update the webview
    const listener = onProcessEventsChanged(() => {
      if (this._view) {
        this._view.webview.html = this.getHtmlForWebview();
      }
    });
    
    this._disposables.push({ dispose: listener });
  }

  dispose() {
    this._disposables.forEach(d => d.dispose());
  }

  private getHtmlForWebview(): string {
    const legend = createScriptLegend();
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath || "";
    const processState = getProcessState(workspaceRoot);
    const tree = this.buildTree(legend, processState);

    return `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body>
  <main class="surface">
    <div id="factory-system-container">
      ${this.renderTreeNode(tree)}
    </div>
  </main>
</body>
</html>`;
  }

  private buildTree(legend: ReturnType<typeof createScriptLegend>, processState: any): TreeNode {
    const buildScriptNode = (id: string): TreeNode => {
      const s = scriptFactoryEntries.find((e) => e.script_id === id);
      if (!s) return { label: id };
      
      const lastEvent = processState?.current?.by_script?.[s.script_id] ? processState.recent.findLast((e: any) => e.script_name === s.script_id) : null;

      return {
        label: s.label,
        description: s.does,
        scriptId: s.script_id,
        status: lastEvent?.status,
        children: s.child_scripts?.map(buildScriptNode)
      };
    };

    const singleScripts = scriptFactoryEntries
      .filter((s) => s.script_kind === "Single Script" || !s.script_kind)
      .map((s) => buildScriptNode(s.script_id));

    const multiScripts = scriptFactoryEntries
      .filter((s) => s.script_kind === "Multi Script")
      .map((s) => buildScriptNode(s.script_id));

    const sortedTerms = [...legend.terms].sort((a, b) => a.term.localeCompare(b.term));
    const sortedScriptionary = [...scriptFactoryEntries].sort((a, b) => a.label.localeCompare(b.label));

    return {
      label: "Factory System",
      description: "The complete network of coordinated factories across domains.",
      open: false,
      children: [
        {
          label: "Factories",
          description: "Governed domains that coordinate multiple forges and manage governance.",
          open: false,
          children: [
            {
              label: "Script Factory (Seed)",
              description: "The workspace and governance layer that creates, manages, and runs script forges. [Active]",
            },
            {
              label: "Context Factory",
              description: "A future factory domain for creating, refreshing, and packaging local context assets.",
            },
            {
              label: "Model Factory",
              description: "A future factory domain for local/cloud model routing and model capability policy.",
            },
            {
              label: "Artifact Factory",
              description: "A future factory domain for generated files, packets, reports, and durable outputs.",
            },
          ],
        },
        {
          label: "Forges",
          description: "Bounded conversion units that turn defined inputs into defined outputs.",
          open: false,
          children: [
            {
              label: "Single Script",
              children: singleScripts,
            },
            {
              label: "Multi Script",
              children: multiScripts,
            },
          ],
        },
        {
          label: "Map",
          description: "Navigation, terminology, and relationship assets for the Factory System.",
          open: false,
          children: [
            {
              label: "Script Legend (Rules & Terms)",
              children: [
                {
                  label: "Deterministic Rules",
                  children: legend.deterministic_rules.map((r) => ({ label: r })),
                },
                ...sortedTerms.map((t) => ({
                  label: t.term,
                  description: `Meaning: ${t.meaning}\nUse: ${t.deterministic_use}`,
                })),
              ],
            },
            {
              label: "Scriptionary (Vocabulary)",
              children: sortedScriptionary.map((s) => ({
                label: s.label,
                description: s.does,
              })),
            },
            {
              label: "Scriptonomy (Taxonomy)",
              children: legend.taxonomy.map((t) => ({
                label: t.name,
                description: `Allowed: ${t.allowed_values.join(", ")}\nRule: ${t.rule}`,
              })),
            },
            {
              label: "Scriptograph (Relationship Symbols)",
              children: legend.graph_symbols.map((s) => ({
                label: s.term,
                description: s.meaning,
              })),
            },
            {
              label: "Scriptographer (Cartographer)",
              description: "The scanner/builder that maintains script maps and definitions.",
            },
            {
              label: "Script Registry (Source List)",
              children: scriptFactoryEntries.map((s) => ({
                label: s.script_id,
                description: s.label,
              })),
            },
            {
              label: "Codebase Tree (Repo Map)",
              description: "Machine-readable repository map index (.refer-factory/codebase-tree.json).",
            },
            {
              label: "Agent Context (Briefing)",
              description: "Compact human/model-readable summary of the repo (.refer-factory/agent-context.md).",
            },
            {
              label: "Script Inoculation Registry (Containment)",
              description: "Registry of identified 'Trojans'—catastrophic patterns to be avoided and studied.",
              children: scriptInoculationRegistry.map((t) => ({
                label: `Trojan: ${t.label}`,
                description: `Failure: ${t.failure_mode}\nSymptom: ${t.symptom}\nRule: ${t.containment_rule}\nLesson: ${t.lesson_learned}`,
              })),
            },
          ],
        },
      ],
    };
  }

  private renderTreeNode(node: TreeNode): string {
    const hasChildren = node.children && node.children.length > 0;
    
    let content = "";
    if (node.description || hasChildren) {
      content += `<div class="factory-tree-children">`;
      if (node.description) {
        content += `<div class="factory-tree-subtext">${node.description}</div>`;
      }
      if (hasChildren) {
        content += node.children!.map((child) => this.renderTreeNode(child)).join("");
      }
      content += `</div>`;
    }

    return `<details class="factory-tree-node" ${node.open ? "open" : ""}>
      <summary>
        <button class="factory-tree-button" type="button" 
                onclick="runScript('${node.scriptId || ""}')">
          <span class="status-light ${node.status || "off"}"></span>
          ${node.label}
        </button>
      </summary>
      ${content}
    </details>`;
  }
}

interface TreeNode {
  label: string;
  description?: string;
  children?: TreeNode[];
  open?: boolean;
  scriptId?: string;
  status?: string;
}
