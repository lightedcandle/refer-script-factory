import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import * as path from "node:path";
import { fullUniversalLawFiles } from "../bootstrap/lawManifest";
import {
  LocalUpdateState,
  UpdateApplyReport,
  UpdateArtifact,
  UpdateChannel,
  UpdateCheckResult,
  UpdateManifest,
} from "./updateTypes";

export interface UpdateContext {
  extensionRoot: string;
  workspaceRoot: string;
  channel: UpdateChannel;
  manifestUrl?: string;
}

export async function checkForReferUpdates(
  context: UpdateContext,
): Promise<UpdateCheckResult> {
  const manifest = await loadUpdateManifest(context);
  if (manifest.channel !== context.channel) {
    return {
      manifest,
      state: readLocalUpdateState(context.workspaceRoot, context.channel),
      pending_artifacts: [],
      up_to_date: true,
    };
  }
  const state = readLocalUpdateState(context.workspaceRoot, context.channel);
  const pending_artifacts = manifest.artifacts.filter(
    (artifact) => state.artifacts[artifact.id] !== artifact.version,
  );

  return {
    manifest,
    state,
    pending_artifacts,
    up_to_date: pending_artifacts.length === 0,
  };
}

export async function applyReferUpdate(
  context: UpdateContext,
  checkResult?: UpdateCheckResult,
): Promise<UpdateApplyReport> {
  const result = checkResult ?? (await checkForReferUpdates(context));
  const backup_dir = path.join(
    context.workspaceRoot,
    ".refer-factory",
    "updates",
    `backup-${Date.now()}`,
  );
  const report: UpdateApplyReport = {
    manifest_version: result.manifest.manifest_version,
    channel: result.manifest.channel,
    applied: [],
    skipped: [],
    failed: [],
    backup_dir,
    requires_restart: false,
  };

  for (const artifact of result.pending_artifacts) {
    try {
      const source = resolveArtifactSource(context.extensionRoot, artifact);
      const target = path.resolve(context.workspaceRoot, artifact.target_path);
      assertWithinWorkspace(context.workspaceRoot, target);
      const content = fs.readFileSync(source);
      if (artifact.sha256 && sha256(content) !== artifact.sha256) {
        throw new Error("sha256 mismatch");
      }
      if (fs.existsSync(target)) {
        const backupTarget = path.join(backup_dir, artifact.target_path);
        fs.mkdirSync(path.dirname(backupTarget), { recursive: true });
        fs.copyFileSync(target, backupTarget);
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
      report.applied.push(artifact.id);
      report.requires_restart ||= artifact.requires_restart === true;
    } catch (error) {
      report.failed.push({
        id: artifact.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  for (const artifact of result.manifest.artifacts) {
    if (!result.pending_artifacts.includes(artifact)) {
      report.skipped.push(artifact.id);
    }
  }

  const nextState: LocalUpdateState = {
    manifest_version: result.manifest.manifest_version,
    channel: result.manifest.channel,
    applied_at: new Date().toISOString(),
    artifacts: { ...result.state.artifacts },
  };
  for (const id of report.applied) {
    const artifact = result.manifest.artifacts.find((item) => item.id === id);
    if (artifact) {
      nextState.artifacts[id] = artifact.version;
    }
  }
  writeLocalUpdateState(context.workspaceRoot, nextState);
  return report;
}

export function createPackagedLawManifest(
  channel: UpdateChannel,
  version: string,
): UpdateManifest {
  return {
    manifest_version: version,
    channel,
    published_at: new Date(0).toISOString(),
    notes: "Packaged dormant REFER.OS reference library manifest.",
    artifacts: fullUniversalLawFiles.map((fileName) => ({
      id: `law:${fileName}`,
      kind: "law",
      version,
      target_path: `REFER.OS/${fileName}`,
      source_path: `unscripted-laws/REFER.OS/${fileName}`,
      summary: `Update dormant reference ${fileName}`,
    })),
  };
}

export function readLocalUpdateState(
  workspaceRoot: string,
  channel: UpdateChannel,
): LocalUpdateState {
  const filePath = updateStatePath(workspaceRoot);
  if (!fs.existsSync(filePath)) {
    return {
      manifest_version: "0.0.0",
      channel,
      applied_at: null,
      artifacts: {},
    };
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as LocalUpdateState;
}

export function writeLocalUpdateState(
  workspaceRoot: string,
  state: LocalUpdateState,
): void {
  const filePath = updateStatePath(workspaceRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function updateStatePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "updates", "state.json");
}

async function loadUpdateManifest(context: UpdateContext): Promise<UpdateManifest> {
  if (!context.manifestUrl) {
    return createPackagedLawManifest(context.channel, packagedVersion(context.extensionRoot));
  }

  if (/^https?:\/\//i.test(context.manifestUrl)) {
    return JSON.parse(await readUrl(context.manifestUrl)) as UpdateManifest;
  }

  const manifestPath = path.isAbsolute(context.manifestUrl)
    ? context.manifestUrl
    : path.resolve(context.workspaceRoot, context.manifestUrl);
  return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as UpdateManifest;
}

function packagedVersion(extensionRoot: string): string {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(extensionRoot, "package.json"), "utf8"),
  ) as { version?: string };
  return pkg.version ?? "0.0.0";
}

function resolveArtifactSource(
  extensionRoot: string,
  artifact: UpdateArtifact,
): string {
  const source = path.resolve(extensionRoot, artifact.source_path);
  const relative = path.relative(extensionRoot, source);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("artifact source escapes extension root");
  }
  if (!fs.existsSync(source)) {
    throw new Error(`artifact source missing: ${artifact.source_path}`);
  }
  return source;
}

function assertWithinWorkspace(workspaceRoot: string, target: string): void {
  const root = path.resolve(workspaceRoot);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("target escapes workspace root");
  }
}

function sha256(content: Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function readUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    client
      .get(url, (response) => {
        if (!response.statusCode || response.statusCode >= 400) {
          reject(new Error(`manifest request failed: ${response.statusCode}`));
          response.resume();
          return;
        }
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}
