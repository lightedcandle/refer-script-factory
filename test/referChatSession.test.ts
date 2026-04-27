import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  appendReferChatTurn,
  createReferChatSession,
  readLatestReferChatSession,
  referChatSessionPath,
  writeReferChatSession,
} from "../src/contracts/referChatSession";
import { createReferIntakeRecord } from "../src/contracts/referIntake";

const session = createReferChatSession(new Date("2026-04-25T12:00:00.000Z"));
const intake = createReferIntakeRecord(
  "Build the contract chat panel.",
  new Date("2026-04-25T12:01:00.000Z"),
);
const updated = appendReferChatTurn(
  session,
  {
    raw_input_ref: intake.contract.raw_input_ref,
    contract_id: intake.contract.contract_id,
    contract: intake.contract,
    resolution: {
      resolution_state: "resolved_as_is",
      answer: "Done.",
      missing_fields: [],
      script_gap: "",
      blocked_reason: "",
      failed_reason: "",
    },
    assistant_output: "Done.",
    progress: ["REFER pass 1: resolved_as_is (return_final)."],
  },
  new Date("2026-04-25T12:02:00.000Z"),
);

assert.equal(updated.turns.length, 1);
assert.equal(updated.turns[0]?.turn_id, "turn.1");
assert.equal(updated.turns[0]?.role, "contract");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-chat-session-"));
const written = writeReferChatSession(root, updated);
assert.equal(written, referChatSessionPath(root, updated.session_id));
assert.ok(fs.existsSync(written));

const latest = readLatestReferChatSession(root);
assert.equal(latest?.session_id, updated.session_id);
assert.equal(latest?.turns[0]?.contract_id, intake.contract.contract_id);
