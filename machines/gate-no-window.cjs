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
const DIRS = ["engine", "machines"];
const JSON_OUT = process.argv.includes("--json");

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
for (const dir of DIRS) {
  const d = path.join(FACTORY, dir);
  let entries = [];
  try {
    entries = fs.readdirSync(d);
  } catch {
    continue;
  }
  for (const name of entries) {
    if (!/\.(cjs|mjs|js)$/.test(name)) continue;
    if (name === path.basename(__filename)) continue;
    const file = path.join(d, name);
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
      offenders.push({
        file: `${dir}/${name}`,
        line: src.slice(0, m.index).split("\n").length,
        call: m[1],
        excerpt: text.replace(/\s+/g, " ").slice(0, 120),
      });
    }
  }
}

const report = { checkedAt: new Date().toISOString(), launchers: checked, offenders };
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
