/**
 * KIND - what a belt record IS, as opposed to what state it is in.
 *
 * UNIVERSAL VOCABULARY. Required by every machine that reads the belt, and by
 * the board that draws it. One implementation, one file, because this rule has
 * already been written twice in eight places in this factory and drifted every
 * single time - see the account in build-tracker.cjs, which counts the copies.
 *
 * THE PROBLEM THIS SOLVES
 *
 * Operator, 2026-09-12: "some of the deposits are actually notifications or
 * chats, not necessarily something to be fixed." And then, narrowing it: "don't
 * put notifications on the belt, only contracts to be processed."
 *
 * The belt mixed four different things wearing one shape. "The host no longer
 * sleeps" is a statement of fact with nothing owed. "Mind is now watched" is an
 * announcement that happened to carry contract:mind, so it rode the incoming
 * column as a debt against mind. A genuine job like the hand-written Tailwind
 * utilities was drawn identically to both. The `triggers` field encodes WHO is
 * addressed and never WHAT KIND of thing it is, so no column could separate
 * reading from doing.
 *
 * FOUR KINDS, AND THREE DESTINATIONS
 *
 *   CONTRACT   work somebody owes. The ONLY kind that may ride the belt, be
 *              dispatched, or count toward open work, domain tallies and age
 *              alarms.
 *   DEPOSIT    seen, not yet judged. Waits in incoming for triage. Not work
 *              yet, so it is not owed by anyone and cannot be dispatched.
 *   NOTE       a statement to read. Goes to a reading area. Two states only,
 *              unread and read. No worker, no timer, no dispatch, no closure.
 *   DECISION   reserved to him by law. Keeps the hourglass it already had.
 *
 * A note that is never read is not a failure of the factory. A contract that is
 * never worked is. That asymmetry is the whole reason they cannot share a
 * column.
 *
 * THE INFERENCE RULES, AND WHY THEY ARE DELIBERATELY TIMID
 *
 * The belt is append-only. Existing records cannot be edited and must not be
 * backfilled, so kind is inferred at read time from what is already there.
 *
 *   1. AN EXPLICIT `kind` WINS. Either the record's own, or one attached by a
 *      later record naming it as subject - the same later-wins mechanism that
 *      already carries `recommend` and `lesson`. A word outside the four is
 *      NOT guessed at: it reports as a vocabulary fault and the record is a
 *      DEPOSIT.
 *
 *   2. `triggers` is `operator`, or the record carries `operatorDecision` -> a
 *      DECISION. The vocabulary already means "it is his".
 *
 *   3. The record is terminal (`terminal:*` or `closed`) -> a CONTRACT. It is
 *      finished: it cannot be dispatched, cannot age, and cannot inflate any
 *      open count. Its kind decides only which column it is drawn in, and
 *      finished work belongs on the resolution table.
 *
 *   4. EVERYTHING ELSE IS A DEPOSIT.
 *
 * Rule 4 is the important one and it is not laziness. `contract:<dim>` looks
 * like it should mean CONTRACT and it does not: the operator's own example of a
 * notification carried `contract:mind`. So the trigger cannot be trusted to
 * name a kind, and there is no other signal on the belt that separates a job
 * from an announcement. `recommend` was tested as a discriminator and fails in
 * both directions - the mind announcement has none, and the Tailwind job the
 * operator called "a genuine contract" has none either.
 *
 * Therefore NO OPEN RECORD IS INFERRED TO BE A CONTRACT. Work becomes work by
 * an act, which is exactly what was missing:
 *
 * Operator: "deposits to be converted into contracts" - a stage the model did
 * not have. Guessing something into the work queue is the failure this whole
 * change removes, so the guess is refused rather than made politely.
 *
 * NOTE IS NEVER INFERRED EITHER, for the mirror-image reason. Filing something
 * as a note moves it to a place where nothing is owed, and doing that to a real
 * defect hides it. The first watch of the mind domain reported a SECURITY
 * DEFINER function with no pinned search path inside a record whose first
 * sentence is an announcement; read as a notification it would have gone to a
 * reading area. It is a DEPOSIT, and triage is where someone decides.
 *
 * TRIAGE IS A RECORDED ACT
 *
 * Promoting a deposit appends a record: `subject` naming it, `kind` set, and
 * `triggers: "terminal:triaged"`.
 *
 * `triaged` MUST live in the NOTING family. A terminal record naming a subject
 * normally CLOSES it - so without this, accepting a deposit as work would file
 * it as finished the instant it was accepted, and the board would move it
 * straight to RESOLVED. It is in NOTING below for that reason and for no other.
 */

const KIND = Object.freeze({
  NOTE: "note",
  DEPOSIT: "deposit",
  CONTRACT: "contract",
  DECISION: "decision",
});

const KIND_WORDS = Object.freeze(Object.values(KIND));

