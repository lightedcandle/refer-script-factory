# PLAN-REFER-FAMILY-001 — the family: HQ, outposts, channels, and one root

**Registered** 2026-09-15 on main. Status: registered, not started. No stage
below executes on the strength of this document; each starts as its own
branch under its owning repo's law. Operator's words are quoted where the
plan derives from them, because they are the authority for *what the product
is*; everything else here is derived.

## What the operator asked for

> "Hive and my own outpost, and my own hq, and I need to be able to have
> computers sync or possibly tunnel into each other ... chat instances to be
> able to pick up and relay messages to other computer ... one central
> location has the refer universal, it can deploy instructions to other
> computers, how to operate and what to do. Every computer will have their
> own board ... it can set up its own drive and location ... Computers have
> autonomy with smart agents. They just need to be a part of a family. And
> have access to knowledge acquired ... I don't want to waste tokens
> duplicating work when the factory is able to build it for free ... bypass
> all those friction [GitHub, Claude channel setup] and enable synchronization
> through our own refer channels."

> "I want to be able to install the app and it finds the hive automatically
> ... there really shouldn't be a friction in the key. I think the outpost
> should be able to ratify itself ... the fact that they downloaded and
> installed the app is an intent that they want to be a part of the family."

## The shape

- **HQ** holds the universal REFER and the factory. It deploys *instructions*
  — law, methods, what to do — never checkouts.
- **Outposts** are ordinary computers. Each has its own board, belt, drive,
  location and agents, and autonomy over its own work. Members, not terminals.
- **Channels** are ours. Joining, syncing and relaying never route through
  GitHub or a Claude channel setup. Install → connected.
- **Knowledge flows.** What an agent learns on any outpost reaches the
  family; the factory builds it once.

## What Claude's own learning teaches, by inversion

Claude's cross-user learning is batch, diffuse (weights, not records),
delayed by months, uncitable and unrevocable — the right trade for strangers
and the wrong one for a family. The family inverts every property:

