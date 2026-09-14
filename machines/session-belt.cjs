#!/usr/bin/env node
/**
 * THE SESSION BELT - the timer puts live sessions on the belt.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-14: "this chat needs to be on the belt, it's the timer's
 * job to put it there (also driven by the pulse), and set the watcher to
 * watch (also driven by the pulse). same for the spawn (subagent) - need to
 * be placed on the belt."
 *
 * Until today the board knew a session only through a deposit that NAMED it -
 * a contract with a dispatch record. A chat working in this repo with no such
 * deposit was invisible, and the operator's own session, the most active thing
 * on the host, was the case in point. But a live session IS work in the system,
 * whatever the belt has been told about it, and the belt's single structural
 * rule already says how liveness is known: from disk, from the transcript the
 * session was going to write anyway. So this machine asks that question for
 * every session in the subject repo, every beat, and writes down the answer.
 *
 *   CHAT    a transcript in the repo's own project directory
 *           ~/.claude/projects/<token>/<uuid>.jsonl
 *   AUTO    a chat whose title is a routine's (see .refer-factory/routines.json)
 *   SPAWN   a transcript in one of the repo's worktree project directories
 *           ~/.claude/projects/<token>--claude-worktrees-<name>/<uuid>.jsonl
 *           - OR, because a worker spawned with worktree isolation writes no
 *           transcript at all (session-life.cjs measured it), a worktree under
 *           <repo>/.claude/worktrees/<name> with a fresh write inside it
 *
 *   ALIVE   written inside the belt's window (30m) - has this agent walked away?
 *   ACTIVE  written inside one beat - is somebody working right now?
 *
 * The token and the window are session-life.cjs's, so this can never disagree
 * with the check that decides whether a dispatched card stays on the belt.
 *
 * IT DEPOSITS NOTHING. Not to the belt, not on a gap, not ever - same rule as
 * the pulse belt, for the same reason: at one record per beat per session the
 * belt would be a session log inside a week. It writes ONE file it owns,
 *
 *     <repo>/.claude/agent-context/sessions.json
 *
 * which the board reads to draw one card per live session and the watcher reads
 * to say whether anybody is here. Absent means this machine has never run;
 * an empty list means it ran and found nobody. Those are different facts and
 * both readers keep them apart.
 *
 *   node <factory>/machines/session-belt.cjs          list, write sessions.json
 *   node <factory>/machines/session-belt.cjs --json   machine-readable
 *   node <factory>/machines/session-belt.cjs --dry    compute, write nothing
 *
 * Exit 0 always: an empty repo is a normal, healthy state. Exit 1 only when the
 * file could not be written, because a session belt that silently stopped
 * updating is the one failure this machine must never have.
 */
const fs = require("fs");
const path = require("path");
const { tokenize, repoRootOf, PROJECTS, newestWrite } = require("./session-life.cjs");
const { discoverTriggers } = require("./triggers.cjs");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const OUT = path.join(CTX, "sessions.json");

const argv = process.argv.slice(2);
const JSON_OUT = argv.includes("--json");
const DRY = argv.includes("--dry");

const MS = { m: 6e4 };
const ALIVE_MS = 30 * MS.m; // DISPATCH_ALIVE_MS - the belt's question

// One beat, from the repo's own pulse declaration, so "active" means the same
// thing here as on the rail. A repo that declares none gets five minutes.
const durMs = (spec) => {
  const m = String(spec || "").match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  return m ? Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2].toLowerCase()] : null;
};
const ACTIVE_MS = (() => {
  try {
    const t = (discoverTriggers(ROOT) || []).find((x) => x && x.id === "pulse");
    return (t && durMs(t.every)) || 5 * MS.m;
  } catch {
    return 5 * MS.m;
  }
})();

const expectedFsError = (err) => !!err && ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EBUSY", "EMFILE", "ELOOP", "ENAMETOOLONG"].includes(err.code);

