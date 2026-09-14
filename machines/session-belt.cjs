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
 *   SPAWN   a transcript in one of the repo's worktree project directories
 *           ~/.claude/projects/<token>--claude-worktrees-<name>/<uuid>.jsonl
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
const { tokenize, repoRootOf, PROJECTS } = require("./session-life.cjs");
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
      sessions.push({
        id,
        short: id.slice(0, 8),
        kind,
        worktree,
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
sessions.sort((a, b) => a.ageMs - b.ageMs);

const counts = {
  chat: sessions.filter((s) => s.kind === "chat").length,
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
  console.log(`session-belt: ${sessions.length} alive in ${report.repo} (${counts.chat} chat, ${counts.spawn} spawn; ${counts.active} active inside ${ACTIVE_MS / MS.m}m)${seen ? "" : " - transcript store not readable"}`);
  for (const s of sessions) {
    const age = Math.round(s.ageMs / MS.m);
    console.log(`  ${s.kind.padEnd(5)} ${s.short}  ${age}m ago${s.active ? "  ACTIVE" : ""}${s.worktree ? `  (${s.worktree})` : ""}`);
  }
  if (!DRY && !writeError) console.log(`  wrote ${path.relative(ROOT, OUT).replace(/\\/g, "/")}`);
  if (DRY) console.log("  (--dry: nothing written)");
}

if (writeError) {
  console.error(`session-belt: could not write ${OUT} - ${writeError}`);
  process.exit(1);
}
