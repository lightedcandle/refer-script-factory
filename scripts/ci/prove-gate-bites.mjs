#!/usr/bin/env node
/**
 * PROVE THE GATE BITES - break one thing at a time and watch it fail.
 *
 *   npm run gate:prove
 *
 * A gate nobody has watched fail is not a gate, it is a green check. This repo
 * had no checks at all until 2026-09-12, which is the cheapest possible state to
 * improve on and the easiest one to replace with something worse: a job that
 * runs, passes, and checks nothing.
 *
 * Five defects, one per thing the gate claims to catch:
 *
 *   1  a half-written machine          the watcher.cjs incident, exactly
 *   2  a literal U+FEFF in a regex     the invisible character, in a live file
 *   3  a machine that throws at load   what `node --check` cannot see
 *   4  a machine nobody declared       the gate silently under-checking
 *   5  a machine that stops reporting  no crash; it just always says fine
 *
 * WHAT THIS EXERCISE ACTUALLY TAUGHT, recorded because it cost three rounds and
 * will cost them again: THREE OF THE FIRST FIVE BREAK ATTEMPTS DID NOT PROVE
 * WHAT THEY CLAIMED, and every one of them read as "the gate does not bite".
 *
 *   break 2 anchored on a string kind.cjs does not contain, so nothing was
 *           injected and the gate's PASS was correct.
 *   break 5 was appended after pulse-check.cjs had already called process.exit,
 *           so the defect was present in the file and unreachable.
 *   break 5 again, prepended, displaced the shebang - so the gate bit on `parse`
 *           and the exit-code assertion it was written to test stayed untested.
 *
 * A break test that does not verify its own break has the same shape as the
 * check-that-cannot-fail it exists to rule out. So this asserts the file changed
 * before trusting any verdict, and each case names the check it must trip - a
 * failure on a DIFFERENT check does not count.
 *
 * WHY IT REFUSES TO RUN IN THE MAIN CHECKOUT
 *
 * It edits live machines, briefly, on purpose. The scheduler reads machines off
 * disk at the moment it fires - there is no build, no deploy, no copy - so for
 * the second or two a defect is in place, a tick landing on it would run it. Run
 * this in a linked git worktree, which is what the check below enforces; pass
 * --force only in a checkout no scheduler is reading.
 */
import { writeFileSync, readFileSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const GATE = join(REPO, "scripts/ci/machines-gate.mjs");
const MACHINES = join(REPO, "machines");
const LITERAL = String.fromCharCode(0xfeff);
const FORCE = process.argv.includes("--force");

const git = (...a) => spawnSync("git", a, { cwd: REPO, encoding: "utf8" });

// A linked worktree has a git dir under <common>/worktrees/<name>; the main
// checkout's two are the same path. This is the one reliable way to tell them
// apart, and it is exactly the distinction that matters here.
const gitDir = (git("rev-parse", "--absolute-git-dir").stdout || "").trim();
const commonDir = (git("rev-parse", "--path-format=absolute", "--git-common-dir").stdout || "").trim();
const inWorktree = Boolean(gitDir) && Boolean(commonDir) && gitDir !== commonDir;

if (!inWorktree && !FORCE) {
  console.error(`refusing to run: ${REPO} looks like the main checkout, not a linked worktree.`);
  console.error("This script puts real defects into machines/ for a few seconds at a time, and the");
  console.error("scheduler reads machines off disk every five minutes. Run it in a worktree, or pass");
  console.error("--force if you are certain no scheduler is reading this tree.");
  process.exit(2);
}

// Clean before, clean after. Restoration is only verifiable against a known
// starting state, and a break test that leaves a defect behind is the worst
// possible outcome for a script whose subject goes live on save.
const dirtyAtStart = (git("status", "--porcelain", "--", "machines").stdout || "").trim();
if (dirtyAtStart && !FORCE) {
  console.error("refusing to run: machines/ has uncommitted changes, so a clean restore cannot be proved.");
  console.error(dirtyAtStart);
  process.exit(2);
}

const run = () => {
  const r = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: "utf8", timeout: 600000 });
  return { code: r.status, out: ((r.stdout || "") + (r.stderr || "")).trim() };
};

const show = (label, r, tail = 14) => {
  console.log(`\n$ node scripts/ci/machines-gate.mjs        # ${label}`);
  const lines = r.out.split("\n");
  console.log(lines.slice(-tail).join("\n"));
  console.log(`exit ${r.code}`);
};

