# Universal machines

One copy, every repo.

These are the machines of the Living Factory (`PLAN-LIVING-FACTORY-001`, registered in Telechurch at `refer.app/plan/refer.living-factory.plan.md`) that were never any one repo's. A clock, a pulse, a belt check, a provider watch — every repo that runs a factory needs all of them, and keeping a copy in each is how four copies become four behaviours.

## How a repo uses one

The repo declares **which** machines it runs and **how often**, beside its own machinery, in a `*.station.json`:

```json
{
  "id": "pulse",
  "run": "factory:pulse-check",
  "every": "1h",
  "floor": "5m",
  "why": "..."
}
```

`factory:<name>` resolves to `<factory root>/machines/<name>.cjs`. The root is discovered — `REFER_FACTORY_ROOT`, then the known path, then a sibling directory — and a factory that cannot be found is reported **as a missing factory**, never as a station that simply failed. Those are different problems with different fixes.

That split is deliberate and it is the same one the station files already make: **the machine is universal, the cadence is local.** A repo that wants the pulse hourly and a repo that wants it daily share the machine and disagree only in their own declaration.

## The one rule for writing a machine here

**Resolve the target repo from `process.cwd()`, never from `__dirname`.**

The clock spawns machines with `cwd` set to the consuming repo. A machine that resolves paths against its own location will read **this** repo's belt while reporting on another one — silently, with plausible numbers. That is the worst failure available to a watcher, and it is the single mistake this directory makes easy to commit.

## The belt's vocabulary lives in `kind.cjs`, and nowhere else

Every machine that reads the belt needs the same three answers: **is this record finished**, **is it only bookkeeping about another record**, and **what kind of thing is it**. Those rules were written out by hand in six files — the board, the manager, both workers, the deposit lookup and the night watch — and they drifted every single time one of them changed. The board's own comments count the drift seven times over, and the cross-source check caught the eighth.

There is one copy now. `require("./kind.cjs")`, and from a repo, resolve it the way `build-tracker.cjs` does: `REFER_FACTORY_ROOT`, then the known path, then a sibling directory, and **stop loudly** if it is missing rather than falling back to a private copy. A fallback copy is the drift, deliberately.

### Four kinds, three destinations

| Kind | Where it goes | May it be dispatched? | Does it count as open work? |
| ---- | ------------- | --------------------- | --------------------------- |
| **CONTRACT** | the belt | yes | yes — and it is the only thing that does |
| **DEPOSIT** | incoming, awaiting triage | no | no — nobody is late on it yet |
| **NOTE** | the reading area | no | no — it is read, or it is not |
| **DECISION** | incoming, marked his | never | no — counted in his column only |

Operator, 2026-09-12: *"don't put notifications on the belt, only contracts to be processed."* A note that is never read is not a failure of the factory; a contract that is never worked is. That asymmetry is why they cannot share a column.

### How kind is inferred, and why it refuses to guess

The belt is append-only. Nothing is ever edited or backfilled, so kind is worked out at read time from what is already in each record:

1. **An explicit `kind` wins** — the record's own, or one attached by a later record naming it as subject, the same later-wins mechanism that already carries `recommend` and `lesson`. A word outside the four is reported as a vocabulary fault, not guessed at, and the record falls to DEPOSIT.
2. **`triggers` is `operator`, or `operatorDecision` is set** → DECISION.
3. **The record is terminal** (`terminal:*` or `closed`) → CONTRACT. It is finished: it cannot be dispatched, cannot age, cannot inflate a count. Kind decides only which column draws it, and finished work belongs on the resolution table.
4. **Everything else** → DEPOSIT.

Rule 4 is the important one. `contract:<dim>` looks like it should mean CONTRACT and does not: the operator's own example of a notification carried `contract:mind`. `recommend` was tested as a discriminator and fails both ways — that same notification has none, and the Tailwind job he called *"a genuine contract"* has none either. So **no open record is inferred to be a contract.** Work becomes work by an act.

**NOTE is never inferred either**, for the mirror reason. Filing something as a note moves it where nothing is owed, and doing that to a real defect hides it — the first watch of the mind domain reported a `SECURITY DEFINER` function with no pinned search path inside a record whose first sentence is an announcement. That is a DEPOSIT, and triage is where somebody decides.

### Triage is a recorded act

`node <factory>/machines/triage.cjs <handle|id> --contract`, or the **ACCEPT AS WORK** button on a deposit row of the board (served by `serve-tracker.cjs`, which posts to `/triage`). Both append the same record: `subject` naming the target, `kind` set, `triggers: "terminal:triaged"`.

**`triaged` is in the NOTING family and must stay there.** A terminal record naming a subject normally *closes* it, so without that, accepting a deposit as work would file it as finished the instant somebody agreed to do it.

### A closer must name its target by id, exactly

`closedBy` is keyed on the subject string and asks for an exact match against a record id. A closer written as *"supersedes belt record `<id>`"* contains the id without equalling it and closes nothing — two findings were answered within 35 minutes and then reported as open and neglected for 26 hours because of it.

**When a record closes another, its `subject` IS the target's id.** The matcher is deliberately not made cleverer: a closure applied to the wrong record deletes real work silently, which is strictly worse than one that failed to apply. Near misses are reported by `beltIndex().orphanClosers`, and every prose-subject closer by `.proseSubjectClosers`.

### Read state is not a belt record

It lives in `.claude/agent-context/board-read.json`, keyed by record id with the time it was read. Absent means unread, so a new record is unread by default without anyone writing anything, and **read is never inferred from age**. A read receipt is evidence about *him*; the belt is evidence about the app, and mixing them puts glancing into the work ledger.

