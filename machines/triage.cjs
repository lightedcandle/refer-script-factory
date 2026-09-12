#!/usr/bin/env node
/**
 * TRIAGE - the act that turns a deposit into a contract.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-12: "deposits to be converted into contracts" - a stage the
 * model did not have. A watcher deposited with contract:mind and it was instantly
 * a debt against mind whether or not anyone had decided it should be, which is
 * why the by-domain counts climbed without anybody agreeing to the work.
 *
 * So: a deposit is SEEN, NOT JUDGED. Becoming a contract is something somebody
 * does - the manager, the operator, or a session - and it is recorded. Intake
 * only ever dispatches contracts, so nothing reaches the belt that was not
 * deliberately accepted as work.
 *
 * THE RECORD IS APPENDED, NEVER EDITED. The belt is append-only, so the
 * acceptance is itself evidence: who accepted it, and when. `terminal:triaged`
 * sits in the NOTING family, so accepting work does not file it as finished.
 *
 *   node <factory>/machines/triage.cjs B12 --contract
 *   node <factory>/machines/triage.cjs <record-id> --note
 *   node <factory>/machines/triage.cjs --list          what is awaiting triage
 *   node <factory>/machines/triage.cjs B12 --contract --by "claude, build lane"
 *
 * Takes a handle (B12) or a full record id. Exit 1 when it cannot act, because a
 * triage that silently did nothing is the failure this stage exists to remove.
 */
const fs = require("fs");
const path = require("path");
const { KIND, KIND_WORDS, beltIndex, triageRecord } = require("./kind.cjs");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const LIST = process.argv.includes("--list");
const DRY = process.argv.includes("--dry");

if (!fs.existsSync(BELT)) {
  console.error(`triage: no belt in ${ROOT}`);
  process.exit(2);
}

const records = fs
  .readFileSync(BELT, "utf8")
  .replace(/^﻿/, "")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const IX = beltIndex(records);

// The same numbering the board draws, so a handle he says out loud resolves
// here. It is derived from the BELT rather than read from handles.json, which
// the board writes - a lookup that only works after a successful render fails
// exactly when something is wrong. That was the reason this block was once
// written out by hand in two files; the rule now lives once, in kind.cjs, and
// still never touches the board's output.
const { byHandle, handleOf } = require("./kind.cjs").handleIndex(records);

if (LIST) {
  const waiting = records.filter(IX.isAwaitingTriage);
  if (JSON_OUT) {
    console.log(JSON.stringify(waiting.map((r) => ({ handle: handleOf.get(String(r.id)), id: r.id, dimension: r.dimension, triggers: r.triggers, claim: r.claim })), null, 2));
  } else {
    console.log(`${waiting.length} deposit(s) awaiting triage in ${path.basename(ROOT)}:\n`);
    for (const r of waiting) {
      console.log(`  ${String(handleOf.get(String(r.id))).padEnd(5)} ${String(r.triggers).padEnd(24)} ${String(r.claim).replace(/\s+/g, " ").slice(0, 76)}`);
    }
    if (waiting.length) console.log(`\n  accept one:  node <factory>/machines/triage.cjs <handle> --contract`);
  }
  process.exit(0);
}

const want = (process.argv[2] || "").trim();
if (!want || want.startsWith("--")) {
  console.error("triage: name a handle or a record id, e.g. B12 --contract. --list shows what is waiting.");
  process.exit(2);
}

const kindFlag = KIND_WORDS.find((k) => process.argv.includes(`--${k}`));
if (!kindFlag) {
  console.error(`triage: say what it becomes - ${KIND_WORDS.map((k) => `--${k}`).join(", ")}`);
  process.exit(2);
}

const byArg = (() => {
  const i = process.argv.indexOf("--by");
  return i >= 0 ? process.argv[i + 1] : null;
})();

const target = byHandle.get(want.toUpperCase()) || records.find((r) => String(r.id) === want);
if (!target) {
  console.error(`triage: nothing on the belt is called "${want}".`);
  process.exit(1);
}

const was = IX.kindOf(target);
if (was === kindFlag) {
  // Said rather than written. A second identical triage record would be a second
  // act claiming to have changed something, and the belt would carry two
  // acceptances of one deposit - which reads as disagreement, not as agreement.
  console.log(`triage: ${handleOf.get(String(target.id))} is already a ${was}. Nothing written.`);
  process.exit(0);
}

const rec = triageRecord({
  id: String(target.id),
  kind: kindFlag,
  dimension: target.dimension,
  owner: target.owner,
  to: String(target.triggers || "").startsWith("contract:") ? String(target.triggers).slice("contract:".length) : target.dimension,
  by: byArg || "the command line",
});

if (!DRY) fs.appendFileSync(BELT, JSON.stringify(rec) + "\n", "utf8");

if (JSON_OUT) {
  console.log(JSON.stringify({ id: target.id, handle: handleOf.get(String(target.id)), was, now: kindFlag, written: !DRY, record: rec }, null, 2));
} else {
  console.log(`${DRY ? "would accept" : "accepted"}  ${handleOf.get(String(target.id))}  ${was} -> ${kindFlag}`);
  console.log(`  ${String(target.claim || "").replace(/\s+/g, " ").slice(0, 90)}`);
  if (kindFlag === KIND.CONTRACT) console.log(`  It can now ride the belt and be dispatched. It could not before.`);
  if (kindFlag === KIND.NOTE) console.log(`  It leaves both columns for the reading area. Nothing is owed on it.`);
  if (!DRY) console.log(`  written as ${rec.id}`);
}
