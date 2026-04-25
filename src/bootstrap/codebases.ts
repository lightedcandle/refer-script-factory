import * as fs from "node:fs";
import * as path from "node:path";

export type CodebaseStatus = "active" | "discovered" | "missing" | "ignored";

export interface CodebaseEntry {
  id: string;
  path: string;
  framework: string;
  adapter: "angular" | "react" | "node" | "generic";
  status: CodebaseStatus;
  target_paths: string[];
  alias?: string;
  primary?: boolean;
  manual?: boolean;
}

export interface CodebaseRegistry {
  schema_version: 1;
  workspace_mode: "single" | "monorepo";
  tracking_scope: "repo";
  last_scanned_at: string;
  codebases: CodebaseEntry[];
  ignored_paths: string[];
}

const candidateParents = ["apps", "packages", "services", "workers"];
const generatedDirectories = new Set([
  ".git",
  ".refer-factory",
  ".vscode",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

export function codebaseRegistryPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "codebases.json");
}

export function createCodebaseRegistry(
  workspaceRoot: string,
  framework: string,
  now = new Date(),
): CodebaseRegistry {
  return mergeCodebaseRegistry(
    emptyRegistry(now),
    discoverCodebases(workspaceRoot, framework),
    now,
  );
}

export function refreshCodebaseRegistry(
  workspaceRoot: string,
  framework = "generic",
  now = new Date(),
): CodebaseRegistry {
  const existing = readCodebaseRegistry(workspaceRoot);
  return mergeCodebaseRegistry(
    existing ?? emptyRegistry(now),
    discoverCodebases(workspaceRoot, framework),
    now,
  );
}

export function readCodebaseRegistry(
  workspaceRoot: string,
): CodebaseRegistry | null {
  const filePath = codebaseRegistryPath(workspaceRoot);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as CodebaseRegistry;
}

export function writeCodebaseRegistry(
  workspaceRoot: string,
  registry: CodebaseRegistry,
): void {
  const filePath = codebaseRegistryPath(workspaceRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

export function discoverCodebases(
  workspaceRoot: string,
  rootFramework = "generic",
): CodebaseEntry[] {
  const root = path.resolve(workspaceRoot);
  const discovered: CodebaseEntry[] = [];

  for (const parent of candidateParents) {
    const parentPath = path.join(root, parent);
    if (!fs.existsSync(parentPath) || !fs.statSync(parentPath).isDirectory()) {
      continue;
    }

    for (const entry of fs.readdirSync(parentPath, { withFileTypes: true })) {
      if (!entry.isDirectory() || generatedDirectories.has(entry.name)) {
        continue;
      }

      const relativePath = normalizePath(path.join(parent, entry.name));
      discovered.push(createCodebaseEntry(root, relativePath, "discovered"));
    }
  }

  if (discovered.length === 0) {
    return [
      {
        id: "root",
        path: ".",
        framework: rootFramework,
        adapter: adapterFor(rootFramework),
        status: "active",
        primary: true,
        target_paths: ["**"],
      },
    ];
  }

  return discovered;
}

function mergeCodebaseRegistry(
  existing: CodebaseRegistry,
  discovered: CodebaseEntry[],
  now: Date,
): CodebaseRegistry {
  const discoveredByPath = new Map(
    discovered.map((entry) => [normalizePath(entry.path), entry]),
  );
  const existingByPath = new Map(
    existing.codebases.map((entry) => [normalizePath(entry.path), entry]),
  );
  const codebases: CodebaseEntry[] = [];

  for (const existingEntry of existing.codebases) {
    const key = normalizePath(existingEntry.path);
    const discoveredEntry = discoveredByPath.get(key);
    if (discoveredEntry) {
      codebases.push({
        ...discoveredEntry,
        ...existingEntry,
        status:
          existingEntry.status === "ignored"
            ? "ignored"
            : existingEntry.status === "active"
              ? "active"
              : discoveredEntry.status,
      });
      discoveredByPath.delete(key);
      continue;
    }

    codebases.push({
      ...existingEntry,
      status: existingEntry.status === "ignored" ? "ignored" : "missing",
    });
  }

  codebases.push(...discoveredByPath.values());
  if (!codebases.some((entry) => entry.primary)) {
    codebases[0] = { ...codebases[0]!, primary: true };
  }

  return {
    schema_version: 1,
    workspace_mode: codebases.some((entry) => entry.path !== ".")
      ? "monorepo"
      : "single",
    tracking_scope: "repo",
    last_scanned_at: now.toISOString(),
    codebases: codebases.sort((a, b) => a.path.localeCompare(b.path)),
    ignored_paths: existing.ignored_paths ?? [],
  };
}

function createCodebaseEntry(
  workspaceRoot: string,
  relativePath: string,
  status: CodebaseStatus,
): CodebaseEntry {
  const framework = detectFramework(path.join(workspaceRoot, relativePath));
  return {
    id: idFromPath(relativePath),
    path: relativePath,
    framework,
    adapter: adapterFor(framework),
    status,
    target_paths: [`${relativePath}/**`],
  };
}

function detectFramework(codebasePath: string): string {
  if (fs.existsSync(path.join(codebasePath, "angular.json"))) {
    return "Angular";
  }

  const packageJsonPath = path.join(codebasePath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return "generic";
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const deps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  if (deps["@angular/core"]) {
    return "Angular";
  }
  if (deps.react || deps["react-dom"] || deps.next) {
    return "React";
  }
  return "Node";
}

function adapterFor(framework: string): CodebaseEntry["adapter"] {
  const normalized = framework.toLowerCase();
  if (normalized.includes("angular")) {
    return "angular";
  }
  if (normalized.includes("react")) {
    return "react";
  }
  if (normalized.includes("node")) {
    return "node";
  }
  return "generic";
}

function emptyRegistry(now: Date): CodebaseRegistry {
  return {
    schema_version: 1,
    workspace_mode: "single",
    tracking_scope: "repo",
    last_scanned_at: now.toISOString(),
    codebases: [],
    ignored_paths: [],
  };
}

function idFromPath(value: string): string {
  return normalizePath(value)
    .replace(/^\.$/, "root")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}
