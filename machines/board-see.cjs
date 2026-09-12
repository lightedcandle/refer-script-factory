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

// A CHECK THAT COULD NOT HAVE FAILED DID NOT PASS.
//
// Some of these tests need material on the board to mean anything - a note to
// prove notes stay out of the work columns, an unread one to prove read state
// survives a reload. With nothing to test they report nothing, which on this
// station's own report is indistinguishable from a pass, and a check nobody has
// seen fail is a check nobody has reason to trust.
//
// So they say so. Not as findings - nothing is wrong - but printed beside the
// result, so "everything passed" can be read honestly.
const vacuous = [];

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
    vacuous,
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
    for (const v of vacuous) console.log(`  NOT TESTED: ${v}`);
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
    // KIND, counted the same way as state and from the same rows. A record has
    // both, and the board draws two strips of chips because they answer two
    // different questions.
    const byKind = {};
    for (const r of rows) {
      const k = r.getAttribute("data-kind") || "(none)";
      byKind[k] = (byKind[k] || 0) + 1;
    }
    const kindPicks = [...document.querySelectorAll(".kindpick")].map((p) => ({
      key: p.getAttribute("data-pick"),
      count: Number((p.textContent.match(/\d+/) || [])[0] ?? -1),
      visible: vis(p),
    }));
    // WHERE NOTES ARE, AND WHERE THEY MUST NOT BE. Read off the page as three
    // separate populations, because "a note is not on the belt" is only a real
    // check if the same pass can also see that the notes exist somewhere.
    const noteRows = [...document.querySelectorAll(".noterow")];
    const notesOnBoard = {
      inReading: noteRows.length,
      unread: noteRows.filter((r) => r.getAttribute("data-read") === "0").length,
      inIncoming: rows.filter((r) => r.getAttribute("data-kind") === "note").length,
      inResolved: [...document.querySelectorAll(".outrow")].filter((r) => r.getAttribute("data-kind") === "note").length,
      onBelt: [...document.querySelectorAll(".beltrow")].filter((r) => r.getAttribute("data-kind") === "note").length,
    };
    // The counts the centre prints, read as text the way a person reads them -
    // never as a value this code set.
    const num = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const m = (el.textContent || "").match(/\d+/);
      return m ? Number(m[0]) : null;
    };
    const printed = { contracted: num(".opencount"), triage: num(".triagecount") };
    const banner = [...document.querySelectorAll("*")].find((e) => /NOT RECEIVING FROM THE FACTORY/i.test(e.textContent || "") && e.children.length === 0);
    return {
      rowTotal: rows.length,
      renderedTotal: rows.filter(vis).length,
      byStatus,
      byKind,
      kindPicks,
      notesOnBoard,
      printed,
      picks,
      bannerShowing: !!(banner && vis(banner)),
      pageScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      // A row whose text is wider than its box is silently cut off on a wall
      // display, where nobody can scroll it.
      //
      // The cells are NAMED, not just counted. A count sends whoever reads it
      // back to the browser to find out which cell - which is a second
      // measuring pass for information this pass already had in its hand.
      clippedCells: rows
        .filter(vis)
        .flatMap((r) => [...r.children])
        .filter((c) => c.scrollWidth > c.clientWidth + 2)
        .map((c) => ({
          text: (c.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
          box: c.clientWidth,
          needs: c.scrollWidth,
        })),
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

  // ---- T3b  THE KIND CHIPS MUST FILTER TOO, AND NOT LIE --------------------
  //
  // Same two tests as the state chips, on the other axis. Written as a separate
  // pass rather than folded into T1/T3 because the two strips combine with AND:
  // a kind chip is clicked while the state filter is on ALL, and the state chips
  // were clicked while the kind filter is on ALL. Interleaving them would test a
  // combination nobody has asked for and miss the ones they have.
  //
  // THE STATE FILTER IS CLEARED FIRST, and forgetting it is how this check
  // reported three failures against a board that was working: T3 above leaves the
  // LAST state chip applied, so every kind measurement was taken through a
  // hourglass filter and came back zero. The board was ANDing correctly and the
  // test was asking the wrong question - which is worth having happened, because
  // a wrong reading here would have sent somebody to rewrite a correct filter.
  {
    const back = await page.$('.statpick[data-pick="all"]');
    if (back) {
      await back.click();
      await page.evaluate(settle);
    }
  }
  for (const p of seen.kindPicks) {
    if (!p.key || p.key === "all" || p.count < 0) continue;
    const actual = seen.byKind[p.key] || 0;
    if (p.count !== actual) {
      say(
        `kind-legend-count-${p.key}`,
        `The ${p.key} chip says ${p.count} but there are ${actual} ${p.key} rows on the board.`,
        `Counted by looking: ${JSON.stringify(seen.byKind)}. A legend that disagrees with what it labels teaches the room to distrust the whole board.`,
      );
    }
  }
  for (const p of seen.kindPicks) {
    if (!p.key || p.key === "all") continue;
    const el = await page.$(`.kindpick[data-pick="${p.key}"]`);
    if (!el) continue;
    await el.click();
    await page.evaluate(settle);
    const shown = await page.evaluate(() =>
      [...document.querySelectorAll(".inrow")].filter((r) => r.getBoundingClientRect().height > 0).length,
    );
    const want = seen.byKind[p.key] || 0;
    filterResults.push({ key: `kind:${p.key}`, shown, want });
    if (shown !== want) {
      const bad = await shot(`kindfilter-${p.key}-FAILED`);
      say(
        `kind-filter-does-not-filter-${p.key}`,
        `Clicking the ${p.key} chip leaves ${shown} rows on screen when only ${want} are ${p.key}.`,
        `Measured as rendered height after a real click, at 1920x1080. ${shown === seen.rowTotal ? "The filter changed nothing at all." : "The filter is selecting the wrong set."} Snapshot: ${path.relative(ROOT, bad)}`,
      );
    }
  }
  {
    // And it must let go. Two strips that both hide rows can deadlock: leaving
    // the kind filter on would make every state check below measure a subset and
    // report the difference as a broken filter.
    const kindAll = await page.$('.kindpick[data-pick="all"]');
    if (kindAll) {
      await kindAll.click();
      await page.evaluate(settle);
      const back = await page.evaluate(() =>
        [...document.querySelectorAll(".inrow")].filter((r) => r.getBoundingClientRect().height > 0).length,
      );
      if (back !== seen.rowTotal) {
        const bad = await shot("kindfilter-all-FAILED");
        say(
          "kind-all-does-not-restore",
          `After filtering by kind, clicking ALL brings back ${back} rows out of ${seen.rowTotal}.`,
          `Measured by rendered height. Work hidden behind a filter that will not reopen is invisible while still being counted. Snapshot: ${path.relative(ROOT, bad)}`,
        );
      }
    } else if (seen.kindPicks.length) {
      say(
        "no-kind-all-chip",
        "The kind legend has no ALL chip, so once a kind is clicked there is no way back to the whole list.",
        `Kind chips found: ${seen.kindPicks.map((p) => p.key).join(", ")}.`,
      );
    }
  }

  // ---- T3c  A NOTE MAY NOT BE ANYWHERE WORK IS -----------------------------
  //
  // Operator, 2026-09-12: "don't put notifications on the belt, only contracts to
  // be processed." The rule is enforced in the builder; this is the bump that
  // proves it held, measured on the rendered page rather than asserted from the
  // data the page was built from.
  {
    const n = seen.notesOnBoard;
    const strays = [
      n.inIncoming ? `${n.inIncoming} in the incoming column` : "",
      n.inResolved ? `${n.inResolved} on the resolution table` : "",
      n.onBelt ? `${n.onBelt} on the conveyor` : "",
    ].filter(Boolean);
    if (strays.length) {
      const bad = await shot("note-on-the-belt-FAILED");
      say(
        "note-drawn-as-work",
        `A note is being drawn where work goes: ${strays.join(", ")}.`,
        `Counted from data-kind on the rendered rows. A note has no worker, no timer, no dispatch and no closure - drawn in a work column it sits there forever asking who owes it, which is the conflation this taxonomy removes. Snapshot: ${path.relative(ROOT, bad)}`,
        "contract:body",
        "body",
      );
    }
    // A check that can only pass is not a check. If nothing on the belt is a note
    // this test proves nothing, and says so rather than reporting a pass.
    if (!n.inReading) {
      vacuous.push("note-drawn-as-work: no notes exist on this belt, so nothing was actually tested");
    }
  }

  // ---- T3d  THE OPEN COUNT MUST BE THE CONTRACT COUNT ----------------------
  //
  // "Open counts, domain tallies and age alarms count contracts only." The
  // number is read as TEXT off the centre readout - the way a person reads it -
  // and compared against the rows carrying data-kind="contract" plus whatever is
  // riding the belt, because a contract being worked leaves the incoming column.
  {
    const printed = seen.printed.contracted;
    if (printed === null) {
      say(
        "no-contract-count-printed",
        "The board does not print how many contracts are open, so there is no number to check the belt against.",
        "The centre readout carries the factory's own idea of its backlog. Without it, the only cross-source check left is the row count, and a board can draw the right number of wrong rows.",
      );
    } else {
      const onBeltRows = await page.evaluate(() => document.querySelectorAll(".beltrow").length);
      const contractRows = seen.byKind.contract || 0;
      if (printed !== contractRows + onBeltRows) {
        const bad = await shot("open-count-FAILED");
        say(
          "open-count-is-not-the-contract-count",
          `The board says ${printed} contracted and draws ${contractRows} contract row${contractRows === 1 ? "" : "s"} incoming plus ${onBeltRows} on the belt.`,
          `Read off the rendered page: the printed figure against the rows carrying data-kind="contract". Only contracts count as open work, so these are the same number by definition - if they differ, something that is not a contract is being counted as one, which is how a notification inflated the backlog in the first place. Snapshot: ${path.relative(ROOT, bad)}`,
        );
      }
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

  // ---- T4b2  READ STATE MUST SURVIVE A RELOAD ------------------------------
  //
  // Operator, on notifications: "read state persists per record and must survive
  // a reload; a state that resets on refresh is not a state, it is a decoration."
  //
  // This is the check that would have caught the half-built version. Read state
  // is baked into the HTML at build time, so clicking a note turned it white and
  // a refresh - serving the same HTML - turned it green again. Everything about
  // the code looked right, and the feature did not work between two builds.
  //
  // So it is measured the only way that could have told the difference: click a
  // real unread note, reload the real page, and look at the colour. Never at a
  // class this code just toggled, never at the POST's response, and never at the
  // file on disk - each of those confirms its own assignment.
  {
    // The reading area is behind a tab, and a hidden row cannot be clicked - so
    // the pane is opened the way a person opens it, by pressing its tab.
    const openNotes = async () => {
      const tab = await page.$('.paneltab[data-panel="notes"]');
      if (!tab) return false;
      await tab.click();
      await page.evaluate(settle);
      return true;
    };
    const hasPane = await openNotes();
    const target = hasPane
      ? await page.evaluate(() => {
          const row = document.querySelector('.noterow[data-read="0"]');
          return row ? row.getAttribute("data-rid") : null;
        })
      : null;
    if (!hasPane) {
      say(
        "no-reading-area",
        "The board has no NOTES pane, so a notification has nowhere to go that is not a work column.",
        "Only contracts ride the belt; a note needs a reading area or it has to be drawn as work to be drawn at all.",
      );
    } else if (!target) {
      vacuous.push("read-state-survives-reload: no unread note exists on this board, so nothing was actually tested");
    } else {
      // The colour a person sees, not the class that produces it.
      const colourOf = (rid) =>
        page.evaluate((id) => {
          const row = document.querySelector(`.noterow[data-rid="${CSS.escape(id)}"]`);
          if (!row) return null;
          const text = row.querySelector(".notetext");
          const pip = row.querySelector(".notepip");
          return {
            colour: text ? getComputedStyle(text).color : null,
            opacity: text ? getComputedStyle(text).opacity : null,
            word: pip ? (pip.textContent || "").trim() : null,
          };
        }, rid);

      const before = await colourOf(target);
      const row = await page.$(`.noterow[data-rid="${target.replace(/"/g, '\\"')}"]`);
      if (row) await row.click();
      // The click posts; give the server a moment to have written it before the
      // reload asks for it back. A race here would report a real feature broken.
      await page.waitForTimeout(400);
      const afterClick = await colourOf(target);

      if (!afterClick || afterClick.word !== "READ") {
        const bad = await shot("note-does-not-read-FAILED");
        say(
          "note-does-not-mark-read",
          `Tapping an unread note does not mark it read - it still says "${(afterClick && afterClick.word) || "nothing"}".`,
          `Measured on the rendered row after a real click. A note has two states and marking one read is the only act available on it; if the act does nothing the pane is a list, not a state. Snapshot: ${path.relative(ROOT, bad)}`,
        );
      } else {
        await page.reload({ waitUntil: "networkidle" });
        await page.evaluate(settle);
        await openNotes();
        // The page asks the server on load, so give that fetch the same grace.
        await page.waitForTimeout(600);
        const afterReload = await colourOf(target);
        if (!afterReload || afterReload.word !== "READ") {
          const bad = await shot("read-state-lost-FAILED");
          say(
            "read-state-does-not-survive-reload",
            `A note marked read comes back unread after a reload - it reads "${(afterReload && afterReload.word) || "nothing"}" again.`,
            `Clicked, reloaded, and re-measured from computed style on the rendered row: ${JSON.stringify(before)} before, ${JSON.stringify(afterClick)} after the click, ${JSON.stringify(afterReload)} after the reload. A state that resets on refresh is a decoration. Snapshot: ${path.relative(ROOT, bad)}`,
          );
        }
      }
      // Leave the tab strip as the room should find it.
      await page.evaluate(() => {
        const first = document.querySelector(".paneltab[data-panel]");
        if (first) first.click();
      });
    }
  }

  // ---- T4c  nothing may be drawn on top of the centre readout --------------
  //
  // The operator found a parked carrier card sitting directly on the "BELT
  // IDLE" heading - the MIND label occupied x 951-969, y 403-411, entirely
  // inside the heading's box. At a glance it read as a slightly busy middle
  // rather than as two things in the same pixels, which is why it survived
  // several careful looks at the screenshot.
  //
  // Geometry catches what the eye forgives. Boxes that intersect are a fact.
  {
    const overlaps = await page.evaluate(() => {
      const board = document.querySelector("svg #board");
      if (!board) return null;
      const svg = board.ownerSVGElement;
      const panel = svg.parentElement;
      const hit = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
      // A carrier card is the little rounded rect with a coloured spine.
      const cards = [...svg.querySelectorAll("g")]
        .filter((g) => /^translate/.test(g.getAttribute("transform") || "") && g.querySelector("rect[rx='3']"))
        .map((g) => g.getBoundingClientRect());
      // The readout is the absolutely-positioned overlay sitting over the loop.
      const readout = [...panel.querySelectorAll("span")]
        .filter((s) => s.textContent.trim() && s.getBoundingClientRect().height > 0)
        .map((s) => ({ t: s.textContent.trim().slice(0, 30), r: s.getBoundingClientRect() }));
      const found = [];
      for (const c of cards) for (const o of readout) if (hit(c, o.r)) found.push(o.t);
      return [...new Set(found)];
    });
    if (overlaps && overlaps.length) {
      const bad = await shot("overlap-FAILED");
      say(
        "carrier-card-over-readout",
        `A carrier card is drawn on top of the centre readout, covering: ${overlaps.join(", ")}.`,
        `Boxes measured in a real browser and found to intersect. Two things in the same pixels read as one slightly busy thing, which is why this survives being looked at. Snapshot: ${path.relative(ROOT, bad)}`,
      );
    }
  }

  // ---- T4d  the readout must stay inside the belt --------------------------
  //
  // The operator found the status line running out through the conveyor on both
  // sides - 646 to 1274 against a loop interior of 704 to 1215. It had grown
  // there gradually, one sentence at a time, which is exactly the kind of drift
  // nobody notices in a screenshot they have looked at fifty times.
  //
  // Measured against the LOOP PATH's own box, so the check keeps working if the
  // loop is ever resized.
  {
    const spill = await page.evaluate(() => {
      const loop = document.querySelector("svg #board");
      if (!loop) return null;
      const svg = loop.ownerSVGElement;
      const panel = svg.parentElement;
      const lb = loop.getBoundingClientRect();
      // The conveyor has a stroke width; the usable interior is inside it.
      const w = parseFloat(getComputedStyle(loop).strokeWidth) || 0;
      const sx = lb.width / (svg.viewBox.baseVal.width || 1);
      const inset = (w * sx) / 2;
      const inner = { left: lb.left + inset, right: lb.right - inset, top: lb.top + inset, bottom: lb.bottom - inset };
      const out = [];
      for (const s of panel.querySelectorAll("span")) {
        const r = s.getBoundingClientRect();
        if (!r.height || !s.textContent.trim()) continue;
        // Only the readout - things deliberately outside the loop are not spill.
        const insideish = r.left > lb.left - 40 && r.right < lb.right + 40 && r.top > lb.top && r.bottom < lb.bottom;
        if (!insideish) continue;
        if (r.left < inner.left - 1 || r.right > inner.right + 1) {
          out.push(`${s.textContent.trim().slice(0, 28)} (${Math.round(r.left)}-${Math.round(r.right)} vs ${Math.round(inner.left)}-${Math.round(inner.right)})`);
        }
      }
      return out;
    });
    if (spill && spill.length) {
      const bad = await shot("belt-spill-FAILED");
      say(
        "readout-outside-the-belt",
        `${spill.length} line(s) of the centre readout run outside the conveyor loop.`,
        `Measured against the loop path's own box: ${spill.join("; ")}. Text crossing the belt reads as a rendering fault to anyone glancing at it. Snapshot: ${path.relative(ROOT, bad)}`,
      );
    }
  }

  // ---- T4e  a tab must show one pane, and every tab must work --------------
  //
  // The year chart rendered underneath the classroom because its pane carried an
  // inline display:flex, and an inline style beats [hidden]. That is the THIRD
  // time this exact fight has been lost on this board, and the second time
  // inside a change whose own comment warned about it. Written rules clearly do
  // not hold here; a check does.
  //
  // Measured by rendered height, so a pane that is "hidden" but still occupying
  // the screen fails, which is precisely what happened.
  {
    const tabResults = await page.evaluate(async () => {
      const tabs = [...document.querySelectorAll(".paneltab[data-panel]")];
      const bodies = [...document.querySelectorAll(".panelbody[data-panel]")];
      if (!tabs.length || !bodies.length) return null;
      const out = [];
      for (const t of tabs) {
        t.click();
        await new Promise((r) => setTimeout(r, 60));
        const want = t.getAttribute("data-panel");
        const visible = bodies.filter((b) => b.getBoundingClientRect().height > 0).map((b) => b.getAttribute("data-panel"));
        out.push({ want, visible });
      }
      return out;
    });
    if (tabResults) {
      for (const r of tabResults) {
        if (r.visible.length !== 1 || r.visible[0] !== r.want) {
          const bad = await shot(`tab-${r.want}-FAILED`);
          say(
            `tab-shows-wrong-pane-${r.want}`,
            `Selecting the ${r.want.toUpperCase()} tab leaves ${r.visible.length === 0 ? "nothing" : r.visible.join(" and ")} on screen.`,
            `Measured as rendered height after a real click. ${r.visible.length > 1 ? "Two panes are drawn on top of each other, which reads as a rendering fault." : "The tab selects nothing at all."} Snapshot: ${path.relative(ROOT, bad)}`,
          );
        }
      }
      // Leave it as the room should find it.
      await page.evaluate(() => {
        const first = document.querySelector(".paneltab[data-panel]");
        if (first) first.click();
      });
    }
  }

  // ---- T4f  the cycle strip must read shortest to longest ------------------
  //
  // Operator asked for it explicitly, and an explicit instruction is exactly the
  // kind of thing that gets quietly undone by the next change to the same file.
  // Read off the RENDERED page in left-to-right order, so this checks what a
  // person sees rather than what the data was sorted as.
  {
    const strip = await page.evaluate(() => {
      const UNIT = { m: 60, h: 3600, d: 86400, s: 1 };
      const cells = [...document.querySelectorAll("div")]
        .filter((d) => /^[A-Z][A-Z .…]{3,22}\s*\d+[smhd]/.test((d.textContent || "").replace(/\s+/g, " ").trim()) && d.children.length <= 4)
        .map((d) => {
          const t = (d.textContent || "").replace(/\s+/g, " ").trim();
          const m = t.match(/(\d+)([smhd])/);
          return { t: t.slice(0, 34), x: Math.round(d.getBoundingClientRect().left), y: Math.round(d.getBoundingClientRect().top), secs: m ? Number(m[1]) * UNIT[m[2]] : null };
        })
        .filter((c) => c.y < 300 && c.secs !== null);
      const uniq = [];
      for (const c of cells.sort((a, b) => a.x - b.x)) if (!uniq.some((u) => u.x === c.x)) uniq.push(c);
      return uniq;
    });
    if (strip && strip.length > 2) {
      // THE PULSE IS EXEMPT, AND ONLY THE PULSE, AND ONLY IN THE FIRST SLOT.
      //
      // Operator, 2026-09-12: "move the pulse to the first slot on the left, this
      // is the primordial tick for the living factory." It sits there by
      // insertion rather than by sorting, because at five minutes it happens to
      // sort first today and that is a coincidence - the moment any trigger
      // declares something faster, a sorted pulse would move and the instruction
      // would be silently undone.
      //
      // Which means this check has to know. Without the exemption it would report
      // the operator's own arrangement as a fault the first time anything faster
      // exists - a gate firing on the thing it was told to allow, which is worse
      // than no gate because somebody would eventually "fix" the board to satisfy
      // it.
      const ordered = strip.length && /^PULSE\b/i.test(strip[0].t.trim()) ? strip.slice(1) : strip;
      const wrong = [];
      for (let i = 1; i < ordered.length; i++) if (ordered[i].secs < ordered[i - 1].secs) wrong.push(`${ordered[i - 1].t} then ${ordered[i].t}`);
      if (wrong.length) {
        const bad = await shot("strip-order-FAILED");
        say(
          "cycle-strip-out-of-order",
          `The cycle strip is not in order, shortest pulse first: ${wrong.join("; ")}.`,
          `Read left to right off the rendered page. The strip is ordered by the pace printed on each cell, so a cell showing a shorter pace must sit to the left of a longer one - including a station that has tightened after a fault, which should move toward the front. Snapshot: ${path.relative(ROOT, bad)}`,
        );
      }
    }
  }

  // ---- T4g  a cycle cannot count down past its own pace --------------------
  //
  // Every cycle cell prints two numbers about the same station: the pace it
  // runs on, and how long until it next fires. The second can never exceed the
  // first. If it does, the two were computed from different intervals.
  //
  // This is written because it happened, and because it was INVISIBLE to every
  // other check here. The board read:
  //
  //     BOARD CRITIC  15m *  ... 1h 44m          AUTONOMY  30m *  ... 5h 34m
  //
  // The pace came from the interval the clock had tightened to after a fault;
  // the countdown came from the ceiling the station DECLARED. Both stations
  // were healthy and running every fifteen and thirty minutes, and the board
  // told the room they were hours away. The bar between the two numbers was
  // drawn from the pace, so it sat at 100% above a countdown reading 1h 44m -
  // a tile disagreeing with itself, passing every test on this station.
  //
  // The same one line reached the footer strip, which picks the five nearest
  // stations by that wrong number, so the two about to fire were the two it
  // left out; and it reached the ALIVE lamp, which measured every station
  // against its ceiling - meaning a station tightened to 15m could be DEAD for
  // nearly six hours under the words "every station inside its interval".
  //
  // Tightened stations are the ones the clock has decided to watch most
  // closely. Computing their schedule from the ceiling made the board least
  // accurate exactly where it most needed to be right.
  {
    const cells = await page.evaluate(() => {
      const UNIT = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5 };
      const ms = (text) => {
        const t = (text || "").trim();
        if (!t) return null;
        if (/^(due|now)$/i.test(t)) return 0;
        let total = null;
        for (const m of t.matchAll(/(\d+)\s*([smhdw])/gi)) total = (total || 0) + Number(m[1]) * UNIT[m[2].toLowerCase()];
        return total;
      };
      // The cycle cells are the only things on the board carrying a title that
      // opens "every " - set by the builder next to the pace it prints.
      return [...document.querySelectorAll('div[title^="every "]')].map((cell) => {
        const spans = [...cell.querySelectorAll("span")];
        const name = (spans[0] && spans[0].textContent) || "";
        const paceText = ((spans[1] && spans[1].textContent) || "").replace(/\*/g, "");
        const whenText = (spans[2] && spans[2].textContent) || "";
        return {
          name: name.replace(/\s+/g, " ").trim(),
          paceText: paceText.trim(),
          whenText: whenText.replace(/\s+/g, " ").trim(),
          pace: ms(paceText),
          when: ms(whenText),
        };
      });
    });

    // A minute of slack: both numbers are rendered as rounded words, so "15m"
    // against "15m" must pass while "15m" against "1h 44m" must not.
    const SLACK = 60 * 1000;
    const liars = (cells || []).filter((c) => c.pace !== null && c.when !== null && c.when > c.pace + SLACK);
    if (liars.length) {
      const bad = await shot("cycle-countdown-FAILED");
      say(
        "cycle-countdown-exceeds-pace",
        `${liars.length} cycle cell(s) count down past the pace printed beside them: ${liars
          .map((c) => `${c.name} says every ${c.paceText} but ${c.whenText} away`)
          .join("; ")}.`,
        `Read off the rendered cells. A station cannot be further from firing than its own interval, so the pace and the countdown were computed from different numbers - almost certainly the declared ceiling against the interval the clock actually tightened to. Snapshot: ${path.relative(ROOT, bad)}`,
        "contract:body",
        "body",
      );
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
  if (seen.clippedCells.length > 0) {
    say(
      "text-clipped",
      `${seen.clippedCells.length} cell(s) on the board are cut off mid-text: ${seen.clippedCells.map((c) => `"${c.text}"`).join(", ")}.`,
      `Measured with scrollWidth against clientWidth, which is the only way to catch truncation - judging it by eye from a scaled screenshot reports crowding, not clipping. ${seen.clippedCells
        .map((c) => `"${c.text}" has ${c.box}px and needs ${c.needs}px`)
        .join("; ")}.`,
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
