import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
const { renderScriptLegendMarkdown } = require(
  path.join(root, "dist", "src", "core", "contracts", "scriptLegend.js"),
);

const content = `${renderScriptLegendMarkdown().trimEnd()}\n`;
const targets = [
  path.join(root, "docs", "script-legend.md"),
  path.join(root, ".refer-factory", "script-legend.md"),
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  process.stdout.write(`Wrote ${path.relative(root, target)}\n`);
}
