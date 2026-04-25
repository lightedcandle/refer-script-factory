# PLAN-REFER-FACTORY-001

## Product

Refer Script Factory is a governed VS Code cockpit for REFER plans, Send
Contracts, factory telemetry, Miles tracking, process events, and repo bootstrap
dry-runs.

## First Slice

The first implementation slice is intentionally bounded:

- extension shell
- REFER sidebar container with Dashboard and Process views
- deterministic sample metrics
- Miles tracking for counted source lines
- Live/Average dashboard modes for prompt-level and over-time metrics
- token MPG model for input/output return ratio
- sample process event stream
- Send Contract draft schema and command
- adapter contract
- repo initialization dry-run with explicit apply confirmation
- agent governance bootstrap through an append/update-only `AGENTS.md` REFER block and `.refer-factory/agent-profile.json`
- hidden `.refer-factory/plan/refer.plan.json` workspace plan output instead of production-visible public assets
- derived `.refer-factory/codebases.json` registry for repo-level tracking plus
  internal monorepo/subspace scope hints
- tests for metric, event, and dry-run behavior

## Non-Scope

- hosted cloud orchestration
- marketplace
- billing
- autonomous multi-agent execution
- Telechurch app-code dependency
