import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const matched = JSON.parse(
  execFileSync(
    "node",
    [
      "scripts/repair/modification-loop.mjs",
      "--script-id",
      "test.modification-loop.match",
      "--expected",
      "{\"b\":2,\"a\":1}",
      "--observed",
      "{\"a\":1,\"b\":2}",
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  ),
);

assert.equal(matched.ok, true);
assert.equal(matched.effect_state, "functional");
assert.equal(matched.flag_file, null);
assert.ok(matched.readiness_file);
assert.ok(fs.existsSync(path.join(process.cwd(), matched.lineage_file)));
assert.ok(fs.existsSync(path.join(process.cwd(), matched.readiness_file)));
fs.rmSync(path.join(process.cwd(), matched.lineage_file), { force: true });
fs.rmSync(path.join(process.cwd(), matched.readiness_file), { force: true });

const mismatched = JSON.parse(
  execFileSync(
    "node",
    [
      "scripts/repair/modification-loop.mjs",
      "--script-id",
      "test.modification-loop.mismatch",
      "--expected",
      "ready",
      "--observed",
      "not-ready",
      "--repair-layer",
      "script",
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  ),
);

assert.equal(mismatched.ok, false);
assert.equal(mismatched.effect_state, "mismatched");
assert.ok(mismatched.flag_file);
assert.ok(fs.existsSync(path.join(process.cwd(), mismatched.lineage_file)));
assert.ok(fs.existsSync(path.join(process.cwd(), mismatched.flag_file)));

const flag = JSON.parse(fs.readFileSync(path.join(process.cwd(), mismatched.flag_file), "utf8"));
assert.equal(flag.next, "Enter modification loop: repair the smallest responsible layer, rerun the same contract, compare again.");
assert.equal(flag.loop_gate, "failure_detector");
assert.equal(flag.rerun_policy, "Every repair rerun must return through this detector with the same contract before promotion.");
fs.rmSync(path.join(process.cwd(), mismatched.lineage_file), { force: true });
fs.rmSync(path.join(process.cwd(), mismatched.flag_file), { force: true });

const blocked = JSON.parse(
  execFileSync(
    "node",
    [
      "scripts/repair/modification-loop.mjs",
      "--script-id",
      "test.modification-loop.blocked",
      "--blocked",
      "--blocker-type",
      "authority_missing",
      "--blocker-detail",
      "Official source was not available.",
      "--gap-layer",
      "authority",
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  ),
);

assert.equal(blocked.ok, false);
assert.equal(blocked.effect_state, "blocked");
assert.ok(blocked.flag_file);

const blockedFlag = JSON.parse(fs.readFileSync(path.join(process.cwd(), blocked.flag_file), "utf8"));
assert.equal(blockedFlag.mismatch.type, "authority_missing");
assert.equal(blockedFlag.repair_layer, "authority");
assert.equal(blockedFlag.detector, "scripts/repair/modification-loop.mjs");
assert.equal(blockedFlag.loop_gate, "failure_detector");
fs.rmSync(path.join(process.cwd(), blocked.lineage_file), { force: true });
fs.rmSync(path.join(process.cwd(), blocked.flag_file), { force: true });

const forgeMismatch = JSON.parse(
  execFileSync(
    "node",
    [
      "scripts/repair/modification-loop.mjs",
      "--script-id",
      "test.modification-loop.forge",
      "--expected",
      "ready",
      "--observed",
      "not-ready",
      "--gap-layer",
      "forge",
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  ),
);
const forgeFlag = JSON.parse(fs.readFileSync(path.join(process.cwd(), forgeMismatch.flag_file), "utf8"));
assert.equal(forgeFlag.repair_layer, "forge");
assert.equal(forgeFlag.gate, undefined);

fs.rmSync(path.join(process.cwd(), forgeMismatch.lineage_file), { force: true });
fs.rmSync(path.join(process.cwd(), forgeMismatch.flag_file), { force: true });
