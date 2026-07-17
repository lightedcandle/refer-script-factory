import assert from "node:assert/strict";
import {
  createNeverCancelledToken,
  createReferIntakeRecord,
  createScriptBlueprint,
  createScriptLegend,
  runReferCoreOrchestratorPrompt,
  scriptFactoryEntries,
  type ProcessEvent,
  type ReferRuntimeTurn,
} from "../src/core";

void main();

async function main(): Promise<void> {
  const intake = createReferIntakeRecord(
    "Build a provider-neutral script plan.",
    new Date("2026-07-15T12:00:00.000Z"),
  );
  assert.match(intake.contract.contract_id, /^refer\.intake\./);
  assert.equal(createScriptBlueprint().blueprint_id, "REFER-SCRIPT-BLUEPRINT-001");
  assert.ok(scriptFactoryEntries.length > 0);
  assert.ok(createScriptLegend().terms.some((term) => term.term === "Host Adapter"));

  const events: ProcessEvent[] = [];
  const progress: string[] = [];
  let persistedTurn: ReferRuntimeTurn | undefined;
  let completedTurns = 0;

  const result = await runReferCoreOrchestratorPrompt({
    prompt: "say hello",
    model: {
      label: "in-memory model",
      async sendPrompt() {
        return JSON.stringify({
          resolution_state: "resolved_as_is",
          answer: "Core reached the model port.",
          missing_fields: [],
          script_gap: "",
          blocked_reason: "",
          failed_reason: "",
        });
      },
    },
    token: createNeverCancelledToken(),
    workspace: {
      handleControlPrompt() {
        return null;
      },
      beginIntake(record) {
        return `memory://${record.contract.contract_id}`;
      },
      writeTurn(turn) {
        persistedTurn = turn;
      },
      completeTurn() {
        completedTurns += 1;
      },
    },
    events: {
      emit(event) {
        events.push(event);
      },
    },
    output: {
      progress(message) {
        progress.push(message);
      },
    },
    now: () => new Date("2026-07-15T12:00:00.000Z"),
  });

  assert.equal(result.ok, true);
  assert.equal(result.output, "Core reached the model port.");
  assert.equal(result.absolute_record_path?.startsWith("memory://"), true);
  assert.equal(persistedTurn?.assistantOutput, result.output);
  assert.equal(completedTurns, 1);
  assert.equal(progress.length, result.progress.length);
  assert.deepEqual(
    events.map((event) => event.status),
    ["running", "running", "running", "completed"],
  );
}
