#!/usr/bin/env node
/**
 * THE PULSE BELT - the tick made visible, riding the conveyor it powers.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()),
 * never __dirname (precedent P13).
 *
 * Operator, 2026-09-12: "I want the 5 minute tick to be added to the deposit,
 * refresh the board, and placed on the belt with the time on it and watcher
 * moves it to exit when the time is up and then other pulse drops in on the
 * deposit and continues in the cycle. this way i can see a pulse always on the
 * belt. i'm going to allow the pulse to be the power source for the conveyor
 * that drives it."
 *
 * And, narrowing it: "there will only be one pulse card at a time or one in each
 * state. One incoming pulse ready to be pulled. One on the Belt. One already
 * resolved from last exit. And auto removed from file in 5 minutes. This would
 * keep the board clean and will be able to see the reality of how items move."
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS ITS OWN FILE, AND NOT findings.jsonl
 * ---------------------------------------------------------------------------
 *
 * The design is right and the storage was the only thing wrong with it. Three
 * reasons, and the second is the one that decides it:
 *
 *   1. THE BELT CARRIES FINDINGS. pulse-check.cjs already states it: a liveness
 *      mark is not a finding, it is true, then false, then true again. At two
 *      records per tick that is 576 a day and 4.2MB a week, against a belt that
 *      was 201 records and 214KB after two days - the pulse would be 95% of the
 *      belt inside a week, and every machine re-parses the whole file on every
 *      run.
 *
 *   2. AUTO-REMOVAL IS UNSAFE ON THE BELT AND SAFE HERE. This is the decisive
 *      one. Deleting a record means read-whole-file, filter, rewrite. NINE
 *      machines append to findings.jsonl on independent schedules - board-see,
 *      board-serve-check, composition-watch, exit-worker, manager, mind-watch,
 *      provider-watch, triage and watcher - and an append landing inside that
 *      read-modify-write window is simply lost. Doing it 288 times a day does
 *      not risk eating a real finding, it eventually does, silently.
 *
 *      THIS FILE HAS EXACTLY ONE WRITER: this machine. That is what makes
 *      rewriting it safe, and it is the whole reason the feature is possible at
 *      all. Nothing else may ever write pulse-belt.jsonl.
 *
 *   3. HANDLES WOULD RENUMBER. B12 and A73 are stable only because the belt is
 *      append-only and the Nth body record is always B<n>. Deleting records
 *      shifts every later handle in that dimension - and handles exist
 *      precisely so he can say "fix deposit S23" out loud.
 *
 * The board draws both streams on one conveyor, so what a person SEES is what
 * he asked for: a pulse card at each stage, always moving, beside real work.
 *
 * ---------------------------------------------------------------------------
 * THE STAGE IS DERIVED FROM AGE. IT IS NEVER STORED.
 * ---------------------------------------------------------------------------
 *
 * A card records one thing: when it was created. Which stage it is in is worked
 * out at read time from how old it is - the same discipline kind.cjs uses on the
 * belt, and for the same reason: a stored stage has to be advanced by something,
 * and a thing that advances state on a timer will happily advance it through a
 * period when nothing was running.
 *
 *   age <  1 stage   INCOMING   waiting to be pulled
 *   age <  2 stages  ON BELT    being worked
 *   age <  3 stages  RESOLVED   came off at the exit
 *   older            removed from the file
 *
 * So when the ticks are regular there is exactly one card in each state, which
 * is what he asked for. AND WHEN A TICK IS MISSED THERE IS A HOLE, which is the
 * point rather than a defect: a gap in the cycle is the honest picture of a
 * factory that stopped, and a pulse belt that always shows three neat cards
 * would be a liveness display that cannot report death. Absence is not failure,
 * but it must be VISIBLE.
 *
 * The stage length is read from the repo's own `pulse` trigger declaration, so
 * the cards can never disagree with the tick that drives them. A repo that does
 * not declare one gets the 5m default and is told so.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT DELIBERATELY DOES NOT DO
 * ---------------------------------------------------------------------------
 *
 * IT DEPOSITS NOTHING. Not to the belt, not on a gap, not ever. That is what
 * makes it safe to run every five minutes forever. Liveness faults are
 * pulse-check's job and it already reports them; a second watcher depositing the
 * same fault on a faster clock is how a belt dies by flooding.
 *
 * Note for P13: this is a universal machine that PRODUCES rather than deposits,
 * so it fits neither half of P13's test either - the same gap the scheduler
 * exposes, from the other side. See docs/seven-machines-pending-move.md.
 *
 *   node <factory>/machines/pulse-belt.cjs          tick: prune, add, write
 *   node <factory>/machines/pulse-belt.cjs --json   machine-readable
 *   node <factory>/machines/pulse-belt.cjs --list   show the cycle, write nothing
 *   node <factory>/machines/pulse-belt.cjs --dry    compute everything, write nothing
 *
 * Exit 0 when the cycle advanced. Exit 1 only when it could not be written,
 * because a pulse belt that silently stopped updating is the one failure this
 * machine must never have.
 */
