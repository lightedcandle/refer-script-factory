import assert from "node:assert/strict";
import { createOrchestratorRoadmap } from "../src/contracts/orchestratorRoadmap";

const roadmap = createOrchestratorRoadmap();
const ids = new Set(roadmap.capabilities.map((capability) => capability.id));

assert.equal(roadmap.schema_version, 1);
assert.equal(roadmap.capabilities.length, 13);
assert.equal(ids.size, roadmap.capabilities.length);
assert.ok(ids.has("ORCH-001"));
assert.ok(ids.has("ORCH-008"));
assert.ok(ids.has("ORCH-012"));
assert.ok(ids.has("ORCH-013"));

for (const capability of roadmap.capabilities) {
  assert.equal(capability.status, "scaffolded");
  assert.ok(capability.integrate_when_available.length > 0);
  assert.ok(capability.target_hook.length > 0);
}
