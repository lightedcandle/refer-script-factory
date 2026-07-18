import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { Readable } from "node:stream";
import type {
  ReferPromptModel,
  ReferResolutionEnvelope,
  ReferResolutionState,
} from "../src/core";
import {
  cliExitCodes,
  runCli,
  type CliModelConfiguration,
  type CliWriter,
} from "../src/adapters/cli/execute";

class CaptureWriter implements CliWriter {
  value = "";

  write(chunk: string): boolean {
    this.value += chunk;
    return true;
  }
}

void main();

async function main(): Promise<void> {
  const temporaryRoots: string[] = [];
  try {
    await testPromptJsonAndPersistence(temporaryRoots);
    await testStdinAndHumanOutput(temporaryRoots);
    await testAllResolutionStates(temporaryRoots);
    await testInvalidArgumentsAndWorkspace(temporaryRoots);
    await testProviderFailure(temporaryRoots);
    await testCancellation(temporaryRoots);
    await testCompiledExecutableWithStubbedOllama(temporaryRoots);
  } finally {
    for (const root of temporaryRoots) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
}

async function testPromptJsonAndPersistence(temporaryRoots: string[]): Promise<void> {
  const workspace = makeWorkspace(temporaryRoots);
  const stdout = new CaptureWriter();
  const stderr = new CaptureWriter();
  let receivedConfiguration: CliModelConfiguration | undefined;

  const exitCode = await runCli(
    [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "Resolve this prompt",
      "--model",
      "stub:model",
      "--json",
    ],
    {
      stdout,
      stderr,
      createModel(configuration) {
        receivedConfiguration = configuration;
        return modelForState("resolved_as_is", { answer: "Resolved by the stub." });
      },
    },
  );

  assert.equal(exitCode, cliExitCodes.resolved);
  assert.deepEqual(receivedConfiguration, {
    baseUrl: "http://127.0.0.1:11434",
    model: "stub:model",
    timeoutMs: 120_000,
  });
  const machine = parseMachineResult(stdout.value);
  assert.equal(machine.exit_code, 0);
  assert.equal(machine.result.resolution.resolution_state, "resolved_as_is");
  assert.equal(machine.result.output, "Resolved by the stub.");
  assert.match(stderr.value, /^\[refer\] /m);

  const intakePath = String(machine.result.absolute_record_path);
  assert.ok(fs.existsSync(intakePath));
  const intake = JSON.parse(fs.readFileSync(intakePath, "utf8")) as {
    raw_input: string;
  };
  assert.equal(intake.raw_input, "Resolve this prompt");

  const contractId = String(machine.result.contract_id);
  const turnPath = path.join(
    workspace,
    ".refer-factory",
    "cli",
    "turns",
    `${contractId}.json`,
  );
  assert.ok(fs.existsSync(turnPath));
  const turn = JSON.parse(fs.readFileSync(turnPath, "utf8")) as {
    kind: string;
    resolution: { resolution_state: string };
  };
  assert.equal(turn.kind, "refer.cli.turn");
  assert.equal(turn.resolution.resolution_state, "resolved_as_is");

  const events = readProcessEvents(workspace);
  assert.deepEqual(
    events.map((event) => event.status),
    ["running", "running", "running", "completed"],
  );
}

async function testStdinAndHumanOutput(temporaryRoots: string[]): Promise<void> {
  const stdinWorkspace = makeWorkspace(temporaryRoots);
  const stdinStdout = new CaptureWriter();
  const stdinStderr = new CaptureWriter();
  const stdinExit = await runCli(
    [
      "resolve",
      "--workspace",
      stdinWorkspace,
      "--stdin",
      "--model",
      "stub:model",
      "--json",
    ],
    {
      stdin: Readable.from(["Prompt supplied through stdin"]),
      stdout: stdinStdout,
      stderr: stdinStderr,
      createModel: () => modelForState("resolved_as_is", { answer: "stdin resolved" }),
    },
  );
  assert.equal(stdinExit, cliExitCodes.resolved);
  const stdinMachine = parseMachineResult(stdinStdout.value);
  const intake = JSON.parse(
    fs.readFileSync(String(stdinMachine.result.absolute_record_path), "utf8"),
  ) as { raw_input: string };
  assert.equal(intake.raw_input, "Prompt supplied through stdin");

  const humanWorkspace = makeWorkspace(temporaryRoots);
  const humanStdout = new CaptureWriter();
  const humanStderr = new CaptureWriter();
  const humanExit = await runCli(
    [
      "resolve",
      "--workspace",
      humanWorkspace,
      "--prompt",
      "Human output",
      "--model",
      "stub:model",
    ],
    {
      stdout: humanStdout,
      stderr: humanStderr,
      createModel: () => modelForState("resolved_as_is", { answer: "Human answer." }),
    },
  );
  assert.equal(humanExit, cliExitCodes.resolved);
  assert.equal(humanStdout.value, "Human answer.\n");
  assert.match(humanStderr.value, /^\[refer\] /m);
}

async function testAllResolutionStates(temporaryRoots: string[]): Promise<void> {
  const cases: Array<{
    state: ReferResolutionState;
    expectedExit: number;
    fields?: Partial<ReferResolutionEnvelope>;
  }> = [
    {
      state: "resolved_as_is",
      expectedExit: cliExitCodes.resolved,
      fields: { answer: "resolved" },
    },
    {
      state: "needs_more_info",
      expectedExit: cliExitCodes.needsMoreInfo,
      fields: { missing_fields: ["scope"] },
    },
    {
      state: "needs_script",
      expectedExit: cliExitCodes.needsScript,
      fields: { script_gap: "missing route" },
    },
    {
      state: "blocked_by_policy_or_scope",
      expectedExit: cliExitCodes.blocked,
      fields: { blocked_reason: "outside scope" },
    },
    {
      state: "failed_with_reason",
      expectedExit: cliExitCodes.failedWithReason,
      fields: { failed_reason: "deterministic failure" },
    },
  ];

  for (const testCase of cases) {
    const workspace = makeWorkspace(temporaryRoots);
    const stdout = new CaptureWriter();
    const stderr = new CaptureWriter();
    const exitCode = await runCli(
      [
        "resolve",
        "--workspace",
        workspace,
        "--prompt",
        `State ${testCase.state}`,
        "--model",
        "stub:model",
        "--json",
      ],
      {
        stdout,
        stderr,
        createModel: () => modelForState(testCase.state, testCase.fields),
      },
    );
    assert.equal(exitCode, testCase.expectedExit, testCase.state);
    const machine = parseMachineResult(stdout.value);
    assert.equal(machine.exit_code, testCase.expectedExit, testCase.state);
    assert.equal(machine.result.resolution.resolution_state, testCase.state);
  }
}

async function testInvalidArgumentsAndWorkspace(temporaryRoots: string[]): Promise<void> {
  const workspace = makeWorkspace(temporaryRoots);
  const stdout = new CaptureWriter();
  const stderr = new CaptureWriter();
  let modelCreated = false;
  const invalidExit = await runCli(
    [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "one",
      "--stdin",
      "--model",
      "stub:model",
      "--json",
    ],
    {
      stdout,
      stderr,
      createModel() {
        modelCreated = true;
        return modelForState("resolved_as_is");
      },
    },
  );
  assert.equal(invalidExit, cliExitCodes.usageError);
  assert.equal(modelCreated, false);
  assert.equal(parseMachineResult(stdout.value).error.code, "USAGE_ERROR");
  assert.equal(fs.existsSync(path.join(workspace, ".refer-factory")), false);

  const remoteStdout = new CaptureWriter();
  const remoteExit = await runCli(
    [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "one",
      "--model",
      "stub:model",
      "--base-url",
      "https://example.com",
      "--json",
    ],
    { stdout: remoteStdout, stderr: new CaptureWriter() },
  );
  assert.equal(remoteExit, cliExitCodes.usageError);
  assert.match(parseMachineResult(remoteStdout.value).error.message, /loopback|localhost/);

  const missingStdout = new CaptureWriter();
  const missingExit = await runCli(
    [
      "resolve",
      "--workspace",
      path.join(workspace, "missing"),
      "--prompt",
      "one",
      "--model",
      "stub:model",
      "--json",
    ],
    { stdout: missingStdout, stderr: new CaptureWriter() },
  );
  assert.equal(missingExit, cliExitCodes.workspaceError);
  assert.equal(parseMachineResult(missingStdout.value).error.code, "WORKSPACE_ERROR");
}

async function testProviderFailure(temporaryRoots: string[]): Promise<void> {
  const workspace = makeWorkspace(temporaryRoots);
  const stdout = new CaptureWriter();
  const stderr = new CaptureWriter();
  const exitCode = await runCli(
    [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "Provider failure",
      "--model",
      "stub:model",
      "--json",
    ],
    {
      stdout,
      stderr,
      createModel: () => ({
        label: "failing stub",
        async sendPrompt() {
          throw new Error("stub provider unavailable");
        },
      }),
    },
  );
  assert.equal(exitCode, cliExitCodes.providerFailure);
  const machine = parseMachineResult(stdout.value);
  assert.equal(machine.error.code, "PROVIDER_FAILURE");
  assert.match(machine.error.message, /stub provider unavailable/);
  assert.equal(readProcessEvents(workspace).at(-1)?.status, "failed");
}

async function testCancellation(temporaryRoots: string[]): Promise<void> {
  const workspace = makeWorkspace(temporaryRoots);
  const stdout = new CaptureWriter();
  const stderr = new CaptureWriter();
  const controller = new AbortController();
  let markStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });

  const running = runCli(
    [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "Cancel this run",
      "--model",
      "stub:model",
      "--json",
    ],
    {
      stdout,
      stderr,
      signal: controller.signal,
      createModel: () => ({
        label: "cancellable stub",
        sendPrompt(_prompt, token) {
          markStarted?.();
          return new Promise<string>((_resolve, reject) => {
            token.onCancellationRequested(() => reject(new Error("stub cancelled")));
          });
        },
      }),
    },
  );
  await started;
  controller.abort();
  const exitCode = await running;
  assert.equal(exitCode, cliExitCodes.interrupted);
  const machine = parseMachineResult(stdout.value);
  assert.equal(machine.exit_code, cliExitCodes.interrupted);
  assert.equal(machine.error.code, "INTERRUPTED");
  assert.equal(readProcessEvents(workspace).at(-1)?.status, "failed");
}

