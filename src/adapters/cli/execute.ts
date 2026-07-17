import * as fs from "node:fs";
import * as path from "node:path";
import {
  runReferCoreOrchestratorPrompt,
  type ReferOrchestratorRunResult,
  type ReferPromptModel,
  type ReferResolutionState,
} from "../../core";
import { createOllamaReferPromptModel } from "../ollama/referOllamaPromptModel";
import {
  CliUsageError,
  parseCliArguments,
  type ResolveCliOptions,
} from "./arguments";
import {
  CliCancellationToken,
  CliCancelledError,
  readPromptFromStdin,
} from "./cancellation";
import {
  CliPersistenceError,
  CliWorkspaceError,
  createCliRuntimePorts,
  resolveWorkspaceRoot,
} from "./runtime";

export const cliExitCodes = {
  resolved: 0,
  internalError: 1,
  usageError: 2,
  workspaceError: 3,
  providerFailure: 4,
  needsMoreInfo: 10,
  needsScript: 11,
  blocked: 12,
  failedWithReason: 13,
  interrupted: 130,
} as const;

export interface CliWriter {
  write(chunk: string): unknown;
}

export interface CliModelConfiguration {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export interface RunCliDependencies {
  stdin?: NodeJS.ReadableStream;
  stdout?: CliWriter;
  stderr?: CliWriter;
  cwd?: string;
  signal?: AbortSignal;
  now?: () => Date;
  createModel?: (configuration: CliModelConfiguration) => ReferPromptModel;
}

export async function runCli(
  argv: string[],
  dependencies: RunCliDependencies = {},
): Promise<number> {
  const stdout = dependencies.stdout ?? process.stdout;
  const stderr = dependencies.stderr ?? process.stderr;
  const jsonRequested = argv.includes("--json");
  const signal = dependencies.signal ?? new AbortController().signal;
  let workspace: string | null = null;
  let provider: CliModelConfiguration | null = null;

  try {
    const command = parseCliArguments(argv);
    if (command.kind === "help") {
      stdout.write(cliHelpText);
      return cliExitCodes.resolved;
    }
    if (command.kind === "version") {
      stdout.write(`${readPackageVersion()}\n`);
      return cliExitCodes.resolved;
    }

    if (signal.aborted) {
      throw new CliCancelledError();
    }

    workspace = resolveWorkspaceRoot(command.options.workspace, dependencies.cwd ?? process.cwd());
    const runtime = createCliRuntimePorts(workspace);
    const prompt = await resolvePrompt(command.options, dependencies.stdin ?? process.stdin, signal);
    provider = {
      baseUrl: command.options.baseUrl,
      model: command.options.model,
      timeoutMs: command.options.timeoutMs,
    };
    const model = dependencies.createModel
      ? dependencies.createModel(provider)
      : createOllamaReferPromptModel(provider);

    const result = await runReferCoreOrchestratorPrompt({
      prompt,
      model,
      token: new CliCancellationToken(signal),
      workspace: runtime.workspace,
      events: runtime.events,
      output: {
        progress(message) {
          stderr.write(`[refer] ${message}\n`);
        },
      },
      now: dependencies.now,
    });

    const exitCode = signal.aborted
      ? cliExitCodes.interrupted
      : exitCodeForResult(result);
    if (command.options.json) {
      writeMachineResult(stdout, {
        ok: result.ok,
        exitCode,
        workspace,
        provider,
        result,
        error: result.ok
          ? null
          : {
              code: signal.aborted ? "INTERRUPTED" : "PROVIDER_FAILURE",
              message: result.error ?? "The provider run failed.",
            },
      });
    } else if (result.ok) {
      stdout.write(`${result.output.trimEnd()}\n`);
    } else if (signal.aborted) {
      stderr.write("REFER interrupted.\n");
    } else {
      stderr.write(`REFER provider/runtime failure: ${result.error ?? "unknown failure"}\n`);
    }
    return exitCode;
  } catch (error) {
    const failure = classifyFailure(error);
    if (jsonRequested) {
      writeMachineResult(stdout, {
        ok: false,
        exitCode: failure.exitCode,
        workspace,
        provider,
        result: null,
        error: { code: failure.code, message: failure.message },
      });
    } else if (failure.exitCode === cliExitCodes.interrupted) {
      stderr.write("REFER interrupted.\n");
    } else {
      stderr.write(`refer-script-factory: ${failure.message}\n`);
      if (failure.exitCode === cliExitCodes.usageError) {
        stderr.write("Run refer-script-factory --help for usage.\n");
      }
    }
    return failure.exitCode;
  }
}

async function resolvePrompt(
  options: ResolveCliOptions,
  stdin: NodeJS.ReadableStream,
  signal: AbortSignal,
): Promise<string> {
  if (options.input.kind === "prompt") {
    return options.input.value;
  }
  let prompt: string;
  try {
    prompt = await readPromptFromStdin(stdin, signal);
  } catch (error) {
    if (error instanceof CliCancelledError) {
      throw error;
    }
    throw new CliUsageError(error instanceof Error ? error.message : String(error));
  }
  if (!prompt.trim()) {
    throw new CliUsageError("--stdin did not provide a non-empty prompt.");
  }
  return prompt;
}

function exitCodeForResult(result: ReferOrchestratorRunResult): number {
  if (!result.ok) {
    return cliExitCodes.providerFailure;
  }
  if (!result.resolution) {
    return cliExitCodes.internalError;
  }
  return exitCodeForResolution(result.resolution.resolution_state);
}

function exitCodeForResolution(state: ReferResolutionState): number {
  switch (state) {
    case "resolved_as_is":
      return cliExitCodes.resolved;
    case "needs_more_info":
      return cliExitCodes.needsMoreInfo;
    case "needs_script":
      return cliExitCodes.needsScript;
    case "blocked_by_policy_or_scope":
      return cliExitCodes.blocked;
    case "failed_with_reason":
      return cliExitCodes.failedWithReason;
  }
}

function classifyFailure(error: unknown): {
  exitCode: number;
  code: string;
  message: string;
} {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof CliCancelledError) {
    return { exitCode: cliExitCodes.interrupted, code: "INTERRUPTED", message };
  }
  if (error instanceof CliUsageError) {
    return { exitCode: cliExitCodes.usageError, code: "USAGE_ERROR", message };
  }
  if (error instanceof CliWorkspaceError) {
    return { exitCode: cliExitCodes.workspaceError, code: "WORKSPACE_ERROR", message };
  }
  if (error instanceof CliPersistenceError) {
    return { exitCode: cliExitCodes.internalError, code: "PERSISTENCE_ERROR", message };
  }
  return { exitCode: cliExitCodes.internalError, code: "INTERNAL_ERROR", message };
}

