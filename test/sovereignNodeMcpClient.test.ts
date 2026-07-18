import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  assertSovereignNodeReadToolAllowed,
  createSovereignNodeReadClient,
  isSovereignNodeReadError,
  sovereignNodeReadContractId,
  sovereignNodeReadTools,
  type SovereignNodeReadErrorCode,
} from "../src/integrations/sovereign-node";

void main();

async function main(): Promise<void> {
  const roots: string[] = [];
  try {
    await testSixReadMethodsAndNotFound(roots);
    await testProtocolAndSchemaFailures(roots);
    await testLedgerAndAvailabilityFailures(roots);
    await testBoundedTimeouts(roots);
    testConfigAndMutationRejection(roots);
  } finally {
    for (const root of roots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
}

async function testSixReadMethodsAndNotFound(roots: string[]): Promise<void> {
  const root = makeFixtureRoot(roots);
  process.env.SOVEREIGN_MCP_MUTATION_TOKEN = "must-not-cross";
  process.env.SOVEREIGN_MCP_MUTATION_SCOPES = "realtime:write";
  const client = createSovereignNodeReadClient({ nodeRoot: root });
  try {
    const discovery = await client.discover();
    assert.equal(discovery.kind, "sovereign-node");
    assert.equal(discovery.workflowLedger.summary.workflowCount, 1);
    assert.equal(discovery.mutationEnvironmentPresent, false);
    assert.equal((await client.validateWorkflowLedger()).ok, true);
    assert.equal((await client.listWorkflows()).workflows[0].id, "node.discover");
    assert.equal((await client.getWorkflow("node.discover")).entry?.id, "node.discover");
    assert.equal(
      (await client.listMethods()).methods[0].method_id,
      "node-mcp-migration-plan-method",
    );
    assert.equal(
      (await client.getMethod("branching methodology")).entry?.method_id,
      "branching methodology",
    );
    await expectCode(client.getWorkflow("missing-workflow"), "NODE_NOT_FOUND");
    await expectCode(client.getMethod("missing-method"), "NODE_NOT_FOUND");
  } finally {
    delete process.env.SOVEREIGN_MCP_MUTATION_TOKEN;
    delete process.env.SOVEREIGN_MCP_MUTATION_SCOPES;
    await client.close();
  }

  const calls = fs
    .readFileSync(path.join(root, "fixture-calls.jsonl"), "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => (JSON.parse(line) as { tool: string }).tool);
  assert.equal(calls[0], "discover_node");
  assert.equal(calls.every((tool) => sovereignNodeReadTools.includes(tool as any)), true);
}

async function testProtocolAndSchemaFailures(roots: string[]): Promise<void> {
  for (const [mode, code] of [
    ["wrong-identity", "NODE_PROTOCOL_MISMATCH"],
    ["wrong-version", "NODE_PROTOCOL_MISMATCH"],
    ["schema-missing", "NODE_SCHEMA_MISMATCH"],
  ] as const) {
    const root = makeFixtureRoot(roots, { mode });
    const client = createSovereignNodeReadClient({ nodeRoot: root });
    try {
      await expectCode(client.discover(), code);
    } finally {
      await client.close();
    }
  }

  const missingContractRoot = makeFixtureRoot(roots);
  fs.rmSync(
    path.join(
      missingContractRoot,
      "docs",
      "contracts",
      `${sovereignNodeReadContractId}.schema.json`,
    ),
  );
  const missingContract = createSovereignNodeReadClient({
    nodeRoot: missingContractRoot,
  });
  try {
    await expectCode(missingContract.discover(), "NODE_PROTOCOL_MISMATCH");
  } finally {
    await missingContract.close();
  }
}

async function testLedgerAndAvailabilityFailures(roots: string[]): Promise<void> {
  const invalidRoot = makeFixtureRoot(roots, { mode: "invalid-ledger" });
  const invalidClient = createSovereignNodeReadClient({ nodeRoot: invalidRoot });
  try {
    await expectCode(
      invalidClient.validateWorkflowLedger(),
      "NODE_LEDGER_INVALID",
    );
  } finally {
    await invalidClient.close();
  }

  const unavailableRoot = makeFixtureRoot(roots, { mode: "unavailable" });
  const unavailableClient = createSovereignNodeReadClient({
    nodeRoot: unavailableRoot,
  });
  try {
    await expectCode(unavailableClient.discover(), "NODE_UNAVAILABLE");
  } finally {
    await unavailableClient.close();
  }
}

async function testBoundedTimeouts(roots: string[]): Promise<void> {
  const connectRoot = makeFixtureRoot(roots, { mode: "connect-timeout" });
  const connectClient = createSovereignNodeReadClient({ nodeRoot: connectRoot });
  const connectStarted = Date.now();
  try {
    await expectCode(connectClient.discover(), "NODE_TIMEOUT");
    assert.ok(Date.now() - connectStarted >= 4_500);
    assert.ok(Date.now() - connectStarted < 8_000);
  } finally {
    await connectClient.close();
  }

  const readRoot = makeFixtureRoot(roots, { timeoutTool: "list_workflows" });
  const readClient = createSovereignNodeReadClient({ nodeRoot: readRoot });
  try {
    await readClient.discover();
    const readStarted = Date.now();
    await expectCode(readClient.listWorkflows(), "NODE_TIMEOUT");
    assert.ok(Date.now() - readStarted >= 9_500);
    assert.ok(Date.now() - readStarted < 13_000);
  } finally {
    await readClient.close();
  }
}

function testConfigAndMutationRejection(roots: string[]): void {
  assert.throws(
    () => createSovereignNodeReadClient({ nodeRoot: path.join(os.tmpdir(), "missing-node-root") }),
    (error: unknown) => isSovereignNodeReadError(error) && error.code === "NODE_CONFIG_INVALID",
  );

  const root = makeFixtureRoot(roots);
  assert.throws(
    () => assertSovereignNodeReadToolAllowed("realtime_publish"),
    (error: unknown) => isSovereignNodeReadError(error) && error.code === "NODE_CONFIG_INVALID",
  );
  assert.equal(fs.existsSync(path.join(root, "fixture-calls.jsonl")), false);
}

async function expectCode(
  promise: Promise<unknown>,
  code: SovereignNodeReadErrorCode,
): Promise<void> {
  await assert.rejects(
    promise,
    (error: unknown) => isSovereignNodeReadError(error) && error.code === code,
  );
}

function makeFixtureRoot(
  roots: string[],
  mode: Record<string, unknown> = {},
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-node-client-test-"));
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
