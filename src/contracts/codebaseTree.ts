import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

export interface CodebaseTreeFile {
  path: string;
  kind: string;
  size_bytes: number;
  modified_at: string;
  hash: string;
  role: string[];
  exports: string[];
  imports: string[];
  detects: string[];
}

export interface CodebaseTreeDirectory {
  path: string;
  file_count: number;
  role: string[];
}

export interface CodebaseTree {
  schema_version: 1;
  generated_at: string;
  workspace_root: string;
  summary: {
    file_count: number;
    directory_count: number;
    important_entrypoints: string[];
  };
  files: CodebaseTreeFile[];
  directories: CodebaseTreeDirectory[];
}

const ignoredDirectories = new Set([
  ".git",
  ".history",
  ".refer-factory",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

const ignoredExtensions = new Set([".vsix", ".log"]);
const includedRootFiles = new Set([
  "package.json",
  "tsconfig.json",
  "AGENTS.md",
  ".gitignore",
  ".vscode/launch.json",
  ".vscode/settings.json",
]);
const includedRoots = ["src", "test", "schemas", "resources", "docs", "law"];

export function codebaseTreePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "codebase-tree.json");
}

export function agentContextPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "agent-context.md");
}

export function scanCodebaseTree(
  workspaceRoot: string,
  now = new Date(),
): CodebaseTree {
  const root = path.resolve(workspaceRoot);
  const files: CodebaseTreeFile[] = [];
  const directories = new Map<string, CodebaseTreeDirectory>();

  walk(root, root, files, directories);
  const sortedFiles = files.sort((a, b) => a.path.localeCompare(b.path));
  const sortedDirectories = [...directories.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  return {
    schema_version: 1,
    generated_at: now.toISOString(),
    workspace_root: root,
    summary: {
      file_count: sortedFiles.length,
      directory_count: sortedDirectories.length,
      important_entrypoints: sortedFiles
        .filter((file) => file.role.length > 0)
        .slice(0, 18)
        .map((file) => file.path),
    },
    files: sortedFiles,
    directories: sortedDirectories,
  };
}

export function writeCodebaseTree(
  workspaceRoot: string,
  tree: CodebaseTree,
): string {
  const target = codebaseTreePath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(tree, null, 2)}\n`, "utf8");
  return target;
}

export function writeAgentContext(
  workspaceRoot: string,
  tree: CodebaseTree,
): string {
  const target = agentContextPath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${renderAgentContext(tree)}\n`, "utf8");
  return target;
}

export function renderAgentContext(tree: CodebaseTree): string {
  const important = tree.summary.important_entrypoints
    .map((file) => `- ${file}`)
    .join("\n");
  const scripts = tree.files
    .filter((file) => file.detects.includes("npm-scripts"))
    .map((file) => `- ${file.path}: npm scripts`)
    .join("\n");
  const views = tree.files
    .filter((file) => file.detects.includes("vscode-views"))
    .map((file) => `- ${file.path}: VS Code view contributions`)
    .join("\n");

  return `# REFER Agent Context

Generated: ${tree.generated_at}
Workspace: ${tree.workspace_root}

## Summary
- Files indexed: ${tree.summary.file_count}
- Directories indexed: ${tree.summary.directory_count}

## Important Entrypoints
${important || "- none detected"}

## Package And Extension Surface
${scripts || "- no npm script surface detected"}
${views ? `\n${views}` : ""}

## Guidance
Use this file as a compact map before opening full source files. Open the specific files above only when their details are needed.

Terminology authority: .refer-factory/script-legend.md`;
}

function walk(
  root: string,
  current: string,
  files: CodebaseTreeFile[],
  directories: Map<string, CodebaseTreeDirectory>,
): void {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    const relative = normalizePath(path.relative(root, absolute));

    if (entry.isDirectory()) {
      if (!shouldEnterDirectory(relative, entry.name)) {
        continue;
      }
      walk(root, absolute, files, directories);
      continue;
    }

    if (!entry.isFile() || !shouldIncludeFile(relative)) {
      continue;
    }

    const file = describeFile(root, absolute, relative);
    files.push(file);
    const parent = normalizePath(path.dirname(relative));
    if (parent && parent !== ".") {
      const existing = directories.get(parent) ?? {
        path: parent,
        file_count: 0,
        role: directoryRoles(parent),
      };
      existing.file_count += 1;
      directories.set(parent, existing);
    }
  }
}

