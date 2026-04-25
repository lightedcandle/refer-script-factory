import assert from "node:assert/strict";
import {
  createApplyHealthSnapshot,
  createCancelledHealthSnapshot,
  createDryRunHealthSnapshot,
  getBootstrapHealthSnapshot,
  setBootstrapHealthSnapshot,
} from "../src/telemetry/bootstrapHealth";

const dryRun = {
  workspace_root: "E:/repo",
  repo_purpose: "test repo",
  framework: "React",
  would_create: ["REFER.OS", "refer.app"],
  would_update: [".refer-factory/metrics.json"],
  would_skip: [".refer-factory"],
  unsafe_overwrites: [],
  required_confirmation: false,
};

const dryRunSnapshot = createDryRunHealthSnapshot(dryRun);

assert.equal(dryRunSnapshot.phase, "dry-run");
assert.equal(dryRunSnapshot.framework, "React");
assert.equal(dryRunSnapshot.create_count, 2);
assert.equal(dryRunSnapshot.update_count, 1);
assert.equal(dryRunSnapshot.skip_count, 1);
assert.equal(dryRunSnapshot.unsafe_overwrite_count, 0);
assert.equal(dryRunSnapshot.repo_health_score, 80);

const applySnapshot = createApplyHealthSnapshot({
  dry_run: dryRun,
  created: ["REFER.OS"],
  updated: [".refer-factory/metrics.json"],
  skipped: [".refer-factory", "refer.app"],
  unsafe_overwrites: [],
});

assert.equal(applySnapshot.phase, "applied");
assert.equal(applySnapshot.create_count, 1);
assert.equal(applySnapshot.update_count, 1);
assert.equal(applySnapshot.skip_count, 2);
assert.equal(applySnapshot.repo_health_score, 88);

const cancelledSnapshot = createCancelledHealthSnapshot(dryRun);
assert.equal(cancelledSnapshot.phase, "cancelled");
assert.equal(cancelledSnapshot.create_count, 2);

setBootstrapHealthSnapshot(applySnapshot);
const storedSnapshot = getBootstrapHealthSnapshot();
assert.deepEqual(storedSnapshot, applySnapshot);
storedSnapshot.phase = "none";
assert.equal(getBootstrapHealthSnapshot().phase, "applied");
