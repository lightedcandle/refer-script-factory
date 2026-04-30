import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lineageDir = path.join(root, ".refer-factory", "lineage");
const flagsDir = path.join(root, ".refer-factory", "modification-loop", "flags");
const readinessDir = path.join(root, ".refer-factory", "script-readiness", "records");

function parseArgs(argv) {
  const args = {
    scriptId: "manual.script",
    forgeId: "script-factory-kernel-forge",
    forgeFamily: "Script Factory Kernel",
    scriptClass: "Validator Script",
    expected: undefined,
    observed: undefined,
    expectedFile: "",
    observedFile: "",
    repairLayer: "script",
    mismatchType: "output_mismatch",
    blocked: false,
    blockerType: "missing_input",
    blockerDetail: "",
    summary: "Compare deterministic script output.",
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--script-id" && value) args.scriptId = value, i += 1;
    else if (key === "--forge-id" && value) args.forgeId = value, i += 1;
    else if (key === "--forge-family" && value) args.forgeFamily = value, i += 1;
    else if (key === "--script-class" && value) args.scriptClass = value, i += 1;
    else if (key === "--expected" && value !== undefined) args.expected = value, i += 1;
    else if (key === "--observed" && value !== undefined) args.observed = value, i += 1;
    else if (key === "--expected-file" && value) args.expectedFile = value, i += 1;
    else if (key === "--observed-file" && value) args.observedFile = value, i += 1;
    else if (key === "--repair-layer" && value) args.repairLayer = value, i += 1;
    else if (key === "--gap-layer" && value) args.repairLayer = value, i += 1;
    else if (key === "--mismatch-type" && value) args.mismatchType = value, i += 1;
    else if (key === "--gap-type" && value) args.mismatchType = value, i += 1;
    else if (key === "--blocked") args.blocked = true;
    else if (key === "--blocker-type" && value) args.blockerType = value, i += 1;
    else if (key === "--blocker-detail" && value) args.blockerDetail = value, i += 1;
    else if (key === "--summary" && value) args.summary = value, i += 1;
    else if (key === "--json") args.json = true;
  }
  return args;
}

function idStamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

function readInput(inlineValue, filePath) {
  if (filePath) return fs.readFileSync(path.resolve(root, filePath), "utf8");
  return inlineValue;
}

