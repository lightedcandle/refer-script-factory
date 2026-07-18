import * as fs from "node:fs";
import * as path from "node:path";
import { renderScriptLegendMarkdown } from "../core/contracts/scriptLegend";

export * from "../core/contracts/scriptLegend";

export function scriptLegendPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "script-legend.md");
}

export function writeScriptLegend(workspaceRoot: string): string {
  const target = scriptLegendPath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${renderScriptLegendMarkdown().trimEnd()}\n`, "utf8");
  return target;
}
