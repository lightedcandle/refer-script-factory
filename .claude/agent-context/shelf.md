# Thread register — refer-script-factory

Open threads, what is shelved and why, and what closed. A thread leaves this
conversation by being ratified, closed or shelved — never by going quiet.

Shelving is an act. Each entry records **what must become true to bring it
back**. "Later" is not a revival condition.

---

## SHELVED

### The factory as a platform — database, sovereign node, HQ/outpost

**Raised** 2026-09-12 by the operator: *"I think the script factory is going to
need a database, and we might need to use the sovereign node db capabilities for
this so we can have it live and accessible on the web... tied into anyone's
claude for tracking deposits and remote management and building. akin to hq and
outpost."*

**Shelved the same day**, by him: *"lets keep this under horizon, and we'll see
what is natively happening and it will derive its needs naturally."*

**Revival condition — a second host writing to a belt.** Not size, and not the
web. The belt is 194 records / 207 KB, fully re-parsed by roughly ten machines
every five minutes; that is fine now and fine at ten thousand. What append-only
JSONL cannot survive is concurrent writers on different disks, because today the
ordering guarantee is the filesystem and nothing else. The moment a deposit
arrives from a host that is not this one, the storage question is live and
answered — and not before.

**What was derived while it was open, so it does not have to be derived again:**

- If the belt moves, it moves to an **append-only event log**, never a mutable
  `findings` table. `kind.cjs` infers kind at read time *because* nothing is ever
  edited or backfilled; an UPDATE statement silently deletes the property that
  makes the belt its own audit log.
- **The read half is already specified and is safe to ship alone.**
  `src/integrations/sovereign-node/` implements `refer-script-factory-node-read-v1`
  — six tools, read-only — and `AGENTS.md` forbids moving Node authority or
  mutation into the provider-neutral core. Remote *tracking* is that contract.
  Remote *management and building* is a different product with a different risk
  profile, and the seam between them already exists.
- **A remote deposit must arrive as DEPOSIT, never CONTRACT.** `kind.cjs` already
  refuses to infer contract-ness, and triage is a recorded act. That rule
  survives the move to a platform unchanged, and it is exactly what makes it
  safe to let a stranger's agent deposit: they can spend storage, never
  judgement.
- The never-autonomous list must be refused **server-side**. An agent that can be
  argued with must not be the thing holding that line.
- **HQ/outpost is already the shape.** P13's "one machine, many working
  directories" *is* the outpost model, and `node-to-outpost-map.json` and
  `hive-node-registry.json` are already the roster. A platform is that plus a
  network hop and an identity per outpost — nothing in the machine layer has to
  change, which is the strongest evidence the design is right.
- **Do not make the board the interaction surface.** Its value is that it is a
  pure projection of the belt. Once it holds its own state it can disagree with
  the belt, and catching exactly that is one of `manager.cjs`'s four questions.
  Actions go behind it as recorded acts that append and re-render.
- **Separate the two halves.** The factory needs a database. REFER.OS needs a
  version number — it is 86 markdown documents, and what makes it installable
  rather than read off a working tree is packaging and a resolver, not storage.
  Conflating them turns a two-month job into a two-year one.

**Not the revival condition, and confirmed so by measurement:** board staleness.
Raised the same day as *"the board is currently static and stale and has long
delays"*, with a Docker database proposed as the fix. Measured instead: a
rebuild costs **0.28 seconds** and is scheduled **hourly**, and the page already
polls `/stamp` and reloads only on a real change. Realtime is a transport
property, not a storage one, and the transport already exists. Deposited to
Telechurch's belt as **A73**, recommending `every: 5m`. A database would not
have fixed it.

---

## OPEN

### The seven machines still in the product repo

Recorded in full at [`docs/seven-machines-pending-move.md`](../../docs/seven-machines-pending-move.md).
Nothing moved on 2026-09-12 and that was deliberate. Blocked on the same
decision as the shelved thread above — whether the factory becomes an installed,
versioned runtime — because `schedule.cjs` is an engine rather than a machine,
and moving an engine is a decision about where authority over cadence lives.
