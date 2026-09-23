#!/usr/bin/env node
/**
 * DEPOSIT - the one door onto the belt, and the lookup for the handle he says
 * out loud. Writing is the top half of this file; reading is the bottom.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * ===========================================================================
 * THE DOOR: nothing reaches the belt without being read first
 * ===========================================================================
 *
 * kind.cjs consolidated how the belt is READ and left how it is WRITTEN in
 * thirteen inline copies across nine machines, so nothing looked at a record
 * before it landed. That asymmetry is not cosmetic, because the belt is
 * APPEND-ONLY: a record written wrong can never be edited and never be
 * removed. Every other file in this factory can be repaired by a later commit.
 * This one cannot.
 *
 * WHAT IT COST, measured. The belt's invariant is that every record names what
 * it triggers or names itself terminal - pulse-check enforces it and calls a
 * record without `triggers` a leak, because a leak is the only way this system
 * dies quietly. For 198 records the invariant held perfectly. Then two landed
 * without the field on 2026-09-12; by 2026-09-23 it was FIFTEEN out of 634,
 * and every one of them is permanent. They were only silenced by hand, one
 * withdrawal record each, because pulse-check exempts a leak somebody later
 * named - which is a way to stop the alarm, not a way to fix the record.
 *
 * Thirteen of those fifteen came from three call sites in one machine, which
 * is the point: this was never a rule people ignore. 198 of 198 says the rule
 * is known and followed. What was missing was anything that CHECKED, and a
 * missing check fails in bursts - one machine written slightly wrong emits
 * every leak it will ever emit before anybody reads the first one.
 *
 * WHAT IT REFUSES, and why each refusal earns its keep:
 *
 *   NO ID           the board keys on it, closures name it, handles number it.
 *                   A record without one can never be closed, dispatched or
 *                   spoken about.
 *   NO TRIGGERS     the belt's own invariant, checked at the door instead of
 *                   discovered by pulse-check the following night. This is the
 *                   refusal the whole file exists for.
 *   BAD TRIGGERS    `operator`, `seer`, `closed`, `contract:<who>` or
 *                   `terminal:<what>`. The SHAPE is checked and the vocabulary
 *                   is not frozen: a new terminal word is ordinary growth, and
 *                   a guard that refuses correct work teaches the next session
 *                   to stop using the guard. A bare `terminal:` is a typo and
 *                   is caught.
 *   BAD KIND        one of the four in kind.cjs. "closure" is the one people
 *                   reach for and it is not a kind - it is what a record DOES,
 *                   and writing it there voids the field. kind.cjs already
 *                   reports this at READ time, which is the night after.
 *   NO WORDS        `claim`, `title` or `detail`. The Go switch (2026-09-21)
 *                   made the plan panel a second author and the board drew the
 *                   operator's own note as a card with nothing written on it.
 *                   Nothing errored anywhere - which is exactly the failure
 *                   this door is for.
 *
 * IT THROWS. A machine that hands this a malformed record stops, loudly, with
 * every problem listed at once rather than one per attempt. That asymmetry is
 * deliberate: a crashed station runs again in five minutes, and a malformed
 * record is on the belt forever.
 *
 * WHAT IT DOES NOT REFUSE, on purpose:
 *
 *   A TERMINAL RECORD WITH A PROSE SUBJECT. kind.cjs reports those and will
 *   not guess at them, and it is right not to: most terminal records name the
 *   THING they are about - "the pulse strip", "the presentation screen" - and
 *   were never reaching for a record id. Refusing them here would refuse the
 *   ordinary case to catch the rare one.
 *
 *   A DUPLICATE ID. That is not malformed, it is already said. It returns
 *   `{written: false, reason: "duplicate"}` so the caller can count what it
 *   skipped, which is what all nine machines were already doing by hand with
 *   `beltText.includes()`. The rule now lives once - and precisely: it matches
 *   `"id":"<x>"` rather than the bare `"<x>"` every copy used, so a record
 *   whose id once appeared as somebody else's SUBJECT is no longer silently
 *   suppressed.
 *
 * ===========================================================================
 * THE LOOKUP: the handle he says out loud
 * ===========================================================================
 *
 * Operator, 2026-09-11: "can we enumerate deposits for easier reference so I
 * can say something like fix deposit S23 as recommended."
 *
 * Record ids are written for machines. "filter-verified-its-own-assignment" is
 * precise and unsayable, and asking him to read one aloud is asking him to do
 * the machine's filing. A handle is the human address: one letter for the
 * domain, one number, stable forever because the belt is append-only and the
 * Nth body record is always B<n>.
 *
 *   node <factory>/machines/deposit.cjs S23          print it, with its advice
 *   node <factory>/machines/deposit.cjs S23 --json   machine-readable
 *   node <factory>/machines/deposit.cjs --open       every open deposit
 *   node <factory>/machines/deposit.cjs --write f.json   put one ON the belt
 *
 * `--write` takes a FILE, never a command-line string: PowerShell re-tokenizes
 * quoted spans and mangles every non-ASCII character that passes through it,
 * which is the same reason commit messages here use `git commit -F`. It exists
 * because a session that has FOUND something had no safe way to put it down -
 * hand-appending is exactly how thirteen of the fifteen permanent leaks got
 * there.
 *
 * Exit 1 when the handle names nothing, because a lookup that silently returns
 * nothing is indistinguishable from one that found an empty record.
 */
