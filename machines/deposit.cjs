#!/usr/bin/env node
/**
 * DEPOSIT LOOKUP - resolve the handle he says out loud.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "can we enumerate deposits for easier reference so I can
 * say something like fix deposit S23 as recommended."
 *
 * Record ids are written for machines. "filter-verified-its-own-assignment" is
 * precise and unsayable, and asking him to read one aloud is asking him to do
 * the machine's filing. A handle is the human address: one letter for the
 * domain, one number, stable forever because the belt is append-only and the Nth
 * body record is always B<n>.
 *
 *   node <factory>/machines/deposit.cjs S23        print it, with its advice
 *   node <factory>/machines/deposit.cjs S23 --json machine-readable
 *   node <factory>/machines/deposit.cjs --open     every open deposit, by handle
 *
 * Exit 1 when the handle names nothing, because a lookup that silently returns
 * nothing is indistinguishable from one that found an empty record.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const LIST_OPEN = process.argv.includes("--open");
const want = (process.argv[2] || "").toUpperCase().trim();

if (!fs.existsSync(BELT)) {
  console.error(`deposit: no belt in ${ROOT}`);
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

// The same numbering the board draws. Duplicated deliberately rather than read
// from handles.json: that file is written by the board, and a lookup that only
// works after a successful render is a lookup that fails exactly when something
// is wrong. Both derive from the belt, so they cannot disagree.
const HANDLE_LETTER = { body: "B", mind: "M", spirit: "S", architecture: "A", hive: "H", world: "W", dev: "D", law: "L", refer: "R", shed: "X" };
const handles = new Map();
const byHandle = new Map();
{
  const seq = {};
  for (const r of records) {
    const dim = String(r.dimension || "").toLowerCase();
    const letter = /^X\d/.test(String(r.driver || "")) ? "X" : HANDLE_LETTER[dim] || (dim ? dim[0].toUpperCase() : "?");
    seq[letter] = (seq[letter] || 0) + 1;
    const h = `${letter}${seq[letter]}`;
    handles.set(String(r.id), h);
    byHandle.set(h, r);
  }
}

const NOTING = /^terminal:(recorded|definition|annotation|note)$/;
const selfTerminal = (r) => /^(terminal:.+|closed)$/.test(String(r.triggers || "").trim());
const closedBy = new Map();
for (const r of records) {
  if (!selfTerminal(r) || NOTING.test(String(r.triggers || "").trim())) continue;
  if (r.subject) closedBy.set(String(r.subject), r);
}
const isDone = (r) => selfTerminal(r) || closedBy.has(String(r.id));

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
    console.log(`  ${h.padEnd(5)} ${String(r.triggers).padEnd(16)} ${String(r.claim).replace(/\s+/g, " ").slice(0, 78)}`);
    if (rec) console.log(`        -> ${String(rec).replace(/\s+/g, " ").slice(0, 100)}`);
  }
  process.exit(0);
}

if (!want) {
  console.error("deposit: name a handle, e.g. S23 - or --open for the list");
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
  status: isDone(r) ? "closed" : "open",
  triggers: r.triggers,
  owner: r.owner,
  claim: r.claim,
  evidence: r.evidence,
  recommend: adviceLate.get(String(r.id)) || r.recommend || null,
  options: optsLate.get(String(r.id)) || r.options || null,
  lesson: lessonLate.get(String(r.id)) || r.lesson || null,
  run: r.run,
};

if (JSON_OUT) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`${want}  ${out.status.toUpperCase()}  [${out.dimension}]  -> ${out.triggers}`);
  console.log(`  id: ${out.id}`);
  console.log(`\n  ${String(out.claim).replace(/\s+/g, " ")}`);
  if (out.evidence) console.log(`\n  why: ${String(out.evidence).replace(/\s+/g, " ")}`);
  if (out.recommend) console.log(`\n  DO THIS: ${String(out.recommend).replace(/\s+/g, " ")}`);
  if (Array.isArray(out.options)) for (const o of out.options) console.log(`    - ${o.label}${o.why ? " - " + o.why : ""}`);
  if (out.lesson) console.log(`\n  lesson: ${String(out.lesson).replace(/\s+/g, " ")}`);
}
