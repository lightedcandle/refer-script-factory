import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createBootstrapDryRun } from "../src/bootstrap/dryRun";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-factory-"));
fs.mkdirSync(path.join(root, "REFER.OS"));
fs.writeFileSync(path.join(root, "REFER.OS", "refer.md"), "# Existing refer\n");
fs.writeFileSync(
  path.join(root, "REFER.OS", "refer.plan.md"),
  "# Existing plan\n",
);
fs.writeFileSync(
  path.join(root, "REFER.OS", "refer.factory.md"),
  "# Existing factory\n",
);
fs.mkdirSync(path.join(root, ".refer-factory"));
fs.writeFileSync(path.join(root, "AGENTS.md"), "# Existing Agent Rules\n");
fs.writeFileSync(path.join(root, ".refer-factory", "metrics.json"), "{}");

const report = createBootstrapDryRun({
  workspace_root: root,
  repo_purpose: "test repo",
  framework: "generic",
});

assert.ok(report.would_skip.includes("REFER.OS"));
assert.ok(report.would_update.includes("REFER.OS/refer.md"));
assert.ok(report.would_update.includes("REFER.OS/refer.plan.md"));
assert.ok(report.would_update.includes("REFER.OS/refer.factory.md"));
assert.ok(report.would_update.includes("AGENTS.md"));
assert.ok(report.would_update.includes(".refer-factory/metrics.json"));
assert.ok(report.would_create.includes("refer.app"));
assert.equal(report.unsafe_overwrites.length, 0);
assert.equal(report.required_confirmation, false);