const fs = require("fs");
const path = require("path");
const { discoverTriggers } = require("./triggers.cjs");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const CARDS = path.join(CTX, "pulse-belt.jsonl");
const REPORT = path.join(CTX, "pulse-belt.json");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const JSON_OUT = has("--json");
const LIST = has("--list");
const DRY = has("--dry") || LIST;

// Three stages, one tick each. Not configurable: the shape IS the request, and a
// knob here would let a repo quietly produce a pulse belt that means something
// different from every other repo's.
const STAGES = ["incoming", "belt", "resolved"];

const MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
const durMs = (spec) => {
  const m = String(spec || "").match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  return m ? Number(m[1]) * MS[m[2].toLowerCase()] : null;
};

// The stage length comes from the repo's own pulse declaration, so a card can
// never disagree with the tick that made it. Falling back silently would let a
// repo draw a 5m cycle while ticking hourly, which is a display that lies.
const DEFAULT_STAGE_MS = 5 * MS.m;
function stageLength() {
  let declared = null;
  try {
    for (const t of discoverTriggers(ROOT) || []) {
      if (t && (t.id === "pulse" || t.id === "pulse-belt")) {
        const ms = durMs(t.every);
        if (ms) declared = { ms, from: t.id, every: t.every };
        if (t.id === "pulse-belt") break; // our own declaration wins over the tick's
      }
    }
  } catch {
    // A declaration we cannot read is not a reason to stop drawing the cycle.
    declared = null;
  }
  return declared || { ms: DEFAULT_STAGE_MS, from: null, every: "5m" };
}

const STAGE = stageLength();
const LIFETIME_MS = STAGE.ms * STAGES.length;

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

function readCards() {
  let raw;
  try {
    raw = fs.readFileSync(CARDS, "utf8");
  } catch (err) {
    // Never-written and unreadable are different facts and must not merge.
    if (err.code === "ENOENT") return { cards: [], unreadable: 0, firstRun: true };
    throw err;
  }
  const cards = [];
  let unreadable = 0;
  for (const line of raw.replace(/^\uFEFF/, "").split("\n")) {
    if (!line.trim()) continue;
    let c;
    try {
      c = JSON.parse(line);
    } catch (err) {
      // Swallow only the error expected from a bad line. Anything else is a bug
      // in this machine and must not be filed as a corrupt card.
      if (!(err instanceof SyntaxError)) throw err;
      unreadable++;
      continue;
    }
    if (c && typeof c.at === "string" && Number.isFinite(Date.parse(c.at))) cards.push(c);
    else unreadable++;
  }
  return { cards, unreadable, firstRun: false };
}

// A GRACE WINDOW, because schedulers do not fire on the second.
//
// Measured 2026-09-12: with no grace, a tick landing 20 seconds early leaves the
// previous card at 4m40s - still inside its first stage - so the new card joins
// it and INCOMING holds two. The cycle stops showing one card per state, which
// is the entire thing being asked for, and it would happen on most ticks rather
// than rarely: Windows Scheduled Tasks and cron both drift by seconds.
//
// Ten percent of a stage is enough to absorb that and far too small to hide a
// missed tick, which is a whole stage late. So an early tick still reads as
// on-time and a skipped one still reads as a hole - which is the line that
// matters, because the hole is the only thing here that reports death.
const GRACE_MS = Math.round(STAGE.ms * 0.1);

const stageOf = (card, now) => {
  const age = now - Date.parse(card.at);
  if (age < 0) return STAGES[0]; // a card from the future: treat as just made
  const i = Math.floor((age + GRACE_MS) / STAGE.ms);
  return i < STAGES.length ? STAGES[i] : null; // null means expired
};

