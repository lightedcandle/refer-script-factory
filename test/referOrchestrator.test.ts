import assert from "node:assert/strict";
import { createReferIntakeRecord } from "../src/contracts/referIntake";
import {
  createOrchestratorPrompt,
  decideReferNextAction,
  parseResolutionEnvelope,
} from "../src/contracts/referOrchestrator";

const record = createReferIntakeRecord(
  `${"background detail ".repeat(120)}\nBuild the dashboard.`,
  new Date("2026-04-25T12:00:00.000Z"),
);

const prompt = createOrchestratorPrompt({
  contract: record.contract,
  pass: 1,
});
assert.ok(prompt.includes("REFER bounded orchestrator"));
assert.ok(prompt.includes(record.contract.contract_id));
assert.ok(prompt.includes("execution_gate"));
assert.ok(prompt.includes("Do not create selector/resolver scripts"));
assert.ok(!prompt.includes(record.raw_input));

const parsed = parseResolutionEnvelope(`\`\`\`json
{
  "resolution_state": "needs_more_info",
  "answer": "",
  "missing_fields": ["target_paths"],
  "script_gap": "",
  "blocked_reason": "",
  "failed_reason": ""
}
\`\`\``);
assert.equal(parsed.resolution_state, "needs_more_info");
assert.deepEqual(parsed.missing_fields, ["target_paths"]);

const scanDecision = decideReferNextAction({
  envelope: parsed,
  pass: 1,
  rawInputAvailable: true,
  rawInputAlreadyUsed: false,
});
assert.equal(scanDecision.next_action, "scan_raw_input");
assert.equal(scanDecision.terminal, false);

const askDecision = decideReferNextAction({
  envelope: parsed,
  pass: 2,
  rawInputAvailable: true,
  rawInputAlreadyUsed: true,
});
assert.equal(askDecision.next_action, "ask_user");
assert.equal(askDecision.terminal, true);

const scriptDecision = decideReferNextAction({
  envelope: {
    resolution_state: "needs_script",
    answer: "",
    missing_fields: [],
    script_gap: "No route exists for repeatable dashboard generation.",
    blocked_reason: "",
    failed_reason: "",
  },
  pass: 1,
  rawInputAvailable: true,
  rawInputAlreadyUsed: false,
});
assert.equal(scriptDecision.next_action, "emit_script_request");
assert.equal(scriptDecision.terminal, true);
