import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "refer-source-workspace-"));
const universalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "refer-source-universal-"));
const agentPath = path.join(universalRoot, "AGENTS.md");
const bootstrapPath = path.join(universalRoot, "REFER.OS", "refer.agent.md");
fs.mkdirSync(path.dirname(bootstrapPath), { recursive: true });
fs.writeFileSync(agentPath, "# Universal agent\n", "utf8");
fs.writeFileSync(bootstrapPath, "# Agent bootstrap\n", "utf8");

const syncOutput = execFileSync(
  "node",
  [
    "scripts/reference/universal-source-sync.mjs",
    "sync",
    "--workspace-root",
    workspaceRoot,
    "--universal-root",
    universalRoot,
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
const synced = JSON.parse(syncOutput) as { fresh: boolean };
assert.equal(synced.fresh, true);
assert.ok(fs.existsSync(path.join(workspaceRoot, ".refer", "source.json")));

const freshCheck = spawnSync(
  "node",
  [
    "scripts/reference/universal-source-sync.mjs",
    "check",
    "--workspace-root",
    workspaceRoot,
    "--universal-root",
    universalRoot,
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
assert.equal(freshCheck.status, 0);

fs.utimesSync(agentPath, new Date("2020-01-01T00:00:00.000Z"), new Date("2020-01-01T00:00:00.000Z"));
const staleCheck = spawnSync(
  "node",
  [
    "scripts/reference/universal-source-sync.mjs",
    "check",
    "--workspace-root",
    workspaceRoot,
    "--universal-root",
    universalRoot,
  ],
  { cwd: process.cwd(), encoding: "utf8" },
);
assert.equal(staleCheck.status, 1);
const stale = JSON.parse(staleCheck.stdout) as { fresh: boolean; reasons: string[] };
assert.equal(stale.fresh, false);
assert.ok(stale.reasons.some((reason) => reason.includes("stale source stamp")));
