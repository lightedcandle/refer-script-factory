import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lineageDir = path.join(root, ".refer-factory", "lineage");

function idStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function createPacket(overrides = {}) {
  const now = new Date().toISOString();
  const scriptId = overrides.script_id ?? "refer.script-class-registry";
  return {
    schema_version: 1,
    lineage_packet_id: overrides.lineage_packet_id ?? `lineage.script-factory.${idStamp()}`,
    created_at: now,
    intent_contract: overrides.intent_contract ?? {
      intent: "Create foundational Script Factory registry lineage.",
    },
    authority_refs: overrides.authority_refs ?? [
      "docs/script-factory-deterministic-evolution-plan.md",
      "docs/script-legend.md",
    ],
    factory: overrides.factory ?? "Script Factory",
    forge_family: overrides.forge_family ?? "Script Factory Kernel",
    forge_id: overrides.forge_id ?? "script-factory-kernel-forge",
    forge_version: overrides.forge_version ?? "0.0.1",
    script_class: overrides.script_class ?? "Telemetry Script",
    script_id: scriptId,
    script_version: overrides.script_version ?? "0.0.1",
    run_id: overrides.run_id ?? `run.${scriptId}.${idStamp()}`,
    sequence: overrides.sequence ?? {
      rank: "SEQ-H",
      sub_sequence: [],
      conditional_action: "continue",
    },
    intended_effect: overrides.intended_effect ?? {
      summary: "Write a durable lineage packet.",
    },
    observed_effect: overrides.observed_effect ?? {
      summary: "Packet created.",
    },
    allowed_boundary: overrides.allowed_boundary ?? {
      writes: [".refer-factory/lineage/**"],
    },
    effect_state: overrides.effect_state ?? "functional",
    mismatch: overrides.mismatch ?? {
      type: "none",
      detail: "",
      repair_layer: "",
    },
    checks: overrides.checks ?? [],
    evidence: overrides.evidence ?? [],
    repair_history: overrides.repair_history ?? [],
    promotion: overrides.promotion ?? {
      status: "not_promoted",
      promoted_at: null,
      receipt: null,
    },
  };
}

function writePacket(packet) {
  fs.mkdirSync(lineageDir, { recursive: true });
  const file = path.join(lineageDir, `${packet.lineage_packet_id}.json`);
  fs.writeFileSync(file, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  return file;
}

function listPackets() {
  if (!fs.existsSync(lineageDir)) return [];
  return fs
    .readdirSync(lineageDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.join(lineageDir, file));
}

function report() {
  const packets = listPackets();
  console.log(`Lineage packets: ${packets.length}`);
  for (const file of packets) {
    const packet = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log(`${packet.lineage_packet_id} | ${packet.script_id} | ${packet.effect_state}`);
  }
}

function recordRun() {
  const packet = createPacket({
    script_id: process.argv[3] ?? "manual.run",
    observed_effect: { summary: process.argv[4] ?? "Run recorded." },
    evidence: [{ type: "manual", detail: "Recorded through lineage-packet.mjs record-run." }],
  });
  console.log(writePacket(packet));
}

function recordMismatch() {
  const packet = createPacket({
    script_id: process.argv[3] ?? "manual.mismatch",
    effect_state: "mismatched",
    sequence: {
      rank: "SEQ-J",
      sub_sequence: ["SEQ-J.1"],
      conditional_action: "modify",
    },
    observed_effect: { summary: process.argv[4] ?? "Mismatch recorded." },
    mismatch: {
      type: "manual",
      detail: process.argv[4] ?? "Mismatch recorded.",
      repair_layer: process.argv[5] ?? "script",
    },
  });
  console.log(writePacket(packet));
}

function promote() {
  const packet = createPacket({
    script_id: process.argv[3] ?? "manual.promote",
    sequence: {
      rank: "SEQ-K",
      sub_sequence: [],
      conditional_action: "promote",
    },
    promotion: {
      status: "promoted",
      promoted_at: new Date().toISOString(),
      receipt: process.argv[4] ?? "manual-promotion",
    },
  });
  console.log(writePacket(packet));
}

const command = process.argv[2] ?? "create";

if (command === "create") {
  console.log(writePacket(createPacket()));
} else if (command === "sample") {
  console.log(JSON.stringify(createPacket(), null, 2));
} else if (command === "record-run") {
  recordRun();
} else if (command === "record-mismatch") {
  recordMismatch();
} else if (command === "promote") {
  promote();
} else if (command === "report") {
  report();
} else {
  throw new Error(`Unknown command: ${command}`);
}