const fs = require("fs");
const path = require("path");

const KINDLIB = require("./kind.cjs");
const { KIND_WORDS, beltIndex, handleIndex, headlineOf, reasonOf } = KINDLIB;

const BELT_REL = ".claude/agent-context/findings.jsonl";
const beltPathFor = (root) => path.join(root || process.cwd(), BELT_REL);

/** Refused, with everything that is wrong - not the first thing that is wrong. */
class DepositRefused extends Error {
  constructor(problems, record) {
    super(`deposit refused: ${problems.join(" | ")}`);
    this.name = "DepositRefused";
    this.problems = problems;
    this.record = record;
  }
}

// `operator` and `seer` are addresses; `closed` is a state the belt has always
// accepted; `contract:` and `terminal:` take a word. pulse-check reads exactly
// this grammar to tell open work from finished work, so anything outside it is
// counted as finished by accident.
const TRIGGER_SHAPE = /^(operator|seer|closed|(?:contract|terminal):[a-z0-9][a-z0-9-]*)$/i;

/** Everything wrong with a record, as sentences a person can act on. */
function refusalsFor(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return ["a belt record must be an object"];
  }
  const out = [];

  if (!String(record.id == null ? "" : record.id).trim()) {
    out.push("no id: the board keys on it and a closure names it, so a record without one can never be closed or dispatched");
  }

  const trig = String(record.triggers == null ? "" : record.triggers).trim();
  if (!trig) {
    out.push(
      'no triggers: every record names what it triggers ("contract:body", "operator") or names itself terminal ("terminal:fixed"). ' +
        "This is the belt's invariant and it is checked here because the belt is append-only - a record without it cannot be repaired afterwards",
    );
  } else if (!TRIGGER_SHAPE.test(trig)) {
    out.push(`triggers "${trig}" is not operator, seer, closed, contract:<who> or terminal:<what>`);
  }

  if (record.kind != null) {
    const k = String(record.kind).trim().toLowerCase();
    if (!KIND_WORDS.includes(k)) {
      out.push(`kind "${record.kind}" is not one of ${KIND_WORDS.join(", ")} - "closure" is what a record does, not what it is, and writing it here voids the field`);
    }
  }

  if (!headlineOf(record)) {
    out.push("no words: a record needs a claim, a title or a detail, or the board draws a card with nothing written on it and nothing errors");
  }

  return out;
}

/**
 * Put one record on the belt.
 *
 * Throws DepositRefused if it is malformed. Returns what happened otherwise,
 * so a caller can go on counting what it skipped:
 *   { written: true,  id, belt }
 *   { written: false, reason: "duplicate" | "no-belt", id, belt }
 */
