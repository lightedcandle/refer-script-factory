#!/usr/bin/env node
/**
 * INTAKE WORKER - picks the next deposit off incoming and puts it on the belt.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-12: "the intake worker is responsible for pulling deposits
 * off the incoming and placing them on the conveyor."
 *
 * Placing something on the conveyor means DISPATCHING it - a named agent, in a
 * session that exists on disk - because that is what the belt now requires. So
 * this worker has a real capability and a deliberate safety.
 *
 * IT PREPARES BY DEFAULT AND DISPATCHES ONLY WHEN TOLD. --dispatch spawns a
 * real session; without it the worker selects, writes the brief, and stops.
 * Arming a machine to start agents on its own is a decision about authority, not
 * a default to be set quietly at two in the morning by the thing that benefits
 * from it.
 *
 * SELECTION, in order, and each rule earns its place:
 *
 *   capacity      never exceed the concurrent limit. A factory that dispatches
 *                 everything at once has not scheduled anything.
 *   his           never touch an item addressed to the operator. Those are his
 *                 by law - taste, money, deletion - and an agent picking one up
 *                 would be taking a decision that was reserved.
 *   actionable    an item carrying a recommendation goes before one without.
 *                 Dispatching a diagnosis with no proposed action just moves the
 *                 thinking to a colder session.
 *   oldest        among equals, the one that has waited longest.
 *
 *   node <factory>/machines/intake-worker.cjs             select and brief
 *   node <factory>/machines/intake-worker.cjs --dispatch  actually start it
 *   node <factory>/machines/intake-worker.cjs --json      machine-readable
 *
 * Exit 0 always: having nothing to pick up is a normal, healthy morning.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const DO_DISPATCH = process.argv.includes("--dispatch");

const MS = { m: 6e4, h: 36e5 };
const ALIVE_MS = 30 * MS.m;
const CAPACITY = 3; // concurrent items on the belt
const now = Date.now();

if (!fs.existsSync(BELT)) {
  console.error(`intake-worker: no belt in ${ROOT}`);
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

const NOTING = /^terminal:(recorded|definition|annotation|note)$/;
const selfTerminal = (r) => /^(terminal:.+|closed)$/.test(String(r.triggers || "").trim());
const ids = new Set(records.map((r) => String(r.id)));
const closedBy = new Map();
for (const r of records) {
  if (!selfTerminal(r) || NOTING.test(String(r.triggers || "").trim())) continue;
  if (r.subject) closedBy.set(String(r.subject), r);
}
const isDone = (r) => selfTerminal(r) || closedBy.has(String(r.id));
const isCloser = (r) => selfTerminal(r) && !NOTING.test(String(r.triggers || "").trim()) && r.subject && ids.has(String(r.subject));
const isAnnotation = (r) => NOTING.test(String(r.triggers || "").trim()) && r.subject && ids.has(String(r.subject));

const adviceFor = new Map();
for (const r of records) if (r.subject && r.recommend) adviceFor.set(String(r.subject), r.recommend);
const adviceOf = (r) => adviceFor.get(String(r.id)) || r.recommend || null;

const dispatchFor = new Map();
for (const r of records) if (r.subject && r.dispatch) dispatchFor.set(String(r.subject), r.dispatch);

// ONE DEFINITION, in session-life.cjs, shared with exit-worker. Written out
// here once and blind to every spawned agent - see the account in that file.
const { sessionLife } = require("./session-life.cjs");
const alive = (id) => {
  const life = sessionLife(id, ROOT, ALIVE_MS);
  return !!(life && life.alive);
};

// CAPACITY COUNTS EVERY DOOR, AND ALWAYS HAS.
//
// `dispatchFor` is built from every record carrying a dispatch, whoever made it,
// so this counts work that arrived through chat and through a spawn exactly as
// it counts work this worker sent. Stated here because it has been read the
// other way once: the proof is that it reports 1 on the belt while `armed` is
// false, and that one is a dispatch it did not make.
//
// What it CANNOT count is a live session that no belt record names - and that is
// a missing record, not a wrong filter. Do not "fix" this into counting only our
// own dispatches; that would be the bug it was mistaken for.
const onBelt = records.filter((r) => !isDone(r) && !isCloser(r) && !isAnnotation(r) && dispatchFor.has(String(r.id)) && alive(dispatchFor.get(String(r.id)).session));
const room = Math.max(0, CAPACITY - onBelt.length);

const waiting = records
  .filter((r) => !isDone(r) && !isCloser(r) && !isAnnotation(r) && !dispatchFor.has(String(r.id)))
  // His by law. Never pick these up.
  .filter((r) => String(r.triggers || "") !== "operator" && r.owner !== "operator" && !r.operatorDecision)
  .map((r) => ({ r, advice: adviceOf(r), at: Date.parse(r.run || "") || 0 }))
  .sort((a, b) => (a.advice ? 0 : 1) - (b.advice ? 0 : 1) || a.at - b.at);

const picks = waiting.slice(0, room);

const brief = (p) =>
  [
    `Work this single deposit from the Living Factory belt and nothing else.`,
    ``,
    `ID: ${p.r.id}`,
    `Claim: ${String(p.r.claim || "").replace(/\s+/g, " ")}`,
    `Evidence: ${String(p.r.evidence || "").replace(/\s+/g, " ")}`,
    p.advice ? `Recommended: ${String(p.advice).replace(/\s+/g, " ")}` : `No recommendation exists. Work out what to do, and say so before doing it.`,
    ``,
    `When finished, append ONE record to .claude/agent-context/findings.jsonl with`,
    `subject "${p.r.id}" and a terminal trigger (terminal:fixed, terminal:shipped,`,
    `terminal:resolved, or terminal:withdrawn if it should not be done). That closure`,
    `is what takes it off the conveyor - nothing else will.`,
    ``,
    `Repo law: never edit files through PowerShell Set-Content; use git commit -F for`,
    `messages; branch as <lane>/<PLAN-ID>--claude--<lineage>--<description> and publish`,
    `with npm run branch:publish, which squash-merges. Verify what a person would see,`,
    `never the flag you just set.`,
  ].join("\n");

let started = [];
if (DO_DISPATCH && picks.length) {
  for (const p of picks) {
    const label = String(p.r.id).slice(0, 28);
    try {
      // Detached so the worker's own exit does not take the agent with it.
      const child = spawn("cmd.exe", ["/c", "claude", "-p", brief(p)], { cwd: ROOT, detached: true, stdio: "ignore" });
      child.unref();
      started.push({ id: p.r.id, label, pid: child.pid });
    } catch (err) {
      started.push({ id: p.r.id, label, error: err.message.split("\n")[0] });
    }
  }
}

const report = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(ROOT),
  capacity: CAPACITY,
  onBelt: onBelt.length,
  room,
  waiting: waiting.length,
  selected: picks.map((p) => ({ id: p.r.id, hasRecommendation: !!p.advice, waitedHours: Math.round((now - p.at) / MS.h) })),
  dispatched: DO_DISPATCH ? started : [],
  armed: DO_DISPATCH,
};
fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(path.join(CTX, "intake-worker.json"), JSON.stringify(report, null, 2) + "\n");
if (picks.length) fs.writeFileSync(path.join(CTX, "intake-brief.txt"), picks.map(brief).join("\n\n" + "-".repeat(70) + "\n\n"), "utf8");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`intake-worker: ${onBelt.length}/${CAPACITY} on the belt, ${waiting.length} waiting, room for ${room}  [${report.repo}]`);
  for (const p of picks) console.log(`  would dispatch  ${p.r.id}${p.advice ? "" : "   (no recommendation - it would have to work one out)"}`);
  if (!picks.length) console.log(room ? "  nothing eligible to pick up" : "  belt is full");
  if (DO_DISPATCH) for (const s of started) console.log(`  DISPATCHED ${s.id}${s.error ? " - FAILED: " + s.error : " (pid " + s.pid + ")"}`);
  else if (picks.length) console.log(`\n  Not armed. Brief written to .claude/agent-context/intake-brief.txt; run with --dispatch to start them.`);
}
process.exit(0);