function parseValue(value) {
  if (value === undefined) return { provided: false, value: null, canonical: "" };
  const text = String(value);
  try {
    const parsed = JSON.parse(text);
    return { provided: true, value: parsed, canonical: stableStringify(parsed) };
  } catch {
    return { provided: true, value: text, canonical: text };
  }
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function createPacket(args, comparison) {
  const now = new Date().toISOString();
  const lineagePacketId = `lineage.modification-loop.${safeName(args.scriptId)}.${idStamp()}`;
  const effectState = comparison.effect_state;
  return {
    schema_version: 1,
    lineage_packet_id: lineagePacketId,
    created_at: now,
    intent_contract: {
      intent: args.summary,
      deterministic_output_compare: true,
    },
    authority_refs: [
      "docs/script-factory-deterministic-evolution-plan.md",
      "docs/script-legend.md",
    ],
    factory: "Script Factory",
    forge_family: args.forgeFamily,
    forge_id: args.forgeId,
    forge_version: "0.0.1",
    script_class: args.scriptClass,
    script_id: args.scriptId,
    script_version: "0.0.1",
    run_id: `run.${safeName(args.scriptId)}.${idStamp()}`,
    sequence: {
      rank: effectState === "functional" ? "SEQ-I" : "SEQ-J",
      sub_sequence: effectState === "functional" ? [] : ["SEQ-J.1"],
      conditional_action: effectState === "functional" ? "continue" : effectState === "blocked" ? "block" : "modify",
    },
    intended_effect: {
      deterministic_output: comparison.expected.value,
    },
    observed_effect: {
      deterministic_output: comparison.observed.value,
    },
    allowed_boundary: {
      writes: [".refer-factory/lineage/**", ".refer-factory/modification-loop/flags/**"],
    },
    effect_state: effectState,
    mismatch: {
      type: effectState === "functional" ? "none" : comparison.mismatch_type,
      detail: comparison.detail,
      repair_layer: effectState === "functional" ? "" : args.repairLayer,
    },
    checks: [
      {
        name: "deterministic-output-compare",
        ok: effectState === "functional",
        expected_canonical: comparison.expected.canonical,
        observed_canonical: comparison.observed.canonical,
      },
    ],
    evidence: [
      {
        type: "deterministic_compare",
        detail: comparison.detail || "Expected and observed output match.",
      },
    ],
    repair_history: [],
    promotion: {
      status: "not_promoted",
      promoted_at: null,
      receipt: null,
    },
  };
}

function compare(args) {
  const expected = parseValue(readInput(args.expected, args.expectedFile));
  const observed = parseValue(readInput(args.observed, args.observedFile));
  if (args.blocked) {
    return {
      effect_state: "blocked",
      mismatch_type: args.blockerType,
      detail: args.blockerDetail || "Failure detector classified the run as blocked before output comparison.",
      expected,
      observed,
    };
  }
  if (!expected.provided || !observed.provided) {
    return {
      effect_state: "blocked",
      mismatch_type: "missing_input",
      detail: "Expected and observed outputs are both required for deterministic comparison.",
      expected,
      observed,
    };
  }
  if (expected.canonical === observed.canonical) {
    return {
      effect_state: "functional",
      mismatch_type: "none",
      detail: "",
      expected,
      observed,
    };
  }
  return {
    effect_state: "mismatched",
    mismatch_type: args.mismatchType,
    detail: "Observed output does not match deterministic expected output.",
    expected,
    observed,
  };
}

function writeJson(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function writeFlag(packet) {
  if (packet.effect_state === "functional") return null;
  const flag = {
    schema: "refer.modification-loop.flag.v1",
    created_at: packet.created_at,
    detector: "scripts/repair/modification-loop.mjs",
    loop_gate: "failure_detector",
    rerun_policy: "Every repair rerun must return through this detector with the same contract before promotion.",
    lineage_packet_id: packet.lineage_packet_id,
    script_id: packet.script_id,
    forge_id: packet.forge_id,
    effect_state: packet.effect_state,
    mismatch: packet.mismatch,
    repair_layer: packet.mismatch.repair_layer,
    next: packet.effect_state === "blocked"
      ? "Provide missing input, authority, permission, environment, or boundary decision."
      : "Enter modification loop: repair the smallest responsible layer, rerun the same contract, compare again.",
  };
  const file = path.join(flagsDir, `${packet.lineage_packet_id}.json`);
  writeJson(file, flag);
  return file;
}

function writeReadiness(packet) {
  if (packet.effect_state !== "functional") return null;
  const readiness = {
    schema: "refer.script-readiness.v1",
    created_at: packet.created_at,
    script_id: packet.script_id,
    forge_id: packet.forge_id,
    status: "ready_for_script_first_use",
    source_lineage_packet_id: packet.lineage_packet_id,
    gate: "ai_watcher_parallel_inspection",
    next: "Prefer this script route next time the same intent/effect contract applies.",
  };
  const file = path.join(readinessDir, `${safeName(packet.script_id)}.json`);
  writeJson(file, readiness);
  return file;
}

function safeName(value) {
  return String(value || "script").replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const comparison = compare(args);
  const packet = createPacket(args, comparison);
  const lineageFile = path.join(lineageDir, `${packet.lineage_packet_id}.json`);
  writeJson(lineageFile, packet);
  const flagFile = writeFlag(packet);
  const readinessFile = writeReadiness(packet);
  const result = {
    ok: packet.effect_state === "functional",
    effect_state: packet.effect_state,
    lineage_file: path.relative(root, lineageFile),
    flag_file: flagFile ? path.relative(root, flagFile) : null,
    readiness_file: readinessFile ? path.relative(root, readinessFile) : null,
    next: flagFile ? "modification_loop_flagged" : "continue",
  };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${result.effect_state}: ${result.next}`);
    console.log(result.lineage_file);
    if (result.flag_file) console.log(result.flag_file);
  }
}

run();
