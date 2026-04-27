import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createNeverCancelledToken,
  runReferOrchestratorPrompt,
} from "../src/chat/referOrchestratorRunner";
import type { ReferPromptModel } from "../src/chat/referPromptModel";
import { readReferChatModeState } from "../src/contracts/referChatMode";

void main();

async function main(): Promise<void> {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-runner-"));
  const model: ReferPromptModel = {
    label: "fake model",
    async sendPrompt() {
      return JSON.stringify({
        resolution_state: "resolved_as_is",
        answer: "Runner reached the orchestrator.",
        missing_fields: [],
        script_gap: "",
        blocked_reason: "",
        failed_reason: "",
      });
    },
  };

  const control = await runReferOrchestratorPrompt({
    workspaceRoot: root,
    prompt: "on",
    model,
    token: createNeverCancelledToken(),
  });
  assert.equal(control.ok, true);
  assert.equal(control.output, "REFER persistent contract mode is on.");
  assert.equal(readReferChatModeState(root).persistent_contract_mode, true);

  const result = await runReferOrchestratorPrompt({
    workspaceRoot: root,
    prompt: "say hello",
    model,
    token: createNeverCancelledToken(),
  });
  assert.equal(result.ok, true);
  assert.equal(result.resolution?.resolution_state, "resolved_as_is");
  assert.equal(result.output, "Runner reached the orchestrator.");
  assert.ok(result.contract_id?.startsWith("refer.intake."));
  assert.ok(result.absolute_record_path);
  assert.ok(fs.existsSync(result.absolute_record_path));
  assert.ok(fs.existsSync(path.join(root, ".refer-factory", "process-state.json")));
}
