import {
  createSovereignNodeReadClient,
  isSovereignNodeReadError,
  type SovereignNodeReadClient,
  type SovereignNodeReadErrorCode,
} from "../../integrations/sovereign-node";
import type { NodeCliAction, NodeCliOptions } from "./arguments";

export interface NodeCliWriter {
  write(chunk: string): unknown;
}

export interface NodeCliDependencies {
  stdout: NodeCliWriter;
  stderr: NodeCliWriter;
  cwd: string;
  createClient?: (input: {
    nodeRoot: string;
    cwd: string;
  }) => SovereignNodeReadClient;
}

export async function runNodeCliCommand(
  options: NodeCliOptions,
  dependencies: NodeCliDependencies,
): Promise<number> {
  let client: SovereignNodeReadClient | undefined;
  try {
    client = dependencies.createClient
      ? dependencies.createClient({
          nodeRoot: options.nodeRoot,
          cwd: dependencies.cwd,
        })
      : createSovereignNodeReadClient({
          nodeRoot: options.nodeRoot,
          cwd: dependencies.cwd,
        });
    dependencies.stderr.write(`[refer] Reading Sovereign Node ${options.action}.\n`);
    const result = sanitizeNodeOutput(await executeNodeAction(client, options));
    if (options.json) {
      writeNodeMachinePacket(dependencies.stdout, {
        command: `node.${options.action}`,
        ok: true,
        exitCode: 0,
        result,
        error: null,
      });
    } else {
      dependencies.stdout.write(renderNodeHumanOutput(options.action, result));
    }
    return 0;
  } catch (error) {
    const failure = normalizeNodeFailure(error);
    const exitCode = failure.code === "NODE_CONFIG_INVALID" ? 2 : 1;
    if (options.json) {
      writeNodeMachinePacket(dependencies.stdout, {
        command: `node.${options.action}`,
        ok: false,
        exitCode,
        result: null,
        error: failure,
      });
    } else {
      dependencies.stderr.write(
        `refer-script-factory: ${failure.code}: ${failure.message}\n`,
      );
    }
    return exitCode;
  } finally {
    await client?.close();
  }
}

export function writeNodeUsageFailure(
  writer: NodeCliWriter,
  argv: string[],
  message: string,
): void {
  const action = argv[1] ?? "unknown";
  writeNodeMachinePacket(writer, {
    command: `node.${action}`,
    ok: false,
    exitCode: 2,
    result: null,
    error: { code: "NODE_CONFIG_INVALID", message },
  });
}

async function executeNodeAction(
  client: SovereignNodeReadClient,
  options: NodeCliOptions,
): Promise<unknown> {
  switch (options.action) {
    case "discover":
      return client.discover();
    case "validate":
      return client.validateWorkflowLedger();
    case "workflows":
      return client.listWorkflows();
    case "workflow":
      return client.getWorkflow(options.lookup as string);
    case "methods":
      return client.listMethods();
    case "method":
      return client.getMethod(options.lookup as string);
  }
}

function normalizeNodeFailure(error: unknown): {
  code: SovereignNodeReadErrorCode;
  message: string;
} {
  if (isSovereignNodeReadError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "NODE_UNAVAILABLE",
    message: "The Sovereign Node read failed unexpectedly.",
  };
}

function writeNodeMachinePacket(
  writer: NodeCliWriter,
  input: {
    command: string;
    ok: boolean;
    exitCode: number;
    result: unknown;
    error: { code: SovereignNodeReadErrorCode; message: string } | null;
  },
): void {
  writer.write(
    `${JSON.stringify({
      schema_version: 1,
      command: input.command,
      ok: input.ok,
      exit_code: input.exitCode,
      result: input.result,
      error: input.error,
    })}\n`,
  );
}

function sanitizeNodeOutput(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNodeOutput(item));
  }
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (key === "repoRoot" || key === "path") {
        continue;
      }
      output[key] = sanitizeNodeOutput(item);
    }
    return output;
  }
  if (typeof value === "string") {
    return redactLocalPaths(value);
  }
  return value;
}

function redactLocalPaths(value: string): string {
  return value
    .replace(/[A-Za-z]:[\\/][^\s"'`]+/g, "<local-path-redacted>")
    .replace(/\\\\[^\s"'`]+/g, "<local-path-redacted>")
    .replace(
      /(^|\s)\/(?:home|srv|var|tmp|Users|opt|etc)\/[^\s"'`]+/g,
      (_match, prefix: string) => `${prefix}<local-path-redacted>`,
    );
}

function renderNodeHumanOutput(action: NodeCliAction, value: unknown): string {
  const result = value as any;
  switch (action) {
    case "discover":
      return (
        `Sovereign Node discovered. ` +
        `Workflows: ${result.workflowLedger.summary.workflowCount}; ` +
        `subflows: ${result.workflowLedger.summary.subflowCount}; ` +
        `methods: ${result.methodBank.summary.methodCount}.\n`
      );
    case "validate":
      return (
        `Workflow ledger valid. ` +
        `Workflows: ${result.summary.workflowCount}; ` +
        `subflows: ${result.summary.subflowCount}.\n`
      );
    case "workflows":
      return [
        ...result.workflows.map(
          (entry: any) => `${entry.id} - ${entry.title} [${entry.status}]`,
        ),
        ...result.subflows.map(
          (entry: any) => `${entry.id} - ${entry.title} [subflow]`,
        ),
      ].join("\n") + "\n";
    case "workflow":
      return renderDetailedEntry(result.entry, "id");
    case "methods":
      return result.methods
        .map(
          (entry: any) =>
            `${entry.method_id} - ${entry.method_name} [${entry.category}]`,
        )
        .join("\n") + "\n";
    case "method":
      return renderDetailedEntry(result.entry, "method_id");
  }
}

function renderDetailedEntry(
  entry: Record<string, any>,
  idKey: "id" | "method_id",
): string {
  const title = entry.title ?? entry.method_name;
  const outcome = entry.outcome ?? entry.purpose;
  const lines = [`${entry[idKey]} - ${title}`];
  if (entry.status) {
    lines.push(`Status: ${entry.status}`);
  }
  if (outcome) {
    lines.push(`Outcome: ${outcome}`);
  }
  if (Array.isArray(entry.steps)) {
    lines.push("Steps:", ...entry.steps.map((step: string, index: number) => `  ${index + 1}. ${step}`));
  }
  return `${lines.join("\n")}\n`;
}
