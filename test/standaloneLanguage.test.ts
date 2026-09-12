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

// This used to require the literal "Script Factory VS Code adapter", to stop
// AGENTS.md presenting that host as the product. The host is gone; the thing the
// guard was protecting is not. AGENTS.md must still say that hosts are adapters
// and that the core does not depend on them, because the next host will arrive
// with the same gravity the last one had.
assert.match(agents, /adapters and operator surfaces/);
assert.match(agents, /Host adapters depend on the core/);
assert.match(
  agents,
  /VS Code adapter was retired on 2026-09-12/,
  "AGENTS.md must record the retirement: a reader who finds src/adapters/vscode missing needs to know it was removed, not that the checkout is broken",
);

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
    "src/chat/referOrchestratorRunner.ts",
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

// The VS Code adapter was retired on 2026-09-12. This check used to permit VS
// Code wording on adapter-specific entries; with no adapter, any such wording in
// the registry now describes something that does not exist.
//
// "Command Palette" is deliberately not in the pattern: the Command Surface
// legend term is doctrine about host commands in general, and outliving one host
// is the whole point of a provider-neutral vocabulary.
// One entry may say the word, and only this one: the core boundary checker
// rejects the `vscode` module specifier by name, and it should keep doing so
// precisely because no adapter is left to make such an import legitimate.
// Naming what a guard refuses is not describing a surface.
const boundaryEntry = "npm.verify.core-boundary";
for (const entry of scriptFactoryEntries) {
  if (entry.script_id === boundaryEntry) continue;
  const wording = `${entry.entrypoint} ${entry.label} ${entry.does} ${entry.detail}`;
  assert.equal(
    /VS Code|vscode/i.test(wording),
    false,
    `${entry.script_id} still describes a VS Code surface, which no longer exists`,
  );
}
assert.ok(
  scriptFactoryEntries.some((entry) => entry.script_id === boundaryEntry),
  `${boundaryEntry} must stay registered: it is what keeps the vscode import gone`,
);

const packageJson = JSON.parse(read("package.json")) as {
  version: string;
  description: string;
  bin?: Record<string, string>;
  [key: string]: unknown;
};
assert.equal(packageJson.version, "0.0.1");
assert.match(packageJson.description, /provider-neutral REFER system/i);

// The retirement must not creep back by someone reinstating a manifest field
// "just to package it". A lone `contributes` block reads as harmless and pulls
// the whole adapter behind it.
for (const field of ["contributes", "activationEvents", "publisher", "main", "categories"]) {
  assert.equal(
    field in packageJson,
    false,
    `package.json declares ${field}: this is a Node package with a CLI bin, not a VS Code extension`,
  );
}
assert.ok(packageJson.bin?.["refer-script-factory"], "the CLI bin must stay declared");

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
