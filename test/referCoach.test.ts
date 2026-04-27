import assert from "node:assert/strict";
import { createReferCoachPlan } from "../src/contracts/referCoach";

const plan = createReferCoachPlan();
const itemIds = new Set(plan.checklist.map((item) => item.id));

assert.equal(plan.coach_id, "refer.coach.local-efficiency");
assert.ok(plan.target_outcome.includes("local LLMs"));
assert.ok(itemIds.has("coach.ollama"));
assert.ok(itemIds.has("coach.providers"));
assert.ok(itemIds.has("coach.workspace"));
assert.ok(itemIds.has("coach.usage"));

for (const item of plan.checklist) {
  assert.ok(item.evidence.length > 0);
  assert.ok(item.next_action.length > 0);
}
