/**
 * IS THIS AGENT ALIVE, AND HOW DO WE KNOW.
 *
 * UNIVERSAL. Resolves the repo it is asked about from the caller's cwd, never
 * from __dirname.
 *
 * One definition, in one place, because three copies of it had already been
 * written and a rename was about to carry all three somewhere harder to find.
 * The belt's single structural rule is that a dispatch is PROVEN FROM DISK, so
 * the function that does the proving is the last thing that should exist in
 * triplicate.
 *
 * WHAT WAS WRONG, AND IT WAS WRONG IN THE WORST POSSIBLE PLACE
 *
 * A session working in a git worktree does NOT write its transcript to the
 * repo's project directory. It writes to its own:
 *
 *   ~/.claude/projects/E--Telechurch-e2e-v2                                  <- only this was searched
 *   ~/.claude/projects/E--Telechurch-e2e-v2--claude-worktrees-<worktree>      <- where a spawned agent actually writes
 *
 * And the transcript FILENAME is a random uuid, not the session id. The old
 * check matched `filename.startsWith(sessionId.slice(0, 8))`, so for a worktree
 * session it could never match anything: measured 2026-09-12, the dispatch
 * naming `intelligent-nobel-ccd039` had its transcript at
 * `57e082d9-....jsonl`. There is no prefix in common and there never could be.
 *
 * It therefore fell through to the worktree FOLDER's mtime - which only moves
 * when a file is added or removed at the folder's top level, not when anything
 * inside it is written. Measured at the same moment: four worktree folders all
 * reading 22:02-22:26 while two of those sessions were actively working, one of
 * them having merged a pull request minutes earlier.
 *
 * So every spawned agent went invisible about thirty minutes after its folder
 * last changed, however hard it was working, and the belt then dropped it and
 * called it abandoned. A liveness test that could not observe the thing it was
 * testing, falling back to a signal that does not move - inside the check whose
 * entire job is to stop exactly that.
 *
 * THE ORDER OF EVIDENCE, best first:
 *
 *   1. a transcript in the session's OWN worktree project directory. The
 *      directory is named for the worktree and the dispatch names the worktree,
 *      so the directory IS the identification - any transcript in it counts.
 *   2. a transcript in the repo's project directory whose filename starts with
 *      the session id. This is the main-checkout case, where the session id is
 *      the uuid.
 *   3. the newest file written ANYWHERE inside the worktree. See below.
 *   4. the worktree folder's mtime. LAST RESORT AND BARELY EVIDENCE - keep
 *      reading above before trusting it. It is retained only so a session with
 *      no transcript at all is not reported as fictional.
 *
 * WHY SOURCE 3 EXISTS: QUIET MUST STOP LOOKING ABANDONED
 *
 * Operator, 2026-09-11: "build the marker heartbeat so quiet stops looking
 * abandoned."
 *
 * A background worker spawned with worktree isolation writes NO transcript -
 * measured, by spawning a probe and watching the disk. So sources 1 and 2 are
 * both blank for it, and it fell straight through to source 4, the folder mtime
 * that does not move. With unattended workers now the standing default for
 * forked work, the weakest proof this file accepts was about to become the
 * most-used one.
 *
 * THE PROPOSED FIX WAS A MARKER FILE THE WORKER TOUCHES AS IT GOES. That was
 * rejected while building it, and the reason generalises: a heartbeat the worker
 * must REMEMBER to write is a rule enforced by nothing. Every worker that forgot
 * - or crashed before its first touch, or was spawned by an older brief - would
 * be reported abandoned, and the failure would look exactly like the one being
 * fixed. Liveness must be derived from work the agent was going to do anyway.
 *
 * So source 3 asks the honest question directly: has anything in this worktree
 * been written recently? Any file the worker touches answers it, and it needs no
 * cooperation, no new convention, and no brief that mentions it.
 *
 * IT EXITS THE MOMENT IT FINDS ONE FRESH FILE. The expensive case - walking a
 * whole tree - happens only when nothing is fresh, which is exactly the case
 * where the answer is "not alive" and a slow no is affordable. A working agent
 * is usually proven in the first few directories.
 */
const fs = require("fs");
const path = require("path");

const PROJECTS = path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude/projects");

// SWALLOW ONLY THE ERROR YOU EXPECT.
//
// A bare `catch {}` around a filesystem read also catches ReferenceError,
// TypeError and every other programming mistake - and here that would report a
// working agent as DEAD, which hands its work back to incoming as abandoned.
// The honest failure is a crash: a crash is a message, and a plausible status
// is not.
//
// Written because it happened on this board's chat door: a removed constant left
// a ReferenceError inside a catch, the door reported UNOBSERVED, and the build
// succeeded. Nothing anywhere said a check had not run.
const expectedFsError = (err) =>
  !!err && ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EBUSY", "EMFILE", "ELOOP", "ENAMETOOLONG"].includes(err.code);

// A project directory is the repo's absolute path with the drive colon, the
// separators and the dots all replaced by "-".
const tokenize = (p) => p.replace(/[:\\/.]/g, "-");

// Asked from inside .claude/worktrees/<name>, the repo itself is three levels
// up. Without this a build running in a worktree would look for its siblings
// under the worktree's own token and find none of them.
function repoRootOf(root) {
  return /[\\/]\.claude[\\/]worktrees[\\/][^\\/]+$/.test(root) ? path.resolve(root, "../../..") : root;
}

