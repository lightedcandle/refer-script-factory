import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  loadReferEndpointTargetRegistry,
  resolveReferEndpointTarget,
} from "../src/server/referTargetRegistry";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-target-registry-"));
const appRoot = path.join(root, "apps", "jamaicaeats");
fs.mkdirSync(appRoot, { recursive: true });
fs.mkdirSync(path.join(root, ".refer-factory"), { recursive: true });
fs.writeFileSync(
  path.join(root, ".refer-factory", "orchestrator-targets.json"),
  JSON.stringify(
    {
      targets: [
        {
          id: "jamaicaeats",
          workspaceRoot: appRoot,
          label: "JamaicaEats test target",
        },
      ],
    },
    null,
    2,
  ),
);

const registry = loadReferEndpointTargetRegistry(root);
assert.equal(registry.targets.length, 1);
assert.equal(registry.targets[0]?.id, "jamaicaeats");

const resolved = resolveReferEndpointTarget({
  registry,
  target: "JamaicaEats",
  defaultWorkspaceRoot: root,
});
assert.equal(resolved.workspaceRoot, appRoot);

assert.throws(
  () =>
    resolveReferEndpointTarget({
      registry,
      target: "missing",
      defaultWorkspaceRoot: root,
    }),
  /Unknown REFER target/,
);

const fallback = resolveReferEndpointTarget({
  registry,
  workspaceRoot: root,
  defaultWorkspaceRoot: appRoot,
});
assert.equal(fallback.workspaceRoot, root);
