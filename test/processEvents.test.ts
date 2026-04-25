import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  appendProcessEvent,
  appendProcessEvents,
  getProcessEvents,
  getProcessState,
  processStatePath,
  sampleProcessEvents,
  summarizeProcessEvents,
} from "../src/telemetry/processEvents";

const summary = summarizeProcessEvents(sampleProcessEvents);

assert.equal(summary.completed, 1);
assert.equal(summary.running, 1);
assert.equal(summary.failed, 1);
assert.equal(summary.queued, 0);

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-factory-events-"));
appendProcessEvent(
  {
    id: "persisted-001",
    script_name: "persisted-script",
    status: "completed",
    started_at: "2026-04-25T00:00:00.000Z",
    elapsed_ms: 12,
    dominant_gear: "factory",
    output_target: "process-state.json",
    efficiency_state: "normal",
    message: "Persisted event",
    error: null,
  },
  root,
);

assert.ok(fs.existsSync(processStatePath(root)));
assert.ok(
  getProcessEvents(root).some((event) => event.id === "persisted-001"),
);

const firstState = getProcessState(root);
assert.equal(firstState.current.total, 1);
assert.equal(firstState.current.by_status.completed, 1);
assert.equal(firstState.current.by_script["persisted-script"], 1);
assert.equal(firstState.current.last_event?.id, "persisted-001");
assert.equal(firstState.daily_history[0]?.date, "2026-04-25");
assert.equal(firstState.daily_history[0]?.total, 1);

appendProcessEvents(
  Array.from({ length: 60 }, (_, index) => ({
    id: `bounded-${index.toString().padStart(3, "0")}`,
    script_name: "bounded-script",
    status: index % 2 === 0 ? "completed" : "failed",
    started_at: "2026-04-25T01:00:00.000Z",
    elapsed_ms: 10,
    dominant_gear: "factory",
    output_target: "process-state.json",
    efficiency_state: "normal",
    message: "Bounded event",
    error: index % 2 === 0 ? null : "failed",
  })),
  root,
);

const boundedState = getProcessState(root);
assert.equal(boundedState.current.total, 61);
assert.equal(boundedState.daily_history[0]?.total, 61);
assert.equal(boundedState.recent.length, 50);
assert.equal(boundedState.recent[0]?.id, "bounded-010");