function shouldEnterDirectory(relative: string, name: string): boolean {
  if (ignoredDirectories.has(name)) {
    return false;
  }
  const rootSegment = relative.split("/")[0] ?? relative;
  return includedRoots.includes(rootSegment) || relative === ".vscode";
}

function shouldIncludeFile(relative: string): boolean {
  if (includedRootFiles.has(relative)) {
    return true;
  }
  const ext = path.extname(relative);
  if (ignoredExtensions.has(ext)) {
    return false;
  }
  const rootSegment = relative.split("/")[0] ?? relative;
  return includedRoots.includes(rootSegment);
}

function describeFile(
  root: string,
  absolute: string,
  relative: string,
): CodebaseTreeFile {
  const stat = fs.statSync(absolute);
  const content = readTextSnippet(absolute, stat.size);
  return {
    path: relative,
    kind: fileKind(relative),
    size_bytes: stat.size,
    modified_at: stat.mtime.toISOString(),
    hash: shortHash(fs.readFileSync(absolute)),
    role: fileRoles(relative, content),
    exports: exportedSymbols(content),
    imports: importedModules(content),
    detects: detectedSurfaces(relative, content),
  };
}

function readTextSnippet(absolute: string, size: number): string {
  if (size > 250_000) {
    return "";
  }
  try {
    return fs.readFileSync(absolute, "utf8");
  } catch {
    return "";
  }
}

function fileKind(relative: string): string {
  const ext = path.extname(relative).toLowerCase();
  if (ext === ".ts") return "typescript";
  if (ext === ".json") return "json";
  if (ext === ".md") return "markdown";
  if (ext === ".svg") return "svg";
  return ext.replace(/^\./, "") || "file";
}

function shortHash(input: Buffer): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function fileRoles(relative: string, content: string): string[] {
  const roles: string[] = [];
  if (relative === "src/extension.ts") roles.push("extension-entrypoint");
  if (relative.includes("scriptFactory")) roles.push("script-registry");
  if (relative.includes("referParticipant")) roles.push("chat-participant");
  if (relative.includes("referOrchestrator")) roles.push("orchestration");
  if (relative.includes("referResolutionLoop")) roles.push("resolution-loop");
  if (relative.includes("server/")) roles.push("server");
  if (relative.startsWith("test/")) roles.push("test");
  if (content.includes("registerWebviewViewProvider")) roles.push("webview-provider-registration");
  return roles;
}

function directoryRoles(relative: string): string[] {
  if (relative === "src/chat") return ["chat-orchestration"];
  if (relative === "src/cockpit") return ["webview-ui"];
  if (relative === "src/commands") return ["vscode-commands"];
  if (relative === "src/contracts") return ["contracts"];
  if (relative === "src/server") return ["http-server"];
  return [];
}

function exportedSymbols(content: string): string[] {
  return [...content.matchAll(/export\s+(?:async\s+)?(?:function|class|const|interface|type)\s+([A-Za-z0-9_]+)/g)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
}

function importedModules(content: string): string[] {
  return [...content.matchAll(/from\s+["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
}

function detectedSurfaces(relative: string, content: string): string[] {
  const detects: string[] = [];
  if (relative === "package.json" && content.includes('"scripts"')) detects.push("npm-scripts");
  if (relative === "package.json" && content.includes('"views"')) detects.push("vscode-views");
  if (relative === "package.json" && content.includes('"commands"')) detects.push("vscode-commands");
  if (content.includes("createChatParticipant")) detects.push("chat-participant");
  if (content.includes("registerWebviewViewProvider")) detects.push("webview-provider");
  if (content.includes("createServer") || content.includes("/refer/chat")) detects.push("http-endpoint");
  return detects;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}
