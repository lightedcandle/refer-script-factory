#!/usr/bin/env node
/**
 * THE PULSE BELT - the tick made visible, riding the conveyor it powers.
 *
 * UNIVERSAL MACHINE, AND UNIVERSAL STATE - which is the unusual part.
 *
 * Most machines are one copy acting on many repos: the code is shared, the
 * output is per repo, because a finding is ABOUT a repo. The tick is not about
 * a repo. There is one scheduler on this host and one routine behind it, so
 * there is one heartbeat, and it is kept in ONE file in the factory:
 *
 *     <factory>/.refer-factory/pulse-belt.jsonl
 *
 * Only the CADENCE is read from process.cwd() - the repo whose scheduler is
 * driving, and whose trigger declaration says how often it beats. Every card
 * records which repo drove it, so one shared file with more than one driver
 * stays legible.
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

// THE CARDS LIVE IN THE FACTORY, NOT IN THE REPO. This was wrong in the first
// version and the operator caught it: "why is the pulse repo sensitive, shouldn't
// it be universal, doesn't the living factory show both universal and app
// deposits?"
//
// Yes on all three. The first version put the cards in <repo>/.claude/agent-context
// by analogy with findings.jsonl, and the analogy does not hold. THE BELT IS
// ABOUT A REPO; THE PULSE IS NOT. There is one scheduler on this host and one
// driver behind it - the `living-factory-pulse` routine - so one heartbeat. A
// per-repo file gives N counters for that one heartbeat: "beat 43" here and
// "beat 12" there, describing the same tick.
//
// And it breaks the best part of the machine. Gap detection would report a hole
// in every repo the scheduler did not happen to tick that round - announcing
// death in a perfectly alive factory, which is exactly the failure class this
// system exists to remove.
//
// The board already draws both kinds and the pattern is already established:
// node-heartbeat.cjs writes the host block to <factory>/.refer-factory/hive-node-registry.json
// through this same discovery chain, and build-tracker.cjs reads it back and
// cites where it read it. Its comment states the rule - "the host is part of the
// factory, so its state belongs on the board". The tick is the same kind of
// thing: factory state, drawn on every repo's board.
// UNLIKE EVERY OTHER MACHINE, THIS ONE DOES NOT HAVE TO SEARCH FOR THE FACTORY.
// It lives in it. `__dirname/..` is the factory root by definition, so the
// discovery chain the other machines need - REFER_FACTORY_ROOT, then a known
// path, then a sibling - cannot fail here, and an error branch for "factory not
// found" would be unreachable code claiming to guard something. Dead
// error-handling is a lie about the failure modes.
//
// Note which `__dirname` this is, because P13 forbids the other one: the SUBJECT
// still comes from process.cwd() - the repo being ticked, and where the cadence
// is declared. This is the sibling use, a factory file locating another part of
// the factory, which is the one legitimate case. See
// docs/seven-machines-pending-move.md.
const OWN_FACTORY = path.resolve(__dirname, "..");

// REFER_FACTORY_ROOT still means something: it points the cards at a DIFFERENT
// factory, which is how the cycle test writes into a fixture instead of here.
// So an override that is set and wrong is a real, reachable configuration
// failure and is refused - a silent fall back to the real factory would write
// live cards during a test, which is the accident this check exists to stop.
const OVERRIDE = process.env.REFER_FACTORY_ROOT || null;
const looksLikeFactory = (c) => fs.existsSync(path.join(c, "machines", "pulse-belt.cjs"));

if (OVERRIDE && !looksLikeFactory(OVERRIDE)) {
  console.error(
    `pulse-belt: REFER_FACTORY_ROOT is set to ${OVERRIDE}, and there is no machines/pulse-belt.cjs there.\n` +
      "  Refusing to guess. Falling back to the real factory would write live cards from whatever\n" +
      "  set this variable, and that is worse than stopping.\n" +
      "  This is NOT the pulse having stopped - nothing was read and nothing was written."
  );
  process.exit(2);
}

const FACTORY = OVERRIDE || OWN_FACTORY;

const CTX = path.join(FACTORY, ".refer-factory");
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

// ONE BEAT PER TICK, however many drivers call in.
//
// Moving the cards to the factory made this file shared, so the single-writer
// guarantee no longer comes from "each repo has its own". It comes from here:
// if a card already exists inside the current stage window, the tick has already
// been recorded and this run adds nothing. Two schedulers, or a scheduler and
// somebody running it by hand, produce one beat rather than two.
//
// The window is a stage minus the grace, the same boundary stageOf uses, so a
// beat is never both "on time" and "a duplicate".
const newest = kept.reduce((m, c) => Math.max(m, Date.parse(c.at)), 0);
const alreadyBeat = newest > 0 && now - newest < STAGE.ms - GRACE_MS;

// `seq` is carried forward so the count survives cards expiring; it is what lets
// the board say how many times the factory has beaten, which a three-card window
// cannot.
const lastSeq = kept.concat(existing).reduce((m, c) => (Number.isFinite(c.seq) && c.seq > m ? c.seq : m), 0);
const at = new Date(now).toISOString();
const card = alreadyBeat
  ? null
  : {
      id: `pulse-${at.replace(/[:.]/g, "-")}`,
      at,
      seq: lastSeq + 1,
      source: "pulse-belt",
      // Which repo's scheduler drove this beat. One file, many possible drivers,
      // so a card that cannot say who beat it makes a shared belt unreadable.
      drivenFrom: path.basename(ROOT),
      why: "the tick, made visible - this card is the power the conveyor runs on",
    };

const next = kept.concat(card ? [card] : []).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

// A gap is the interesting signal, so it is measured rather than inferred from a
// card count: with regular ticks every stage is occupied, and a stage with
// nobody in it means nothing ran during that window.
const occupancy = {};
for (const s of STAGES) occupancy[s] = next.filter((c) => stageOf(c, now) === s).length;
const empty = STAGES.filter((s) => occupancy[s] === 0);
const gap = !firstRun && empty.length > 0;

// Nothing to write when the tick was already recorded AND nothing expired:
// rewriting identical content would move the file's mtime, and the board reloads
// on mtime change. A display that flickers on every no-op is a display that
// stops meaning anything.
const changed = Boolean(card) || dropped > 0;

let wrote = false;
let writeError = null;
if (!DRY && changed) {
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
  factory: FACTORY.replace(/\\/g, "/"),
  file: CARDS.replace(/\\/g, "/"),
  universal: true,
  stageMs: STAGE.ms,
  graceMs: GRACE_MS,
  stageEvery: STAGE.every,
  stageFrom: STAGE.from || "default (no pulse trigger declared in this repo)",
  lifetimeMs: LIFETIME_MS,
  beat: card ? card.seq : lastSeq,
  added: card && !DRY ? card.id : null,
  alreadyBeat,
  changed,
  dropped,
  unreadable,
  occupancy,
  gap,
  emptyStages: empty,
  cards: next.map((c) => ({ id: c.id, at: c.at, seq: c.seq, stage: stageOf(c, now), drivenFrom: c.drivenFrom || null })),
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
  const lead = alreadyBeat ? `already beat this stage, at beat ${lastSeq}` : `beat ${card.seq}`;
  console.log(`pulse-belt: ${lead}, driven from ${report.repo}, one stage = ${where}`);
  console.log(`  cards: ${report.file}  (universal - one heartbeat, one file)`);
  for (const s of STAGES) {
    const c = next.find((x) => stageOf(x, now) === s);
    const age = c ? Math.round((now - Date.parse(c.at)) / 1000) : null;
    const who = c && c.drivenFrom ? ` via ${c.drivenFrom}` : "";
    console.log(`  ${s.padEnd(9)} ${c ? `${c.id}  (${age}s old, beat ${c.seq}${who})` : "- empty: nothing ran in this window"}`);
  }
  if (dropped) console.log(`  removed ${dropped} card(s) past ${LIFETIME_MS / 6e4}m`);
  if (unreadable) console.log(`  ${unreadable} unreadable line(s) skipped`);
  if (gap) console.log(`  GAP: ${empty.join(", ")} empty - the cycle is not being driven on time`);
  if (!DRY && !changed) console.log(`  nothing changed, so nothing written - the board must not flicker on a no-op`);
  if (DRY) console.log(`  (${LIST ? "--list" : "--dry"}: nothing written)`);
}

if (writeError) {
  console.error(`pulse-belt: could not write ${report.file} - ${writeError}`);
  process.exit(1);
}
