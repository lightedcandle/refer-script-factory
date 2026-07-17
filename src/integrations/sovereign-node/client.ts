import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { SovereignNodeReadError, isSovereignNodeReadError } from "./errors";
import {
  sovereignNodeReadContractId,
  sovereignNodeReadTools,
  type DiscoverNodeResponse,
  type GetMethodResponse,
  type GetWorkflowResponse,
  type ListMethodsResponse,
  type ListWorkflowsResponse,
  type SovereignNodeReadClient,
  type SovereignNodeReadTool,
  type ValidateWorkflowLedgerResponse,
} from "./types";
import {
  validateDiscoverNodeResponse,
  validateGetMethodResponse,
  validateGetWorkflowResponse,
  validateListMethodsResponse,
  validateListWorkflowsResponse,
  validateWorkflowLedgerResponse,
} from "./validation";

const connectTimeoutMs = 5_000;
const readTimeoutMs = 10_000;
const closeTimeoutMs = 2_000;
const minimumServerVersion = [1, 1, 0] as const;
const maximumServerVersionExclusive = [2, 0, 0] as const;

export interface SovereignNodeReadClientOptions {
  nodeRoot: string;
  cwd?: string;
}

export function assertSovereignNodeReadToolAllowed(
  tool: string,
): asserts tool is SovereignNodeReadTool {
  if (!(sovereignNodeReadTools as readonly string[]).includes(tool)) {
    throw new SovereignNodeReadError(
      "NODE_CONFIG_INVALID",
      `MCP tool ${tool} is outside the Script Factory read allowlist.`,
    );
  }
}

export function createSovereignNodeReadClient(
  options: SovereignNodeReadClientOptions,
): SovereignNodeReadClient {
  return new LocalSovereignNodeReadClient(options);
}

class LocalSovereignNodeReadClient implements SovereignNodeReadClient {
  readonly #nodeRoot: string;
  readonly #serverPath: string;
  #client: Client | undefined;
  #transport: StdioClientTransport | undefined;
  #connectPromise: Promise<void> | undefined;
  #discovery: DiscoverNodeResponse | undefined;

  constructor(options: SovereignNodeReadClientOptions) {
    const suppliedRoot = options.nodeRoot?.trim();
    if (!suppliedRoot) {
      throw new SovereignNodeReadError(
        "NODE_CONFIG_INVALID",
        "An explicit --node-root path is required.",
      );
    }
    const resolved = path.resolve(options.cwd ?? process.cwd(), suppliedRoot);
    try {
      const stat = fs.statSync(resolved);
      if (!stat.isDirectory()) {
        throw new Error("not a directory");
      }
      this.#nodeRoot = fs.realpathSync(resolved);
    } catch (error) {
      throw new SovereignNodeReadError(
        "NODE_CONFIG_INVALID",
        "--node-root must resolve to an existing Sovereign Node directory.",
        { cause: error },
      );
    }

    this.#serverPath = path.join(this.#nodeRoot, "mcp", "server.mjs");
    try {
      if (!fs.statSync(this.#serverPath).isFile()) {
        throw new Error("not a file");
      }
    } catch (error) {
      throw new SovereignNodeReadError(
        "NODE_CONFIG_INVALID",
        "--node-root does not contain the required mcp/server.mjs entrypoint.",
        { cause: error },
      );
    }
  }

  async discover(): Promise<DiscoverNodeResponse> {
    await this.#ensureConnected();
    return this.#discovery as DiscoverNodeResponse;
  }

  async validateWorkflowLedger(): Promise<ValidateWorkflowLedgerResponse> {
    await this.#ensureConnected();
    const response = validateWorkflowLedgerResponse(
      await this.#callAllowedTool("validate_workflow_ledger", {}),
    );
    if (!response.ok) {
      throw new SovereignNodeReadError(
        "NODE_LEDGER_INVALID",
        "The Sovereign Node workflow ledger is invalid.",
      );
    }
    return response;
  }

  async listWorkflows(): Promise<ListWorkflowsResponse> {
    await this.#ensureConnected();
    return validateListWorkflowsResponse(
      await this.#callAllowedTool("list_workflows", {}),
    );
  }

  async getWorkflow(id: string): Promise<GetWorkflowResponse> {
    const requestedId = normalizeLookup(id, "workflow");
    await this.#ensureConnected();
    const response = validateGetWorkflowResponse(
      await this.#callAllowedTool("get_workflow", { workflowId: requestedId }),
      requestedId,
    );
    if (response.entry === null) {
      throw new SovereignNodeReadError(
        "NODE_NOT_FOUND",
        `No Sovereign Node workflow matched ${requestedId}.`,
      );
    }
    return response;
  }

  async listMethods(): Promise<ListMethodsResponse> {
    await this.#ensureConnected();
    return validateListMethodsResponse(
      await this.#callAllowedTool("list_methods", {}),
    );
  }

  async getMethod(idOrAlias: string): Promise<GetMethodResponse> {
    const requestedId = normalizeLookup(idOrAlias, "method");
    await this.#ensureConnected();
    const response = validateGetMethodResponse(
      await this.#callAllowedTool("get_method", { methodId: requestedId }),
      requestedId,
    );
    if (response.entry === null) {
      throw new SovereignNodeReadError(
        "NODE_NOT_FOUND",
        `No Sovereign Node method matched ${requestedId}.`,
      );
    }
    return response;
  }

  async close(): Promise<void> {
    const client = this.#client;
    const transport = this.#transport;
    this.#client = undefined;
    this.#transport = undefined;
    this.#connectPromise = undefined;
    this.#discovery = undefined;
    if (!client) {
      return;
    }

    const pid = transport?.pid ?? null;
    let timer: NodeJS.Timeout | undefined;
    const closePromise = client.close().catch(() => undefined);
    await Promise.race([
      closePromise,
      new Promise<void>((resolve) => {
        timer = setTimeout(() => {
          if (pid !== null) {
            try {
              process.kill(pid, "SIGKILL");
            } catch {
              // The child already terminated.
            }
          }
          resolve();
        }, closeTimeoutMs);
        timer.unref();
      }),
    ]);
    if (timer) {
      clearTimeout(timer);
    }
  }

  async #ensureConnected(): Promise<void> {
    if (this.#discovery) {
      return;
    }
    if (!this.#connectPromise) {
      this.#connectPromise = this.#connect();
    }
    return this.#connectPromise;
  }

