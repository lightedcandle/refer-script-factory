export const defaultOllamaBaseUrl = "http://127.0.0.1:11434";
export const defaultOllamaTimeoutMs = 120_000;
export const minimumOllamaTimeoutMs = 1_000;
export const maximumOllamaTimeoutMs = 300_000;

export interface ResolveCliOptions {
  workspace: string;
  input: { kind: "prompt"; value: string } | { kind: "stdin" };
  json: boolean;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

export type NodeCliAction =
  | "discover"
  | "validate"
  | "workflows"
  | "workflow"
  | "methods"
  | "method";

export interface NodeCliOptions {
  action: NodeCliAction;
  nodeRoot: string;
  lookup?: string;
  json: boolean;
}

export type CliCommand =
  | { kind: "help" }
  | { kind: "version" }
  | { kind: "resolve"; options: ResolveCliOptions }
  | { kind: "node"; options: NodeCliOptions };

export class CliUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliUsageError";
  }
}

export function parseCliArguments(argv: string[]): CliCommand {
  if (argv.length === 0) {
    throw new CliUsageError("Expected the resolve subcommand, --help, or --version.");
  }

  if (argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    if (argv.length !== 1) {
      throw new CliUsageError("--help does not accept additional arguments.");
    }
    return { kind: "help" };
  }

  if (argv[0] === "--version" || argv[0] === "-v" || argv[0] === "version") {
    if (argv.length !== 1) {
      throw new CliUsageError("--version does not accept additional arguments.");
    }
    return { kind: "version" };
  }

  if (argv[0] === "node") {
    if (argv.slice(1).some((argument) => argument === "--help" || argument === "-h")) {
      return { kind: "help" };
    }
    return { kind: "node", options: parseNodeArguments(argv.slice(1)) };
  }

  if (argv[0] !== "resolve") {
    throw new CliUsageError(`Unknown command: ${argv[0]}`);
  }

  if (argv.slice(1).some((argument) => argument === "--help" || argument === "-h")) {
    return { kind: "help" };
  }

  let workspace: string | undefined;
  let prompt: string | undefined;
  let useStdin = false;
  let json = false;
  let model: string | undefined;
  let baseUrl = defaultOllamaBaseUrl;
  let timeoutMs = defaultOllamaTimeoutMs;
  const seen = new Set<string>();

  const requireOnce = (name: string): void => {
    if (seen.has(name)) {
      throw new CliUsageError(`${name} may be supplied only once.`);
    }
    seen.add(name);
  };

  const readValue = (name: string, index: number): string => {
    const value = argv[index + 1];
    if (value === undefined) {
      throw new CliUsageError(`${name} requires a value.`);
    }
    return value;
  };

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--workspace":
        requireOnce(argument);
        workspace = readValue(argument, index);
        index += 1;
        break;
      case "--prompt":
        requireOnce(argument);
        prompt = readValue(argument, index);
        index += 1;
        break;
      case "--stdin":
        requireOnce(argument);
        useStdin = true;
        break;
      case "--json":
        requireOnce(argument);
        json = true;
        break;
      case "--model":
        requireOnce(argument);
        model = readValue(argument, index);
        index += 1;
        break;
      case "--base-url":
        requireOnce(argument);
        baseUrl = normalizeLoopbackBaseUrl(readValue(argument, index));
        index += 1;
        break;
      case "--timeout-ms":
        requireOnce(argument);
        timeoutMs = parseTimeout(readValue(argument, index));
        index += 1;
        break;
      default:
        throw new CliUsageError(`Unknown resolve option: ${argument}`);
    }
  }

  if (!workspace?.trim()) {
    throw new CliUsageError("resolve requires --workspace <path>.");
  }
  if (!model?.trim()) {
    throw new CliUsageError("resolve requires an explicit --model <name>.");
  }
  if (model.length > 200 || /[\r\n]/.test(model)) {
    throw new CliUsageError("--model must be a single-line name no longer than 200 characters.");
  }
  if ((prompt === undefined && !useStdin) || (prompt !== undefined && useStdin)) {
    throw new CliUsageError("resolve requires exactly one input source: --prompt or --stdin.");
  }
  if (prompt !== undefined && !prompt.trim()) {
    throw new CliUsageError("--prompt must not be empty.");
  }

  return {
    kind: "resolve",
    options: {
      workspace: workspace.trim(),
      input: prompt === undefined ? { kind: "stdin" } : { kind: "prompt", value: prompt },
      json,
      model: model.trim(),
      baseUrl,
      timeoutMs,
    },
  };
}

function parseNodeArguments(argv: string[]): NodeCliOptions {
  const subcommand = argv[0];
  const actions: Record<string, NodeCliAction> = {
    discover: "discover",
    validate: "validate",
    workflows: "workflows",
    workflow: "workflow",
    methods: "methods",
    method: "method",
  };
  const action = actions[subcommand];
  if (!action) {
    throw new CliUsageError(
      "node requires discover, validate, workflows, workflow, methods, or method.",
    );
  }

  let nodeRoot: string | undefined;
  let json = false;
  const positional: string[] = [];
  const seen = new Set<string>();
  const requireOnce = (name: string): void => {
    if (seen.has(name)) {
      throw new CliUsageError(`${name} may be supplied only once.`);
    }
    seen.add(name);
  };

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case "--node-root":
        requireOnce(argument);
        nodeRoot = argv[index + 1];
        if (nodeRoot === undefined || nodeRoot.startsWith("--")) {
          throw new CliUsageError("--node-root requires a value.");
        }
        index += 1;
        break;
      case "--json":
        requireOnce(argument);
        json = true;
        break;
      default:
        if (argument.startsWith("-")) {
          throw new CliUsageError(`Unknown node option: ${argument}`);
        }
        positional.push(argument);
    }
  }

  if (!nodeRoot?.trim()) {
    throw new CliUsageError("node commands require --node-root <path>.");
  }
  const needsLookup = action === "workflow" || action === "method";
  if (needsLookup && positional.length !== 1) {
    throw new CliUsageError(`node ${action} requires exactly one lookup value.`);
  }
  if (!needsLookup && positional.length !== 0) {
    throw new CliUsageError(`node ${action} does not accept positional values.`);
  }
  const lookup = positional[0]?.trim();
  if (needsLookup && (!lookup || lookup.length > 300 || /[\r\n]/.test(lookup))) {
    throw new CliUsageError(
      `node ${action} requires a single-line lookup no longer than 300 characters.`,
    );
  }

  return {
    action,
    nodeRoot: nodeRoot.trim(),
    lookup,
    json,
  };
}

function parseTimeout(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new CliUsageError("--timeout-ms must be a whole number.");
  }
  const timeout = Number(value);
  if (timeout < minimumOllamaTimeoutMs || timeout > maximumOllamaTimeoutMs) {
    throw new CliUsageError(
      `--timeout-ms must be between ${minimumOllamaTimeoutMs} and ${maximumOllamaTimeoutMs}.`,
    );
  }
  return timeout;
}

function normalizeLoopbackBaseUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new CliUsageError("--base-url must be a valid loopback HTTP(S) URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new CliUsageError("--base-url must use http or https.");
  }
  if (parsed.username || parsed.password) {
    throw new CliUsageError("--base-url must not contain credentials.");
  }
  if (parsed.search || parsed.hash) {
    throw new CliUsageError("--base-url must not contain a query string or fragment.");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "[::1]") {
    throw new CliUsageError("--base-url must target localhost, 127.0.0.1, or ::1.");
  }

  return parsed.toString().replace(/\/+$/, "");
}
