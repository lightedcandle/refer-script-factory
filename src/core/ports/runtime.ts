import type { ReferIntakeRecord } from "../contracts/referIntake";
import type { ReferResolutionEnvelope } from "../contracts/referOrchestrator";
import type { ProcessEvent } from "../evidence/processEvent";

export interface ReferRuntimeTurn {
  record: ReferIntakeRecord;
  resolution: ReferResolutionEnvelope;
  assistantOutput: string;
  progress: string[];
}

/**
 * Supplies target-workspace and legacy runtime-session persistence to the core.
 * Implementations own storage paths and compatibility schemas.
 */
export interface ReferRuntimeWorkspacePort {
  handleControlPrompt(prompt: string): string | null;
  beginIntake(record: ReferIntakeRecord): string;
  writeTurn(turn: ReferRuntimeTurn): void;
  completeTurn(): void;
}

/** Delivers evidence/status without coupling core orchestration to a host store. */
export interface ReferProcessEventPort {
  emit(event: ProcessEvent): void;
}

/** Delivers progress/output without coupling core orchestration to a host UI. */
export interface ReferOutputPort {
  progress(message: string): void;
}
