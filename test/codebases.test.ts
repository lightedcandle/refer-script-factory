import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  codebaseRegistryPath,
  createCodebaseRegistry,
  refreshCodebaseRegistry,
  writeCodebaseRegistry,
} from "../src/bootstrap/codebases";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-codebases-"));
fs.mkdirSync(path.join(root, "apps", "web"), { recursive: true });
fs.mkdirSync(path.join(root, "packages", "api"), { recursive: true });
fs.writeFileSync(
  path.join(root, "apps", "web", "package.json"),
  JSON.stringify({ dependencies: { "@angular/core": "20.0.0" } }),
);
fs.writeFileSync(
  path.join(root, "packages", "api", "package.json"),
  JSON.stringify({ dependencies: { express: "5.0.0" } }),
);

const registry = createCodebaseRegistry(
  root,
  "generic",
  new Date("2026-04-25T00:00:00.000Z"),
);
assert.equal(registry.workspace_mode, "monorepo");
assert.equal(registry.tracking_scope, "repo");
assert.equal(registry.codebases.length, 2);
assert.ok(registry.codebases.some((entry) => entry.path === "apps/web"));
assert.equal(
  registry.codebases.find((entry) => entry.path === "apps/web")?.adapter,
  "angular",
);
assert.equal(
  registry.codebases.find((entry) => entry.path === "packages/api")?.adapter,
  "node",
);

const withOverride = {
  ...registry,
  codebases: registry.codebases.map((entry) =>
    entry.path === "apps/web"
      ? { ...entry, status: "active" as const, alias: "Main Web" }
      : entry,
  ),
};
writeCodebaseRegistry(root, withOverride);
assert.ok(fs.existsSync(codebaseRegistryPath(root)));

fs.rmSync(path.join(root, "packages", "api"), { recursive: true, force: true });
fs.mkdirSync(path.join(root, "workers", "mail"), { recursive: true });

const refreshed = refreshCodebaseRegistry(
  root,
  "generic",
  new Date("2026-04-26T00:00:00.000Z"),
);
assert.equal(
  refreshed.codebases.find((entry) => entry.path === "apps/web")?.alias,
  "Main Web",
);
assert.equal(
  refreshed.codebases.find((entry) => entry.path === "apps/web")?.status,
  "active",
);
assert.equal(
  refreshed.codebases.find((entry) => entry.path === "packages/api")?.status,
  "missing",
);
assert.equal(
  refreshed.codebases.find((entry) => entry.path === "workers/mail")?.status,
  "discovered",
);

const singleRoot = fs.mkdtempSync(path.join(os.tmpdir(), "refer-single-"));
const single = createCodebaseRegistry(singleRoot, "React");
assert.equal(single.workspace_mode, "single");
assert.equal(single.codebases[0]?.path, ".");
assert.equal(single.codebases[0]?.adapter, "react");

const nodeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "refer-node-"));
const nodeSingle = createCodebaseRegistry(nodeRoot, "Node");
assert.equal(nodeSingle.workspace_mode, "single");
assert.equal(nodeSingle.codebases[0]?.adapter, "node");
