import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { applyBootstrap } from "../src/bootstrap/apply";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-factory-apply-"));
fs.mkdirSync(path.join(root, ".refer-factory"));
fs.writeFileSync(
  path.join(root, ".refer-factory", "metrics.json"),
  "{\"script_status\":\"stale\"}\n",
);

const report = applyBootstrap(
  {
    workspace_root: root,
    repo_purpose: "test repo",
    framework: "React",
  },
  { update_existing: true },
);

assert.ok(report.created.includes("REFER.OS"));
assert.ok(report.created.includes("REFER.OS/refer.md"));
assert.ok(report.created.includes("REFER.OS/refer.plan.md"));
assert.ok(report.created.includes("REFER.OS/refer.factory.md"));
assert.ok(report.created.includes("REFER.OS/refer.engine.md"));
assert.ok(report.created.includes("refer.app"));
assert.ok(report.created.includes("AGENTS.md"));
assert.ok(report.created.includes(".refer-factory/agent-profile.json"));
assert.ok(report.created.includes(".refer-factory/adapter.json"));
assert.ok(report.created.includes(".refer-factory/codebases.json"));
assert.ok(report.created.includes(".refer-factory/plan/refer.plan.json"));
assert.ok(report.updated.includes(".refer-factory/metrics.json"));
assert.ok(report.skipped.includes(".refer-factory"));
assert.equal(report.unsafe_overwrites.length, 0);

const adapter = JSON.parse(
  fs.readFileSync(path.join(root, ".refer-factory", "adapter.json"), "utf8"),
);
assert.equal(adapter.adapter_id, "react");

const agentProfile = JSON.parse(
  fs.readFileSync(path.join(root, ".refer-factory", "agent-profile.json"), "utf8"),
);
assert.equal(agentProfile.profile_id, "refer-governed-agent");
assert.equal(agentProfile.prompt_handling.default_route, "refer.intake");

const agentInstructions = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
assert.match(agentInstructions, /contract-first workflow/);

const metrics = JSON.parse(
  fs.readFileSync(path.join(root, ".refer-factory", "metrics.json"), "utf8"),
);
assert.equal(metrics.dominant_gear, "bootstrap");

const codebases = JSON.parse(
  fs.readFileSync(path.join(root, ".refer-factory", "codebases.json"), "utf8"),
);
assert.equal(codebases.tracking_scope, "repo");
assert.equal(codebases.codebases[0].path, ".");

const plan = JSON.parse(
  fs.readFileSync(
    path.join(root, ".refer-factory", "plan", "refer.plan.json"),
    "utf8",
  ),
);
assert.equal(plan.repo_purpose, "test repo");
assert.equal(plan.adapter, "react");

const existingRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "refer-factory-existing-agent-"),
);
fs.writeFileSync(
  path.join(existingRoot, "AGENTS.md"),
  "# Existing Agent Rules\n\nKeep local review rules.\n",
);

const existingReport = applyBootstrap(
  {
    workspace_root: existingRoot,
    repo_purpose: "existing repo",
    framework: "generic",
  },
  { update_existing: true },
);

assert.ok(existingReport.updated.includes("AGENTS.md"));

const patchedInstructions = fs.readFileSync(
  path.join(existingRoot, "AGENTS.md"),
  "utf8",
);
assert.match(patchedInstructions, /Keep local review rules/);
assert.match(patchedInstructions, /<!-- REFER GOVERNANCE START -->/);
assert.match(patchedInstructions, /<!-- REFER GOVERNANCE END -->/);

const secondReport = applyBootstrap(
  {
    workspace_root: existingRoot,
    repo_purpose: "existing repo updated",
    framework: "generic",
  },
  { update_existing: true },
);

const refreshedInstructions = fs.readFileSync(
  path.join(existingRoot, "AGENTS.md"),
  "utf8",
);
assert.ok(secondReport.updated.includes("AGENTS.md"));
assert.equal(
  refreshedInstructions.match(/<!-- REFER GOVERNANCE START -->/g)?.length,
  1,
);
assert.match(refreshedInstructions, /existing repo updated/);
