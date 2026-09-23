#!/usr/bin/env node
/**
 * GATE: nothing the factory starts may put a window on the operator's screen.
 *
 * Operator, 2026-09-15: "the node pulse pop-up window is intrusive, can it run
 * in background or stay in system tray."
 *
 * Operator, 2026-09-22, about the dispatched agents: "I'm getting intrusive
 * popups on my desktop: can we silence them or background run them, and make it
 * a rule that this is how we deal with automated processes."
 *
 * The same complaint, seven days apart, on two different launchers. The rule
 * existed after the first one and was written in a comment beside the thing it
 * fixed, where nobody writing the NEXT launcher would ever read it. That is the
 * failure this file corrects: the rule is now a check that runs.
 *
 * THE RULE. Every call that starts a process - spawn, spawnSync, exec, execSync,
 * execFile, execFileSync - carries `windowsHide: true`. On Windows a console
 * program started in an interactive session gets a console window, and
 * `detached: true` guarantees one because it means DETACHED_PROCESS, which
 * denies the child its parent's console so it opens its own.
 *
 * WHAT windowsHide CANNOT DO, learned the hard way on the agent dispatch: it
 * applies to the process being started, and not to a process that one starts in
 * turn. `cmd.exe /c claude` hidden still showed a window, because the claude
 * launcher opens a console of its own. Start the real executable directly.
 * This gate cannot see that case - it reads a call, not a process tree - so the
 * measurement that settles it is the one the fix was proven with: compare the
 * set of windowed processes before and after, and read the answer off the
 * desktop rather than off the flag.
 *
 *   node <factory>/machines/gate-no-window.cjs          check
 *   node <factory>/machines/gate-no-window.cjs --json   machine-readable
 *
 * Exit 1 when a launcher is missing the flag.
 */
const fs = require("fs");
const path = require("path");

const FACTORY = path.resolve(__dirname, "..");
const JSON_OUT = process.argv.includes("--json");

// IT SCANNED HALF THE MACHINES AND REPORTED THE FACTORY CLEAN.
//
// The first version looked only at the factory's own engine and machines, and
// passed - while the repo it was running IN held forty more factory scripts,
// several of which spawn processes by the dozen. One of them, the gate that
// proves the auto door still obeys its list, says so in its own registration:
// "each run spawns about a dozen short node processes", every six hours. The
// operator was still getting popups after the fix, and the gate that was meant
// to have caught them was looking somewhere else.
//
// A rule that applies to the factory applies wherever the factory's work runs.
// Both roots now, and a directory that does not exist is skipped in silence
// rather than reported, because most repos have no tools/factory.
// SCOPED TO WHAT THE CLOCK RUNS, and deliberately not to every script in the
// repo. Scanning all of tools/ found 79 launchers, most of them in scripts a
// person runs in a terminal they are already looking at - where a console is
// the point, not a defect. Demanding the flag there would bury the twenty-odd
// that actually matter, and a gate nobody can act on gets muted. The rule is
// about AUTOMATED processes: the factory's own machines, and the stations this
// repo registers on the clock.
const ROOTS = [
  { base: FACTORY, dirs: ["engine", "machines"] },
  { base: process.cwd(), dirs: ["tools/factory"] },
];

const STARTERS = /\b(spawnSync|spawn|execFileSync|execFile|execSync|exec)\s*\(/g;

// From the opening paren, walk to its match so the whole call is examined and
// only the whole call - a nested call's options must not be read as this one's.
// Quotes and template literals are skipped, because a paren inside a string is
// not a paren. This is the same lesson as the comment stripper that ate a third
// of a component: a scanner that does not know what is quoted is not a scanner.
function callText(src, openIdx) {
  let depth = 0;
  let quote = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return src.slice(openIdx, i + 1);
    }
  }
  return src.slice(openIdx);
}