function writeMachineResult(
  writer: CliWriter,
  input: {
    ok: boolean;
    exitCode: number;
    workspace: string | null;
    provider: CliModelConfiguration | null;
    result: ReferOrchestratorRunResult | null;
    error: { code: string; message: string } | null;
  },
): void {
  writer.write(
    `${JSON.stringify({
      schema_version: 1,
      command: "resolve",
      ok: input.ok,
      exit_code: input.exitCode,
      workspace: input.workspace,
      provider: input.provider
        ? {
            kind: "ollama",
            model: input.provider.model,
            base_url: input.provider.baseUrl,
            timeout_ms: input.provider.timeoutMs,
          }
        : null,
      result: input.result,
      error: input.error,
    })}\n`,
  );
}

function readPackageVersion(): string {
  let current = __dirname;
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) {
      const parsed = JSON.parse(fs.readFileSync(candidate, "utf8")) as {
        name?: unknown;
        version?: unknown;
      };
      if (parsed.name === "refer-script-factory" && typeof parsed.version === "string") {
        return parsed.version;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  throw new Error("Unable to locate the refer-script-factory package version.");
}

export const cliHelpText = `REFER Script Factory CLI

Usage:
  refer-script-factory --help
  refer-script-factory --version
  refer-script-factory resolve --workspace <path> (--prompt <text> | --stdin) --model <name> [options]

Resolve options:
  --workspace <path>   Existing target workspace; relative paths resolve from cwd.
  --prompt <text>      Prompt text. Mutually exclusive with --stdin.
  --stdin              Read one prompt from standard input (maximum 1 MiB).
  --model <name>       Explicit local Ollama model name.
  --base-url <url>     Loopback Ollama URL (default: http://127.0.0.1:11434).
  --timeout-ms <ms>    Bounded provider timeout from 1000 to 300000 (default: 120000).
  --json               Emit one machine-readable JSON object on stdout.

Artifacts:
  .refer-factory/intake/*.json
  .refer-factory/cli/turns/*.json
  .refer-factory/cli/process-events.jsonl

Progress is written to stderr. The CLI reads no credentials and accepts only a
loopback Ollama endpoint.

Exit codes:
  0 resolved_as_is/help/version    1 adapter or persistence failure
  2 usage error                    3 workspace error
  4 provider/runtime failure      10 needs_more_info
 11 needs_script                  12 blocked_by_policy_or_scope
 13 failed_with_reason           130 interrupted by SIGINT
`;
