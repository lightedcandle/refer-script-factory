import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  sovereignNodeReadContractId,
  sovereignNodeReadTools,
} from "../src/integrations/sovereign-node";

void main();

async function main(): Promise<void> {
  const roots: string[] = [];
  try {
    await testCompiledSixCommandSmoke(roots);
    await testHumanAndMachineFailures(roots);
  } finally {
    for (const root of roots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
}

async function testCompiledSixCommandSmoke(roots: string[]): Promise<void> {
  const root = makeFixtureRoot(roots);
  const executable = path.resolve(__dirname, "../src/adapters/cli/index.js");
  const commands = [
    ["node", "discover", "--node-root", root, "--json"],
    ["node", "validate", "--node-root", root, "--json"],
    ["node", "workflows", "--node-root", root, "--json"],
    ["node", "workflow", "node.discover", "--node-root", root, "--json"],
    ["node", "methods", "--node-root", root, "--json"],
    ["node", "method", "branching methodology", "--node-root", root, "--json"],
  ];

  for (const args of commands) {
    const result = await runChild(executable, args);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.equal(result.stdout.trim().split(/\r?\n/).length, 1);
    const packet = JSON.parse(result.stdout) as any;
    assert.equal(packet.ok, true);
    assert.equal(packet.exit_code, 0);
    assert.match(packet.command, /^node\./);
    assert.doesNotMatch(result.stdout, new RegExp(escapeRegExp(root), "i"));
    assert.doesNotMatch(result.stdout, /E:\/SovereignNode/i);
    assert.match(result.stderr, /^\[refer\] Reading Sovereign Node/m);
  }

  const help = await runChild(executable, ["--help"]);
  assert.equal(help.exitCode, 0);
  assert.match(help.stdout, /refer-script-factory resolve/);
  assert.match(help.stdout, /node discover --node-root/);
  const version = await runChild(executable, ["--version"]);
  assert.equal(version.exitCode, 0);
  assert.equal(version.stdout.trim(), "0.0.1");
}

async function testHumanAndMachineFailures(roots: string[]): Promise<void> {
  const executable = path.resolve(__dirname, "../src/adapters/cli/index.js");
  const root = makeFixtureRoot(roots);
  const human = await runChild(executable, [
    "node",
    "discover",
    "--node-root",
    root,
  ]);
  assert.equal(human.exitCode, 0);
  assert.equal(
    human.stdout,
    "Sovereign Node discovered. Workflows: 1; subflows: 1; methods: 1.\n",
  );
  assert.doesNotMatch(human.stdout, new RegExp(escapeRegExp(root), "i"));

  const missing = await runChild(executable, [
    "node",
    "workflow",
    "missing-workflow",
    "--node-root",
    root,
    "--json",
  ]);
  assert.equal(missing.exitCode, 1);
  assert.equal((JSON.parse(missing.stdout) as any).error.code, "NODE_NOT_FOUND");

  const unavailableRoot = makeFixtureRoot(roots, { mode: "unavailable" });
  const unavailable = await runChild(executable, [
    "node",
    "discover",
    "--node-root",
    unavailableRoot,
    "--json",
  ]);
  assert.equal(unavailable.exitCode, 1);
  assert.equal((JSON.parse(unavailable.stdout) as any).error.code, "NODE_UNAVAILABLE");

  const invalid = await runChild(executable, [
    "node",
    "discover",
    "--json",
  ]);
  assert.equal(invalid.exitCode, 2);
  assert.equal((JSON.parse(invalid.stdout) as any).error.code, "NODE_CONFIG_INVALID");

  const missingRootValue = await runChild(executable, [
    "node",
    "discover",
    "--node-root",
    "--json",
  ]);
  assert.equal(missingRootValue.exitCode, 2);
  assert.equal(
    (JSON.parse(missingRootValue.stdout) as any).error.code,
    "NODE_CONFIG_INVALID",
  );
}

function makeFixtureRoot(
  roots: string[],
  mode: Record<string, unknown> = {},
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-node-cli-test-"));
  roots.push(root);
  fs.mkdirSync(path.join(root, "mcp"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs", "contracts"), { recursive: true });
  fs.copyFileSync(
    path.resolve(__dirname, "../../test/fixtures/sovereignNodeMcpServer.mjs"),
    path.join(root, "mcp", "server.mjs"),
  );
  fs.writeFileSync(path.join(root, "fixture-mode.json"), JSON.stringify(mode));
  fs.writeFileSync(
    path.join(
      root,
      "docs",
      "contracts",
      `${sovereignNodeReadContractId}.schema.json`,
    ),
    JSON.stringify({
      "x-refer-contract": {
        contractId: sovereignNodeReadContractId,
        mcpIdentity: {
          name: "sovereign-node",
          minimumVersion: "1.1.0",
          maximumVersionExclusive: "2.0.0",
        },
        allowedTools: sovereignNodeReadTools,
      },
    }),
  );
  return root;
}

function runChild(
  executable: string,
  args: string[],
): Promise<{ exitCode: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [executable, ...args], {
      cwd: path.resolve(__dirname, "../.."),
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.once("error", reject);
    child.once("close", (exitCode) => resolve({ exitCode, stdout, stderr }));
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
