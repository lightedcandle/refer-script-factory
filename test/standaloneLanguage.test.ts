import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { scriptFactoryEntries } from "../src/contracts/scriptFactory";
import {
  createScriptLegend,
  renderScriptLegendMarkdown,
} from "../src/contracts/scriptLegend";

const root = process.cwd();
const canonicalIdentity =
  "The Script Factory is the provider-neutral system that converts ratified REFER Execution Contracts and verified methods into bounded script plans, artifacts, verification evidence, and reusable registrations.";

for (const relativePath of [
  "README.md",
  "docs/factory-system-doctrine.md",
  "docs/PLAN-REFER-FACTORY-STANDALONE-001.md",
]) {
  assert.ok(
    read(relativePath).replace(/\s+/g, " ").includes(canonicalIdentity),
    `${relativePath} must state the canonical identity`,
  );
}

const agents = read("AGENTS.md");
assert.match(agents, /provider-neutral system that converts ratified REFER Execution Contracts/);
assert.match(agents, /Script Factory VS Code adapter/);

const legend = createScriptLegend();
const requiredTerms = new Set([
  "Interactive Host",
  "Host Command",
  "Operator Interface",
  "Target Workspace",
  "Host-Provided Model",
  "Event/Output Sink",
  "Host Adapter",
  "Intake Record",
  "Intake Envelope",
  "Planning Artifact",
  "Execution Contract",
  "Execution Authorization",
  "Runtime Session",
]);
for (const term of requiredTerms) {
  assert.ok(legend.terms.some((entry) => entry.term === term), `missing canonical term: ${term}`);
}

assert.equal(
  legend.taxonomy.some((category) => category.name === "Cockpit View Label"),
  false,
);
assert.ok(legend.taxonomy.some((category) => category.name === "Operator Interface Label"));

const renderedLegend = normalize(renderScriptLegendMarkdown());
assert.equal(normalize(read("docs/script-legend.md")), renderedLegend);
assert.equal(normalize(read(".refer-factory/script-legend.md")), renderedLegend);

for (const forbidden of [
  "temporary contract",
  "persistent contract",
  "intake contract",
  "contract mode",
]) {
  for (const relativePath of [
    "AGENTS.md",
    "README.md",
    "docs/factory-system-doctrine.md",
    "docs/domain-script-registry.md",
    "docs/cross-factory-orchestration.md",
    "docs/refer-orchestrator-roadmap.md",
    "docs/script-legend.md",
    "docs/script-factory-text-diagram.md",
    "docs/Refer Script Factory.mmd",
    "docs/user-law-expansion.md",
    "src/chat/referParticipant.ts",
    "src/chat/referOrchestratorRunner.ts",
    "src/commands/contractMode.ts",
    "src/cockpit/contractChatPanel.ts",
    "src/contracts/referCoach.ts",
    "src/contracts/referIntake.ts",
    "src/contracts/referOrchestrator.ts",
  ]) {
    assert.equal(
      read(relativePath).toLowerCase().includes(forbidden),
      false,
      `${relativePath} must not present ${forbidden} as core language`,
    );
  }
}

const vsCodeSpecificEntries = new Set([
  "refer.chat.participant",
  "refer.scan.codebase",
]);
for (const entry of scriptFactoryEntries) {
  const wording = `${entry.entrypoint} ${entry.does} ${entry.detail}`;
  if (/VS Code|Command Palette/i.test(wording)) {
    assert.ok(
      entry.surface === "vscode-command" || vsCodeSpecificEntries.has(entry.script_id),
      `${entry.script_id} uses VS Code wording without being adapter-specific`,
    );
  }
}

for (const id of [
  "refer.contractModeOn",
  "refer.contractModeOff",
  "refer.contractModeToggle",
]) {
  const entry = scriptFactoryEntries.find((candidate) => candidate.script_id === id);
  assert.ok(entry, `missing compatibility entry: ${id}`);
  assert.match(`${entry.label} ${entry.does} ${entry.detail}`, /legacy intake-session/i);
  assert.match(entry.detail, /Execution Contract/i);
  assert.match(entry.detail, /does not|not a|neither state/i);
}

const packageJson = JSON.parse(read("package.json")) as {
  version: string;
  description: string;
  contributes: { commands: { command: string; title: string }[] };
};
assert.equal(packageJson.version, "0.0.1");
assert.match(packageJson.description, /provider-neutral REFER system/i);
const commandTitles = new Map(
  packageJson.contributes.commands.map((command) => [command.command, command.title]),
);
assert.equal(commandTitles.get("refer.contractModeOn"), "REFER: Legacy Intake Session On");
assert.equal(commandTitles.get("refer.contractModeOff"), "REFER: Legacy Intake Session Off");
assert.equal(
  commandTitles.get("refer.contractModeToggle"),
  "REFER: Toggle Legacy Intake Session",
);

const domainRegistry = JSON.parse(read(".refer-factory/script-registry.json")) as {
  domains: {
    id: string;
    scope: string;
    scripts: { id: string; purpose: string }[];
    discovered_package_scripts?: { name: string; command: string }[];
  }[];
};
const factoryDomain = domainRegistry.domains.find(
  (domain) => domain.id === "refer-script-factory",
);
assert.ok(factoryDomain);
assert.equal(
  factoryDomain.scope,
  "Provider-neutral TypeScript source and doctrine, plus current host-adapter registrations.",
);
assert.match(
  factoryDomain.scripts.find((script) => script.id === "refer.extension.script-registry")
    ?.purpose ?? "",
  /provider-neutral script contract registry/i,
);
assert.equal(
  factoryDomain.discovered_package_scripts?.find((script) => script.name === "test")
    ?.command,
  (JSON.parse(read("package.json")) as { scripts: { test: string } }).scripts.test,
);
const domainRegistryGenerator = read("scripts/registry/domain-script-registry.mjs");
assert.ok(domainRegistryGenerator.includes(factoryDomain.scope));
assert.ok(
  domainRegistryGenerator.includes(
    "Authoritative provider-neutral script contract registry with accurately labeled current host-adapter entries.",
  ),
);
assert.equal(
  read(".refer-factory/script-registry.md").includes(
    "Authoritative VS Code extension and provider-neutral script contract registry",
  ),
  false,
);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function normalize(value: string): string {
  return value.replace(/\r\n/g, "\n").trimEnd();
}
