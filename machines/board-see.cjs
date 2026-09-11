#!/usr/bin/env node
/**
 * THE SEER - the station that actually looks at the board.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "It's amazing how many errors I'm able to detect just by
 * looking at the page and trying to click 2 simple things that it seems like no
 * one is doing but me. Why am I catching things that you are programmed to catch
 * and resolve? I don't think you're learning - you're in dependency mode instead
 * of autonomy."
 *
 * He is right, and the classification is a DISCIPLINE FAILURE, not a missing
 * rule. "Look at it rendered" is already written in three separate places in
 * this corpus. It was reachable at every moment of decision. It was skipped, and
 * each time something cheaper was substituted and called equivalent:
 *
 *   the filter    was "verified" by reading back r.hidden - the same property
 *                 the code had just written. It confirmed its own assignment.
 *   the server    was "verified" by opening a TCP socket, which any process
 *                 holding the port would have satisfied.
 *   the counts    were "verified" against the array the page was built from,
 *                 never against the rows the page actually drew.
 *
 * One shape, three times: VERIFIED FROM THE INSIDE, using the same assumption
 * that produced the bug. A check like that cannot fail, which is worse than no
 * check because it is trusted.
 *
 * So the answer is not another written rule. Section 3.55: a rule that is
 * written is not enforced, and you never build a camera where a bump is
 * available. This is the bump. Nothing here can read back a flag it just set,
 * because nothing here sets one - it opens the board in a real browser, clicks
 * what a person clicks, and measures RENDERED GEOMETRY.
 *
 * Operator, same day: "get the page watcher to take actual snapshots as part of
 * the cycle." So every run photographs the board. The snapshot is not
 * decoration - it is what lets a failure be judged after the fact by someone
 * who was not there when it happened, and it is the one piece of evidence that
 * cannot be produced by reasoning about the code.
 *
 *   node <factory>/machines/board-see.cjs         look, report
 *   node <factory>/machines/board-see.cjs --json  machine-readable
 *   node <factory>/machines/board-see.cjs --keep  leave the browser open (debug)
 *
 * Exit 1 when the board is lying to whoever is looking at it.
 */
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const SNAPS = path.join(CTX, "board-snaps");
const PORTFILE = path.join(CTX, "board-port.txt");
const JSON_OUT = process.argv.includes("--json");

// Keep two days at the 45m ceiling, rather more at the 15m floor. Enough to
// answer "what did it look like when that happened" and not enough to become a
// second problem.
const KEEP_SNAPS = 64;

const now = Date.now();
const stamp = new Date(now).toISOString().replace(/[:.]/g, "-").slice(0, 19);

// ---- resolving playwright ---------------------------------------------------
//
// From the TARGET repo, never from this one. A universal machine that resolved
// its dependencies relative to __dirname would silently test the factory repo's
// idea of a browser while claiming to have looked at the product repo's board -
// which is the same class of lie this whole machine exists to catch.
let chromium = null;
let whyNoBrowser = "";
try {
  const req = createRequire(path.join(ROOT, "package.json"));
  ({ chromium } = req("playwright"));
} catch (err) {
  whyNoBrowser = err.message.split("\n")[0];
}

const port = (() => {
  try {
    return Number(fs.readFileSync(PORTFILE, "utf8").trim()) || 47390;
  } catch {
    return 47390;
  }
})();

// --url points the seer at some OTHER board. Its only real use is proving this
// station can fail: a deliberately broken copy is served elsewhere and the
// station must report it. A check nobody has ever seen fail is a check nobody
// has any reason to trust - which is the entire lesson this machine was built
// out of.
//
// Pointed elsewhere, it does not deposit. The belt is the record of THIS repo's
// board, and a sabotaged copy has no business writing to it. Snapshots are
// still taken, because the picture of the failure is the proof.
const urlArg = process.argv.indexOf("--url");
const PROBE = urlArg >= 0;
const URL = PROBE ? process.argv[urlArg + 1] : `http://127.0.0.1:${port}/`;

const findings = [];
const say = (key, claim, evidence, triggers = "contract:body", owner = "body", dimension = "body") =>
  findings.push({ key, claim, evidence, triggers, owner, dimension });