// WHAT THE SESSION IS CALLED. Operator, 2026-09-14: "I need a better name for
// the chat in the details of the processing, as nothing shows me this chat id.
// I need the chat title to be included in the processing so I can tell."
//
// The app writes the title it shows into the transcript as a `custom-title`
// line, and rewrites it when it changes - so the LAST one is the current name.
// A session never titled falls back to its first user message, which is what
// a person would call it anyway ("start the server"). Read as text and
// scanned, not parsed line by line: a transcript can be several megabytes and
// this runs every beat, so it looks for the two markers it needs and stops.
function titleOf(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  let title = null;
  const re = /"type":"custom-title"[^\n]*?"customTitle":"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(text))) title = m[1];
  if (!title) {
    const u = /"type":"user","message":\{"role":"user","content":(?:"((?:[^"\\]|\\.)*)"|\[\{"type":"text","text":"((?:[^"\\]|\\.)*)")/.exec(text);
    if (u) title = u[1] || u[2] || null;
  }
  if (!title) return null;
  try {
    title = JSON.parse(`"${title}"`);
  } catch {
    /* keep the raw text */
  }
  return title.replace(/\s+/g, " ").trim().slice(0, 120) || null;
}

// WHICH SESSIONS ARE ROUTINES, NOT PEOPLE. Operator, 2026-09-14: "if the
// living factory pulse is what it is then it's showing a chat icon, not the
// pulse icon." A routine's run is stamped in its transcript exactly like a
// human chat - origin human, entrypoint claude-desktop - so the only honest
// key is the title the app gives the run, which is the task's title verbatim.
// Those titles are in <factory>/.refer-factory/routines.json; a session whose
// title matches one is the factory's own hand (kind "auto"), and a routine of
// kind "pulse" makes its run the pulse. No file, no routines: every session
// reads as what its transcript says, a chat.
const ROUTINES = (() => {
  try {
    const p = path.resolve(__dirname, "..", ".refer-factory", "routines.json");
    // A BOM is stripped by code point, not by a regex literal: the gate forbids
    // the literal character in a parsed file, and the escape form was written
    // as the character itself the first time. This needs neither.
    const raw = fs.readFileSync(p, "utf8");
    const j = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
    return Array.isArray(j.routines) ? j.routines.filter((r) => r && r.title) : [];
  } catch {
    return [];
  }
})();
const routineOf = (title) => (title ? ROUTINES.find((r) => r.title === title) || null : null);

const now = Date.now();
const base = tokenize(repoRootOf(ROOT));
const sessions = [];
let seen = false;
try {
  const dirs = fs.readdirSync(PROJECTS, { withFileTypes: true });
  seen = true;
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    let kind = null;
    let worktree = null;
    if (d.name === base) kind = "chat";
    else if (d.name.startsWith(`${base}--claude-worktrees-`)) {
      kind = "spawn";
      worktree = d.name.slice(`${base}--claude-worktrees-`.length);
    } else continue;
    let files;
    try {
      files = fs.readdirSync(path.join(PROJECTS, d.name));
    } catch (err) {
      if (expectedFsError(err)) continue;
      throw err;
    }
    for (const f of files) {
      if (!f.endsWith(".jsonl")) continue;
      let st;
      try {
        st = fs.statSync(path.join(PROJECTS, d.name, f));
      } catch (err) {
        if (expectedFsError(err)) continue;
        throw err;
      }
      const age = now - st.mtimeMs;
      if (age >= ALIVE_MS) continue;
      const id = f.slice(0, -".jsonl".length);
      const title = titleOf(path.join(PROJECTS, d.name, f));
      const routine = kind === "chat" ? routineOf(title) : null;
      sessions.push({
        id,
        short: id.slice(0, 8),
        // A routine's run is the factory's own hand, not a person: auto.
        kind: routine ? "auto" : kind,
        role: routine && routine.kind === "pulse" ? "pulse" : null,
        routine: routine ? routine.id : null,
        worktree,
        title,
        lastWrite: new Date(st.mtimeMs).toISOString(),
        ageMs: Math.round(age),
        active: age < ACTIVE_MS,
        bytes: st.size,
        transcript: path.join(PROJECTS, d.name, f).replace(/\\/g, "/"),
      });
    }
  }
} catch (err) {
  if (!expectedFsError(err)) throw err;
  seen = false;
}
// SPAWNED WORKERS WRITE NO TRANSCRIPT. session-life.cjs measured it: an agent
// spawned with worktree isolation leaves nothing under ~/.claude/projects, so
// the scan above cannot see it - and on 2026-09-14 four such agents were
// working in this repo while the belt showed one chat. Its evidence is the
// one session-life accepts as source 3: anything written inside the worktree
// recently. So every worktree under <repo>/.claude/worktrees that a
// transcript has not already claimed is asked that question with the same
// helper, and a fresh write makes it a live spawn. The id is the worktree's
// name, which is what a dispatch names too, so a card here and a dispatched
// card can be matched by eye.
const WORKTREES = path.join(repoRootOf(ROOT), ".claude", "worktrees");
const claimed = new Set(sessions.filter((s) => s.worktree).map((s) => s.worktree));
try {
  for (const d of fs.readdirSync(WORKTREES, { withFileTypes: true })) {
    if (!d.isDirectory() || claimed.has(d.name)) continue;
    const dir = path.join(WORKTREES, d.name);
    const w = newestWrite(dir, now - ALIVE_MS);
    if (!w || !w.at || now - w.at >= ALIVE_MS) continue;
    const age = now - w.at;
    sessions.push({
      id: `worktree:${d.name}`,
      short: d.name.replace(/^agent-/, "").slice(0, 8),
      kind: "spawn",
      role: null,
      routine: null,
      worktree: d.name,
      title: null,
      lastWrite: new Date(w.at).toISOString(),
      ageMs: Math.round(age),
      active: age < ACTIVE_MS,
      bytes: null,
      transcript: null,
      evidence: `newest write inside the worktree: ${String(w.file || "").replace(/\\/g, "/")}`,
    });
  }
} catch (err) {
  if (!expectedFsError(err)) throw err;
  /* no worktree directory: this repo has spawned nothing */
}

