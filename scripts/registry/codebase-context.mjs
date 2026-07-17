import * as path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
const {
  scanCodebaseTree,
  writeAgentContext,
  writeCodebaseTree,
} = require(path.join(root, "dist", "src", "contracts", "codebaseTree.js"));

const tree = scanCodebaseTree(root);
const canonicalWorkspaceRoot = process.env.REFER_CANONICAL_WORKSPACE_ROOT?.trim();
if (canonicalWorkspaceRoot) {
  tree.workspace_root = canonicalWorkspaceRoot;
}
const treePath = writeCodebaseTree(root, tree);
const contextPath = writeAgentContext(root, tree);
process.stdout.write(`Wrote ${path.relative(root, treePath)}\n`);
process.stdout.write(`Wrote ${path.relative(root, contextPath)}\n`);
