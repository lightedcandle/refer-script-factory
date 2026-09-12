#!/usr/bin/env node
/**
 * THE FACTORY MANAGER - the thing that reads the board and asks why nothing
 * happened.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Renamed from board-critic 2026-09-12, on the operator's direction. "Critic"
 * undersold it: this is the only thing in the factory that reads the WHOLE board
 * and asks why nothing moved, which is a manager's job rather than a reviewer's.
 * Its trigger id is `manager` - short, because it has to fit the board's cycle
 * strip - and the schedule carries its history across the rename so it does not
 * read as NEVER RUN for a cycle.
 *
 * Operator, 2026-09-11: "That problem could have been discovered just by looking
 * at the page. So apparently nothing is looking at the page and extrapolating,
 * and wondering, why are there issues on the page that are not being addressed?"
 *
 * He is right, and it is the largest structural gap the factory has had.
 *
 * THE BOARD WAS THE BIGGEST LEAK IN THE SYSTEM. Section 3.1 says an output
 * nobody picks up is a leak, and a leak is the only way this system dies
 * quietly. The board is the terminal display of everything the factory knows -
 * and nothing read it. Watchers deposited, the board rendered, and there the
 * chain stopped. Every defect found on it so far was found by a person looking
 * at it, which is exactly the labour this whole system exists to remove.
 *
 * So this reads the board's own state and asks the questions a person asks when
 * they look at it:
 *
 *   Is anything shown as needing attention that nobody has touched?
 *   Is any domain carrying work with nobody watching it?
 *   Is the same thing being reported again and again without resolving?
 *   Does any count on the board disagree with what it counts?
 *
 * WHY THIS IS A SCRIPT AND NOT A SESSION. Most of "looking at the page" is not
 * looking - it is arithmetic over the data the page renders, and arithmetic
 * needs no judgement. What genuinely needs eyes (does this LOOK wrong, is the
 * layout broken) stays with the seer. Splitting them is what makes the cheap
 * half run every cycle instead of once a day.
 *
 *   node <factory>/machines/manager.cjs         report
 *   node <factory>/machines/manager.cjs --json  machine-readable
 *
 * Exit 1 when it finds something nobody is acting on.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");

const MS = { h: 36e5, d: 864e5 };
const STALE_HOURS = 24; // open, untouched, and older than this = nobody picked it up

if (!fs.existsSync(BELT)) {
  console.error(`manager: no belt in ${ROOT}`);
  process.exit(2);
}

const belt = fs
  .readFileSync(BELT, "utf8")
  .replace(/^﻿/, "")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

// Discovery via triggers.cjs, so the declaration suffix exists in one place.
// The schedule reports unreadable declarations; not this machine's job.
const { discoverTriggers } = require("./triggers.cjs");
const stations = discoverTriggers(ROOT);

const now = Date.now();
const runAt = (r) => {
  const t = Date.parse(r.run || "");
  return Number.isNaN(t) ? null : t;
};
// A later record naming this one as its subject, and terminal itself, closes it.
// The belt is append-only, so this is the only way a finding can ever die - and
// without it the critic's own rules counted finished work as outstanding. It was
// re-raising a recurrence built from three records that were all already closed.
const TERMINAL = (t) => /^(terminal:.+|closed)$/.test(String(t || "").trim());

// NOT EVERY TERMINAL RECORD CLOSES WHAT IT NAMES. A word that means NOTED does
// not resolve anything - attaching a lesson or a recommendation to a finding
// explains it, which is the opposite of fixing it.
//
// This machine disagreed with the board for about ten minutes because the rule
// was fixed in one place and not the other, and THE CROSS-SOURCE CHECK BELOW
// CAUGHT IT: the belt said 13 open, the board drew 20. That check exists exactly
// for a divergence between two definitions of the same thing, and the first
// thing it found was this machine's own.
//
// Seventh place one rule has been written twice on this board. The vocabulary is
// factory law (precedent P13) and both readers must keep it identical.
//
// AND IT IS NOW READ FROM ONE FILE. kind.cjs holds the vocabulary - what closes
// a finding, what is only an annotation, and what KIND each record is. This
// machine had its own copy of the first two and the board had a third; the
// comments above record them drifting and being caught by the cross-source check
// below. There is one copy now.
const { KIND, beltIndex } = require("./kind.cjs");
const IX = beltIndex(belt);
const NOTING = IX.NOTING;
const isClosed = IX.isDone;

// OPEN MEANS A CONTRACT SOMEBODY OWES.
//
// Operator, 2026-09-12: "don't put notifications on the belt, only contracts to
// be processed." A deposit has not been judged, so nobody is late on it; a note
// is not work; a decision is his. Every alarm below inherits this - the unwatched
// domain, the stale finding, the recurrence, the carrier arithmetic - because all
// four were counting things nobody had agreed to do and calling the total a
// backlog.
const isOpen = (r) => IX.isOpenContract(r);
const isAwaitingTriage = (r) => IX.isAwaitingTriage(r);
const ago = (t) => (!t ? "never" : `${Math.round((now - t) / MS.h)}h ago`);

// A later record acts on an earlier one by naming it as subject. Append-only
// means the whole history is the state, so "has anyone touched this" is a
// question about what came after it, never about the record itself.
const actedOn = new Set(belt.filter((r) => r.subject).map((r) => String(r.subject)));

const findings = [];
const say = (key, claim, evidence, triggers, owner, dimension) =>
  findings.push({ key, claim, evidence, triggers, owner, dimension });

// ---- 1. A domain carrying work with nobody watching it ----------------------
//
// This is the one he found by eye. Generalised so it is never found by eye again.
{
  const watched = new Set(stations.map((s) => s.owns).filter(Boolean));
  const load = {};
  for (const r of belt) {
    if (!isOpen(r)) continue;
    for (const d of ["body", "mind", "spirit"]) {
      if (r.owner === d || String(r.triggers) === `contract:${d}`) load[d] = (load[d] || 0) + 1;
    }
  }
  for (const [dim, n] of Object.entries(load)) {
    if (watched.has(dim)) continue;
    say(
      `unwatched-dimension-${dim}`,
      `${dim} is carrying ${n} open item${n === 1 ? "" : "s"} and no station watches it.`,
      `Triggers declare what they own: ${stations.map((s) => `${s.id}->${s.owns || "nothing"}`).join(", ")}. Nothing owns ${dim}.`,
      `contract:${dim}`,
      dim,
      dim,
    );
  }
}

// ---- 2. Open, untouched, and old -------------------------------------------
//
// The question a person asks looking at the board: this has been sitting here,
// why has nothing happened? A finding nobody picked up is the leak's quieter
// cousin - it HAS an address, and the address never collected.
{
  const stale = belt.filter((r) => {
    if (!isOpen(r)) return false;
    if (actedOn.has(String(r.id))) return false;
    const t = runAt(r);
    return t && now - t > STALE_HOURS * MS.h;
  });
  if (stale.length) {
    const worst = stale.sort((a, b) => runAt(a) - runAt(b))[0];
    say(
      "open-and-untouched",
      `${stale.length} finding${stale.length === 1 ? " has" : "s have"} been open and untouched for over ${STALE_HOURS}h. Nothing has picked ${stale.length === 1 ? "it" : "them"} up.`,
      `Oldest: "${worst.id}" deposited ${ago(runAt(worst))}, addressed to ${worst.triggers}. Full list: ${stale.map((s) => s.id).join(", ")}. A finding with an address that never collects is a leak that passed the leak check.`,
      "operator",
      "operator",
      "architecture",
    );
  }
}

// ---- 3. The same thing, reported again ---------------------------------------
//
// A subject that keeps earning new findings is not being fixed; it is being
// re-noticed. That is a different problem from a single open item and wants a
// different answer.
{
  const bySubject = {};
  for (const r of belt) {
    const s = r.subject && String(r.subject);
    if (!s || s.startsWith("supersedes") || belt.some((x) => String(x.id) === s)) continue;
    (bySubject[s] ||= []).push(r);
  }
  for (const [subj, rs] of Object.entries(bySubject)) {
    // Only findings that are STILL OPEN count toward a recurrence. "The fix has
    // not held" is a claim about a live problem; three closed records on one
    // subject are three problems that were dealt with, and reporting them as a
    // recurrence puts finished work back in front of him.
    const live = rs.filter(isOpen);
    if (live.length < 3) continue;

    // A BACKLOG IS NOT A RECURRENCE, and the two look identical when they share
    // a label. Many findings ABOUT one thing is work to do; one thing found many
    // times is a fix that did not hold - and only the second deserves an alarm.
    //
    // The computable difference is TIME SPREAD. Twelve items queued inside one
    // minute are a programme somebody wrote down; three findings arriving over
    // days are a problem that keeps coming back.
    //
    // This rule raised three false alarms before the distinction was drawn, and
    // every one of them reached the most expensive place on the board - the
    // column that asks for his attention. The subject convention still stands,
    // that a subject names the specific thing and never the programme it belongs
    // to, but a convention nothing enforces gets broken again. It was, by the
    // person who wrote it, an hour after writing it.
    const times = live.map((r) => Date.parse(r.run || "")).filter((t) => !Number.isNaN(t));
    const spreadMs = times.length > 1 ? Math.max(...times) - Math.min(...times) : 0;
    if (spreadMs < MS.h) continue;

    say(
      `recurring-${subj.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}`,
      `"${subj}" has ${live.length} findings still open against it. It is being re-noticed rather than fixed.`,
      `Open: ${live.map((r) => r.id).join(", ")}.${rs.length > live.length ? ` (${rs.length - live.length} more on this subject are already closed and are not counted.)` : ""} Three or more OPEN findings on one subject means the fix has not held, or the subject is really a class of problem wearing one name.`,
      "operator",
      "operator",
      "architecture",
    );
  }
}

// ---- 4. Counts that disagree with what they count ---------------------------
//
// The board has been wrong this way twice - a panel counting 4 and rendering 2,
// and a centre counting held work as circulating. Both were found by eye.
{
  const open = belt.filter(isOpen);
  // ANY contracted domain is carried, not only the three drawn as carriers.
  // This check reported "1 open item counted nowhere" for an architecture item
  // whose only fault was that its domain had no card on the belt - the drawing
  // deciding what the data was allowed to be. Eighth place this one rule lives;
  // the board was corrected first and this followed, which is the drift the
  // cross-source check exists to catch and did.
  //
  // `open` is contracts only now, so `held` - work addressed to him - is no
  // longer inside it and is counted from its own kind. Subtracting a bucket that
  // can never contain anything would have made every unplaced contract vanish
  // into a category of zero.
  const carried = open.filter((r) => /^contract:/.test(String(r.triggers || "")) || ["body", "mind", "spirit"].some((d) => r.owner === d));
  const held = belt.filter(IX.isOpenDecision);
  const unplaced = open.length - carried.length;
  if (unplaced !== 0) {
    say(
      "open-items-counted-nowhere",
      `${unplaced} open contract${unplaced === 1 ? " rides" : "s ride"} no carrier at all.`,
      `open contracts ${open.length} = carried ${carried.length} + ${unplaced} unaccounted. (${held.length} decision(s) are held for him and ${belt.filter(isAwaitingTriage).length} deposit(s) await triage; neither is a contract and neither belongs in this sum.) A contract naming no domain is invisible while being counted, which is the leak this board exists to expose.`,
      "contract:body",
      "body",
      "body",
    );
  }
}

// ---- 5. the belt says one thing, the board shows another ---------------------
//
// The seer checks that the board agrees with ITSELF - chips against rows, counts
// against what they label. It passed for hours while the board was wrong,
// because the board was perfectly coherent and coherently wrong: a finding
// closed by a later record was still being drawn as open, so the chip and the
// rows agreed on a number that should not have existed.
//
// No single-source check can catch that. This one compares two sources - what
// the belt says is still open, against how many rows the seer actually counted
// on the page - which is the only way a shared assumption gets caught.
//
// ---- WHAT WAS WRONG WITH IT, AND IT WAS THIS MACHINE ------------------------
//
// It reported: "The belt has 32 items still open and the board is drawing 29
// rows." Neither number was wrong. They were taken five minutes apart.
//
// `stillOpen` was counted from the belt AT THE MOMENT THIS RAN. `seen.rowTotal`
// was read out of board-see-detail.json, which the seer had written five minutes
// earlier - and six records were deposited in between. Counted as of the seer's
// own timestamp the belt said 29 and the board drew 29, exactly.
//
// The staleness guard existed and checked the wrong pair of clocks. It asked
// whether the HTML was newer than the newest record, which says the page had
// been rebuilt - and says nothing at all about whether the seer had looked at
// that page. The number being compared is the SEER'S, so the seer's timestamp is
// the one that has to be current. A guard reading a different file from the one
// whose freshness it is protecting is a green check that checks nothing.
//
// Fixed twice over, because the timing was only half of it:
//
//   1. The seer's OWN checkedAt must be newer than the newest record. It is the
//      author of the number.
//   2. The comparison is now against what the BOARD says it drew, written by the
//      builder into board-counts.json, rather than against a count this machine
//      re-derives from the belt. The re-derivation was a ninth copy of the
//      board's row rule and it was already wrong in a second way: the incoming
//      column legitimately omits whatever is on the belt, so the moment a live
//      agent picked something up this check would have cried disagreement about
//      a board that was perfectly right.
//
// Two comparisons now, each between two real sources: belt against the builder's
// claim, and the builder's claim against rendered geometry. Neither reader
// re-derives the other's rule, which is the only arrangement in which a
// disagreement means something.
{
  const detail = path.join(CTX, "board-see-detail.json");
  const countsFile = path.join(CTX, "board-counts.json");
  const readAt = (f, key) => {
    try {
      const j = JSON.parse(fs.readFileSync(f, "utf8"));
      return { j, at: Date.parse(j[key] || "") || 0 };
    } catch {
      return null;
    }
  };
  const seerOut = readAt(detail, "checkedAt");
  const boardOut = readAt(countsFile, "builtAt");
  const newestRecord = Math.max(0, ...belt.map((r) => Date.parse(r.run || "") || 0));

  // 1. THE BELT AGAINST WHAT THE BOARD SAYS IT DREW.
  if (boardOut && boardOut.at > newestRecord) {
    const openNow = belt.filter(isOpen).length;
    const claimed = Number(boardOut.j.openContracts);
    if (Number.isFinite(claimed) && claimed !== openNow) {
      say(
        "belt-and-board-disagree",
        `The belt has ${openNow} contract${openNow === 1 ? "" : "s"} still open and the board built itself believing there ${claimed === 1 ? "was 1" : `were ${claimed}`}.`,
        `Counted from the belt just now, against the figure the builder wrote into board-counts.json at ${boardOut.j.builtAt}, with no record deposited since. Two readers of one belt disagreeing about what is open means one of them holds a rule the other does not.`,
        "contract:body",
        "body",
        "body",
      );
    }
  }

  // 2. WHAT THE BOARD SAYS IT DREW AGAINST WHAT IS ACTUALLY ON SCREEN.
  //
  // Only when the seer looked AFTER the build, and after the newest record.
  // Otherwise the seer is describing a different page, which is not a lie - it is
  // an observation that has not caught up, and reporting it as a disagreement
  // would fire after every deposit. That flood is exactly what this check did.
  if (seerOut && boardOut && seerOut.at >= boardOut.at && seerOut.at > newestRecord) {
    const drew = Number(boardOut.j.incomingRows);
    const seen = seerOut.j.seen;
    if (seen && typeof seen.rowTotal === "number" && Number.isFinite(drew) && drew !== seen.rowTotal) {
      say(
        "board-and-screen-disagree",
        `The board built ${drew} incoming row${drew === 1 ? "" : "s"} and the seer counted ${seen.rowTotal} on the rendered page.`,
        `The builder's own figure against rendered geometry in a real browser. ${seen.rowTotal > drew ? "The page is showing rows the builder did not put there." : "Rows the builder emitted are not reaching the screen, which is worse - they cannot be acted on if they cannot be seen."}`,
        "contract:body",
        "body",
        "body",
      );
    }
  }

  // 3. A CLOSER THAT NAMED ITS TARGET IN PROSE CLOSED NOTHING.
  //
  // closedBy is keyed on the subject string and asks for an exact match against
  // a record id, so "supersedes belt record <id>" contains the id without
  // equalling it and resolves nothing. Two findings were answered within 35
  // minutes and then reported to the operator as open and neglected for 26 hours.
  //
  // The matcher is NOT made cleverer - a closure applied to the wrong record
  // deletes real work silently, which is strictly worse than one that failed to
  // apply. Exact match, and a loud complaint.
  if (IX.orphanClosers.length) {
    say(
      "closer-names-its-target-in-prose",
      `${IX.orphanClosers.length} terminal record${IX.orphanClosers.length === 1 ? "" : "s"} name${IX.orphanClosers.length === 1 ? "s" : ""} a finding in prose instead of by id, so ${IX.orphanClosers.length === 1 ? "it closed" : "they closed"} nothing.`,
      IX.orphanClosers
        .map((o) => `"${o.id}" has subject "${o.subject}" and appears to mean "${o.near}"`)
        .join("; ") +
        `. A subject must EQUAL the target's id. ${IX.proseSubjectClosers.length > IX.orphanClosers.length ? `${IX.proseSubjectClosers.length - IX.orphanClosers.length} more terminal record(s) carry a prose subject that names no id at all and cannot be recovered by any rule; those have to be re-filed by hand.` : ""} Fix the records, not the matcher: a closer that nearly matches an id would start closing the wrong findings.`,
      "contract:architecture",
      "architecture",
      "architecture",
    );
  }

  // 4. A TRIAGE QUEUE NOBODY IS WORKING.
  //
  // Open counts count contracts only now, which is right - and it means an
  // unjudged deposit can no longer trip the stale alarm above. That would have
  // been a silent hole: thirty deposits could sit for a week and every number on
  // the board would read healthy, because none of them is work yet.
  //
  // So the pressure is reported in its own terms. Not "N findings are late" -
  // nobody is late on a deposit - but "N have been sitting unjudged", which is a
  // fact about the factory rather than about any one of them.
  {
    const cold = belt.filter((r) => {
      if (!isAwaitingTriage(r)) return false;
      const t = runAt(r);
      return t && now - t > STALE_HOURS * MS.h;
    });
    if (cold.length) {
      const worst = cold.slice().sort((a, b) => runAt(a) - runAt(b))[0];
      say(
        "deposits-awaiting-triage",
        `${cold.length} deposit${cold.length === 1 ? " has" : "s have"} been waiting over ${STALE_HOURS}h for somebody to judge whether ${cold.length === 1 ? "it is" : "they are"} work.`,
        `Oldest: "${worst.id}", deposited ${ago(runAt(worst))}. A deposit is not owed by anyone, so it cannot go stale the way a contract can - which is exactly why it needs its own alarm. Accept one with triage.cjs, or from the board, and it becomes a contract that the intake worker can dispatch.`,
        "operator",
        "operator",
        "architecture",
      );
    }
  }
}

// ---- deposit, once per distinct finding --------------------------------------

const beltText = fs.readFileSync(BELT, "utf8");
let deposited = 0;
for (const f of findings) {
  const id = `critic-${f.key}`;
  if (beltText.includes(`"${id}"`)) continue;
  fs.appendFileSync(
    BELT,
    JSON.stringify({
      id,
      run: new Date(now).toISOString(),
      driver: "I7",
      tier: 1,
      dimension: f.dimension,
      // The subject is what this finding is ABOUT, and it must be specific.
      //
      // Every board finding used to carry the same string, so rule 3 below -
      // "three findings on one subject means it is being re-noticed rather
      // than fixed" - counted three DIFFERENT problems as one recurring one and
      // raised a false alarm against its own deposits. It reached the operator's
      // NEEDS YOU column, which is the most expensive place in the system to
      // put a thing that is not true.
      //
      // Keyed this way the rule finally means what it says: the same defect,
      // found again, after somebody thought it was fixed.
      subject: `board: ${f.key}`,
      // A WATCHER DEPOSITS, IT DOES NOT CONTRACT.
      //
      // Operator, 2026-09-12: "deposits to be converted into contracts." This
      // machine finds things; deciding that a finding is work somebody owes is a
      // separate act somebody takes. Writing `contract` here would be the factory
      // contracting work nobody judged, which is the defect the kind taxonomy
      // exists to remove - committed by the machine that reports it.
      //
      // Except what is addressed to HIM, which is a decision by definition: the
      // address and the kind say the same thing, and saying it once would leave
      // the other to be inferred.
      kind: f.triggers === "operator" ? KIND.DECISION : KIND.DEPOSIT,
      claim: f.claim,
      evidence: f.evidence,
      seen: false,
      confidence: "measured",
      triggers: f.triggers,
      owner: f.owner,
    }) + "\n",
    "utf8",
  );
  deposited++;
}

const report = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), found: findings.length, deposited, findings };
// manager.json, not board-critic.json. Verified before renaming that nothing
// reads the old filename - a report nobody consumes can be renamed freely, and a
// report somebody consumes cannot.
fs.writeFileSync(path.join(CTX, "manager.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`manager: ${findings.length} thing(s) the board is showing that nobody is acting on  [${report.repo}]`);
  for (const f of findings) {
    console.log(`\n  ${f.claim}`);
    console.log(`    ${f.evidence}`);
    console.log(`    -> ${f.triggers}`);
  }
  if (!findings.length) console.log("  Nothing shown on the board is going unaddressed.");
  if (deposited) console.log(`\n  deposited ${deposited} (the rest were already on the belt)`);
}

process.exit(findings.length ? 1 : 0);