## What is here

| Machine | What it asks |
| ------- | ------------ |
| `kind.cjs` | Not a station — the belt's vocabulary and the handle numbering, required by everything that reads it. See above. |
| `triage.cjs` | Turns a deposit into a contract, and records that somebody did. `--list` shows what is waiting. |
| `watcher.cjs` | **Zone 1, incoming.** What should be judged, in what order, by when. Publishes a standing ordered ready-list. See below. |
| `pulse-check.cjs` | Did every station that should have deposited, deposit — and is the belt still sound? Derives its expectations from the repo's own station declarations. |
| `pulse-belt.cjs` | The tick, made visible: one card incoming, one on the belt, one just resolved, removed after three stages. **Universal state, not per repo** — see below. |
| `provider-watch.cjs` | The WORLD tier. Covers Docker fully; names Supabase and Cloudflare as session-only rather than omitting them, because an absent provider reads as fine and "nobody looked" is a different fact from "nothing wrong". |

## The watcher, and the four zones it does not cover

`watcher.cjs` covers **incoming, and only incoming** — deposits awaiting triage and decisions held for him. The other four zones named in `watcher-has-five-zones` (the belt, the rail of rhythms, the intake doors, the closed pile) are declared in the machine and marked NOT COVERED in every report it prints, because a watcher that half-covers five zones reports confidently about places it cannot see.

It is the **judging** half of the factory, so it takes a **timestamped lock** before it reads anything — the scheduler's singleton protects the mechanical half, and two watchers reaching different conclusions about one item is a corruption rather than a delay. Timestamped and not boolean, so a crashed holder expires after 15 minutes instead of wedging judgement shut forever. Taken with exclusive create (`wx`), which is atomic, so the winner of a race is decided by the filesystem rather than by a read-then-write window.

**Five outcomes and no more.** HOLD (fresh, timer still running — *silent*, counted only), COMPLETE (real but underspecified — the gap is named), PROMOTE (true, specified, owned, timer expired), RETIRE (provably no longer live), RAISE (his by law, or the proposed action is on the never-autonomous list).

**Three rules that are easy to break and expensive to break:**

- **Re-verification runs before prioritising, on anything older than four hours**, and it is a **falsification** test rather than a confirmation one — it asks whether anything has changed that would make the record false, not whether the record can be re-proven. A waiting deposit decays; attention rises with age rather than falling.
- **An expired timer forces a decision and never a promotion.** Expiry raises the item into the front band and requires one of the five. Auto-promotion manufactures work nobody judged.
- **Priority is computed, never a field** — tier, waited as a fraction of its own timer, how many open records name it, and whether it is his, which outranks everything. A hand-set priority field becomes another blank nobody fills.

**Promotion is built and disarmed.** Without `--arm` the machine writes nothing to the belt at all; it writes `.claude/agent-context/watcher-queue.json`, a **standing** ordered list with a freshness stamp so intake can refuse a decayed judgement. `ready` is empty while disarmed and says so in words, because an empty list with no explanation reads as an empty morning. `--arm-limit N` caps how many **acceptances** are written in one run (annotations are never capped, since they accept nothing); acts are taken in queue order, so a RETIRE is never starved by a run of promotions.

## Two kinds of state, and the board draws both

Operator, 2026-09-12: *"why is the pulse repo sensitive, shouldn't it be universal, doesn't the living factory show both universal and app deposits?"*

Yes — and the first version of `pulse-belt.cjs` got this wrong by copying the belt's shape onto something that is not shaped like the belt. The distinction is worth stating once, because "the machine is universal" and "its output is universal" are different claims and only the first is true of most machines here:

| | Lives | Why |
| --- | ----- | --- |
| **App state** — findings, read receipts, baselines | `<repo>/.claude/agent-context/` | It is *about* that repo. A shared belt would merge several repos' work into one unreadable stream. |
| **Factory state** — the tick, the host block | `<factory>/.refer-factory/` | It is about the *factory*, which there is one of. Per-repo copies would be several answers to a question that has one. |

`node-heartbeat.cjs` already writes the host block to `<factory>/.refer-factory/hive-node-registry.json`, and `build-tracker.cjs` reads it back through the same discovery and cites where it read it — *"the host is part of the factory, so its state belongs on the board."* The pulse is the same kind of thing and follows the same path.

**What goes wrong if you get it backwards.** There is one scheduler and one `living-factory-pulse` routine, so one heartbeat. A per-repo pulse belt gives N beat counters for that one heartbeat — and, worse, its gap detection reports a hole in every repo the scheduler did not happen to tick that round. It announces death in a perfectly alive factory, which is the failure class this whole directory exists to remove.

**A machine writing universal state must refuse a wrong `REFER_FACTORY_ROOT` rather than fall back.** `pulse-belt.cjs` lives in the factory, so it can always find it via `__dirname` and never needs to search — the override exists only so a test can write into a fixture. A bogus override that silently fell back to the real factory would write **live** cards during a test run. That is not hypothetical: it happened once on 2026-09-12 and left two real files behind, which is why the check exists and why `pulse-belt-cycle.mjs` case J asserts it.

## What is not here, and why

**The belt itself** (`.claude/agent-context/findings.jsonl`) stays per repo. Findings are *about* a repo; a shared belt would merge four repos' work into one unreadable stream. The board rolls them up instead.

**Station declarations** stay per repo, for the same reason cadence is local.

**Stack-specific gates** — an Angular style checker, a Supabase policy check — belong here too but only run where a repo declares them. They are universal in the sense that any repo *on that stack* wants them, which is a third thing from "universal to all repos" and from "this app only".
