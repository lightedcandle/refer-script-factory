import assert from "node:assert/strict";
import { createScriptDnaSeed } from "../src/contracts/scriptDna";

const seed = createScriptDnaSeed("Create Dashboard Card");

assert.equal(seed.script_id, "script.create-dashboard-card");
assert.equal(seed.registry.route_id, "route.create-dashboard-card");
assert.equal(seed.status, "seed");
assert.ok(seed.governing_refs.includes("REFER.OS/refer.engine.md"));
assert.deepEqual(seed.adapters, ["generic", "react", "angular", "node"]);
assert.ok(seed.inputs.some((input) => input.id === "send_contract"));
assert.ok(seed.inputs.some((input) => input.id === "workspace_context"));
assert.ok(seed.outputs.some((output) => output.id === "script_packet"));
assert.ok(seed.outputs.some((output) => output.id === "framework_operations"));
assert.ok(seed.guards.some((guard) => guard.id === "scope_guard"));

const opcodes = seed.stations.flatMap((station) =>
  station.instructions.map((instruction) => instruction.opcode),
);
assert.ok(opcodes.includes("READ_CONTRACT"));
assert.ok(opcodes.includes("RESOLVE_TARGET"));
assert.ok(opcodes.includes("CHECK_GUARD"));
assert.ok(opcodes.includes("EMIT_PACKET"));
assert.ok(opcodes.includes("PATCH_FILE"));
assert.ok(opcodes.includes("RUN_CHECK"));
assert.ok(opcodes.includes("REGISTER_ROUTE"));

for (const station of seed.stations) {
  assert.ok(station.inputs.length > 0);
  assert.ok(station.outputs.length > 0);
  assert.ok(station.instructions.length > 0);
}