// Directories that are never evidence of an agent working. node_modules alone
// is tens of thousands of files and an `npm install` would stamp all of them,
// which would report a worktree alive because a package manager ran - not
// because anybody did anything.
const NOT_EVIDENCE = new Set([
  "node_modules",
  ".git",
  ".angular",
  "dist",
  "build",
  "out",
  "coverage",
  ".cache",
  ".next",
  ".nx",
  ".turbo",
  "tmp",
  ".venv",
  "__pycache__",
]);

// Bounded so a pathological tree cannot hang the board. Both limits are
// generous for a source tree and are reported when hit, because a scan that
// gave up is a different fact from a scan that found nothing - and reporting
// the second when the first happened is this codebase's most-repeated defect.
const MAX_ENTRIES = 12000;
const MAX_DEPTH = 10;

/**
 * The newest write anywhere inside a directory, ignoring build output.
 *
 * Returns as soon as it finds a file newer than `freshAfter`, because the only
 * question being asked is whether ANYTHING is recent - not which thing is
 * newest. Callers that want a precise timestamp on a dead tree get one; callers
 * asking about a live one get an early yes.
 *
 * @returns {{at:number, file:string|null, exhausted:boolean, scanned:number}}
 */
function newestWrite(dir, freshAfter) {
  let best = 0;
  let bestFile = null;
  let scanned = 0;
  let truncated = false;
  const queue = [{ dir, depth: 0 }];

  while (queue.length) {
    const { dir: cur, depth } = queue.shift();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch (err) {
      if (!expectedFsError(err)) throw err;
      continue;
    }
    for (const e of entries) {
      if (e.isSymbolicLink()) continue; // never follow: a link out of the tree is not this worktree's work
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (NOT_EVIDENCE.has(e.name)) continue;
        if (depth < MAX_DEPTH) queue.push({ dir: full, depth: depth + 1 });
        else truncated = true;
        continue;
      }
      if (!e.isFile()) continue;
      if (++scanned > MAX_ENTRIES) {
        truncated = true;
        return { at: best, file: bestFile, exhausted: false, scanned };
      }
      let at;
      try {
        at = fs.statSync(full).mtimeMs;
      } catch (err) {
        if (!expectedFsError(err)) throw err; // vanished mid-walk is fine; a bug is not
        continue;
      }
      if (at > best) {
        best = at;
        bestFile = path.relative(dir, full);
      }
      // The early exit. One fresh file is the whole answer.
      if (at >= freshAfter) return { at: best, file: bestFile, exhausted: false, scanned };
    }
  }
  return { at: best, file: bestFile, exhausted: !truncated, scanned };
}

/**
 * @param {string} id       the dispatch's session id - a worktree name, or a uuid
 * @param {string} root     the repo (or worktree) the caller is working in
 * @param {number} aliveMs  how recently it must have written to count as alive
 */
function sessionLife(id, root, aliveMs) {
  if (!id) return null;
  const repoRoot = repoRootOf(root);
  const baseToken = tokenize(repoRoot);
  const seen = [];

  // 1 and 2 - the transcripts.
  try {
    for (const d of fs.readdirSync(PROJECTS)) {
      const own = d === `${baseToken}--claude-worktrees-${id}`;
      const base = d === baseToken;
      if (!own && !base) continue;
      const dir = path.join(PROJECTS, d);
      let files;
      try {
        files = fs.readdirSync(dir);
      } catch (err) {
        if (!expectedFsError(err)) throw err;
        continue;
      }
      for (const f of files) {
        if (!f.endsWith(".jsonl")) continue;
        // In the session's own directory the directory already identifies it.
        // In the shared one, only a filename match can.
        if (!own && !f.startsWith(String(id).slice(0, 8))) continue;
        try {
          seen.push({ where: own ? "transcript (worktree)" : "transcript", at: fs.statSync(path.join(dir, f)).mtimeMs });
        } catch (err) {
          if (!expectedFsError(err)) throw err; // vanished between listing and stat is fine; a bug is not
        }
      }
    }
  } catch (err) {
    // No projects directory on this host is expected: no evidence, not an error.
    if (!expectedFsError(err)) throw err;
  }

  // 3 and 4 - the worktree itself. Only reached when no transcript proved it,
  // which for an unattended background worker is always.
  try {
    const p = path.join(repoRoot, ".claude/worktrees", String(id));
    if (fs.existsSync(p)) {
      // 4 first because it is free, and it is the floor: a worktree that was
      // just created has no files newer than itself and would otherwise look
      // dead in the seconds before its worker's first write.
      seen.push({ where: "worktree folder", at: fs.statSync(p).mtimeMs, weak: true });

      // 3 - what the worker actually wrote.
      const w = newestWrite(p, Date.now() - aliveMs);
      if (w.at > 0) {
        seen.push({
          where: w.file ? `worktree file (${w.file})` : "worktree file",
          at: w.at,
          scanned: w.scanned,
        });
      } else if (!w.exhausted) {
        // The scan hit a limit before finding anything. That is NOT the same as
        // an empty worktree, and reporting it as no-evidence would let a bounded
        // scan masquerade as a finished one.
        seen.push({ where: "worktree scan incomplete", at: 0, weak: true, incomplete: true });
      }
    }
  } catch (err) {
    if (!expectedFsError(err)) throw err; // no worktree is fine; a bug is not
  }

  if (!seen.length) return null;
  const newest = seen.sort((a, b) => b.at - a.at)[0];
  return { ...newest, alive: Date.now() - newest.at < aliveMs };
}

module.exports = { sessionLife, repoRootOf, tokenize, newestWrite, PROJECTS, NOT_EVIDENCE };