function deposit(record, opts = {}) {
  const belt = opts.belt || beltPathFor(opts.root);
  const problems = refusalsFor(record);
  if (problems.length) throw new DepositRefused(problems, record);
  const id = String(record.id).trim();

  // No belt is not a refusal. A machine running in a repo that has no belt has
  // nothing to say there, and the nine call sites this replaced all guarded on
  // exactly this before appending.
  if (!fs.existsSync(belt)) return { written: false, reason: "no-belt", id, belt };

  if (!opts.allowDuplicate) {
    const text = opts._beltText != null ? opts._beltText : fs.readFileSync(belt, "utf8");
    if (text.includes(`"id":${JSON.stringify(id)}`)) return { written: false, reason: "duplicate", id, belt };
  }

  fs.appendFileSync(belt, JSON.stringify(record) + "\n", "utf8");
  return { written: true, reason: null, id, belt };
}

/**
 * Put several on, reading the belt once.
 *
 * The watcher writes up to a few dozen annotations in one pass, and re-reading
 * the whole belt per line would make the cost of depositing grow with the
 * length of the belt - which is the one number that only ever goes up.
 * Ids written earlier in the same call are remembered, so a batch cannot
 * duplicate within itself.
 */
function depositMany(records, opts = {}) {
  const belt = opts.belt || beltPathFor(opts.root);
  const list = Array.isArray(records) ? records : [records];
  // Refuse the WHOLE batch before writing any of it. A half-written batch on an
  // append-only belt is not recoverable, and the caller cannot tell which half.
  const bad = list.map((r, i) => ({ i, problems: refusalsFor(r) })).filter((x) => x.problems.length);
  if (bad.length) {
    throw new DepositRefused(
      bad.map((x) => `record ${x.i + 1} of ${list.length}: ${x.problems.join(" | ")}`),
      list,
    );
  }
  if (!fs.existsSync(belt)) return list.map((r) => ({ written: false, reason: "no-belt", id: String(r.id).trim(), belt }));

  let text = opts.allowDuplicate ? "" : fs.readFileSync(belt, "utf8");
  const out = [];
  for (const r of list) {
    const res = deposit(r, { ...opts, belt, _beltText: text });
    out.push(res);
    if (res.written && !opts.allowDuplicate) text += JSON.stringify(r) + "\n";
  }
  return out;
}

module.exports = { deposit, depositMany, refusalsFor, DepositRefused, TRIGGER_SHAPE, beltPathFor, BELT_REL };

// Everything below is the command line. A machine that requires this file for
// the door must not be made to run the lookup - top-level return is legal in
// CommonJS and is the whole of the separation.
if (require.main !== module) return;

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const LIST_OPEN = process.argv.includes("--open");
const WRITE_AT = process.argv.indexOf("--write");
const want = (process.argv[2] || "").toUpperCase().trim();

// ---- --write: the safe way to put a finding down ----------------------------
if (WRITE_AT >= 0) {
  const file = process.argv[WRITE_AT + 1];
  if (!file) {
    console.error("deposit --write <file.json>   (a FILE: a quoted argument is mangled by the shell)");
    process.exit(2);
  }
  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(path.resolve(file), "utf8").replace(/^\uFEFF/, ""));
  } catch (err) {
    console.error(`deposit: ${file} is not readable JSON - ${err.message}`);
    process.exit(2);
  }
  try {
    const list = Array.isArray(payload) ? payload : [payload];
    const results = depositMany(list, { belt: BELT });
    for (const r of results) {
      if (r.written) console.log(`deposited  ${r.id}`);
      else if (r.reason === "duplicate") console.log(`already on the belt, nothing written  ${r.id}`);
      else console.log(`no belt in ${ROOT}, nothing written  ${r.id}`);
    }
    process.exit(results.some((r) => r.written) ? 0 : 1);
  } catch (err) {
    console.error(`deposit: REFUSED - nothing was written.`);
    for (const p of err.problems || [err.message]) console.error(`  - ${p}`);
    process.exit(2);
  }
}

