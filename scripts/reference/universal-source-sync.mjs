#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requiredSourceFiles = ["AGENTS.md", "REFER.OS/refer.agent.md"];

function normalizePath(value) {
  return path.resolve(value).replace(/\\/g, "/");
}

function parseArgs(argv) {
  const parsed = {
    command: argv[0] ?? "check",
    workspaceRoot: process.cwd(),
    universalRoot: process.env.REFER_UNIVERSAL_ROOT ?? "E:/refer.os",
  };

  for (let index = 1; index < argv.length; index += 1) {
    if (argv[index] === "--workspace-root") {
      parsed.workspaceRoot = argv[index + 1] ?? parsed.workspaceRoot;
      index += 1;
    } else if (argv[index] === "--universal-root") {
      parsed.universalRoot = argv[index + 1] ?? parsed.universalRoot;
      index += 1;
    }
  }

  return parsed;
}

function sourceRecordPath(workspaceRoot) {
  return path.join(workspaceRoot, ".refer", "source.json");
}

function readLiveSources(universalRoot) {
  return requiredSourceFiles.map((relativePath) => {
    const sourcePath = path.join(universalRoot, relativePath);
    const stats = fs.statSync(sourcePath);
    return {
      source_path: normalizePath(sourcePath),
      mtime_ms: Math.trunc(stats.mtimeMs),
    };
  });
}

function readRecord(recordPath) {
  if (!fs.existsSync(recordPath)) return null;
  return JSON.parse(fs.readFileSync(recordPath, "utf8"));
}

function compareRecord(record, liveSources) {
  if (!record || !Array.isArray(record.sources)) {
    return ["source record is missing or has no sources array"];
  }

  const recordedByPath = new Map(
    record.sources.map((source) => [source.source_path, source.mtime_ms]),
  );
  const reasons = [];
  for (const source of liveSources) {
    if (!recordedByPath.has(source.source_path)) {
      reasons.push(`missing source stamp: ${source.source_path}`);
    } else if (recordedByPath.get(source.source_path) !== source.mtime_ms) {
      reasons.push(`stale source stamp: ${source.source_path}`);
    }
  }
  return reasons;
}

export function inspectUniversalSourceBinding({ workspaceRoot, universalRoot }) {
  const resolvedWorkspaceRoot = path.resolve(workspaceRoot);
  const resolvedUniversalRoot = path.resolve(universalRoot);
  const recordPath = sourceRecordPath(resolvedWorkspaceRoot);
  const liveSources = readLiveSources(resolvedUniversalRoot);
  const reasons = compareRecord(readRecord(recordPath), liveSources);

  return {
    workspace_root: normalizePath(resolvedWorkspaceRoot),
    universal_root: normalizePath(resolvedUniversalRoot),
    source_record_path: normalizePath(recordPath),
    fresh: reasons.length === 0,
    reasons,
    live_sources: liveSources,
  };
}

export function syncUniversalSourceBinding({ workspaceRoot, universalRoot }) {
  const inspection = inspectUniversalSourceBinding({ workspaceRoot, universalRoot });
  const record = {
    schema_version: 1,
    binding: "refer.universal",
    refreshed_at: new Date().toISOString(),
    sources: inspection.live_sources,
  };
  fs.mkdirSync(path.dirname(inspection.source_record_path), { recursive: true });
  fs.writeFileSync(
    inspection.source_record_path,
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8",
  );
  return inspectUniversalSourceBinding({ workspaceRoot, universalRoot });
}

function print(report) {
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "check") {
    const report = inspectUniversalSourceBinding(args);
    print(report);
    process.exitCode = report.fresh ? 0 : 1;
  } else if (args.command === "sync") {
    print(syncUniversalSourceBinding(args));
  } else {
    throw new Error("Usage: universal-source-sync.mjs <check|sync> [--workspace-root <path>] [--universal-root <path>]");
  }
}
