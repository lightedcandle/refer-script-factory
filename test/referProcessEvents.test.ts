import assert from "node:assert/strict";
import { createReferChatEvent } from "../src/chat/referProcessEvents";

const startedAt = new Date("2026-04-25T12:00:00.000Z");

const passEvent = createReferChatEvent({
  contractId: "refer.intake.test",
  phase: "pass",
  pass: 1,
  startedAt,
  message: "Pass complete.",
  providerLabel: "Ollama qwen3:0.6b",
  envelope: {
    resolution_state: "needs_script",
    answer: "",
    missing_fields: [],
    script_gap: "No route exists.",
    blocked_reason: "",
    failed_reason: "",
  },
  decision: {
    next_action: "emit_script_request",
    terminal: true,
    reason: "Missing script route.",
  },
});

assert.equal(passEvent.script_name, "refer-chat");
assert.equal(passEvent.status, "running");
assert.equal(passEvent.dominant_gear, "orchestrator");
assert.equal(passEvent.output_target, "refer.intake.test");
assert.equal(passEvent.efficiency_state, "capital-burn");
assert.ok(passEvent.message.includes("state=needs_script"));
assert.ok(passEvent.message.includes("action=emit_script_request"));

const terminalBlockedEvent = createReferChatEvent({
  contractId: "refer.intake.blocked",
  phase: "terminal",
  startedAt,
  message: "Terminal.",
  envelope: {
    resolution_state: "blocked_by_policy_or_scope",
    answer: "",
    missing_fields: [],
    script_gap: "",
    blocked_reason: "Outside scope.",
    failed_reason: "",
  },
});

assert.equal(terminalBlockedEvent.status, "blocked");

const failureEvent = createReferChatEvent({
  contractId: "refer.intake.failed",
  phase: "failure",
  startedAt,
  message: "Failed.",
  error: "Model unavailable.",
});

assert.equal(failureEvent.status, "failed");
assert.equal(failureEvent.error, "Model unavailable.");
