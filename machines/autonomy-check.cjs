#!/usr/bin/env node
/**
 * AUTONOMY CHECK - what "the factory no longer needs anyone" actually means.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "your job is not done until the factory no longer needs
 * you or my direct intervention and is fully autonomous."
 *
 * A goal stated that way cannot be finished, only felt - and a loop with no exit
 * condition is not a loop, it is a haunting. So this turns it into seven
 * conditions that can each be measured, and prints a score. It is the gate the
 * resolution loop runs against, and the honest answer to "are we there yet".
 *
 * WHAT IT DELIBERATELY DOES NOT DO: it never reports a condition as met because
 * it could not check. Every unknown counts as unmet. The whole system exists
 * because silence was being read as health, and this is the one file where that
 * mistake would be self-concealing.
 *
 *   node <factory>/machines/autonomy-check.cjs         report
 *   node <factory>/machines/autonomy-check.cjs --json  machine-readable
 *
 * Exit 0 when every condition is met. Exit 1 otherwise - so a loop can simply
 * run it and stop when it passes.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const JSON_OUT = process.argv.includes("--json");

const readJson = (p, fb) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
  } catch {
    return fb;
  }
};
const MS = { m: 6e4, h: 36e5, d: 864e5 };
const durMs = (spec) => {
  const m = String(spec || "").match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  return m ? Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2].toLowerCase()] : null;
};
const ago = (t) => (!t ? "never" : `${Math.round((Date.now() - t) / MS.h)}h ago`);

// ---- inputs -----------------------------------------------------------------

const belt = fs.existsSync(path.join(CTX, "findings.jsonl"))
  ? fs
      .readFileSync(path.join(CTX, "findings.jsonl"), "utf8")
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

const clock = readJson(path.join(CTX, "clock-state.json"), { stations: {} });
const pulse = readJson(path.join(CTX, "pulse.json"), null);
const restart = readJson(path.join(CTX, "host-restart.json"), null);

const stations = [];
for (const rel of ["tools", "tools/factory", "scripts", "machines"]) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".station.json")) continue;
    const d = readJson(path.join(dir, f), null);
    if (d && d.id) stations.push(d);
  }
}

const now = Date.now();
const runAt = (r) => {
  const t = Date.parse(r.run || "");
  return Number.isNaN(t) ? null : t;
};

// ---- the seven conditions ---------------------------------------------------

const conditions = [];
const add = (id, name, met, detail, why) => conditions.push({ id, name, met: met === true, detail, why });

// 1. Every station has run inside its own declared interval.
{
  const late = stations
    .map((s) => {
      const st = clock.stations[s.id] || {};
      const every = durMs(s.every);
      if (!every) return { id: s.id, bad: true, note: "no readable interval" };
      if (!st.lastRunAt) return { id: s.id, bad: true, note: "never run" };
      const over = now - st.lastRunAt > every * 2;
      return { id: s.id, bad: over, note: over ? `last run ${ago(st.lastRunAt)}, every ${s.every}` : null };
    })
    .filter((x) => x.bad);
  add(
    "stations-current",
    "Every station runs on its own clock",
    stations.length > 0 && late.length === 0,
    late.length ? late.map((l) => `${l.id}: ${l.note}`).join("; ") : `${stations.length} stations, all inside interval`,
    "A station that stops without anyone noticing is the failure this whole system was built to end.",
  );
}

// 2. The belt has no leaks.
{
  const leaks = belt.filter((r) => !r.triggers || !String(r.triggers).trim());
  add(
    "no-leaks",
    "Every deposit names what it triggers",
    leaks.length === 0,
    leaks.length ? `${leaks.length} leak(s): ${leaks.map((l) => l.id).join(", ")}` : `${belt.length} records, 0 leaks`,
    "An output nobody picks up is the only way this system dies quietly.",
  );
}

// 3. The pulse is healthy and recent.
{
  const t = pulse && Date.parse(pulse.checkedAt);
  const fresh = t && now - t < 3 * MS.h;
  add(
    "pulse-healthy",
    "The inner loop is running and reports healthy",
    !!(pulse && pulse.healthy && fresh),
    !pulse ? "no pulse.json - never run" : !fresh ? `last check ${ago(t)}` : pulse.healthy ? "healthy" : `faults: ${(pulse.faults || []).join("; ")}`,
    "The thing that notices must itself be noticed running.",
  );
}

// 4. The host can restart and the factory comes back - PROVEN, not armed.
{
  const r = restart && (restart.conditions || []).find((c) => c.name === "RESUMABLE");
  add(
    "restart-survivable",
    "A restart is survivable, proven at a real boot",
    !!(r && r.ok),
    !restart ? "host-restart has never run" : r ? r.why : "no RESUMABLE condition reported",
    "Armed is not proven. Until a real logon writes the marker, a restart the factory schedules is one it may not survive.",
  );
}

// 5. Nothing is waiting on the operator.
//
// THE BELT IS APPEND-ONLY, so a record is never edited to say it is done - a
// LATER record closes it, naming it as its subject with a terminal trigger.
// The first version of this check ignored that and counted a record resolved
// hours earlier as still waiting on him, which would have held the gate shut
// forever over work that was finished. A gate that cannot see resolution is a
// gate that can never open.
{
  // A later record acts on an earlier one by naming it as its subject. Three
  // things it can do, and the gate must honour all three or it will hold shut
  // over work that has already moved:
  //
  //   CLOSE       terminal: trigger        - the thing is finished
  //   REASSIGN    any non-operator trigger - it is someone else's now
  //   MARK        operatorDecision: true   - it is lawfully his to decide
  //
  // The first version honoured only CLOSE, so a record re-addressed to mind an
  // hour earlier still counted against him, and a record marked as genuinely his
  // did not count as marked. Append-only means the whole history is the state.
  const byId = new Map(belt.map((r) => [String(r.id), r]));
  const released = new Set();
  const marked = new Set();
  for (const r of belt) {
    const subj = r.subject && String(r.subject);
    if (!subj || !byId.has(subj)) continue;
    const trig = String(r.triggers || "");
    if (trig.startsWith("terminal:") || (trig && trig !== "operator")) released.add(subj);
    if (r.operatorDecision === true) marked.add(subj);
  }

  const waiting = belt.filter(
    (r) => String(r.triggers) === "operator" && !released.has(String(r.id)) && !String(r.id).startsWith("mark-"),
  );

  // "Nothing held for the operator" is the WRONG target and would never be met.
  // His own law reserves three things to him permanently: what the product
  // should be for the people using it, a commitment of money or identity or
  // legal exposure, and a direction between genuinely different futures. Work
  // like that SHOULD sit with him, and a gate demanding zero would either stay
  // shut forever or teach itself to close his decisions to score a point - which
  // is the worst failure available to a thing that measures itself.
  //
  // So the condition is not "none held". It is "nothing held that the factory
  // should have handled itself": a record addressed to him carries
  // operatorDecision:true when it is genuinely his by that law, and anything
  // unmarked is work the factory failed to resolve and must be accounted for.
  const unmarked = waiting.filter((r) => r.operatorDecision !== true && !marked.has(String(r.id)));
  const genuine = waiting.length - unmarked.length;
  add(
    "nothing-unresolved-waits-on-him",
    "Nothing reaches him that the factory should have handled",
    unmarked.length === 0,
    unmarked.length
      ? `${unmarked.length} unresolved: ${unmarked.map((w) => w.id).join(", ")}${genuine ? ` (plus ${genuine} genuinely his)` : ""}`
      : `${genuine} held, all genuinely his to decide`,
    "Zero would be the wrong target: his law reserves taste, money and direction to him permanently. What must reach zero is work the factory could have resolved and did not.",
  );
}

// 6. The board is fresh.
{
  const p = path.join(CTX, "factory-tracker.html");
  const t = fs.existsSync(p) ? fs.statSync(p).mtimeMs : null;
  const fresh = t && now - t < 3 * MS.h;
  add(
    "board-fresh",
    "The board is rebuilt without a person",
    !!fresh,
    !t ? "never built" : `built ${ago(t)}`,
    "Publishing it still needs a session with an approval; rebuilding it does not. This checks the half that can be autonomous.",
  );
}

// 7. Deposits are arriving - the cycle actually turns.
{
  const newest = belt.map(runAt).filter(Boolean).sort((a, b) => b - a)[0] || null;
  const fresh = newest && now - newest < 36 * MS.h;
  add(
    "cycle-turns",
    "Deposits are still arriving",
    !!fresh,
    newest ? `newest deposit ${ago(newest)}` : "belt is empty",
    "A factory that stops finding things has either finished or died, and only one of those is good news.",
  );
}

// ---- 8. SOMETHING OTHER THAN A PERSON WINDS THE CLOCK ------------------------
//
// This gate printed FULLY AUTONOMOUS for a day while the factory was not
// autonomous in the only sense that matters: NOTHING ON THE MACHINE INVOKED THE
// CLOCK. Stations declared 10- and 15-minute cadences and the thing walking them
// was a person, by hand, whenever they happened to be present.
//
// Every one of the other seven conditions was true and the whole was false. They
// all measure what happens WHEN the factory runs; not one asked what makes it
// run. So the gate was measuring a machine that only existed while being
// watched, which is precisely the failure the operator named: "the living
// factory appears stale, can't seem to keep up with life."
//
// Two pieces of evidence, and both are required. A registered task proves the
// intent; a tick nobody was present for proves the fact. The first without the
// second is a task that is scheduled and failing silently, which is the same
// shape as a green check that checks nothing.
{
  let scheduler = null; // healthy status word, or null
  let schedulerState = "absent"; // absent | disabled | <status>
  try {
    const { execSync } = require("child_process");
    // schtasks rather than the PowerShell cmdlet: no module load, and it is
    // present on every Windows since XP.
    const out = execSync('schtasks /query /tn "LivingFactory-Clock" /fo LIST', { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const status = (out.match(/Status:\s*(\w+)/i) || [])[1] || "unknown";
    schedulerState = status;
    if (/^(Ready|Running)$/i.test(status)) scheduler = status;
  } catch {
    // Not registered, or not Windows. Either way this condition is unmet, and an
    // unmet condition is never reported as met because it could not be checked.
  }
  // ABSENT AND DISABLED ARE DIFFERENT FACTS. The first version said "no task is
  // registered" when the task existed and had simply been switched off - which
  // sends somebody to create a task that is already there. This board's own rule
  // and it was broken inside the check written to enforce autonomy.

  // A tick that happened while nobody was here. The clock records every
  // station's last run; if the newest is more recent than this session could
  // account for, something else is winding it.
  // lastRunAt, an epoch number - NOT lastRun. The first version read a field
  // that does not exist, so every value was zero and the condition could only
  // ever fail. A check that cannot pass is the mirror of one that cannot fail,
  // and both are worthless for the same reason: the answer does not depend on
  // the world. Verified against the real clock-state.json rather than assumed.
  const lastRuns = Object.values(clock.stations || {})
    .map((s) => Number(s.lastRunAt) || Date.parse(s.lastRun || "") || 0)
    .filter(Boolean);
  const newestTick = lastRuns.length ? Math.max(...lastRuns) : 0;
  const tickAgeMin = newestTick ? Math.round((now - newestTick) / MS.m) : null;

  // Fifteen minutes: the ticker runs every five, so three consecutive misses is
  // a real outage rather than a slow cycle.
  const ticking = tickAgeMin !== null && tickAgeMin <= 15;

  add(
    "wound-from-outside",
    "Something other than a person winds the clock",
    !!scheduler && ticking,
    !scheduler
      ? schedulerState === "absent"
        ? "No LivingFactory-Clock task exists on this host. The clock runs only when somebody runs it. Install it: SovereignNode/scripts/install-factory-clock.ps1"
        : `LivingFactory-Clock exists but is ${schedulerState}. It does not need creating, it needs switching back on.`
      : !ticking
        ? `LivingFactory-Clock is ${scheduler}, but the newest station run is ${tickAgeMin === null ? "unknown" : tickAgeMin + " minutes"} old - the task is registered and not delivering.`
        : `LivingFactory-Clock is ${scheduler}; newest station run ${tickAgeMin} minutes ago.`,
    "Every other condition here measures what happens WHEN the factory runs. None of them asks what makes it run, and for a day all seven passed while the only thing invoking the clock was a person doing it by hand. A factory that is alive because somebody is watching it is the arrangement this system exists to end.",
  );
}

// ---- report -----------------------------------------------------------------

const met = conditions.filter((c) => c.met).length;
const report = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), host: os.hostname(), met, of: conditions.length, autonomous: met === conditions.length, conditions };
fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(path.join(CTX, "autonomy.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`autonomy: ${met}/${conditions.length} [${report.repo}]${report.autonomous ? "  FULLY AUTONOMOUS" : ""}`);
  for (const c of conditions) console.log(`  ${c.met ? "ok  " : "NOT "} ${c.name}`);
  const unmet = conditions.filter((c) => !c.met);
  if (unmet.length) {
    console.log("");
    for (const c of unmet) {
      console.log(`  ${c.name}`);
      console.log(`    ${c.detail}`);
      console.log(`    why it matters: ${c.why}`);
    }
  }
}

process.exit(report.autonomous ? 0 : 1);