// A word that means FINISHED closes what it names. A word that means NOTED does
// not - attaching a lesson to a finding explains it, which is the opposite of
// fixing it, and reading one as a resolution made four open problems vanish the
// moment somebody explained them.
//
// `triaged` joins them because ACCEPTING work is not finishing it.
const NOTING = /^terminal:(recorded|definition|annotation|note|triaged)$/;

const trig = (r) => String((r && r.triggers) || "").trim();
const selfTerminal = (r) => /^(terminal:.+|closed)$/.test(trig(r));
const isNoting = (r) => NOTING.test(trig(r));

/**
 * Read the belt once and answer every question about it from one place.
 *
 * Returns predicates rather than arrays so a caller can ask about a single
 * record without re-deriving the rule - which is how eight copies of "what
 * closes a finding" came to exist in this factory, four of them wrong.
 */
function beltIndex(records) {
  const list = Array.isArray(records) ? records.filter(Boolean) : [];
  const ids = new Set(list.map((r) => String(r.id)));

  // What a later record says about an earlier one. Newest wins, because it was
  // written with more of the story.
  const closedBy = new Map();
  const kindFor = new Map();
  const triagedBy = new Map();
  const badKinds = [];
  // ---- A CLOSER WITH A PROSE SUBJECT CLOSES NOTHING --------------------------
  //
  // closedBy is keyed on the subject STRING and isDone asks whether that string
  // equals a record's id. So a terminal record closes a finding only on an exact
  // match - and a closer written as "supersedes belt record <id>" contains the id
  // without equalling it, so it closes nothing and says nothing.
  //
  // Measured 2026-09-12: two findings were answered within 35 minutes of being
  // filed and then reported to the operator as open and neglected for 26 hours,
  // because the records that answered them named their target in prose.
  //
  // THE MATCHER IS NOT MADE CLEVERER. A substring or fuzzy match would start
  // closing the wrong findings, and a closure applied to the wrong record is
  // strictly worse than one that did not apply - it deletes real work from the
  // board silently, where this failure only fails to remove finished work.
  //
  // Exact match, plus a loud complaint. A terminal record naming a subject that
  // matches no known id is reported here, in the same place a bad trigger word
  // is reported, so the fix is to correct the record rather than to teach the
  // reader to guess.
  const orphanClosers = [];
  const proseSubjectClosers = [];

  for (const r of list) {
    const subject = r.subject && String(r.subject);

    if (selfTerminal(r) && !isNoting(r) && subject) {
      closedBy.set(subject, r);
      // ONLY THE NEAR MISSES ARE REPORTED, and that restraint is the whole
      // value. Most terminal records name the THING they are about - "the pulse
      // strip", "the presentation screen" - and were never trying to close a
      // record; reporting those would bury the real fault in twelve lines of
      // noise. A subject that CONTAINS a known id and does not equal it was
      // unmistakably reaching for that record and missed.
      if (!ids.has(subject)) {
        const near = [...ids].find((id) => id.length > 8 && subject.includes(id)) || null;
        // Every prose-subject closer is listed, because the second measured case
        // - "hive-node-registry.json, node telechurch" against
        // hive-node-registry-is-the-missing-layer - shares no substring with its
        // target and no honest rule can recover it. The list is what a person
        // reads; `near` is what a machine can act on without guessing.
        proseSubjectClosers.push({ id: String(r.id), subject, triggers: trig(r), near });
        if (near) orphanClosers.push({ id: String(r.id), subject, triggers: trig(r), near });
      }
    }

    // A kind can be declared on the record itself or attached later. Both are
    // validated, and an unrecognised word is reported rather than guessed at.
    if (r.kind != null) {
      const w = String(r.kind).trim().toLowerCase();
      if (!KIND_WORDS.includes(w)) badKinds.push({ id: String(r.id), kind: String(r.kind) });
      else if (subject && ids.has(subject) && subject !== String(r.id)) {
        kindFor.set(subject, w);
        if (isNoting(r) && /^terminal:triaged$/.test(trig(r))) triagedBy.set(subject, r);
      } else {
        kindFor.set(String(r.id), w);
      }
    }
  }

  const isDone = (r) => selfTerminal(r) || closedBy.has(String(r.id));
  const isCloser = (r) => selfTerminal(r) && !isNoting(r) && r.subject && ids.has(String(r.subject));
  const isAnnotation = (r) => isNoting(r) && r.subject && ids.has(String(r.subject));

  const kindOf = (r) => {
    const declared = kindFor.get(String(r.id));
    if (declared) return declared; // rule 1
    if (trig(r) === "operator" || r.operatorDecision) return KIND.DECISION; // rule 2
    if (selfTerminal(r)) return KIND.CONTRACT; // rule 3
    return KIND.DEPOSIT; // rule 4
  };

  const is = (k) => (r) => kindOf(r) === k;

  // A record that is bookkeeping about another record is not itself a row on
  // any column, whatever its kind.
  const isBookkeeping = (r) => isCloser(r) || isAnnotation(r);

  // OPEN MEANS A CONTRACT SOMEBODY STILL OWES, and nothing else. Deposits are
  // not owed yet; notes are never owed; decisions are his and are counted in
  // their own place, never against a domain.
  const isOpenContract = (r) => kindOf(r) === KIND.CONTRACT && !isDone(r) && !isBookkeeping(r);
  const isAwaitingTriage = (r) => kindOf(r) === KIND.DEPOSIT && !isDone(r) && !isBookkeeping(r);
  const isOpenDecision = (r) => kindOf(r) === KIND.DECISION && !isDone(r) && !isBookkeeping(r);

  const counts = {
    total: list.length,
    note: list.filter(is(KIND.NOTE)).length,
    deposit: list.filter(is(KIND.DEPOSIT)).length,
    contract: list.filter(is(KIND.CONTRACT)).length,
    decision: list.filter(is(KIND.DECISION)).length,
    openContracts: list.filter(isOpenContract).length,
    awaitingTriage: list.filter(isAwaitingTriage).length,
    openDecisions: list.filter(isOpenDecision).length,
  };

  return {
    KIND,
    NOTING,
    ids,
    closedBy,
    kindFor,
    triagedBy,
    badKinds,
    orphanClosers,
    proseSubjectClosers,
    selfTerminal,
    isNoting,
    isDone,
    isCloser,
    isAnnotation,
    isBookkeeping,
    kindOf,
    isNote: is(KIND.NOTE),
    isDeposit: is(KIND.DEPOSIT),
    isContract: is(KIND.CONTRACT),
    isDecision: is(KIND.DECISION),
    isOpenContract,
    isAwaitingTriage,
    isOpenDecision,
    counts,
  };
}

