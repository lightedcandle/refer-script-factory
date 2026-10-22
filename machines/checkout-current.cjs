#!/usr/bin/env node
/**
 * CHECKOUT CURRENT - the checkout the scheduler reads is kept at main, or says
 * out loud why it cannot be.
 *
 * WHY THIS EXISTS (Telechurch shelf T314, PLAN-LEARNING-001, 2026-10-19).
 *
 * The scheduler discovers triggers by reading the subject repo's WORKING TREE,
 * and runs each machine as it stands on disk there. There is no deploy step:
 * merged is not armed, on disk is armed. Telechurch's shared checkout
 * (E:/Telechurch-e2e-v2) sat detached 375 commits behind main for weeks, dirty
 * with other sessions' files, and nothing moved it, because moving a shared
 * dirty tree by hand is a thing nobody can do blind. So:
 *
 *   - the fuel log's trigger was on disk as an untracked copy, and was skipped
 *     every tick for ten days ("its machine is not tracked in this checkout");
 *   - five stations merged on 2026-10-19 (corpus-scorecard, blueprint-build,
 *     apostle-battery, apostle-review, apostle-reality) were not on disk at all,
 *     so they were never even discovered - an absent trigger is
 *     indistinguishable from a healthy one.
 *
 * The factory's own live tree had the same shape the other way round: eleven
 * local commits that never reached origin, so it could not take three merged
 * fixes by fast-forward.
 *
 * WHAT IT DOES, every run:
 *
 *   1. Fetch the base branch (main) from origin. No window, no prompt.
 *   2. Decide whether the checkout MAY move. It may when HEAD is detached, or on
 *      the base branch itself, and HEAD is an ancestor of origin's base - a pure
 *      fast-forward. It REFUSES when the checkout is parked on any other branch
 *      (that branch is somebody's), when HEAD has commits origin does not
 *      (unpushed work - land it first), or when somebody has staged a change
 *      the move would not carry (they are mid-commit).
 *   3. Move it WITHOUT TOUCHING ANYBODY'S WORK. For every file that changed
 *      between HEAD and origin's base:
 *        clean here        -> take main's version
 *        already main's    -> nothing to do
 *        changed here      -> three-way merge when the merge is clean, so the
 *                             local change and main's both survive; otherwise
 *                             HELD exactly as it is on disk, and named
 *        a live belt file  -> always HELD (append-only, many writers, never
 *                             rewritten by anything but its own door)
 *      Untracked files are never deleted or overwritten unless they are already
 *      byte-identical to what main holds.
 *   4. Write the result to .claude/agent-context/checkout-current.json and say
 *      it in one line. A refusal exits 2 and puts ONE record a day per reason
 *      on the belt, through the deposit door, so a stuck checkout is a card on
 *      the board instead of a station quietly never running.
 *
 * WHAT IT DOES NOT DO: commit, stash, reset --hard, clean, delete an untracked
 * file, switch a branch, or push. A held file stays different from main until
 * whoever changed it lands or drops their change; the report names it.
 *
 *   node <factory>/machines/checkout-current.cjs            move if it may
 *   node <factory>/machines/checkout-current.cjs --dry      say what it would do
 *   node <factory>/machines/checkout-current.cjs --root <repo> [--base main]
 *
 * Exit: 0 current or moved; 2 refused (named, recorded, deposited); 1 broken.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const argv = process.argv.slice(2);
const valueOf = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : null;
};
const DRY = argv.includes("--dry");
const ROOT = path.resolve(valueOf("--root") || process.cwd());
const BASE = valueOf("--base") || "main";
const REMOTE = "origin";
const TARGET = `${REMOTE}/${BASE}`;
const CTX = path.join(ROOT, ".claude/agent-context");
const STATUS = path.join(CTX, "checkout-current.json");

// Live state with many writers, appended to by machines every few minutes. A
// read-merge-write on these would lose any line appended inside the window, so
// they are held whatever the merge would say. Main's copy of the belt is a
// snapshot; the checkout's copy is the belt.
const ALWAYS_HOLD = [/^\.claude\/agent-context\/[^/]*\.jsonl$/, /^\.refer-factory\/[^/]*\.jsonl$/];

// No credential window and no prompt may ever come out of an unattended tick.
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never", GIT_ASKPASS: "", SSH_ASKPASS: "" };

function git(args, opts = {}) {
  const r = spawnSync("git", args, {
    cwd: ROOT,
    encoding: opts.encoding === null ? null : "utf8",
    input: opts.input,
    env: GIT_ENV,
    windowsHide: true,
    timeout: opts.timeout || 120000,
    maxBuffer: 1 << 30,
  });
  if (r.error) throw new Error(`git ${args[0]} could not run - ${r.error.message}`);
  if (r.status !== 0 && !opts.allowFail) {
    throw new Error(`git ${args.join(" ")} exited ${r.status}: ${String(r.stderr || "").trim().split("\n")[0]}`);
  }
  return r;
}
const out = (args, opts) => String(git(args, opts).stdout || "").trim();
// NUL-separated output, NOT trimmed: a porcelain line starts with a space when
// only the work tree changed, and trimming the first one shifts its path by a
// character - which read the live belt as clean and took main's copy over it
// on the first scratch run.
const z = (args, opts) => String(git(args, opts).stdout || "").split("\0").filter(Boolean);

const report = {
  checkedAt: new Date().toISOString(),
  repo: path.basename(ROOT),
  root: ROOT.replace(/\\/g, "/"),
  target: TARGET,
  dry: DRY,
  state: null, // current | moved | would-move | refused | fetch-failed
  reason: null,
  head: null,
  headWas: null,
  targetCommit: null,
  behind: null,
  taken: 0,
  deleted: 0,
  merged: [],
  held: [],
  heldStations: [],
};

function finish(code, line) {
  if (!DRY) {
    try {
      fs.mkdirSync(CTX, { recursive: true });
      fs.writeFileSync(STATUS, JSON.stringify(report, null, 2) + "\n");
    } catch (err) {
      console.error(`checkout-current: could not write ${STATUS} - ${err.message}`);
    }
  }
  console.log(`checkout-current: ${line}`);
  if (report.merged.length) console.log(`  merged (local change and main's both kept): ${report.merged.join(", ")}`);
  if (report.held.length) {
    const shown = report.held.slice(0, 12).map((h) => `${h.path} (${h.why})`);
    console.log(`  held as they are (${report.held.length}): ${shown.join("; ")}${report.held.length > 12 ? "; ..." : ""}`);
  }
  if (report.heldStations.length) {
    console.log(`  STATIONS HELD BEHIND MAIN - the scheduler will skip or run an old copy: ${report.heldStations.join(", ")}`);
  }
  if (code === 2 && !DRY) depositRefusal();
  process.exit(code);
}

function refuse(reason) {
  report.state = "refused";
  report.reason = reason;
  finish(2, `REFUSED - ${reason}`);
}

// One card a day per reason, through the door, so a stuck checkout reaches the
// board without becoming ninety-six cards a day.
function depositRefusal() {
  try {
    const { deposit } = require("./deposit.cjs");
    const day = report.checkedAt.slice(0, 10).replace(/-/g, "");
    const key = String(report.reason).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48).replace(/-+$/, "");
    const res = deposit(
      {
        id: `checkout-current-refused-${key}-${day}`,
        run: report.checkedAt,
        driver: "checkout-current",
        tier: 2,
        dimension: "architecture",
        kind: "note",
        subject: `checkout: ${report.root}`,
        claim:
          `The checkout the scheduler reads (${report.root}) is ${report.behind == null ? "not known to be current" : `${report.behind} commit(s) behind ${TARGET}`} and was not moved: ${report.reason}. ` +
          `Until it moves, any station merged since is not on disk here, so it is never discovered or is skipped.`,
        seen: true,
        confidence: "measured",
        triggers: "contract:architecture",
      },
      { root: ROOT },
    );
    if (res.written) console.log(`  deposited ${res.id}`);
  } catch (err) {
    console.error(`  could not deposit the refusal - ${err.message}`);
  }
}

// ---- 1. where are we, and where is main ------------------------------------

try {
  out(["rev-parse", "--git-dir"]);
} catch (err) {
  console.error(`checkout-current: ${ROOT} is not a git checkout - ${err.message}`);
  process.exit(1);
}

const fetched = git(["fetch", "--quiet", REMOTE, BASE], { allowFail: true, timeout: 90000 });
if (fetched.status !== 0) {
  // A network blip is not a refusal and must not tighten anything; it is
  // recorded and the next run tries again against what origin was last seen as.
  report.state = "fetch-failed";
  report.reason = String(fetched.stderr || "").trim().split("\n")[0] || `exit ${fetched.status}`;
  console.log(`checkout-current: could not fetch ${TARGET} (${report.reason}) - judging against the last fetched copy`);
}

const head = out(["rev-parse", "HEAD"]);
const target = out(["rev-parse", TARGET]);
const branch = out(["symbolic-ref", "-q", "--short", "HEAD"], { allowFail: true });
report.head = head;
report.headWas = head;
report.targetCommit = target;
report.behind = Number(out(["rev-list", "--count", `${head}..${target}`]));
const ahead = Number(out(["rev-list", "--count", `${target}..${head}`]));

if (branch && branch !== BASE) {
  refuse(`it is parked on branch ${branch}, which belongs to whoever made it - the checkout the scheduler reads should sit on ${BASE} or detached at it`);
}
if (ahead > 0) {
  const subjects = out(["log", "--format=%h %s", "-5", `${target}..${head}`]).split("\n").join(" | ");
  refuse(`it holds ${ahead} commit(s) ${TARGET} does not (${subjects}) - land them through a pull request, then it fast-forwards`);
}
if (report.behind === 0) {
  report.state = report.state === "fetch-failed" ? "fetch-failed" : "current";
  finish(0, `current at ${head.slice(0, 8)} (${TARGET})${report.state === "fetch-failed" ? " as last fetched" : ""}`);
}

// ---- 2. what would move, and what is somebody's ----------------------------

// Files that differ between HEAD and main, with what main does to each.
const changes = new Map(); // path -> "A" | "M" | "D" | "T"
{
  const parts = z(["diff", "--name-status", "--no-renames", "-z", head, target]);
  for (let i = 0; i + 1 < parts.length; i += 2) changes.set(parts[i + 1], parts[i][0]);
}

// Somebody mid-commit: a staged change whose staged content is not what main
// holds would be lost when the index moves to main.
{
  const staged = z(["diff", "--cached", "--name-only", "-z", head]);
  const lost = [];
  for (const p of staged) {
    const s = out(["ls-files", "-s", "--", p]).split(/\s+/)[1] || null;
    const m = out(["rev-parse", "-q", "--verify", `${target}:${p}`], { allowFail: true }) || null;
    if (s === m) continue;
    // Staged content main already committed at some point is landed work left
    // in the index, not somebody mid-commit. Telechurch's checkout carried one
    // from 2026-10-09: a hook staged at the version #832 merged, then saved on
    // to main's later one, and never unstaged.
    if (s && out(["log", "-1", "--format=%h", `--find-object=${s}`, target, "--", p], { allowFail: true })) continue;
    lost.push(p);
  }
  if (lost.length) refuse(`somebody has staged changes in this checkout that main does not hold (${lost.slice(0, 6).join(", ")}${lost.length > 6 ? ", ..." : ""}) - they are mid-commit here`);
}

// Both trees read ONCE each. Asking git per file cost three process starts per
// changed path, which on Telechurch's 375-commit gap ran past six minutes - and
// the scheduler gives a whole repo's tick four.
function treeOf(rev) {
  const map = new Map(); // path -> { mode, blob }
  for (const entry of z(["ls-tree", "-r", "-z", "--full-tree", rev])) {
    const tab = entry.indexOf("\t");
    const [mode, , blob] = entry.slice(0, tab).split(" ");
    map.set(entry.slice(tab + 1), { mode, blob });
  }
  return map;
}
const HEAD_TREE = treeOf(head);
const MAIN_TREE = treeOf(target);
const blobOf = (rev, p) => ((rev === head ? HEAD_TREE : MAIN_TREE).get(p) || {}).blob || null;
const modeOf = (rev, p) => ((rev === head ? HEAD_TREE : MAIN_TREE).get(p) || {}).mode || null;

// What is dirty here, relative to HEAD. Tracked changes come from status;
// untracked files are found by asking the disk about exactly the paths main
// would add, rather than listing every untracked file in a tree that keeps
// whole worktrees and rescue folders inside it.
const dirty = new Map(); // path -> porcelain XY
{
  const parts = z(["status", "--porcelain=v1", "-z", "--untracked-files=no", "--no-renames"]);
  for (const p of parts) dirty.set(p.slice(3), p.slice(0, 2));
  for (const p of changes.keys()) {
    if (!HEAD_TREE.has(p) && !dirty.has(p) && fs.existsSync(path.join(ROOT, p))) dirty.set(p, "??");
  }
}
// The file on disk as git would store it (line endings and filters applied), so
// it compares equal to a blob when the content is the same.
const workBlob = (p, write) => (fs.existsSync(path.join(ROOT, p)) ? out(["hash-object", ...(write ? ["-w"] : []), "--", p]) : null);
const isStation = (p) => /^(tools|tools\/factory|scripts|machines|engine)\//.test(p) && /\.(cjs|mjs|js|json)$/.test(p);

const take = []; // clean here: write main's version
const remove = []; // clean here, main deleted it
const mergeFiles = []; // { p, text }
for (const [p, op] of changes) {
  const mainBlob = op === "D" ? null : blobOf(target, p);
  if (!dirty.has(p)) {
    if ((op === "D" ? null : modeOf(target, p)) === "160000" || modeOf(head, p) === "160000") {
      report.held.push({ path: p, why: "a submodule pointer - not moved by this machine" });
    } else if (op === "D") remove.push(p);
    else take.push(p);
    continue;
  }
  // Changed here, or untracked here. Already main's? Then the move costs nothing.
  const w = workBlob(p);
  if (w === mainBlob) continue;
  if (ALWAYS_HOLD.some((re) => re.test(p))) {
    report.held.push({ path: p, why: "live append-only state, never rewritten" });
    continue;
  }
  const xy = dirty.get(p);
  const baseBlob = blobOf(head, p);
  if (xy === "??" || !w || !baseBlob || !mainBlob) {
    report.held.push({ path: p, why: xy === "??" ? "untracked here and different from main" : "deleted on one side and changed on the other" });
    continue;
  }
  // Three-way: base = HEAD, ours = the file on disk, theirs = main. All three
  // in their stored form (ours is hashed in with filters applied), so a
  // checkout with CRLF on disk does not read as every line changed; the result
  // goes back out through the same filters a checkout would use.
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "checkout-current-"));
  try {
    const files = { ours: workBlob(p, true), base: baseBlob, theirs: mainBlob };
    for (const [name, blob] of Object.entries(files)) fs.writeFileSync(path.join(tmp, name), git(["cat-file", "blob", blob], { encoding: null }).stdout);
    const r = git(["merge-file", "-p", path.join(tmp, "ours"), path.join(tmp, "base"), path.join(tmp, "theirs")], { allowFail: true, encoding: null });
    if (r.status === 0) {
      const merged = out(["hash-object", "-w", "--stdin", "--no-filters"], { input: r.stdout });
      const text = git(["cat-file", "--filters", `--path=${p}`, merged], { encoding: null }).stdout;
      mergeFiles.push({ p, text, before: w });
    } else report.held.push({ path: p, why: r.status > 0 ? "changed here and on main, and the two overlap" : "could not be merged" });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
report.heldStations = report.held.filter((h) => isStation(h.path)).map((h) => h.path);

if (DRY) {
  report.state = "would-move";
  report.taken = take.length;
  report.deleted = remove.length;
  report.merged = mergeFiles.map((m) => m.p);
  finish(0, `would move ${head.slice(0, 8)} -> ${target.slice(0, 8)} (${report.behind} behind): take ${take.length}, delete ${remove.length}, merge ${mergeFiles.length}, hold ${report.held.length}`);
}

// ---- 3. move ----------------------------------------------------------------

// Re-check cleanliness immediately before writing, so a file somebody saved
// while this ran is held, not overwritten.
{
  const now = new Set(z(["status", "--porcelain=v1", "-z", "--untracked-files=no", "--no-renames"]).map((p) => p.slice(3)));
  for (const p of take) if (!HEAD_TREE.has(p) && fs.existsSync(path.join(ROOT, p))) now.add(p);
  for (const list of [take, remove]) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (now.has(list[i])) {
        report.held.push({ path: list[i], why: "changed while this ran" });
        list.splice(i, 1);
      }
    }
  }
}

// HEAD (and the branch, when on the base branch) and the index move to main;
// the working tree is not touched by this step. A mixed reset keeps the stat
// cache for every entry that did not change, so it is quick on a large tree.
// Index first, then the ref, so a failure on the ref (somebody holding its
// lock) can put the index back before anything on disk has been written.
// read-tree with one tree keeps the stat cache for every unchanged entry.
out(["read-tree", "--reset", target]);
try {
  if (branch === BASE) out(["update-ref", "-m", "checkout-current: fast-forward", `refs/heads/${BASE}`, target, head]);
  else out(["update-ref", "--no-deref", "-m", "checkout-current: fast-forward", "HEAD", target, head]);
} catch (err) {
  git(["read-tree", "--reset", head], { allowFail: true });
  console.error(`checkout-current: could not move HEAD (${err.message}) - index put back, nothing on disk touched`);
  process.exit(1);
}

// Main's version of every file that was clean here, written from the index so
// line endings and filters are applied exactly as a checkout would.
if (take.length) {
  git(["checkout-index", "-f", "-u", "-z", "--stdin"], { input: take.join("\0") + "\0" });
}
for (const p of remove) {
  try {
    fs.unlinkSync(path.join(ROOT, p));
  } catch {
    /* already gone */
  }
}
// The merged files: written only if nobody changed them since they were read.
for (const m of mergeFiles) {
  if (workBlob(m.p) !== m.before) {
    report.held.push({ path: m.p, why: "changed while this ran" });
    continue;
  }
  fs.writeFileSync(path.join(ROOT, m.p), m.text);
  report.merged.push(m.p);
}
git(["update-index", "-q", "--refresh"], { allowFail: true });

report.head = out(["rev-parse", "HEAD"]);
report.taken = take.length;
report.deleted = remove.length;
report.heldStations = report.held.filter((h) => isStation(h.path)).map((h) => h.path);
report.state = "moved";
finish(0, `moved ${head.slice(0, 8)} -> ${report.head.slice(0, 8)} (${report.behind} commit(s)): took ${take.length}, deleted ${remove.length}, merged ${report.merged.length}, held ${report.held.length}`);
