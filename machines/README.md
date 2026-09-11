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

## What is here

| Machine | What it asks |
| ------- | ------------ |
| `pulse-check.cjs` | Did every station that should have deposited, deposit — and is the belt still sound? Derives its expectations from the repo's own station declarations. |
| `provider-watch.cjs` | The WORLD tier. Covers Docker fully; names Supabase and Cloudflare as session-only rather than omitting them, because an absent provider reads as fine and "nobody looked" is a different fact from "nothing wrong". |

## What is not here, and why

**The belt itself** (`.claude/agent-context/findings.jsonl`) stays per repo. Findings are *about* a repo; a shared belt would merge four repos' work into one unreadable stream. The board rolls them up instead.

**Station declarations** stay per repo, for the same reason cadence is local.

**Stack-specific gates** — an Angular style checker, a Supabase policy check — belong here too but only run where a repo declares them. They are universal in the sense that any repo *on that stack* wants them, which is a third thing from "universal to all repos" and from "this app only".