| Claude | The family |
| --- | --- |
| whole chats become training data | only **judgement** crosses — a belt record, a method, a receipt; never repo bytes, never the congregation, never a secret (the Caged Canary's detector-free receipt is the same line) |
| diffuse into weights | **a record with provenance** — who, when, on what, verified how |
| months later | **on the next beat** |
| uncitable, unrevocable | **attributable and superseding** — a later record withdraws an earlier one, as the leak rule already handles |
| one direction | **both ways** — HQ builds against outpost findings; outposts absorb what HQ resolved |

## Rules already ruled on (thread register, platform thread; P13)

- A remote arrival lands as **DEPOSIT, never CONTRACT**. Outposts spend
  storage, never judgement.
- The belt becomes an **append-only event log** when it leaves one disk.
  Never a mutable table.
- The never-autonomous list is refused **server-side**.
- HQ/outpost is P13 — one machine, many working directories — plus a network
  hop and an identity per outpost. The machine layer does not change.
- The board stays a projection of the belt. Actions behind it are recorded
  acts that append and re-render.

## What already exists

| Need | Built |
| --- | --- |
| HQ substrate | **SovereignNode**: Postgres, Redis, realtime broker, self-hosted Supabase (auth, rest, realtime, storage, functions), `wan-bridge` — Cloudflare Tunnel with a stable public hostname. Outposts dial out; no port-forwarding. |
| Instructions, not files | **`refer-mcp`** (refer.os `tools/refer-mcp`): every `REFER.OS/*.md` as an MCP resource plus a `refer_bootstrap` prompt. Served over the channel, an outpost's Claude reads live law — no vendored copy, no fourth fork. |
| Method and knowledge | `refer-harmony` absorption with receipts; the method bank; the belt's resolved records; `machines/kind.cjs` as the wire vocabulary for "a finding, judged". |
| Roster | `.refer-factory/hive-node-registry.json` and `node-heartbeat` — today a file on one disk. |
| Chat instances | `machines/session-belt.cjs` already sees every live chat and spawn per repo. |
| Outpost runtime | The factory as of 2026-09-15: one engine, cwd-subject, sibling-resolved, `engine/install-schedule.ps1` and `engine/install-board-autostart.ps1` beside it, no window. |
| Read-only remote contract | `refer-script-factory-node-read-v1`, six tools, `src/integrations/sovereign-node/`. The seam to grow from. |

## Stages

Each stage is its own plan branch in its owning repo. Order is load-bearing:
the app is last because it is the face of 1–2, and a beautiful installer for
something that cannot connect is the wrong first artifact.

### 0. Repo discipline: one declared root, and a scout that sees it

Operator, 2026-09-15: *"create a Dev folder, and then all the repos in
there ... help users decide how to organize their repo ... so that repos can
have a cleaner surface."*

- **Convention:** `<root>\Dev\<repo>`. Worktrees live *inside* their repo
  (`.claude/worktrees/`), never as siblings. Nothing that is not a repo lives
  in `Dev`. Nested repos that belong nested (`alliance-hub` submodule,
  `refer-zo-bootstrap`) stay nested.
- **Host-root declaration:** one file per machine naming its root. The
  ecosystem map holds ids and paths *relative to the root*; every chain that
  today reads `E:/refer.os` literally (348 files across ten repos) and
  `E:/refer-script-factory` (77) reads through it. The outpost app writes this
  file on first run; on this host it is written by hand and says `E:\`.
- **This host is conformant by declaration, not by moving.** Its repos are
  already flat at one level; what is dirty is the surface — Codex-era sibling
  worktrees (`E:\refer.os--PLAN-*` ×4, `E:\rqc`, three under `E:\tmp\`,
  eighteen under `C:\Users\agent\.codex\worktrees\`) and non-repo clutter.
  Removing the worktrees is `git worktree remove` — the branches survive —
  and is the operator's word, because the lanes are his.
- **`repo-scout`, a universal machine.** On the beat it scans the root for
  git repos and compares with the map: *unwired repo found*, *wired repo
  missing from disk*, *repo outside the root*, *worktree parked as a
  sibling*. Deposited, drawn on the board. **It never wires anything** —
  wiring writes into a repo, so it stays a proposal a person accepts.
- **The physical move to `Dev\` happens once, scripted, after the root file
  exists** — move, rewrite the map, re-run both installers, re-point worktree
  `gitdir`s, and recreate the routines whose stored `cwd` cannot be changed
  (accepting the loss of their stored approvals, the parked-run trap of
  09-13). Never by hand, never one repo at a time. **No junctions**: a
  junction gives one place two names, and the `E:\`/`E:/` trust split is
  already that disease.

Owner: factory (scout, convention, root reader in engine/machines);
e2e-bridge (map shape). Ready to start now; needs nothing decided.

### 1. Enrolment: install is the intent

- The app carries the family's rendezvous — HQ's hostname baked in, the way
  Claude's app carries Claude's endpoint. No key is entered.
- On first run the outpost **mints its own identity** (a keypair, generated
  locally, never shown) and **announces itself**; HQ *records* it. That is
  self-ratification. There is no approval step and no gate at the door.
- A key still exists — the one the outpost made — so nobody can impersonate
  it. If anything is ever sold, it unlocks a *tier*, never membership.
- **Membership decides nothing about power.** What flows is decided by what
  a member may do: receive universal law and public methods; deposit; keep
  its own board, belt and autonomy. Never by joining: contract work, hold
  judgement, read another outpost's belt, reach HQ's private state.
- The operator's own machines are the **inner circle**: they see each
  other's belts because he places them there, on the roster he already keeps.
  A stranger's install never sees the congregation.
- Abuse handled the boring way: per-outpost quotas; HQ can quarantine a
  member.

Owner: SovereignNode (identity, roster served, channel). First stage to build
after 0.

### 2. Law down, heartbeat up

`refer-mcp` served from HQ over the channel; the outpost's Claude binds to
it. Heartbeat and roster served by HQ instead of a file. An outpost is now a
member with live law and a board, and HQ can see it. **This alone ends the
three-way law fork** (universal distilled; Telechurch long-form with the only
`refer.agent.claude.md`; the factory's dead June copy) — the Claude binding
must be promoted to universal first, and the generation question (two-line
distilled law vs. long-form) decided by the operator.

Owner: refer.os (serving, binding promotion), SovereignNode (transport).

### 3. Deposits up

An outpost's belt records replicate to HQ as events — append-only, DEPOSIT
only, judgement only. HQ's factory watches, triages and builds against them.
This is where "the factory builds it for free" becomes literally true: one
factory working every outpost's findings.

Owner: SovereignNode (event store, receiving endpoint that accepts DEPOSIT and
refuses everything else), factory (belt replication machine).

### 4. Knowledge both ways

Resolved records, methods and receipts published by HQ; absorbed by outposts
through harmony with receipts. Learn once, everyone has it.

Owner: refer.os (harmony under Claude), factory.

### 5. Chat relay

A message channel keyed by outpost and session. A chat posts; a chat on
another machine picks it up on its next look. `session-belt` already knows
which sessions are alive. Peer tunnels only if a use turns up that HQ relay
cannot serve; none is expected.

Owner: SovereignNode.

### 6. The outpost app

The Electron shell: bundled Node, first run writes the host root and enrols,
registers the beat through `engine/install-schedule.ps1` (the app **never
ticks** — the OS scheduler does, so the factory runs when the app does not),
tray with the pulse lamp, board window, harmony pull for law, self-update.
Releases freeze the machines into versions for every PC that is not HQ; HQ
keeps the checkout, where saving is deploying.

Owner: its own repo.

## Decisions that are the operator's

- Whether a new member's first deposits are visible to the whole family at
  once, or to HQ only until a person has looked once.
- Whether an outpost may ever *contract* work, or only deposit (the register
  says deposit only; confirm for family members he knows).
- Pricing, if any, and what a tier unlocks — money and identity.
- The family's public name: under `node.cadis.us` or under a REFER name.
- Which generation of law is served: distilled or long-form.
- The word that removes the Codex-era worktrees (stage 0).

## Closes when

An outpost on a machine that has never seen GitHub or a Claude channel setup
installs the app, appears on HQ's roster, reads live law, shows its own
board, deposits a finding that HQ's factory picks up on the next beat, and
receives back a method it did not write. Stage 0 closes earlier and on its
own: the root file exists on this host, the map reads through it, and the
scout's first beat deposits nothing but "all repos where declared".
