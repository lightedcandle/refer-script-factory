import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  createModelPrompt,
  createReferIntakeRecord,
  writeReferIntakeRecord,
} from "../src/contracts/referIntake";

const rawPrompt = `${"ignore this ".repeat(120)}
execute`;
const record = createReferIntakeRecord(
  rawPrompt,
  new Date("2026-04-25T12:00:00.000Z"),
);

assert.equal(record.contract.raw_input_chars, rawPrompt.trim().length);
assert.ok(record.contract.raw_input_ref.startsWith(".refer-factory/intake/"));
assert.equal(
  record.contract.routing.model_prompt_policy,
  "send_compact_contract_only",
);
assert.ok(record.contract.active_contract.relevant_excerpt.includes("[truncated]"));
assert.ok(record.raw_input.includes("execute"));

const modelPrompt = createModelPrompt(record.contract);
assert.ok(modelPrompt.includes(record.contract.contract_id));
assert.ok(!modelPrompt.includes(record.raw_input));

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-intake-"));
const writtenPath = writeReferIntakeRecord(root, record);
assert.ok(fs.existsSync(writtenPath));

const saved = JSON.parse(fs.readFileSync(writtenPath, "utf8")) as typeof record;
assert.equal(saved.raw_input, record.raw_input);
assert.equal(saved.contract.raw_input_sha256, record.contract.raw_input_sha256);