// ---- deposit ----------------------------------------------------------------
//
// At most one deposit per defect per DAY, not per defect ever.
//
// board-critic skips any id already on the belt, which means a defect fixed and
// later reintroduced would never be reported again. And the opposite mistake is
// just as real: the belt can die by flooding, not only by leaking - nineteen
// records here once turned out to be one finding repeated. A day is the honest
// middle. Something still broken tomorrow has earned the right to speak again.
function deposit() {
  if (PROBE) return 0;
  if (!fs.existsSync(BELT)) return 0;
  const beltText = fs.readFileSync(BELT, "utf8");
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
  let n = 0;
  for (const f of findings) {
    const id = `seer-${f.key}-${day}`;
    if (beltText.includes(`"${id}"`)) continue;
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: new Date(now).toISOString(),
        driver: "I7",
        tier: 1,
        dimension: f.dimension,
        // Specific, not "the board" - see the same note in board-critic. A
        // shared subject string turns three unrelated problems into a fake
        // recurrence and puts it in front of him.
        subject: `board: ${f.key}`,
        claim: f.claim,
        evidence: f.evidence,
        seen: true, // it was SEEN. That is the whole point of this station.
        confidence: "measured",
        triggers: f.triggers,
        owner: f.owner,
      }) + "\n",
      "utf8",
    );
    n++;
  }
  return n;
}

function finish(shots) {
  const deposited = deposit();
  const report = {
    checkedAt: new Date(now).toISOString(),
    repo: path.basename(ROOT),
    url: URL,
    looked: !!chromium,
    found: findings.length,
    deposited,
    snapshots: shots,
    findings,
  };
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(path.join(CTX, "board-see.json"), JSON.stringify(report, null, 2) + "\n");

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`board-see: ${findings.length} thing(s) wrong with what the board is SHOWING  [${report.repo}]`);
    for (const f of findings) {
      console.log(`\n  ${f.claim}`);
      console.log(`    ${f.evidence}`);
      console.log(`    -> ${f.triggers}`);
    }
    if (!findings.length) console.log("  Every chip filters, every count matches its rows, nothing is clipped.");
    for (const s of shots) console.log(`  snapshot: ${path.relative(ROOT, s)}`);
    if (deposited) console.log(`  deposited ${deposited}`);
  }
  process.exit(findings.length ? 1 : 0);
}

// A seer with no eyes must say so loudly and exactly once a day, not fail
// silently and not flood. Absence of a capability is not absence of a problem.
if (!chromium) {
  say(
    "no-browser",
    "The seer cannot see: no browser driver is installed in this repo, so nothing is looking at the board.",
    `require("playwright") from ${ROOT} failed: ${whyNoBrowser}. Install it, or this station is a sign rather than a bump - and a rule enforced by words alone is not a rule.`,
    "operator",
    "operator",
    "architecture",
  );
  finish([]);
}

