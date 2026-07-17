import fs from "node:fs";
import path from "node:path";

const modePath = path.join(process.cwd(), "fixture-mode.json");
const mode = fs.existsSync(modePath)
  ? JSON.parse(fs.readFileSync(modePath, "utf8"))
  : {};

if (mode.mode === "unavailable") {
  process.exit(1);
}

const tools = [
  ["discover_node", {}],
  ["validate_workflow_ledger", {}],
  ["list_workflows", {}],
  ["get_workflow", { workflowId: { type: "string" } }],
  ["list_methods", {}],
  ["get_method", { methodId: { type: "string" } }],
].map(([name, properties]) => ({
  name,
  description: `${name} fixture`,
  inputSchema: {
    type: "object",
    properties,
    additionalProperties: false,
  },
}));

const workflowSummary = {
  version: 1,
  updated: "2026-07-16",
  scope: "Fixture Sovereign Node",
  workflowCount: 1,
  subflowCount: 1,
  canonicalWorkflowIds: ["node.discover"],
  statusCounts: { canonical: 1 },
};

const methodSummary = {
  version: 1,
  updated: "2026-07-13",
  description: "Fixture method bank.",
  methodCount: 1,
  categories: { discovery: 1 },
  methodNames: ["Node Discovery Contract Method"],
};

const workflow = (id = "node.discover") => ({
  id,
  title: "Discover the Sovereign Node",
  status: "canonical",
  entrypoints: ["mcp/server.mjs"],
  outcome: "Current Node truth is available.",
  steps: ["Start the local stdio server.", "Read discovery truth."],
});

const subflow = {
  id: "node.discover.verify",
  title: "Verify Node discovery",
  outcome: "Node identity is confirmed.",
  steps: ["Check server identity."],
};

const method = (id = "node-mcp-migration-plan-method") => ({
  method_id: id,
  method_name: "Node Discovery Contract Method",
  category: "discovery",
  repo: "SovereignNode",
  status: "verified",
  purpose: "Read current Node discovery truth.",
  when_to_use: "Before node-consumer work.",
  steps: ["Discover the Node."],
  verification: ["Confirm sovereign-node identity."],
  source_docs: ["E:/SovereignNode/docs/mcp-agent-surface.md"],
});

let buffered = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffered += chunk;
  while (true) {
    const newline = buffered.indexOf("\n");
    if (newline < 0) break;
    const line = buffered.slice(0, newline).trim();
    buffered = buffered.slice(newline + 1);
    if (line) handleMessage(JSON.parse(line));
  }
});

function handleMessage(message) {
  if (!("id" in message)) return;
  if (message.method === "initialize") {
    if (mode.mode === "connect-timeout") return;
    send(message.id, {
      protocolVersion: message.params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: {
        name: mode.mode === "wrong-identity" ? "not-sovereign-node" : "sovereign-node",
        version: mode.mode === "wrong-version" ? "2.0.0" : "1.1.0",
      },
    });
    return;
  }
  if (message.method === "tools/list") {
    send(message.id, { tools });
    return;
  }
  if (message.method === "tools/call") {
    const toolName = message.params?.name;
    fs.appendFileSync(
      path.join(process.cwd(), "fixture-calls.jsonl"),
      `${JSON.stringify({ tool: toolName })}\n`,
    );
    if (mode.timeoutTool === toolName) return;
    const payload = toolPayload(toolName, message.params?.arguments ?? {});
    if (payload === undefined) {
      send(message.id, {
        content: [{ type: "text", text: "Unknown tool" }],
        isError: true,
      });
      return;
    }
    send(message.id, {
      content: [{ type: "text", text: JSON.stringify(payload) }],
    });
    return;
  }
  sendError(message.id, -32601, "Method not found");
}

function toolPayload(toolName, args) {
  const workflowPath = path.join(process.cwd(), "docs", "workflow-ledger.json");
  const methodPath = path.join(process.cwd(), "docs", "method-bank.seed.json");
  switch (toolName) {
    case "discover_node": {
      const payload = {
        repoRoot: process.cwd(),
        kind: "sovereign-node",
        summary: "Deterministic Sovereign Node fixture.",
        hasNodeDocs: true,
        hasMcpDocs: true,
        composeServiceNames: ["api"],
        workflowLedger: {
          exists: true,
          path: workflowPath,
          summary: workflowSummary,
        },
        methodBank: {
          exists: true,
          path: methodPath,
          summary: methodSummary,
        },
        services: [{ name: "api" }],
        agentSurfaces: { mcp: true },
        mutationEnvironmentPresent: Object.keys(process.env).some((key) =>
          key.startsWith("SOVEREIGN_MCP_MUTATION_"),
        ),
      };
      if (mode.mode === "schema-missing") delete payload.methodBank;
      return payload;
    }
    case "validate_workflow_ledger":
      return {
        exists: true,
        path: workflowPath,
        ok: mode.mode !== "invalid-ledger",
        issues: mode.mode === "invalid-ledger" ? ["fixture invalid"] : [],
        summary: workflowSummary,
      };
    case "list_workflows":
      return {
        exists: true,
        path: workflowPath,
        summary: workflowSummary,
        workflows: [workflow()],
        subflows: [subflow],
      };
    case "get_workflow": {
      const id = String(args.workflowId ?? "");
      return {
        exists: true,
        path: workflowPath,
        workflowId: id,
        entry: id.includes("missing") ? null : workflow(id),
      };
    }
    case "list_methods":
      return {
        exists: true,
        path: methodPath,
        summary: methodSummary,
        methods: [method()],
      };
    case "get_method": {
      const id = String(args.methodId ?? "");
      return {
        exists: true,
        path: methodPath,
        methodId: id,
        entry: id.includes("missing") ? null : method(id),
      };
    }
    default:
      return undefined;
  }
}

function send(id, result) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function sendError(id, code, message) {
  process.stdout.write(
    `${JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } })}\n`,
  );
}