sessions.sort((a, b) => a.ageMs - b.ageMs);

const counts = {
  chat: sessions.filter((s) => s.kind === "chat").length,
  auto: sessions.filter((s) => s.kind === "auto").length,
  spawn: sessions.filter((s) => s.kind === "spawn").length,
  active: sessions.filter((s) => s.active).length,
};

const report = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(repoRootOf(ROOT)),
  base,
  store: PROJECTS.replace(/\\/g, "/"),
  seen,
  aliveMs: ALIVE_MS,
  activeMs: ACTIVE_MS,
  counts,
  sessions,
  dry: DRY,
};

let writeError = null;
if (!DRY) {
  try {
    fs.mkdirSync(CTX, { recursive: true });
    // Temp plus rename: the board reads this on its own clock and must never
    // see a torn file, which would look like every session having left.
    const tmp = `${OUT}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2) + "\n", "utf8");
    fs.renameSync(tmp, OUT);
  } catch (err) {
    writeError = `${err.code || "error"}: ${err.message}`;
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ ...report, writeError }, null, 2));
} else {
  console.log(`session-belt: ${sessions.length} alive in ${report.repo} (${counts.chat} chat, ${counts.auto} routine, ${counts.spawn} spawn; ${counts.active} active inside ${ACTIVE_MS / MS.m}m)${seen ? "" : " - transcript store not readable"}`);
  for (const s of sessions) {
    const age = Math.round(s.ageMs / MS.m);
    console.log(`  ${s.kind.padEnd(5)} ${s.short}  ${age}m ago${s.active ? "  ACTIVE" : ""}${s.role === "pulse" ? "  PULSE" : ""}${s.routine ? `  routine:${s.routine}` : ""}${s.worktree ? `  (${s.worktree})` : ""}${s.title ? `  "${s.title}"` : ""}`);
  }
  if (!DRY && !writeError) console.log(`  wrote ${path.relative(ROOT, OUT).replace(/\\/g, "/")}`);
  if (DRY) console.log("  (--dry: nothing written)");
}

if (writeError) {
  console.error(`session-belt: could not write ${OUT} - ${writeError}`);
  process.exit(1);
}
