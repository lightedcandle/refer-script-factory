import assert from "node:assert/strict";
import { createScriptBlueprint } from "../src/contracts/scriptBlueprint";

const blueprint = createScriptBlueprint();
const nodeIds = new Set(blueprint.nodes.map((node) => node.id));

assert.equal(blueprint.blueprint_id, "REFER-SCRIPT-BLUEPRINT-001");
assert.ok(blueprint.governing_refs.includes("REFER.OS/refer.engine.md"));
assert.ok(
  blueprint.doctrine.some((line) =>
    line.includes("Conversation remains intake"),
  ),
);
assert.ok(blueprint.doctrine.some((line) => line.includes("Portable script packets")));
assert.ok(nodeIds.has("user_chat_intent"));
assert.ok(nodeIds.has("send_contract"));
assert.ok(nodeIds.has("script_registry_lookup"));
assert.ok(nodeIds.has("missing_route_correction"));
assert.ok(nodeIds.has("route_registration"));

for (const edge of blueprint.edges) {
  assert.ok(nodeIds.has(edge.from), `missing edge source ${edge.from}`);
  assert.ok(nodeIds.has(edge.to), `missing edge target ${edge.to}`);
}

assert.ok(
  blueprint.edges.some(
    (edge) =>
      edge.from === "script_registry_lookup" &&
      edge.to === "missing_route_correction",
  ),
);
assert.ok(
  blueprint.correction_path.some((step) => step.includes("tooling gap")),
);
