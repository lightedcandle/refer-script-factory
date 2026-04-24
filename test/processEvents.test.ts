import assert from "node:assert/strict";
import {
  sampleProcessEvents,
  summarizeProcessEvents,
} from "../src/telemetry/processEvents";

const summary = summarizeProcessEvents(sampleProcessEvents);

assert.equal(summary.completed, 1);
assert.equal(summary.running, 1);
assert.equal(summary.failed, 1);
assert.equal(summary.queued, 0);
