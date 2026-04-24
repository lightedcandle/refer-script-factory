import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createBootstrapDryRun } from "../src/bootstrap/dryRun";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-factory-"));
fs.mkdirSync(path.join(root, "REFER.OS"));
fs.mkdirSync(path.join(root, ".refer-factory"));
fs.writeFileSync(path.join(root, ".refer-factory", "metrics.json"), "{}");

const report = createBootstrapDryRun({
  workspace_root: root,
  repo_purpose: "test repo",
  framework: "generic",
});

assert.ok(report.would_skip.includes("REFER.OS"));
assert.ok(report.would_update.includes(".refer-factory/metrics.json"));
assert.ok(report.would_create.includes("refer.app"));
assert.equal(report.unsafe_overwrites.length, 0);
assert.equal(report.required_confirmation, false);