(async () => {
  fs.mkdirSync(SNAPS, { recursive: true });
  const shots = [];
  const consoleErrors = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    say(
      "browser-will-not-launch",
      "A browser driver is installed but will not start, so the board is going unlooked-at.",
      `chromium.launch() failed: ${err.message.split("\n")[0]}`,
      "operator",
      "operator",
      "architecture",
    );
    finish([]);
  }

  // 1920x1080 because that is the wall monitor. A board checked at a size
  // nobody displays it at is checked at the wrong size.
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", (e) => consoleErrors.push(String(e.message).slice(0, 200)));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
  });

  let reached = true;
  try {
    const res = await page.goto(URL, { waitUntil: "networkidle", timeout: 15000 });
    if (!res || !res.ok()) reached = false;
  } catch {
    reached = false;
  }

  if (!reached) {
    say(
      "board-unreachable",
      `The board is not being served at ${URL}, so there is nothing on the wall to look at.`,
      "The seer could not load the page at all. board-serve-check owns reviving the server; this station reports that the display is dark.",
      "contract:hive",
      "hive",
      "architecture",
    );
    await browser.close();
    finish([]);
  }

  // Entry animations are held at their start frame until they run, and a
  // measurement taken then reports the FROM state forever - a row mid-fade can
  // read as zero height and look exactly like a row the filter hid. Settling
  // them first is the difference between measuring the board and measuring its
  // arrival.
  //
  // Only the ones that END, though. This board also runs the belt loop and the
  // station pulses, which repeat forever, and finish() on an infinite animation
  // throws - the first run of this station died on exactly that. The looping
  // ones are the board being ALIVE and must keep running; the settling is only
  // for the ones that were on their way somewhere.
  const settle = `() => {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
      if (!t || t.iterations === Infinity || t.endTime === Infinity) continue;
      try { a.finish(); } catch { /* already done, or unfinishable */ }
    }
  }`;
  await page.evaluate(settle);

  // A probe's pictures are marked as such, and a probe NEVER writes latest.png.
  //
  // Found by looking at latest.png after a sabotage run: it showed the broken
  // board, with a chip reading 13 against 19 total, and anyone opening it would
  // have believed that was the factory. The picture meant to be the honest
  // record had been overwritten by a deliberate lie - the exact failure this
  // station exists to catch, committed by this station.
  //
  // Caught by opening the image instead of trusting the code that wrote it,
  // which is the whole argument for the machine being here at all.
  const shot = async (name) => {
    const p = path.join(SNAPS, `${PROBE ? "probe--" : ""}${stamp}--${name}.png`);
    await page.screenshot({ path: p, fullPage: true });
    shots.push(p);
    return p;
  };

  // ---- the photograph, every cycle -----------------------------------------
  //
  // Taken BEFORE anything is clicked, so it is the board as the room sees it.
  await shot("board");
  if (!PROBE) fs.copyFileSync(shots[0], path.join(SNAPS, "latest.png"));

  // ---- what is actually on screen ------------------------------------------
  //
  // Every measurement below is rendered geometry. Not a property this code set,
  // not the array the page was built from - the box a person's eye lands on.
  const seen = await page.evaluate(() => {
    const vis = (e) => {
      const r = e.getBoundingClientRect();
      return r.height > 0 && r.width > 0 && getComputedStyle(e).visibility !== "hidden";
    };
    const rows = [...document.querySelectorAll(".inrow")];
    const picks = [...document.querySelectorAll(".statpick")].map((p) => ({
      key: p.getAttribute("data-pick"),
      // The chip's own number, read off the chip as a person reads it.
      count: Number((p.textContent.match(/\d+/) || [])[0] ?? -1),
      visible: vis(p),
    }));
    const byStatus = {};
    for (const r of rows) {
      const s = r.getAttribute("data-status") || "(none)";
      byStatus[s] = (byStatus[s] || 0) + 1;
    }
    const banner = [...document.querySelectorAll("*")].find((e) => /NOT RECEIVING FROM THE FACTORY/i.test(e.textContent || "") && e.children.length === 0);
    return {
      rowTotal: rows.length,
      renderedTotal: rows.filter(vis).length,
      byStatus,
      picks,
      bannerShowing: !!(banner && vis(banner)),
      pageScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      // A row whose text is wider than its box is silently cut off on a wall
      // display, where nobody can scroll it.
      clipped: rows
        .filter(vis)
        .flatMap((r) => [...r.children])
        .filter((c) => c.scrollWidth > c.clientWidth + 2).length,
    };
  });

  // ---- T1  the legend must not lie -----------------------------------------
  for (const p of seen.picks) {
    if (!p.key || p.key === "all" || p.count < 0) continue;
    const actual = seen.byStatus[p.key] || 0;
    if (p.count !== actual) {
      say(
        `legend-count-${p.key}`,
        `The ${p.key} chip says ${p.count} but there are ${actual} ${p.key} rows on the board.`,
        `Counted by looking: ${JSON.stringify(seen.byStatus)}. A legend that disagrees with what it labels teaches the room to distrust the whole board.`,
      );
    }
  }

  // ---- T2  no row may be unreachable ---------------------------------------
  //
  // A status with no chip cannot be filtered TO, and vanishes the moment any
  // other filter is on - present, counted, and unreachable.
  {
    const chipKeys = new Set(seen.picks.map((p) => p.key));
    for (const s of Object.keys(seen.byStatus)) {
      if (s === "(none)" || chipKeys.has(s)) continue;
      say(
        `orphan-status-${s}`,
        `${seen.byStatus[s]} row(s) carry the "${s}" state and no chip in the legend selects it.`,
        `Legend offers: ${[...chipKeys].join(", ")}. Rows present: ${Object.keys(seen.byStatus).join(", ")}. Those rows disappear under every filter and can never be brought back except by ALL.`,
      );
    }
  }

  // ---- T3  EVERY CHIP MUST ACTUALLY FILTER ---------------------------------
  //
  // This is the defect he found by clicking, generalised so it is never found
  // by clicking again. It clicks each chip for real and counts the rows that
  // still occupy space. The old check read back the flag it had just written
  // and could not have failed; this one fails the moment the screen disagrees.
  const filterResults = [];
  for (const p of seen.picks) {
    if (!p.key || p.key === "all") continue;
    const el = await page.$(`.statpick[data-pick="${p.key}"]`);
    if (!el) continue;
    await el.click();
    await page.evaluate(settle);
    const shown = await page.evaluate(() =>
      [...document.querySelectorAll(".inrow")].filter((r) => r.getBoundingClientRect().height > 0).length,
    );
    const want = seen.byStatus[p.key] || 0;
    filterResults.push({ key: p.key, shown, want });
    if (shown !== want) {
      const bad = await shot(`filter-${p.key}-FAILED`);
      say(
        `filter-does-not-filter-${p.key}`,
        `Clicking the ${p.key} chip leaves ${shown} rows on screen when only ${want} are ${p.key}.`,
        `Measured as rendered height after a real click, at 1920x1080. ${shown === seen.rowTotal ? "The filter changed nothing at all - every row is still showing." : "The filter is selecting the wrong set."} Snapshot of the failing state: ${path.relative(ROOT, bad)}`,
      );
    }
  }

  // ---- T4  and ALL must restore --------------------------------------------
  //
  // A filter you cannot get out of is a worse failure than one that never
  // applied, because the board then permanently hides work while looking fine.
  {
    const all = await page.$('.statpick[data-pick="all"]');
    if (!all) {
      say(
        "no-all-chip",
        "The legend has no ALL chip, so once a filter is clicked there is no way back to the whole list.",
        `Chips found: ${seen.picks.map((p) => p.key).join(", ")}.`,
      );
    } else {
      await all.click();
      await page.evaluate(settle);
      const back = await page.evaluate(() =>
        [...document.querySelectorAll(".inrow")].filter((r) => r.getBoundingClientRect().height > 0).length,
      );
      if (back !== seen.rowTotal) {
        const bad = await shot("filter-all-FAILED");
        say(
          "all-does-not-restore",
          `After filtering, clicking ALL brings back ${back} rows out of ${seen.rowTotal}. ${seen.rowTotal - back} stay hidden.`,
          `Measured by rendered height. Work hidden behind a filter that will not reopen is invisible while still being counted. Snapshot: ${path.relative(ROOT, bad)}`,
        );
      }
    }
  }

  // ---- T4b  a deposit must open, and close again ---------------------------
  //
  // Operator: "tapping the deposit in or out card item should expand
  // untruncate to see full details toggle retruncate." Both columns.
  //
  // Measured as height, never as a class name. Asserting the element gained an
  // "open" class is the r.hidden mistake wearing a different word - it reads
  // back what the click handler just wrote and tells you nothing about whether
  // anything grew on screen.
  for (const which of ["inrow", "outrow"]) {
    const row = await page.$(`.${which}`);
    if (!row) continue;
    const h0 = await row.evaluate((r) => r.getBoundingClientRect().height);
    await row.click();
    const h1 = await row.evaluate((r) => r.getBoundingClientRect().height);
    await row.click();
    const h2 = await row.evaluate((r) => r.getBoundingClientRect().height);

    if (h1 <= h0) {
      const bad = await shot(`expand-${which}-FAILED`);
      say(
        `row-does-not-expand-${which}`,
        `Tapping a ${which === "inrow" ? "deposit" : "resolved"} row does not open it - the row is ${Math.round(h1)}px before and after.`,
        `Measured as rendered height across a real click. The full claim and the evidence stay hidden, so the board still shows only the first 74 characters of everything. Snapshot: ${path.relative(ROOT, bad)}`,
      );
    } else if (Math.abs(h2 - h0) > 2) {
      const bad = await shot(`collapse-${which}-FAILED`);
      say(
        `row-does-not-close-${which}`,
        `A ${which === "inrow" ? "deposit" : "resolved"} row opens on tap but will not close again: ${Math.round(h0)}px, ${Math.round(h1)}px open, ${Math.round(h2)}px after tapping a second time.`,
        `A row that opens and stays open pushes the rest of the column below the fold, and on a wall display below the fold is gone. Snapshot: ${path.relative(ROOT, bad)}`,
      );
    }
  }

  // Only one row open at a time, or a few taps bury the column.
  {
    const rows = await page.$$(".inrow");
    if (rows.length >= 2) {
      await rows[0].click();
      await rows[1].click();
      const openCount = await page.evaluate(() => document.querySelectorAll(".feedrow.open").length);
      await rows[1].click(); // leave the board as it was found
      if (openCount > 1) {
        say(
          "rows-stack-open",
          `${openCount} deposit rows stay open at once, so a few taps push the rest of the list off the screen.`,
          "Opening a second row should close the first. On a wall monitor nobody scrolls back.",
        );
      }
    }
  }

  // ---- T5  the board must not pretend --------------------------------------
  if (seen.bannerShowing) {
    say(
      "disconnected-while-served",
      "The board is showing its disconnected banner even though the server answered.",
      `Loaded ${URL} successfully, yet the page believes it is cut off. Either the stamp poll is broken or the board is crying wolf - and a board that cries wolf is one nobody reads.`,
      "contract:hive",
      "hive",
      "architecture",
    );
  }

  // ---- T6  nothing cut off on a screen nobody can scroll -------------------
  if (seen.pageScrollWidth > seen.innerWidth + 4) {
    say(
      "board-overflows",
      `The board is ${seen.pageScrollWidth}px wide in a 1920px window, so part of it is off the edge of the wall display.`,
      "Nobody scrolls a wall monitor. Anything past the right edge is not shown at all.",
    );
  }
  if (seen.clipped > 0) {
    say(
      "text-clipped",
      `${seen.clipped} cell(s) on the board are cut off mid-text.`,
      "Measured with scrollWidth against clientWidth, which is the only way to catch truncation - judging it by eye from a scaled screenshot reports crowding, not clipping.",
    );
  }

  // ---- T7  the page itself must not be erroring ----------------------------
  if (consoleErrors.length) {
    say(
      "board-script-errors",
      `The board threw ${consoleErrors.length} script error(s) while being looked at.`,
      `First: ${consoleErrors[0]}. A board whose script died renders once and then silently stops updating, which looks identical to a factory with nothing to report.`,
    );
  }

  // ---- T8  there must be a board at all ------------------------------------
  if (seen.rowTotal === 0 && seen.renderedTotal === 0) {
    // Not necessarily wrong - an empty belt is a legitimate state. But it is
    // worth saying out loud, because "nothing to show" and "failed to draw"
    // look exactly alike from across a room.
    say(
      "board-empty",
      "The board rendered with no deposit rows at all.",
      "This is legitimate when the belt is genuinely empty, and indistinguishable from a render failure at a glance. Reported so the two can be told apart.",
      "operator",
      "operator",
      "architecture",
    );
  }

  // Retention, oldest first, latest.png exempt.
  try {
    const files = fs
      .readdirSync(SNAPS)
      .filter((f) => f.endsWith(".png") && f !== "latest.png")
      .sort();
    for (const f of files.slice(0, Math.max(0, files.length - KEEP_SNAPS))) fs.unlinkSync(path.join(SNAPS, f));
  } catch {
    /* a full snapshot dir is untidy, not a fault worth failing the run over */
  }

  if (!process.argv.includes("--keep")) await browser.close();

  // Filter results go in the report even when they pass, so a later reader can
  // see the station did the clicking rather than take its word for it.
  fs.writeFileSync(
    path.join(CTX, "board-see-detail.json"),
    JSON.stringify({ checkedAt: new Date(now).toISOString(), seen, filterResults }, null, 2) + "\n",
  );

  finish(shots);
})().catch((err) => {
  say(
    "seer-crashed",
    "The seer crashed while looking at the board, so this cycle nothing looked at it.",
    `${err.message.split("\n")[0]}. A watcher that dies quietly is worse than one that was never built, because the empty report reads as a clean one.`,
    "operator",
    "operator",
    "architecture",
  );
  finish([]);
});
