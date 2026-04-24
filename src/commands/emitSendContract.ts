import * as vscode from "vscode";

export interface SendContractDraft {
  plan_id: string;
  target_repo: string;
  allowed_mutations: string[];
  target_paths: string[];
  station_route: string[];
  adapter: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  invariants: string[];
  verification: string[];
  failure_handling: string[];
}

export function createSendContractDraft(
  targetRepo = "active-workspace",
): SendContractDraft {
  return {
    plan_id: "PLAN-REFER-FACTORY-001",
    target_repo: targetRepo,
    allowed_mutations: ["dry-run reports", "extension-local scaffold files"],
    target_paths: ["REFER.OS/**", "refer.app/**", ".refer-factory/**"],
    station_route: [
      "Plan",
      "Send Contract",
      "Factory",
      "Adapter",
      "Dry Run",
      "Verification",
    ],
    adapter: "generic",
    inputs: {
      repo_purpose: "operator supplied",
      framework: "operator supplied",
    },
    outputs: {
      bootstrap_report: "json",
      adapter_contract: "json",
    },
    invariants: [
      "no writes outside active workspace",
      "dry-run only for first slice",
      "Telechurch remains pilot-only",
    ],
    verification: [
      "schema validation",
      "compile",
      "bootstrap dry-run overwrite refusal",
    ],
    failure_handling: [
      "emit gap note",
      "refuse unsafe overwrite",
      "do not mutate on blocked state",
    ],
  };
}

export async function emitSendContractCommand() {
  const workspaceRoot =
    vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "active-workspace";
  const draft = createSendContractDraft(workspaceRoot);
  const doc = await vscode.workspace.openTextDocument({
    language: "json",
    content: JSON.stringify(draft, null, 2),
  });
  await vscode.window.showTextDocument(doc);
}
