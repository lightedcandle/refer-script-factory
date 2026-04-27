import * as fs from "node:fs";
import * as path from "node:path";

export interface ReferEndpointTarget {
  id: string;
  workspaceRoot: string;
  label?: string;
}

export interface ReferEndpointTargetRegistry {
  targets: ReferEndpointTarget[];
  source: string;
}

export function loadReferEndpointTargetRegistry(
  defaultWorkspaceRoot: string,
): ReferEndpointTargetRegistry {
  const registryPath =
    process.env.REFER_TARGET_REGISTRY ??
    path.join(defaultWorkspaceRoot, ".refer-factory", "orchestrator-targets.json");
  if (fs.existsSync(registryPath)) {
    const parsed = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
      targets?: ReferEndpointTarget[];
    };
    return {
      source: registryPath,
      targets: normalizeTargets(parsed.targets ?? []),
    };
  }

  return {
    source: "built-in local defaults",
    targets: normalizeTargets(defaultTargets(defaultWorkspaceRoot)),
  };
}

export function resolveReferEndpointTarget(input: {
  registry: ReferEndpointTargetRegistry;
  target?: unknown;
  workspaceRoot?: unknown;
  defaultWorkspaceRoot: string;
}): ReferEndpointTarget {
  if (typeof input.target === "string" && input.target.trim().length > 0) {
    const targetId = normalizeTargetId(input.target);
    const match = input.registry.targets.find(
      (target) => normalizeTargetId(target.id) === targetId,
    );
    if (!match) {
      throw new Error(
        `Unknown REFER target "${input.target}". Available targets: ${input.registry.targets.map((target) => target.id).join(", ") || "none"}.`,
      );
    }
    assertUsableWorkspace(match.workspaceRoot);
    return match;
  }

  if (
    typeof input.workspaceRoot === "string" &&
    input.workspaceRoot.trim().length > 0
  ) {
    const workspaceRoot = path.resolve(input.workspaceRoot);
    assertUsableWorkspace(workspaceRoot);
    return {
      id: path.basename(workspaceRoot),
      workspaceRoot,
      label: "Direct workspaceRoot fallback",
    };
  }

  const workspaceRoot = path.resolve(input.defaultWorkspaceRoot);
  assertUsableWorkspace(workspaceRoot);
  return {
    id: path.basename(workspaceRoot),
    workspaceRoot,
    label: "Default server workspace",
  };
}

function defaultTargets(defaultWorkspaceRoot: string): ReferEndpointTarget[] {
  const driveRoot = path.parse(path.resolve(defaultWorkspaceRoot)).root;
  const candidates: ReferEndpointTarget[] = [
    {
      id: path.basename(path.resolve(defaultWorkspaceRoot)),
      workspaceRoot: path.resolve(defaultWorkspaceRoot),
      label: "Default server workspace",
    },
    {
      id: "jamaicaeats",
      workspaceRoot: path.join(driveRoot, "jamaicaeats"),
    },
    {
      id: "telechurch-e2e-v2",
      workspaceRoot: path.join(driveRoot, "Telechurch-e2e-v2"),
    },
  ];

  return candidates.filter((target) => fs.existsSync(target.workspaceRoot));
}

function normalizeTargets(targets: ReferEndpointTarget[]): ReferEndpointTarget[] {
  const byId = new Map<string, ReferEndpointTarget>();
  for (const target of targets) {
    if (!target.id || !target.workspaceRoot) {
      continue;
    }
    const id = normalizeTargetId(target.id);
    if (byId.has(id)) {
      continue;
    }
    byId.set(id, {
      ...target,
      id,
      workspaceRoot: path.resolve(target.workspaceRoot),
    });
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function normalizeTargetId(value: string): string {
  return value.trim().toLowerCase();
}

function assertUsableWorkspace(workspaceRoot: string): void {
  if (!fs.existsSync(workspaceRoot) || !fs.statSync(workspaceRoot).isDirectory()) {
    throw new Error(`REFER target workspace does not exist: ${workspaceRoot}`);
  }
}