if (!fs.existsSync(BELT)) {
  console.error(`deposit: no belt in ${ROOT}`);
  process.exit(2);
}

const records = fs
  .readFileSync(BELT, "utf8")
  .replace(/^\uFEFF/, "")
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

// The same numbering the board draws, derived from the belt rather than read
// from handles.json: that file is written by the board, and a lookup that only
// works after a successful render is a lookup that fails exactly when something
// is wrong. The rule lives once, in kind.cjs, for the same reason kindOf and
// isDone do - every copy of it in this factory has drifted.
const { byHandle, handleOf: handles } = handleIndex(records);

// The belt's vocabulary, from the one file that holds it.
const IX = beltIndex(records);
const selfTerminal = IX.selfTerminal;
const isDone = IX.isDone;

// Advice and lessons can be attached by a later record, so resolve them the same
// way the board does - otherwise "as recommended" would find nothing for exactly
// the records most likely to carry a recommendation.
const later = (field) => {
  const m = new Map();
  for (const r of records) if (r.subject && r[field]) m.set(String(r.subject), r[field]);
  return m;
};
const adviceLate = later("recommend");
const optsLate = later("options");
const lessonLate = later("lesson");

if (LIST_OPEN) {
  const open = records.filter((r) => !isDone(r) && !(selfTerminal(r) && r.subject));
  console.log(`${open.length} open deposit(s) in ${path.basename(ROOT)}:\n`);
  for (const r of open) {
    const h = handles.get(String(r.id));
    const rec = adviceLate.get(String(r.id)) || r.recommend;
    // The KIND goes on the line, because "open" covers a contract somebody owes
    // and a deposit nobody has judged, and the two ask for opposite things from
    // whoever is reading this list.
    console.log(`  ${h.padEnd(5)} ${IX.kindOf(r).toUpperCase().padEnd(9)} ${String(r.triggers || "").padEnd(16)} ${headlineOf(r).slice(0, 78)}`);
    if (rec) console.log(`        -> ${String(rec).replace(/\s+/g, " ").slice(0, 100)}`);
  }
  process.exit(0);
}

if (!want) {
  console.error("deposit: name a handle, e.g. S23 - or --open for the list, or --write <file.json> to put one down");
  process.exit(2);
}

const r = byHandle.get(want);
if (!r) {
  console.error(`deposit: nothing is filed as ${want}. Highest handles: ${[...byHandle.keys()].slice(-6).join(", ")}`);
  process.exit(1);
}

const out = {
  handle: want,
  id: r.id,
  dimension: r.dimension,
  kind: IX.kindOf(r),
  status: isDone(r) ? "closed" : "open",
  triggers: r.triggers,
  owner: r.owner,
  claim: headlineOf(r),
  evidence: reasonOf(r),
  recommend: adviceLate.get(String(r.id)) || r.recommend || null,
  options: optsLate.get(String(r.id)) || r.options || null,
  lesson: lessonLate.get(String(r.id)) || r.lesson || null,
  run: r.run,
};

if (JSON_OUT) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`${want}  ${out.kind.toUpperCase()}  ${out.status.toUpperCase()}  [${out.dimension}]  -> ${out.triggers}`);
  console.log(`  id: ${out.id}`);
  console.log(`\n  ${String(out.claim).replace(/\s+/g, " ")}`);
  if (out.evidence) console.log(`\n  why: ${String(out.evidence).replace(/\s+/g, " ")}`);
  if (out.recommend) console.log(`\n  DO THIS: ${String(out.recommend).replace(/\s+/g, " ")}`);
  if (Array.isArray(out.options)) for (const o of out.options) console.log(`    - ${o.label}${o.why ? " - " + o.why : ""}`);
  if (out.lesson) console.log(`\n  lesson: ${String(out.lesson).replace(/\s+/g, " ")}`);
}
