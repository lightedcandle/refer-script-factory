#!/usr/bin/env node
/**
 * PULSE - the fast inner loop of the Living Factory. UNIVERSAL MACHINE.
 *
 * Moved here from Telechurch on 2026-09-11, on the operator's direction: "we do
 * have universal operation in the script factory that needs to stand outside the
 * repo." Nothing in it was ever Telechurch's - it asks one question about a
 * belt, and every repo that runs a factory has a belt.
 *
 * WHAT IT IS FOR, precisely: on 2026-09-10 the nightly cycle was found still
 * flagged as running with no activity for many hours, having skipped a day
 * entirely, and nothing noticed - because the only thing that could notice ran
 * once a day and WAS the broken thing. A station cannot be its own liveness
 * check. So this asks, often:
 *
 *     Did every station that should have deposited, deposit?
 *
 * It is a SCRIPT, not a watcher. Comparing a timestamp to a schedule needs no
 * judgement, so spending a model on it hourly would be cost with no information.
 *
 * TWO THINGS CHANGED IN THE MOVE, both because it is now universal:
 *
 *   The target repo comes from process.cwd(), not from __dirname. The clock
 *   spawns machines with cwd set to the consuming repo, so one copy serves every
 *   repo. Resolving against __dirname would have made every repo read THIS one's
 *   belt - the failure would have been silent and the numbers plausible, which
 *   is the worst combination.
 *
 *   Station expectations are READ FROM THE REPO rather than hardcoded. The old
 *   copy carried a literal list naming Telechurch's nightly cycle, which was
 *   already a smell and would have been a lie anywhere else. Each repo declares
 *   its own cadence in *.station.json beside its machinery; this reads it there.
 *
 * WHY THE HEARTBEAT IS NOT ON THE BELT
 *
 * findings.jsonl is append-only and carries FINDINGS. A liveness mark is not a
 * finding - it is true, then false, then true again. Appending one every run
 * would bury the real records within a week, and the belt would stop being
 * readable, which is the one thing it has to be. Liveness is a separate,
 * OVERWRITTEN file. The belt grows; the pulse is replaced.
 *
 *   node <factory>/machines/pulse-check.cjs          exit 1 if a station is overdue
 *   node <factory>/machines/pulse-check.cjs --json   machine-readable
 */
const fs = require("fs");
const path = require("path");

// The repo under inspection, not the repo this file lives in.
const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const PULSE = path.join(CTX, "pulse.json");

const JSON_OUT = process.argv.includes("--json");

if (!fs.existsSync(CTX)) {
  console.error(
    `pulse: no .claude/agent-context in ${ROOT}\n` +
      "  This machine inspects the repo it is RUN IN, not the one it lives in.\n" +
      "  Run it from a repo that carries a factory, or via that repo's clock.",
  );
  process.exit(2);
}

// ---- what this repo expects of itself ---------------------------------------

const durMs = (spec) => {
  const m = String(spec || "").match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  if (!m) return null;
  return Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2].toLowerCase()];
};

// Discovery via triggers.cjs, so the declaration suffix exists in one place.
// An unreadable declaration is the schedule's problem to report, not this one's.
const { discoverTriggers } = require("./triggers.cjs");
const stations = discoverTriggers(ROOT);

// ---- read the belt ----------------------------------------------------------

let records = [];
if (fs.existsSync(BELT)) {
  records = fs
    .readFileSync(BELT, "utf8")
    .replace(/^﻿/, "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch (err) {
        return { __malformed: true, line: i + 1, reason: err.message };
      }
    });
}

const malformed = records.filter((r) => r.__malformed);
const good = records.filter((r) => !r.__malformed);

const parseRun = (r) => {
  const t = Date.parse(r.run || "");
  return Number.isNaN(t) ? null : t;
};

const now = Date.now();
const HOUR = 3600 * 1000;

// ---- the one question -------------------------------------------------------
//
// Lateness is judged against the SLOWEST depositing station this repo declares:
// if the slowest thing that should write to the belt has run within its own
// interval plus grace, the belt is as fresh as this repo promises. Grace is
// generous on purpose - a scheduler applies dispatch delay, and a run that
// starts late but finishes is healthy. A false alarm teaches everyone to ignore
// the alarm, which is the failure this file exists to prevent.

const stamps = good.map(parseRun).filter(Boolean);
const last = stamps.length ? Math.max(...stamps) : null;
const ageHours = last === null ? null : (now - last) / HOUR;

const slowest = stations
  .map((s) => ({ id: s.id, ms: durMs(s.every) }))
  .filter((s) => s.ms)
  .sort((a, b) => b.ms - a.ms)[0];

const expectHours = slowest ? slowest.ms / HOUR : 24;
const graceHours = Math.max(6, expectHours * 0.25);
const dueAfter = expectHours + graceHours;

const beltReport = {
  slowestStation: slowest ? slowest.id : null,
  expectEveryHours: Number(expectHours.toFixed(1)),
  graceHours: Number(graceHours.toFixed(1)),
  lastDepositAt: last ? new Date(last).toISOString() : null,
  ageHours: ageHours === null ? null : Number(ageHours.toFixed(1)),
  neverDeposited: last === null,
  overdue: ageHours !== null && ageHours > dueAfter,
};

// ---- leaks: the belt's own invariant ----------------------------------------
//
// Every record names what it triggers, or names itself terminal. A record
// without `triggers` is a leak, and a leak is the only way this system dies
// quietly. Checking it here costs nothing and catches a malformed deposit the
// night it lands rather than a month later.
const leaks = good.filter((r) => !r.triggers || !String(r.triggers).trim()).map((r) => r.id || "(no id)");

const open = good.filter((r) => /^(contract:|seer$|operator$)/.test(String(r.triggers || ""))).length;
const terminal = good.length - open - leaks.length;

const faults = [
  ...(beltReport.neverDeposited && stations.length ? ["the belt has never been deposited to"] : []),
  ...(beltReport.overdue
    ? [`last deposit ${beltReport.ageHours}h ago, overdue past ${dueAfter.toFixed(1)}h (slowest station: ${beltReport.slowestStation})`]
    : []),
  ...leaks.map((id) => `leak: record "${id}" names nothing to trigger`),
  ...malformed.map((m) => `malformed belt line ${m.line}: ${m.reason}`),
];

const pulse = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(ROOT),
  healthy: faults.length === 0,
  faults,
  belt: { records: good.length, open, terminal, leaks: leaks.length, malformed: malformed.length },
  stations: stations.length,
  freshness: beltReport,
};

// Overwritten, never appended. See the header.
fs.writeFileSync(PULSE, JSON.stringify(pulse, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(pulse, null, 2));
} else {
  console.log(`pulse: ${pulse.healthy ? "healthy" : "FAULT"}  ${new Date(now).toISOString()}  [${pulse.repo}]`);
  console.log(`  belt: ${good.length} records  |  ${open} open  |  ${terminal} terminal  |  ${leaks.length} leaks`);
  console.log(
    `  freshness: last deposit ${beltReport.ageHours === null ? "never" : beltReport.ageHours + "h ago"}` +
      `  (expect every ${beltReport.expectEveryHours}h + ${beltReport.graceHours}h grace)${beltReport.overdue ? "   OVERDUE" : ""}`,
  );
  if (faults.length) {
    console.error("\n  FAULTS:");
    for (const f of faults) console.error(`    - ${f}`);
  }
}

process.exit(faults.length ? 1 : 0);
