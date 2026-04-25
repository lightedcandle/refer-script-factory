export type UpdateChannel = "stable" | "beta" | "dev";

export type UpdateArtifactKind = "law" | "schema" | "script" | "extension";

export interface UpdateArtifact {
  id: string;
  kind: UpdateArtifactKind;
  version: string;
  target_path: string;
  source_path: string;
  sha256?: string;
  summary?: string;
  requires_restart?: boolean;
}

export interface UpdateManifest {
  manifest_version: string;
  channel: UpdateChannel;
  published_at: string;
  notes?: string;
  artifacts: UpdateArtifact[];
}

export interface LocalUpdateState {
  manifest_version: string;
  channel: UpdateChannel;
  applied_at: string | null;
  artifacts: Record<string, string>;
}

export interface UpdateCheckResult {
  manifest: UpdateManifest;
  state: LocalUpdateState;
  pending_artifacts: UpdateArtifact[];
  up_to_date: boolean;
}

export interface UpdateApplyReport {
  manifest_version: string;
  channel: UpdateChannel;
  applied: string[];
  skipped: string[];
  failed: Array<{ id: string; error: string }>;
  backup_dir: string;
  requires_restart: boolean;
}
