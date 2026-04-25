import * as fs from "node:fs";
import * as path from "node:path";

export interface CodebaseMiles {
  codebase_lines: number;
  counted_files: number;
}

const excludedDirectories = new Set([
  ".git",
  ".vscode",
  "dist",
  "node_modules",
  "out",
  "coverage",
]);

const countedExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".mts",
  ".scss",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml",
]);

export function countCodebaseMiles(workspaceRoot: string): CodebaseMiles {
  return countDirectory(path.resolve(workspaceRoot));
}

function countDirectory(directory: string): CodebaseMiles {
  let codebaseLines = 0;
  let countedFiles = 0;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) {
        const child = countDirectory(entryPath);
        codebaseLines += child.codebase_lines;
        countedFiles += child.counted_files;
      }
      continue;
    }

    if (!entry.isFile() || !countedExtensions.has(path.extname(entry.name))) {
      continue;
    }

    codebaseLines += countFileLines(entryPath);
    countedFiles += 1;
  }

  return {
    codebase_lines: codebaseLines,
    counted_files: countedFiles,
  };
}

function countFileLines(filePath: string): number {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.length === 0) {
    return 0;
  }

  return content.endsWith("\n")
    ? content.split("\n").length - 1
    : content.split("\n").length;
}
