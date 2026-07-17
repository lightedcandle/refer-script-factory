import * as fs from "node:fs";
import * as path from "node:path";
import type {
  ProcessEvent,
  ReferProcessEventPort,
  ReferRuntimeTurn,
  ReferRuntimeWorkspacePort,
} from "../../core";

export class CliWorkspaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliWorkspaceError";
  }
}

export class CliPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliPersistenceError";
  }
}

export interface CliRuntimePaths {
  factoryRoot: string;
  turnsDirectory: string;
  processEventsPath: string;
}

export interface CliRuntimePorts {
  workspace: ReferRuntimeWorkspacePort;
  events: ReferProcessEventPort;
  paths: CliRuntimePaths;
}

export function resolveWorkspaceRoot(workspace: string, cwd: string): string {
  const candidate = path.resolve(cwd, workspace);
  let resolved: string;
  try {
    resolved = fs.realpathSync.native(candidate);
  } catch {
    throw new CliWorkspaceError(`Workspace does not exist or cannot be resolved: ${candidate}`);
  }

  let stats: fs.Stats;
  try {
    stats = fs.statSync(resolved);
  } catch {
    throw new CliWorkspaceError(`Workspace cannot be inspected: ${resolved}`);
  }
  if (!stats.isDirectory()) {
    throw new CliWorkspaceError(`Workspace is not a directory: ${resolved}`);
  }
  return resolved;
}

export function createCliRuntimePorts(workspaceRoot: string): CliRuntimePorts {
  const factoryRoot = path.join(workspaceRoot, ".refer-factory");
  const turnsDirectory = path.join(factoryRoot, "cli", "turns");
  const processEventsPath = path.join(factoryRoot, "cli", "process-events.jsonl");

  assertSafeDirectoryIfPresent(factoryRoot);
  assertSafeDirectoryIfPresent(path.join(factoryRoot, "intake"));
  assertSafeDirectoryIfPresent(path.join(factoryRoot, "cli"));
  assertSafeDirectoryIfPresent(turnsDirectory);
  assertSafeFileIfPresent(processEventsPath);

  return {
    paths: { factoryRoot, turnsDirectory, processEventsPath },
    workspace: {
      handleControlPrompt() {
        return null;
      },
      beginIntake(record) {
        const target = resolveFactoryReference(
          workspaceRoot,
          factoryRoot,
          record.contract.raw_input_ref,
        );
        writeNewJson(workspaceRoot, target, record);
        return target;
      },
      writeTurn(turn) {
        const target = path.join(
          turnsDirectory,
          `${safeArtifactName(turn.record.contract.contract_id)}.json`,
        );
        writeNewJson(workspaceRoot, target, createTurnArtifact(turn));
      },
      completeTurn() {},
    },
    events: {
      emit(event) {
        appendProcessEvent(workspaceRoot, processEventsPath, event);
      },
    },
  };
}

function createTurnArtifact(turn: ReferRuntimeTurn) {
  return {
    schema_version: 1,
    kind: "refer.cli.turn",
    turn_id: turn.record.contract.contract_id,
    created_at: turn.record.contract.created_at,
    record: turn.record,
    resolution: turn.resolution,
    assistant_output: turn.assistantOutput,
    progress: turn.progress,
  };
}

function resolveFactoryReference(
  workspaceRoot: string,
  factoryRoot: string,
  reference: string,
): string {
  if (path.isAbsolute(reference)) {
    throw new CliPersistenceError("The core intake reference must be workspace-relative.");
  }
  const target = path.resolve(workspaceRoot, reference);
  assertWithin(factoryRoot, target, "Core intake reference escaped .refer-factory.");
  return target;
}

function appendProcessEvent(
  workspaceRoot: string,
  target: string,
  event: ProcessEvent,
): void {
  ensureSafeDirectory(workspaceRoot, path.dirname(target));
  assertSafeFileIfPresent(target);
  fs.appendFileSync(target, `${JSON.stringify(event)}\n`, { encoding: "utf8", flag: "a" });
}

function writeNewJson(workspaceRoot: string, target: string, value: unknown): void {
  ensureSafeDirectory(workspaceRoot, path.dirname(target));
  assertSafeFileIfPresent(target);
  try {
    fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (isNodeError(error) && error.code === "EEXIST") {
      throw new CliPersistenceError(`Refusing to overwrite existing evidence: ${target}`);
    }
    throw error;
  }
}

function ensureSafeDirectory(workspaceRoot: string, target: string): void {
  assertWithin(workspaceRoot, target, "CLI persistence escaped the selected workspace.");
  const relative = path.relative(workspaceRoot, target);
  let current = workspaceRoot;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (fs.existsSync(current)) {
      assertSafeDirectoryIfPresent(current);
    } else {
      fs.mkdirSync(current);
    }
  }
}

function assertSafeDirectoryIfPresent(target: string): void {
  if (!fs.existsSync(target)) {
    return;
  }
  const stats = fs.lstatSync(target);
  if (stats.isSymbolicLink()) {
    throw new CliWorkspaceError(`Refusing symbolic-link workspace boundary: ${target}`);
  }
  if (!stats.isDirectory()) {
    throw new CliWorkspaceError(`Expected a directory at workspace boundary: ${target}`);
  }
}

function assertSafeFileIfPresent(target: string): void {
  if (!fs.existsSync(target)) {
    return;
  }
  const stats = fs.lstatSync(target);
  if (stats.isSymbolicLink()) {
    throw new CliWorkspaceError(`Refusing symbolic-link evidence path: ${target}`);
  }
  if (!stats.isFile()) {
    throw new CliWorkspaceError(`Expected a regular evidence file: ${target}`);
  }
}

function assertWithin(parent: string, target: string, message: string): void {
  const relative = path.relative(parent, target);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new CliPersistenceError(message);
  }
}

function safeArtifactName(value: string): string {
  const safe = value.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!safe) {
    throw new CliPersistenceError("The core contract identifier cannot name a turn artifact.");
  }
  return safe;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
