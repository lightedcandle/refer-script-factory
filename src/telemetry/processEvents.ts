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

export const sampleProcessEvents: ProcessEvent[] = [
  {
    id: "evt-001",
    script_name: "bootstrap-dry-run",
    status: "completed",
    started_at: "2026-04-24T22:00:00.000Z",
    elapsed_ms: 280,
    dominant_gear: "factory",
    output_target: "dry-run report",
    efficiency_state: "capital-burn",
    message: "Bootstrap report emitted without mutation.",
    error: null,
  },
  {
    id: "evt-002",
    script_name: "send-contract-draft",
    status: "running",
    started_at: "2026-04-24T22:01:00.000Z",
    elapsed_ms: 1200,
    dominant_gear: "plan",
    output_target: "contract preview",
    efficiency_state: "normal",
    message: "Drafting bounded packet.",
    error: null,
  },
  {
    id: "evt-003",
    script_name: "unsafe-overwrite-check",
    status: "failed",
    started_at: "2026-04-24T22:02:00.000Z",
    elapsed_ms: 75,
    dominant_gear: "repo",
    output_target: "overwrite guard",
    efficiency_state: "blocked",
    message: "Unsafe overwrite refused.",
    error: "target exists",
  },
];

export function summarizeProcessEvents(events: ProcessEvent[]) {
  return events.reduce<Record<ProcessStatus, number>>(
    (summary, event) => {
      summary[event.status] += 1;
      return summary;
    },
    { queued: 0, running: 0, blocked: 0, failed: 0, completed: 0 },
  );
}
