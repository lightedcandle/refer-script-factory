import * as fs from "node:fs";
import * as path from "node:path";

export type ReferActiveContractMode = "idle" | "temporary" | "persistent";
export type ReferLastTurnMode = "none" | "temporary" | "persistent";

export interface ReferChatModeState {
  schema_version: 1;
  persistent_contract_mode: boolean;
  active_contract_mode: ReferActiveContractMode;
  last_turn_mode: ReferLastTurnMode;
  updated_at: string;
}

export function defaultReferChatModeState(now = new Date()): ReferChatModeState {
  return {
    schema_version: 1,
    persistent_contract_mode: false,
    active_contract_mode: "idle",
    last_turn_mode: "none",
    updated_at: now.toISOString(),
  };
}

export function referChatModePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "chat", "mode.json");
}

export function readReferChatModeState(
  workspaceRoot: string,
): ReferChatModeState {
  const filePath = referChatModePath(workspaceRoot);
  if (!fs.existsSync(filePath)) {
    return defaultReferChatModeState();
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ReferChatModeState;
}

export function writeReferChatModeState(
  workspaceRoot: string,
  state: ReferChatModeState,
): void {
  const filePath = referChatModePath(workspaceRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function setPersistentContractMode(
  workspaceRoot: string,
  enabled: boolean,
  now = new Date(),
): ReferChatModeState {
  const current = readReferChatModeState(workspaceRoot);
  const next: ReferChatModeState = {
    ...current,
    persistent_contract_mode: enabled,
    active_contract_mode: enabled ? "persistent" : "idle",
    updated_at: now.toISOString(),
  };
  writeReferChatModeState(workspaceRoot, next);
  return next;
}

export function markTemporaryContractActive(
  workspaceRoot: string,
  now = new Date(),
): ReferChatModeState {
  const current = readReferChatModeState(workspaceRoot);
  const next: ReferChatModeState = {
    ...current,
    active_contract_mode: current.persistent_contract_mode
      ? "persistent"
      : "temporary",
    updated_at: now.toISOString(),
  };
  writeReferChatModeState(workspaceRoot, next);
  return next;
}

export function markContractTurnComplete(
  workspaceRoot: string,
  now = new Date(),
): ReferChatModeState {
  const current = readReferChatModeState(workspaceRoot);
  const completedMode = current.persistent_contract_mode
    ? "persistent"
    : current.active_contract_mode === "temporary"
      ? "temporary"
      : current.last_turn_mode;
  const next: ReferChatModeState = {
    ...current,
    active_contract_mode: current.persistent_contract_mode
      ? "persistent"
      : "idle",
    last_turn_mode: completedMode,
    updated_at: now.toISOString(),
  };
  writeReferChatModeState(workspaceRoot, next);
  return next;
}