// ---------------------------------------------------------------------------
// WRITE - atomically, because there is one writer and many readers
// ---------------------------------------------------------------------------

// Temp file plus rename. The board reads this file on its own schedule, and a
// reader that catches a half-written file sees a cycle that is missing cards -
// which here would look exactly like a factory that stopped. rename replaces in
// one step, so a reader sees the old cycle or the new one and never a torn one.
function writeAtomic(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text, "utf8");
  try {
    fs.renameSync(tmp, file);
  } catch (err) {
    try {
      fs.rmSync(tmp, { force: true });
    } catch {
      /* the rename failure is the one worth reporting */
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------

const now = Date.now();
const { cards: existing, unreadable, firstRun } = readCards();

const kept = existing.filter((c) => stageOf(c, now) !== null);
const dropped = existing.length - kept.length;

// The new card. `seq` is carried forward so the count survives cards expiring;
// it is what lets the board say how many times the factory has beaten, which a
// three-card window cannot.
const lastSeq = kept.concat(existing).reduce((m, c) => (Number.isFinite(c.seq) && c.seq > m ? c.seq : m), 0);
const at = new Date(now).toISOString();
const card = {
  id: `pulse-${at.replace(/[:.]/g, "-")}`,
  at,
  seq: lastSeq + 1,
  source: "pulse-belt",
  why: "the tick, made visible - this card is the power the conveyor runs on",
};

const next = kept.concat([card]).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

// A gap is the interesting signal, so it is measured rather than inferred from a
// card count: with regular ticks every stage is occupied, and a stage with
// nobody in it means nothing ran during that window.
const occupancy = {};
for (const s of STAGES) occupancy[s] = next.filter((c) => stageOf(c, now) === s).length;
const empty = STAGES.filter((s) => occupancy[s] === 0);
const gap = !firstRun && empty.length > 0;

let wrote = false;
let writeError = null;
if (!DRY) {
  try {
    fs.mkdirSync(CTX, { recursive: true });
    writeAtomic(CARDS, next.map((c) => JSON.stringify(c)).join("\n") + "\n");
    wrote = true;
  } catch (err) {
    writeError = `${err.code || "error"}: ${err.message}`;
  }
}

const report = {
  checkedAt: at,
  repo: path.basename(ROOT),
  file: path.relative(ROOT, CARDS).replace(/\\/g, "/"),
  stageMs: STAGE.ms,
  graceMs: GRACE_MS,
  stageEvery: STAGE.every,
  stageFrom: STAGE.from || "default (no pulse trigger declared in this repo)",
  lifetimeMs: LIFETIME_MS,
  beat: card.seq,
  added: DRY ? null : card.id,
  dropped,
  unreadable,
  occupancy,
  gap,
  emptyStages: empty,
  cards: next.map((c) => ({ id: c.id, at: c.at, seq: c.seq, stage: stageOf(c, now) })),
  wrote,
  dry: DRY,
  writeError,
};

if (!DRY) {
  try {
    fs.mkdirSync(CTX, { recursive: true });
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");
  } catch {
    // The report is a convenience; failing to write it must not fail the beat.
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const where = STAGE.from ? `${STAGE.every} (from the "${STAGE.from}" trigger)` : `${STAGE.every} (default - no pulse trigger declared here)`;
  console.log(`pulse-belt: beat ${card.seq} in ${report.repo}, one stage = ${where}`);
  for (const s of STAGES) {
    const c = next.find((x) => stageOf(x, now) === s);
    const age = c ? Math.round((now - Date.parse(c.at)) / 1000) : null;
    console.log(`  ${s.padEnd(9)} ${c ? `${c.id}  (${age}s old, beat ${c.seq})` : "- empty: nothing ran in this window"}`);
  }
  if (dropped) console.log(`  removed ${dropped} card(s) past ${LIFETIME_MS / 6e4}m`);
  if (unreadable) console.log(`  ${unreadable} unreadable line(s) skipped`);
  if (gap) console.log(`  GAP: ${empty.join(", ")} empty - the cycle is not being driven on time`);
  if (DRY) console.log(`  (${LIST ? "--list" : "--dry"}: nothing written)`);
}

if (writeError) {
  console.error(`pulse-belt: could not write ${report.file} - ${writeError}`);
  process.exit(1);
}
