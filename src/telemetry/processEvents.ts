import * as fs from "node:fs";
import * as path from "node:path";

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

export interface DailyProcessSummary {
  date: string;
  total: number;
  by_status: Record<ProcessStatus, number>;
  by_script: Record<string, number>;
  elapsed_ms: number;
  last_event_id: string | null;
}

export interface ProcessState {
  current: {
    last_event: ProcessEvent | null;
    by_status: Record<ProcessStatus, number>;
    by_script: Record<string, number>;
    total: number;
  };
  recent: ProcessEvent[];
  daily_history: DailyProcessSummary[];
}

const RECENT_EVENT_LIMIT = 50;
const runtimeProcessEvents: ProcessEvent[] = [];
const listeners = new Set<(events: ProcessEvent[]) => void>();

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

export function appendProcessEvent(
  event: ProcessEvent,
  workspaceRoot?: string,
): void {
  runtimeProcessEvents.push(event);
  if (workspaceRoot) {
    const nextState = collapseProcessEvents(readProcessState(workspaceRoot), [
      event,
    ]);
    writeProcessState(workspaceRoot, nextState);
  }
  notifyProcessEventListeners();
}

export function appendProcessEvents(
  events: ProcessEvent[],
  workspaceRoot?: string,
): void {
  runtimeProcessEvents.push(...events);
  if (workspaceRoot) {
    const nextState = collapseProcessEvents(readProcessState(workspaceRoot), events);
    writeProcessState(workspaceRoot, nextState);
  }
  notifyProcessEventListeners();
}

export function getProcessEvents(workspaceRoot?: string): ProcessEvent[] {
  return [
    ...sampleProcessEvents,
    ...(workspaceRoot ? readProcessState(workspaceRoot).recent : []),
    ...runtimeProcessEvents,
  ];
}

export function getProcessState(workspaceRoot: string): ProcessState {
  return readProcessState(workspaceRoot);
}

export function onProcessEventsChanged(
  listener: (events: ProcessEvent[]) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function summarizeProcessEvents(events: ProcessEvent[]) {
  return events.reduce<Record<ProcessStatus, number>>(
    (summary, event) => {
      summary[event.status] += 1;
      return summary;
    },
    emptyStatusCounts(),
  );
}

export function processEventLogPath(workspaceRoot: string): string {
  return processStatePath(workspaceRoot);
}

export function processStatePath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "process-state.json");
}

export function collapseProcessEvents(
  state: ProcessState,
  events: ProcessEvent[],
): ProcessState {
  const current = {
    last_event: state.current.last_event,
    by_status: { ...state.current.by_status },
    by_script: { ...state.current.by_script },
    total: state.current.total,
  };
  const daily = new Map(
    state.daily_history.map((entry) => [
      entry.date,
      {
        ...entry,
        by_status: { ...entry.by_status },
        by_script: { ...entry.by_script },
      },
    ]),
  );
  const recent = [...state.recent];

  for (const event of events) {
    current.last_event = event;
    current.total += 1;
    current.by_status[event.status] += 1;
    current.by_script[event.script_name] =
      (current.by_script[event.script_name] ?? 0) + 1;

    const date = event.started_at.slice(0, 10);
    const day = daily.get(date) ?? {
      date,
      total: 0,
      by_status: emptyStatusCounts(),
      by_script: {},
      elapsed_ms: 0,
      last_event_id: null,
    };
    day.total += 1;
    day.by_status[event.status] += 1;
    day.by_script[event.script_name] =
      (day.by_script[event.script_name] ?? 0) + 1;
    day.elapsed_ms += event.elapsed_ms;
    day.last_event_id = event.id;
    daily.set(date, day);

    recent.push(event);
  }

  return {
    current,
    recent: recent.slice(-RECENT_EVENT_LIMIT),
    daily_history: [...daily.values()].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  };
}

function readProcessState(workspaceRoot: string): ProcessState {
  const filePath = processStatePath(workspaceRoot);
  if (!fs.existsSync(filePath)) {
    return emptyProcessState();
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ProcessState;
}

function writeProcessState(workspaceRoot: string, state: ProcessState): void {
  const filePath = processStatePath(workspaceRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function emptyProcessState(): ProcessState {
  return {
    current: {
      last_event: null,
      by_status: emptyStatusCounts(),
      by_script: {},
      total: 0,
    },
    recent: [],
    daily_history: [],
  };
}

function emptyStatusCounts(): Record<ProcessStatus, number> {
  return { queued: 0, running: 0, blocked: 0, failed: 0, completed: 0 };
}

function notifyProcessEventListeners(): void {
  const events = getProcessEvents();
  for (const listener of listeners) {
    listener(events);
  }
}