// ---- THE HANDLE HE SAYS OUT LOUD -------------------------------------------
//
// One letter for the domain, one number, stable forever because the belt is
// append-only and the Nth body record is always B<n>. Record ids are written for
// machines - "filter-verified-its-own-assignment" is precise and unsayable - and
// asking him to read one aloud is asking him to do the machine's filing.
//
// IT LIVES HERE BECAUSE IT WAS ABOUT TO BE WRITTEN A THIRD TIME. triage.cjs and
// deposit.cjs each carried a hand-written copy, both with a comment explaining
// that the duplication was deliberate: handles.json is written by the board, and
// a lookup that only works after a successful render fails exactly when
// something is wrong. That reasoning is right and it argues against reading the
// BOARD'S FILE - not for keeping N copies of eight lines. This is the same
// answer kindOf and isDone already got, for the same reason: every rule written
// twice in this factory has drifted, and the board's own comments count that
// eight times over.
//
// It derives from the belt, so no two callers can disagree.
const HANDLE_LETTER = Object.freeze({ body: "B", mind: "M", spirit: "S", architecture: "A", hive: "H", world: "W", dev: "D", law: "L", refer: "R", shed: "X" });

function handleIndex(records) {
  const list = Array.isArray(records) ? records.filter(Boolean) : [];
  const byHandle = new Map();
  const handleOf = new Map();
  const seq = {};
  for (const r of list) {
    const dim = String(r.dimension || "").toLowerCase();
    const letter = /^X\d/.test(String(r.driver || "")) ? "X" : HANDLE_LETTER[dim] || (dim ? dim[0].toUpperCase() : "?");
    seq[letter] = (seq[letter] || 0) + 1;
    const h = `${letter}${seq[letter]}`;
    byHandle.set(h, r);
    handleOf.set(String(r.id), h);
  }
  return { byHandle, handleOf, HANDLE_LETTER };
}

/** The record a triage act appends. One shape, so every door writes the same thing. */
function triageRecord({ id, kind, dimension, owner, to, by, why }) {
  const k = String(kind || "").trim().toLowerCase();
  if (!KIND_WORDS.includes(k)) throw new Error(`kind must be one of ${KIND_WORDS.join(", ")}, not "${kind}"`);
  return {
    id: `triaged-${String(id).slice(0, 60)}-${Date.now().toString(36)}`,
    run: new Date().toISOString(),
    driver: "I7",
    tier: 2,
    dimension: dimension || "architecture",
    subject: String(id),
    kind: k,
    claim:
      k === KIND.CONTRACT
        ? `Accepted as work${to ? ` and addressed to ${to}` : ""}.${why ? ` ${why}` : ""}`
        : `Reclassified as ${k}.${why ? ` ${why}` : ""}`,
    evidence: `Triage by ${by || "unattributed"}. A deposit becomes a contract only by an act, and this is the act - recorded rather than inferred, so the belt can say who accepted the work and when.`,
    seen: true,
    confidence: "measured",
    // NOT a closure. terminal:triaged is in the NOTING family precisely so that
    // accepting work does not file it as finished.
    triggers: "terminal:triaged",
    owner: owner || "architecture",
  };
}

module.exports = { KIND, KIND_WORDS, NOTING, HANDLE_LETTER, selfTerminal, isNoting, beltIndex, handleIndex, triageRecord };