  async #connect(): Promise<void> {
    try {
      await validateContractMetadata(this.#nodeRoot);
      const environment = minimalChildEnvironment();
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [this.#serverPath],
        cwd: this.#nodeRoot,
        env: environment,
        stderr: "pipe",
      });
      transport.stderr?.on("data", () => {
        // Drain bounded child diagnostics so a noisy failed server cannot block stdio.
      });
      const client = new Client({
        name: "refer-script-factory",
        version: "0.0.1",
      });
      this.#transport = transport;
      this.#client = client;
      await client.connect(transport, { timeout: connectTimeoutMs });

      const identity = client.getServerVersion();
      if (
        identity?.name !== "sovereign-node" ||
        !isCompatibleVersion(identity?.version)
      ) {
        throw new SovereignNodeReadError(
          "NODE_PROTOCOL_MISMATCH",
          "The MCP server is not a compatible sovereign-node 1.x server.",
        );
      }

      const listed = await client.listTools(undefined, { timeout: readTimeoutMs });
      const tools = new Map(listed.tools.map((tool) => [tool.name, tool]));
      for (const name of sovereignNodeReadTools) {
        const tool = tools.get(name);
        if (!tool || !tool.inputSchema || typeof tool.inputSchema !== "object") {
          throw new SovereignNodeReadError(
            "NODE_PROTOCOL_MISMATCH",
            `The MCP server does not expose the required ${name} read contract.`,
          );
        }
      }

      this.#discovery = validateDiscoverNodeResponse(
        await this.#callAllowedTool("discover_node", {}),
      );
    } catch (error) {
      await this.close();
      throw normalizeClientFailure(error);
    }
  }

  async #callAllowedTool(
    tool: SovereignNodeReadTool,
    argumentsValue: Record<string, unknown>,
  ): Promise<unknown> {
    assertSovereignNodeReadToolAllowed(tool);
    const client = this.#client;
    if (!client) {
      throw new SovereignNodeReadError(
        "NODE_UNAVAILABLE",
        "The Sovereign Node MCP client is not connected.",
      );
    }
    try {
      const result = await client.callTool(
        { name: tool, arguments: argumentsValue },
        undefined,
        { timeout: readTimeoutMs },
      );
      const rawResult = result as { isError?: unknown; content?: unknown };
      if (rawResult.isError === true) {
        throw new SovereignNodeReadError(
          "NODE_UNAVAILABLE",
          `The Sovereign Node rejected the ${tool} read.`,
        );
      }
      if (!Array.isArray(rawResult.content)) {
        throw new SovereignNodeReadError(
          "NODE_SCHEMA_MISMATCH",
          `The ${tool} response did not contain MCP content.`,
        );
      }
      const text = rawResult.content.find(
        (item: unknown): item is { type: "text"; text: string } => {
          const candidate = asRecord(item);
          return candidate?.type === "text" && typeof candidate.text === "string";
        },
      )?.text;
      if (text === undefined) {
        throw new SovereignNodeReadError(
          "NODE_SCHEMA_MISMATCH",
          `The ${tool} response did not contain a JSON text packet.`,
        );
      }
      try {
        return JSON.parse(text) as unknown;
      } catch (error) {
        throw new SovereignNodeReadError(
          "NODE_SCHEMA_MISMATCH",
          `The ${tool} response was not valid JSON.`,
          { cause: error },
        );
      }
    } catch (error) {
      throw normalizeClientFailure(error);
    }
  }
}

