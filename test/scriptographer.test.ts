import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  runScriptographer,
  scriptographerReportPath,
  writeScriptographerReport,
} from "../src/contracts/scriptographer";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-scriptographer-"));
fs.copyFileSync(
  path.join(process.cwd(), "package.json"),
  path.join(root, "package.json"),
);

const report = runScriptographer(root, new Date("2026-04-26T00:00:00.000Z"));
assert.equal(report.schema_version, 1);
assert.equal(report.generated_at, "2026-04-26T00:00:00.000Z");
assert.ok(report.summary.total > 0);
assert.equal(report.summary.unratified, 0);
assert.ok(
  report.candidates.some(
    (candidate) =>
      candidate.name === "Scriptographer" &&
      candidate.classification === "registered-script-label" &&
      candidate.ratified,
  ),
);
assert.ok(
  report.candidates.some(
    (candidate) =>
      candidate.name === "REFER: Run Scriptographer" &&
      candidate.classification === "entrypoint-label" &&
      candidate.ratified,
  ),
);

const target = writeScriptographerReport(root, report);
assert.equal(target, scriptographerReportPath(root));
assert.equal(fs.existsSync(target), true);
