export type ProcessStatus =
  | "queued"
  | "running"
  | "blocked"
  | "failed"
  | "completed";

export interface ProcessEvent {
  id: string;
  script_name: string;
  status: ProcessStatus;
  started_at: string;
  elapsed_ms: number;
  dominant_gear: string;
  output_target: string;
  efficiency_state: string;
  message: string;
  error: string | null;
}
