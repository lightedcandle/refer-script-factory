#!/usr/bin/env node
/**
 * NIGHT WATCH - what the factory did while nobody was here.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "now let it run overnight and report what it did."
 *
 * The report must not depend on anybody being awake to write it, which is the
 * same principle the heartbeat was built on: a factory that needs a person to
 * describe itself is only half autonomous.
 *
 *   node <factory>/machines/night-watch.cjs --mark     take the baseline
 *   node <factory>/machines/night-watch.cjs            report against it
 *   node <factory>/machines/night-watch.cjs --json     machine-readable
 *
 * WHY A BASELINE AND A DIFF, rather than reading history. The clock keeps only
 * each station's LAST run and a lifetime counter - there is no per-tick log to
 * read, and inventing one would mean writing a second history nobody asked for.
 * Marking a baseline and subtracting is smaller, and it cannot drift out of step
 * with the thing it measures because it IS the thing it measures.
 *
 * IT REPORTS SLEEP AS SLEEP. If the machine dozes, that is not a factory
 * failure and must not be drawn as one - absence and failure are different
 * facts. Gaps are found from the seer's photographs, which are timestamped and
 * taken on a known cadence, so a gap longer than that cadence is a period when
 * nothing was running at all.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const SNAPS = path.join(CTX, "board-snaps");
const MARK = path.join(CTX, "night-watch.mark.json");
const JSON_OUT = process.argv.includes("--json");
const DO_MARK = process.argv.includes("--mark");

const readJson = (p, fb) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return fb;
  }
};
const belt = () =>
  fs.existsSync(BELT)
    ? fs
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
        .filter(Boolean)
    : [];

const snapTimes = () => {
  try {
    return fs
      .readdirSync(SNAPS)
      .filter((f) => /^\d{4}-\d{2}-\d{2}T/.test(f) && f.endsWith(".png"))
      .map((f) => Date.parse(f.slice(0, 19).replace(/-(\d{2})-(\d{2})-(\d{2})--.*$/, "T$1:$2:$3Z").replace(/(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/, "$1T$2:$3:$4Z")))
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
};

// The schedule state via triggers.cjs, which knows both filenames and both
// keys. Reading "clock-state.json" by hand here would have made every trigger
// look as though it had never run the moment that file was renamed - and this
// machine's whole job is to say what ran overnight.
const { readScheduleState } = require("./triggers.cjs");

const state = () => {
  const schedule = readScheduleState(CTX);
  const runs = {};
  for (const [id, s] of Object.entries(schedule.triggers || {})) runs[id] = Number(s.runs) || 0;
  return {
    at: new Date().toISOString(),
    runs,
    beltLength: belt().length,
    snapshots: snapTimes().length,
  };
};

// ---- mark -------------------------------------------------------------------

if (DO_MARK) {
  const s = state();
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(MARK, JSON.stringify(s, null, 1) + "\n");
  console.log(`night-watch: baseline taken ${s.at}`);
  console.log(`  ${Object.keys(s.runs).length} stations, ${s.beltLength} belt records, ${s.snapshots} snapshots`);
  process.exit(0);
}

// ---- report -----------------------------------------------------------------

const base = readJson(MARK, null);
if (!base) {
  console.error("night-watch: no baseline. Run with --mark first, or there is nothing to compare against.");
  process.exit(2);
}

const now = Date.now();
const from = Date.parse(base.at);
const nowState = state();
const hours = ((now - from) / 36e5).toFixed(1);

// What each station did.
const worked = [];
for (const [id, n] of Object.entries(nowState.runs)) {
  const was = Number(base.runs[id] || 0);
  if (n > was) worked.push({ id, runs: n - was });
}
worked.sort((a, b) => b.runs - a.runs);
const silentStations = Object.keys(nowState.runs).filter((id) => !worked.some((w) => w.id === id));

// What arrived on the belt.
const all = belt();
const fresh = all.filter((r) => {
  const t = Date.parse(r.run || "");
  return !Number.isNaN(t) && t >= from;
});
// The belt's vocabulary, from the one file that holds it. Imported rather than
// copied because the words change: `triaged` was added when deposits and
// contracts became different things, and a stale copy here would have reported
// every acceptance of work as an overnight closure - the night report saying
// eight things were finished on a night when eight things were merely started.
const { NOTING, selfTerminal } = require("./kind.cjs");
const newFindings = fresh.filter((r) => !selfTerminal(r));
const closures = fresh.filter((r) => selfTerminal(r) && !NOTING.test(String(r.triggers || "").trim()) && r.subject);
const lessons = fresh.filter((r) => r.lesson);
const forHim = fresh.filter((r) => String(r.triggers || "") === "operator");

// WHEN WAS NOTHING RUNNING. The seer photographs on a known cadence; a gap much
// longer than that is a stretch where the machine was not awake. Reported as a
// quiet period, never as a fault - the factory did not fail, it was not asked.
const shots = snapTimes().filter((t) => t >= from);
const GAP_MIN = 70; // the seer's ceiling is 45m; 70 allows a late tick without crying wolf
const gaps = [];
let prev = from;
for (const t of shots) {
  const mins = Math.round((t - prev) / 6e4);
  if (mins >= GAP_MIN) gaps.push({ from: new Date(prev).toISOString(), to: new Date(t).toISOString(), mins });
  prev = t;
}
const tailMins = Math.round((now - prev) / 6e4);
if (tailMins >= GAP_MIN) gaps.push({ from: new Date(prev).toISOString(), to: new Date(now).toISOString(), mins: tailMins, open: true });

const totalRuns = worked.reduce((a, w) => a + w.runs, 0);
const quietMins = gaps.reduce((a, g) => a + g.mins, 0);
const awakeMins = Math.max(0, Math.round((now - from) / 6e4) - quietMins);

const report = {
  from: base.at,
  to: new Date(now).toISOString(),
  hours: Number(hours),
  stationRuns: totalRuns,
  stationsThatWorked: worked,
  stationsThatDidNotRun: silentStations,
  deposits: newFindings.length,
  closures: closures.length,
  lessons: lessons.length,
  needingHim: forHim.length,
  snapshots: shots.length,
  quietPeriods: gaps,
  minutesAwake: awakeMins,
  minutesQuiet: quietMins,
};

fs.writeFileSync(path.join(CTX, "night-watch.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`night-watch: ${hours}h since ${base.at}  [${path.basename(ROOT)}]\n`);
  console.log(`  ${totalRuns} station runs across ${worked.length} stations`);
  for (const w of worked) console.log(`     ${String(w.runs).padStart(4)}  ${w.id}`);
  if (silentStations.length) console.log(`  did not run at all: ${silentStations.join(", ")}`);
  console.log("");
  console.log(`  ${newFindings.length} new finding(s), ${closures.length} closed, ${lessons.length} lesson(s) recorded`);
  if (forHim.length) console.log(`  ${forHim.length} needing him`);
  console.log(`  ${shots.length} photographs of the board`);
  if (gaps.length) {
    console.log(`\n  QUIET - nothing ran (the machine was not awake, which is not a fault):`);
    for (const g of gaps) console.log(`     ${g.mins} min  ${g.from.slice(11, 16)}Z to ${g.to.slice(11, 16)}Z${g.open ? "  (still quiet)" : ""}`);
  } else {
    console.log(`\n  No gaps. The factory ran continuously for ${hours} hours.`);
  }
  for (const r of newFindings.slice(0, 12)) console.log(`\n  ${String(r.claim).replace(/\s+/g, " ").slice(0, 150)}`);
}
