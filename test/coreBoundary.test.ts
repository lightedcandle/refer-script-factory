import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const output = execFileSync(process.execPath, ["scripts/verify/core-boundary.mjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

assert.match(output, /^Core boundary OK:/);