function normalizeLookup(value: string, kind: "workflow" | "method"): string {
  const normalized = value?.trim();
  if (!normalized || normalized.length > 300 || /[\r\n]/.test(normalized)) {
    throw new SovereignNodeReadError(
      "NODE_CONFIG_INVALID",
      `The ${kind} lookup must be a single-line value no longer than 300 characters.`,
    );
  }
  return normalized;
}

function minimalChildEnvironment(): Record<string, string> {
  const environment = getDefaultEnvironment();
  for (const key of Object.keys(environment)) {
    if (key.toUpperCase().startsWith("SOVEREIGN_MCP_MUTATION_")) {
      delete environment[key];
    }
  }
  return environment;
}

async function validateContractMetadata(nodeRoot: string): Promise<void> {
  const schemaPath = path.join(
    nodeRoot,
    "docs",
    "contracts",
    `${sovereignNodeReadContractId}.schema.json`,
  );
  let parsed: unknown;
  try {
    parsed = JSON.parse(await fs.promises.readFile(schemaPath, "utf8")) as unknown;
  } catch (error) {
    throw new SovereignNodeReadError(
      "NODE_PROTOCOL_MISMATCH",
      `The Node does not provide ${sovereignNodeReadContractId}.`,
      { cause: error },
    );
  }
  const root = asRecord(parsed);
  const metadata = asRecord(root?.["x-refer-contract"]);
  const identity = asRecord(metadata?.mcpIdentity);
  const allowedTools = metadata?.allowedTools;
  if (
    metadata?.contractId !== sovereignNodeReadContractId ||
    identity?.name !== "sovereign-node" ||
    identity?.minimumVersion !== "1.1.0" ||
    identity?.maximumVersionExclusive !== "2.0.0" ||
    !Array.isArray(allowedTools) ||
    allowedTools.length !== sovereignNodeReadTools.length ||
    !sovereignNodeReadTools.every((tool, index) => allowedTools[index] === tool)
  ) {
    throw new SovereignNodeReadError(
      "NODE_PROTOCOL_MISMATCH",
      `The Node's ${sovereignNodeReadContractId} metadata is incompatible.`,
    );
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isCompatibleVersion(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) {
    return false;
  }
  const parsed = match.slice(1).map(Number);
  return (
    compareVersion(parsed, minimumServerVersion) >= 0 &&
    compareVersion(parsed, maximumServerVersionExclusive) < 0
  );
}

function compareVersion(
  left: readonly number[],
  right: readonly number[],
): number {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }
  return 0;
}

function normalizeClientFailure(error: unknown): SovereignNodeReadError {
  if (isSovereignNodeReadError(error)) {
    return error;
  }
  if (error instanceof McpError && error.code === ErrorCode.RequestTimeout) {
    return new SovereignNodeReadError(
      "NODE_TIMEOUT",
      "The Sovereign Node did not respond within the bounded timeout.",
      { cause: error },
    );
  }
  if (
    error instanceof Error &&
    (/timed? ?out/i.test(error.message) || error.name === "AbortError")
  ) {
    return new SovereignNodeReadError(
      "NODE_TIMEOUT",
      "The Sovereign Node did not respond within the bounded timeout.",
      { cause: error },
    );
  }
  return new SovereignNodeReadError(
    "NODE_UNAVAILABLE",
    "The Sovereign Node local stdio service is unavailable.",
    { cause: error },
  );
}
