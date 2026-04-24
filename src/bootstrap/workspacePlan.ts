export interface WorkspacePlan {
  workspace_root: string;
  repo_purpose: string;
  framework: string;
  adapter: string;
  dry_run_only: boolean;
}

export function createWorkspacePlan(
  workspace_root: string,
  repo_purpose: string,
  framework: string,
): WorkspacePlan {
  return {
    workspace_root,
    repo_purpose,
    framework,
    adapter: framework.toLowerCase().includes("angular")
      ? "angular"
      : framework.toLowerCase().includes("react")
        ? "react"
        : "generic",
    dry_run_only: true,
  };
}