const cases = [
  {
    name: "BREAK 1 - a half-written machine (the watcher.cjs incident)",
    file: join(MACHINES, "broken-parse.cjs"),
    make: (f) => writeFileSync(f, "const fs = require('fs');\nfunction half() {\n  if (true) {\n", "utf8"),
    undo: (f) => rmSync(f, { force: true }),
    wantCheck: "parse",
  },
  {
    name: "BREAK 2 - a literal U+FEFF inside a regex, in a live machine",
    file: join(MACHINES, "kind.cjs"),
    make: (f) => {
      copyFileSync(f, f + ".orig");
      // Prepend rather than anchor on a string. The first attempt anchored on
      // `const fs = require`, which kind.cjs does not contain - so the injection
      // silently did nothing and the gate's correct PASS read as a gate that
      // does not bite. A break test that does not verify its own break is the
      // same shape as a check that cannot fail.
      writeFileSync(f, `const BOM_TEST = /^${LITERAL}/;\n` + readFileSync(f, "utf8"), "utf8");
    },
    undo: (f) => {
      copyFileSync(f + ".orig", f);
      rmSync(f + ".orig", { force: true });
    },
    wantCheck: "bom",
  },
  {
    name: "BREAK 3 - a machine that parses but throws at runtime",
    file: join(MACHINES, "triage.cjs"),
    make: (f) => {
      copyFileSync(f, f + ".orig");
      const t = readFileSync(f, "utf8");
      writeFileSync(f, t.replace('const fs = require("fs");', 'const fs = require("fs");\nnoSuchFunction();'), "utf8");
    },
    undo: (f) => {
      copyFileSync(f + ".orig", f);
      rmSync(f + ".orig", { force: true });
    },
    wantCheck: "smoke",
  },
  {
    name: "BREAK 4 - a new machine nobody declared, so nothing would check it",
    file: join(MACHINES, "undeclared.cjs"),
    make: (f) => writeFileSync(f, "#!/usr/bin/env node\nconsole.log('I am new and unchecked');\n", "utf8"),
    undo: (f) => rmSync(f, { force: true }),
    wantCheck: "smoke",
  },
  {
    name: "BREAK 5 - a machine that still runs, but stops reporting a real fault",
    file: join(MACHINES, "pulse-check.cjs"),
    make: (f) => {
      copyFileSync(f, f + ".orig");
      // No crash, no syntax error: it just always says everything is fine. This
      // is the gate-that-passes-without-checking failure, inside a machine.
      //
      // Injected at the TOP and not appended. The first attempt appended
      // `process.exitCode = 0` to the end of the file, where pulse-check has
      // already called process.exit() - so the defect was present in the file
      // and unreachable, and the gate's PASS was again correct. Changing a file
      // is not the same as changing what it does.
      // And injected AFTER the shebang, not before it: prepending pushed
      // `#!/usr/bin/env node` to line 2, which is a syntax error, so the gate
      // bit on `parse` and the exit-code assertion still went untested. A gate
      // that fails for the wrong reason has not been proved.
      const src = readFileSync(f, "utf8").split("\n");
      src.splice(1, 0, `const __e = process.exit.bind(process); process.exit = () => __e(0);`);
      writeFileSync(f, src.join("\n"), "utf8");
    },
    undo: (f) => {
      copyFileSync(f + ".orig", f);
      rmSync(f + ".orig", { force: true });
    },
    wantCheck: "smoke",
  },
];

let allProved = true;
for (const c of cases) {
  console.log(`\n${"=".repeat(76)}\n${c.name}\n${"=".repeat(76)}`);
  const before = existsSync(c.file) ? readFileSync(c.file, "utf8") : null;
  c.make(c.file);
  const after = existsSync(c.file) ? readFileSync(c.file, "utf8") : null;
  if (before === after) {
    console.log(`  -> DEFECT WAS NOT INJECTED. ${c.file} is unchanged; this case proves nothing.`);
    allProved = false;
    c.undo(c.file);
    continue;
  }
  const broken = run();
  show("with the defect present", broken);
  const bit = broken.code !== 0 && broken.out.includes(`FAIL ${c.wantCheck}`);
  console.log(bit ? `  -> BIT, on the ${c.wantCheck} check.` : `  -> DID NOT BITE. The gate is not checking what it claims.`);
  if (!bit) allProved = false;
  c.undo(c.file);
}

console.log(`\n${"=".repeat(76)}\nDEFECTS REMOVED - the gate must go green again\n${"=".repeat(76)}`);
const clean = run();
show("clean tree", clean, 6);

for (const c of cases) if (existsSync(c.file + ".orig")) console.log(`LEFTOVER: ${c.file}.orig`);

// The tree must be exactly as it was found. Anything else means a deliberate
// defect is still sitting in a file the scheduler reads.
const dirtyAtEnd = (git("status", "--porcelain", "--", "machines").stdout || "").trim();
const restored = dirtyAtEnd === dirtyAtStart;
if (!restored) console.error(`\nNOT RESTORED - machines/ differs from how it was found:\n${dirtyAtEnd}`);

const ok = allProved && clean.code === 0 && restored;
console.log(`\n${ok ? "PROVED: every check bites for its own reason, and the gate returns to green." : "NOT PROVED."}`);
process.exit(ok ? 0 : 1);