const offenders = [];
let checked = 0;
const seenFiles = new Set();
for (const { base, dirs } of ROOTS)
  for (const dir of dirs) {
  const d = path.join(base, dir);
  let entries = [];
  try {
    entries = fs.readdirSync(d);
  } catch {
    continue;
  }
  for (const name of entries) {
    if (!/\.(cjs|mjs|js)$/.test(name)) continue;
    if (name === path.basename(__filename)) continue;
    // A throwaway probe an agent left behind is not a launcher anybody runs.
    // Named rather than inferred, so a real file cannot hide behind the suffix.
    if (/\.tmp\.(cjs|mjs|js)$/.test(name)) continue;
    const file = path.join(d, name);
    if (seenFiles.has(file)) continue;
    seenFiles.add(file);
    const src = fs.readFileSync(file, "utf8");
    STARTERS.lastIndex = 0;
    let m;
    while ((m = STARTERS.exec(src))) {
      const open = src.indexOf("(", m.index);
      if (open < 0) continue;
      // A mention inside a comment is not a call. Cheap test, and the only one
      // that matters here: these files carry long explanatory comments that name
      // spawn() constantly.
      const lineStart = src.lastIndexOf("\n", m.index) + 1;
      const before = src.slice(lineStart, m.index);
      if (/^\s*(\/\/|\*|\/\*)/.test(before)) continue;
      // `exec` IS NOT ALWAYS A PROCESS. RegExp.prototype.exec shares the name,
      // and the first run of this gate reported five of them as unguarded
      // launchers - a gate that cries wolf gets muted, which is worse than no
      // gate. A method call only counts when the receiver is child_process
      // itself; a bare call always counts.
      const head = src.slice(Math.max(0, m.index - 60), m.index);
      if (/\.\s*$/.test(head)) {
        // A method call. It counts only when the receiver is named
        // child_process - and a regex LITERAL has no name at all, which is the
        // shape three of the five false positives took: /pattern/.exec(text).
        const recv = /([A-Za-z_$][\w$]*)\s*\.\s*$/.exec(head);
        if (!recv || !/^(child_process|cp|proc)$/.test(recv[1])) continue;
      }
      const text = callText(src, open);
      checked++;
      if (/windowsHide\s*:\s*true/.test(text)) continue;
      // ONE DELIBERATE WINDOW EXISTS, and a rule with no way to say so would
      // either hide it - breaking the one thing it does - or fail forever,
      // which is how a gate gets muted. `window: intentional` in the five lines
      // above the call exempts it, and the phrase is deliberately one nobody
      // types by accident. The emergency reboot prompt is the only user of it:
      // a dialog that asks the operator whether to restart his machine must be
      // seen, and it is started by him being asked, not by a clock.
      const preamble = src.slice(Math.max(0, src.lastIndexOf("\n", m.index) - 400), m.index);
      if (/window:\s*intentional/.test(preamble)) continue;
      offenders.push({
        file: `${base === FACTORY ? "factory" : "repo"}:${dir}/${name}`,
        line: src.slice(0, m.index).split("\n").length,
        call: m[1],
        excerpt: text.replace(/\s+/g, " ").slice(0, 120),
      });
    }
  }
}

// A GATE WHOSE ONLY VOICE IS AN EXIT CODE IS A GATE NOBODY HEARS. Nothing in
// this factory reads the exit codes the scheduler records - that is itself on
// the belt - so a finding here goes where findings go, deduplicated by day so a
// standing offence cannot bury the conveyor it is trying to warn.
let deposited = 0;
if (offenders.length) {
  const BELT = path.join(process.cwd(), ".claude/agent-context/findings.jsonl");
  try {
    if (fs.existsSync(BELT)) {
      const id = `no-window-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
      if (!fs.readFileSync(BELT, "utf8").includes(`"${id}"`)) {
        fs.appendFileSync(
          BELT,
          JSON.stringify({
            id,
            run: new Date().toISOString(),
            driver: "I930",
            tier: 2,
            kind: "deposit",
            dimension: "architecture",
            source: "gate-no-window",
            subject: "the factory's launchers",
            claim: `${offenders.length} launcher(s) can put a console window on the operator's desktop.`,
            evidence:
              offenders.map((o) => `${o.file}:${o.line} ${o.call}()`).join("; ") +
              ". The rule is his, twice: 2026-09-15 about the pulse window and 2026-09-22 about the dispatched agents.",
            recommend:
              "Add windowsHide: true. If the thing being started is itself a launcher - a .cmd shim, or cmd.exe wrapping something else - the flag is not enough; start the real executable directly and prove it by comparing the windowed processes before and after.",
            seen: true,
            confidence: "measured",
            triggers: "contract:architecture",
            owner: "architecture",
          }) + "\n",
          "utf8",
        );
        deposited = 1;
      }
    }
  } catch {
    /* the console still says it, and the exit code still fails */
  }
}

const report = { checkedAt: new Date().toISOString(), launchers: checked, offenders, deposited };
if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`gate-no-window: ${checked} launcher(s) examined, ${offenders.length} missing windowsHide`);
  for (const o of offenders) {
    console.log(`     ${o.file}:${o.line}  ${o.call}(  ${o.excerpt}`);
  }
  if (offenders.length) {
    console.log(
      "\n  Add windowsHide: true to the options. If the thing being started is itself\n" +
        "  a launcher (a .cmd shim, or cmd.exe wrapping something else), the flag will\n" +
        "  not be enough - start the real executable directly and prove it by looking\n" +
        "  at the desktop, not at the flag.",
    );
  }
}
process.exit(offenders.length ? 1 : 0);
