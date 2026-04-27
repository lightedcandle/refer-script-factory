import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  markContractTurnComplete,
  markTemporaryContractActive,
  readReferChatModeState,
  referChatModePath,
  setPersistentContractMode,
} from "../src/contracts/referChatMode";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-chat-mode-"));
let state = readReferChatModeState(root);
assert.equal(state.active_contract_mode, "idle");
assert.equal(state.persistent_contract_mode, false);
assert.equal(state.last_turn_mode, "none");

state = markTemporaryContractActive(root, new Date("2026-04-25T12:00:00.000Z"));
assert.equal(state.active_contract_mode, "temporary");
assert.ok(fs.existsSync(referChatModePath(root)));

state = markContractTurnComplete(root, new Date("2026-04-25T12:01:00.000Z"));
assert.equal(state.active_contract_mode, "idle");
assert.equal(state.last_turn_mode, "temporary");

state = setPersistentContractMode(root, true, new Date("2026-04-25T12:02:00.000Z"));
assert.equal(state.active_contract_mode, "persistent");
assert.equal(state.persistent_contract_mode, true);

state = markTemporaryContractActive(root, new Date("2026-04-25T12:03:00.000Z"));
assert.equal(state.active_contract_mode, "persistent");

state = markContractTurnComplete(root, new Date("2026-04-25T12:04:00.000Z"));
assert.equal(state.active_contract_mode, "persistent");
assert.equal(state.last_turn_mode, "persistent");

state = setPersistentContractMode(root, false, new Date("2026-04-25T12:05:00.000Z"));
assert.equal(state.active_contract_mode, "idle");
assert.equal(state.persistent_contract_mode, false);