async function testCompiledExecutableWithStubbedOllama(
  temporaryRoots: string[],
): Promise<void> {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"),
  ) as { version: string; bin: Record<string, string> };
  assert.deepEqual(packageJson.bin, {
    "refer-script-factory": "./dist/src/adapters/cli/index.js",
  });

  const executable = path.resolve(__dirname, "../src/adapters/cli/index.js");
  const help = await runChild(executable, ["--help"]);
  assert.equal(help.exitCode, 0);
  assert.match(help.stdout, /refer-script-factory resolve/);

  const version = await runChild(executable, ["--version"]);
  assert.equal(version.exitCode, 0);
  assert.equal(version.stdout.trim(), packageJson.version);

  const workspace = makeWorkspace(temporaryRoots);
  let requestedPath = "";
  let requestedModel = "";
  const server = http.createServer((request, response) => {
    requestedPath = request.url ?? "";
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      requestedModel = String((JSON.parse(body) as { model?: unknown }).model ?? "");
      if (request.url === "/redirect/api/chat") {
        response.writeHead(302, { Location: "https://example.com/remote-provider" });
        response.end();
        return;
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          message: {
            content: JSON.stringify(
              envelopeForState("resolved_as_is", { answer: "compiled stub resolved" }),
            ),
          },
        }),
      );
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  try {
    const address = server.address() as AddressInfo;
    const smoke = await runChild(executable, [
      "resolve",
      "--workspace",
      workspace,
      "--prompt",
      "Compiled smoke",
      "--model",
      "compiled:stub",
      "--base-url",
      `http://127.0.0.1:${address.port}`,
      "--timeout-ms",
      "5000",
      "--json",
    ]);
    assert.equal(smoke.exitCode, 0, smoke.stderr);
    assert.equal(parseMachineResult(smoke.stdout).result.output, "compiled stub resolved");
    assert.equal(requestedPath, "/api/chat");
    assert.equal(requestedModel, "compiled:stub");

    const redirected = await runChild(executable, [
      "resolve",
      "--workspace",
      makeWorkspace(temporaryRoots),
      "--prompt",
      "Reject redirect",
      "--model",
      "compiled:stub",
      "--base-url",
      `http://127.0.0.1:${address.port}/redirect`,
      "--timeout-ms",
      "5000",
      "--json",
    ]);
    assert.equal(redirected.exitCode, cliExitCodes.providerFailure);
    assert.equal(parseMachineResult(redirected.stdout).error.code, "PROVIDER_FAILURE");
    assert.equal(requestedPath, "/redirect/api/chat");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function modelForState(
  state: ReferResolutionState,
  fields?: Partial<ReferResolutionEnvelope>,
): ReferPromptModel {
  return {
    label: `stub ${state}`,
    async sendPrompt() {
      return JSON.stringify(envelopeForState(state, fields));
    },
  };
}

function envelopeForState(
  state: ReferResolutionState,
  fields?: Partial<ReferResolutionEnvelope>,
): ReferResolutionEnvelope {
  return {
    resolution_state: state,
    answer: "",
    missing_fields: [],
    script_gap: "",
    blocked_reason: "",
    failed_reason: "",
    ...fields,
  };
}

function makeWorkspace(temporaryRoots: string[]): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-cli-test-"));
  temporaryRoots.push(root);
  return root;
}

function readProcessEvents(workspace: string): Array<{ status: string }> {
  const target = path.join(
    workspace,
    ".refer-factory",
    "cli",
    "process-events.jsonl",
  );
  return fs
    .readFileSync(target, "utf8")
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line) as { status: string });
}

function parseMachineResult(value: string): any {
  assert.equal(value.trim().split(/\r?\n/).length, 1, value);
  return JSON.parse(value) as any;
}

function runChild(
  executable: string,
  args: string[],
): Promise<{ exitCode: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [executable, ...args], {
      cwd: path.resolve(__dirname, "../.."),
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("close", (exitCode) => resolve({ exitCode, stdout, stderr }));
  });
}
