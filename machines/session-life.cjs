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
 *   3. the worktree folder's mtime. LAST RESORT AND BARELY EVIDENCE - keep
 *      reading above before trusting it. It is retained only so a session with
 *      no transcript at all is not reported as fictional.
 */
const fs = require("fs");
const path = require("path");

const PROJECTS = path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude/projects");

// A project directory is the repo's absolute path with the drive colon, the
// separators and the dots all replaced by "-".
const tokenize = (p) => p.replace(/[:\\/.]/g, "-");

// Asked from inside .claude/worktrees/<name>, the repo itself is three levels
// up. Without this a build running in a worktree would look for its siblings
// under the worktree's own token and find none of them.
function repoRootOf(root) {
  return /[\\/]\.claude[\\/]worktrees[\\/][^\\/]+$/.test(root) ? path.resolve(root, "../../..") : root;
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
      } catch {
        continue;
      }
      for (const f of files) {
        if (!f.endsWith(".jsonl")) continue;
        // In the session's own directory the directory already identifies it.
        // In the shared one, only a filename match can.
        if (!own && !f.startsWith(String(id).slice(0, 8))) continue;
        try {
          seen.push({ where: own ? "transcript (worktree)" : "transcript", at: fs.statSync(path.join(dir, f)).mtimeMs });
        } catch {
          /* vanished between listing and stat */
        }
      }
    }
  } catch {
    /* no projects directory on this host - not an error, just no evidence */
  }

  // 3 - the folder, and only because something is better than nothing.
  try {
    const p = path.join(repoRoot, ".claude/worktrees", String(id));
    if (fs.existsSync(p)) seen.push({ where: "worktree folder", at: fs.statSync(p).mtimeMs, weak: true });
  } catch {
    /* no worktree */
  }

  if (!seen.length) return null;
  const newest = seen.sort((a, b) => b.at - a.at)[0];
  return { ...newest, alive: Date.now() - newest.at < aliveMs };
}

module.exports = { sessionLife, repoRootOf, tokenize, PROJECTS };
