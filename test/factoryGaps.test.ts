import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  factoryGapReportPath,
  scanFactoryGaps,
  writeFactoryGapReport,
} from "../src/contracts/factoryGaps";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-factory-gaps-"));
fs.copyFileSync(
  path.join(process.cwd(), "package.json"),
  path.join(root, "package.json"),
);
fs.mkdirSync(path.join(root, ".refer-factory"), { recursive: true });
fs.writeFileSync(path.join(root, ".refer-factory", "codebase-tree.json"), "{}\n");
fs.writeFileSync(path.join(root, ".refer-factory", "agent-context.md"), "# Agent Context\n");
fs.writeFileSync(path.join(root, ".refer-factory", "script-legend.md"), "# Script Legend\n");

const report = scanFactoryGaps(root, new Date("2026-04-26T00:00:00.000Z"));
assert.equal(report.schema_version, 1);
assert.equal(report.generated_at, "2026-04-26T00:00:00.000Z");
assert.equal(report.summary.errors, 0);
assert.equal(
  report.gaps.some((gap) => gap.id.startsWith("terminology.missing")),
  false,
);
assert.equal(
  report.gaps.some((gap) => gap.id === "registry.missing.context-picker"),
  false,
);
assert.equal(
  report.gaps.some((gap) => gap.id.startsWith("registry.unlisted-label")),
  false,
);
assert.equal(
  report.gaps.some((gap) => gap.id.startsWith("terminology.unlisted-cockpit-view-label")),
  false,
);

const target = writeFactoryGapReport(root, report);
assert.equal(target, factoryGapReportPath(root));
assert.equal(fs.existsSync(target), true);
