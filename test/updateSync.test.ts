import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  applyReferUpdate,
  checkForReferUpdates,
  createPackagedLawManifest,
  readLocalUpdateState,
  writeLocalUpdateState,
} from "../src/updates/updateSync";

const extensionRoot = process.cwd();
const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "refer-update-"));

void main();

async function main(): Promise<void> {
  const initial = await checkForReferUpdates({
    extensionRoot,
    workspaceRoot,
    channel: "stable",
  });

  assert.equal(initial.up_to_date, false);
  assert.ok(initial.pending_artifacts.length > 0);
  assert.ok(
    initial.pending_artifacts.some(
      (artifact) => artifact.target_path === "REFER.OS/refer.md",
    ),
  );

  const report = await applyReferUpdate(
    {
      extensionRoot,
      workspaceRoot,
      channel: "stable",
    },
    initial,
  );

  assert.equal(report.failed.length, 0);
  assert.ok(report.applied.includes("law:refer.md"));
  assert.ok(fs.existsSync(path.join(workspaceRoot, "REFER.OS", "refer.md")));

  const after = await checkForReferUpdates({
    extensionRoot,
    workspaceRoot,
    channel: "stable",
  });

  assert.equal(after.up_to_date, true);

  const state = readLocalUpdateState(workspaceRoot, "stable");
  assert.equal(state.artifacts["law:refer.md"], "0.0.1");

  const betaManifest = createPackagedLawManifest("beta", "9.9.9");
  const manifestPath = path.join(workspaceRoot, "beta-manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(betaManifest, null, 2)}\n`);
  const stableCheckAgainstBeta = await checkForReferUpdates({
    extensionRoot,
    workspaceRoot,
    channel: "stable",
    manifestUrl: manifestPath,
  });
  assert.equal(stableCheckAgainstBeta.up_to_date, true);

  writeLocalUpdateState(workspaceRoot, {
    manifest_version: "0.0.0",
    channel: "stable",
    applied_at: null,
    artifacts: {},
  });
  const relativeManifest = await checkForReferUpdates({
    extensionRoot,
    workspaceRoot,
    channel: "beta",
    manifestUrl: "beta-manifest.json",
  });
  assert.equal(relativeManifest.up_to_date, false);
  assert.equal(relativeManifest.manifest.channel, "beta");
}
