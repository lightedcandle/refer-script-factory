import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(read("package.json")) as {
  main: string;
  version: string;
  activationEvents: string[];
  contributes: {
    commands: { command: string }[];
    chatParticipants: { id: string }[];
    configuration: { properties: Record<string, unknown> };
    views: { refer: { id: string }[] };
  };
};

assert.equal(packageJson.main, "./dist/src/extension.js");
assert.equal(packageJson.version, "0.0.1");
assert.deepEqual(
  packageJson.contributes.commands.map((entry) => entry.command),
  [
    "refer.initializeRepo",
    "refer.emitSendContract",
    "refer.emitScriptBlueprint",
    "refer.emitScriptDnaSeed",
    "refer.refreshCodebases",
    "refer.scanCodebase",
    "refer.viewCodebaseTree",
    "refer.scanFactoryGaps",
    "refer.viewFactoryGaps",
    "refer.runScriptographer",
    "refer.viewScriptographerReport",
    "refer.checkForUpdates",
    "refer.applyUpdate",
    "refer.contractModeOn",
    "refer.contractModeOff",
    "refer.contractModeToggle",
  ],
);
assert.deepEqual(packageJson.contributes.chatParticipants.map((entry) => entry.id), [
  "refer-script-factory.refer",
]);
assert.deepEqual(Object.keys(packageJson.contributes.configuration.properties), [
  "refer.updateChannel",
  "refer.updateManifestUrl",
  "refer.autoCheckUpdates",
  "refer.autoRefreshCodebases",
  "refer.modelProvider",
  "refer.ollamaUrl",
  "refer.ollamaModel",
  "refer.ollamaTimeoutMs",
]);
assert.deepEqual(packageJson.contributes.views.refer.map((entry) => entry.id), [
  "refer.referLibrary",
  "refer.scriptFactory",
  "refer.dashboard",
  "refer.chat",
  "refer.process",
  "refer.library",
]);
assert.ok(packageJson.activationEvents.includes("onChatParticipant:refer-script-factory.refer"));

assert.equal(
  normalize(read("src/extension.ts")),
  'export { activate, deactivate } from "./adapters/vscode/extension";',
);
assert.match(read("src/adapters/vscode/extension.ts"), /export function activate/);
assert.match(read("src/adapters/vscode/extension.ts"), /export function deactivate/);

for (const [legacy, owner] of [
  ["src/chat/referParticipant.ts", "../adapters/vscode/referParticipant"],
  ["src/chat/referModelProvider.ts", "../adapters/vscode/referModelProvider"],
  ["src/commands/contractMode.ts", "../adapters/vscode/commands/contractMode"],
  ["src/cockpit/contractChatPanel.ts", "../adapters/vscode/cockpit/contractChatPanel"],
] as const) {
  assert.ok(read(legacy).includes(owner), `${legacy} must forward to ${owner}`);
}

for (const file of collectTypeScriptFiles(path.join(root, "src"))) {
  const relative = normalize(path.relative(root, file));
  const source = fs.readFileSync(file, "utf8");
  if (/from\s+["']vscode["']|import\s+\*\s+as\s+vscode\s+from\s+["']vscode["']/.test(source)) {
    assert.ok(
      relative.startsWith("src/adapters/vscode/"),
      `${relative} imports vscode outside the VS Code adapter boundary`,
    );
  }
}

function collectTypeScriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory()
      ? collectTypeScriptFiles(absolute)
      : entry.isFile() && entry.name.endsWith(".ts")
        ? [absolute]
        : [];
  });
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalize(value: string): string {
  return value.replace(/\r\n/g, "\n").trimEnd().split(path.sep).join("/");
}
