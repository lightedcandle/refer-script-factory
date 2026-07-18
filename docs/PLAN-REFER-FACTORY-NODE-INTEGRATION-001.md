# PLAN-REFER-FACTORY-NODE-INTEGRATION-001

Title: Add the first read-only Sovereign Node consumer to the standalone CLI
Status: Implemented and verified locally; commit not authorized
Date: 2026-07-17
Contract: `CONTRACT-REFER-FACTORY-NODE-INTEGRATION-001`
Target start: `a49d4e2d2c3c68b4f8f88a603df131c912f2dcd5`
Node contract commit: `d72f94ca6766d7184243fca6134378b36905fc1b`
Primary owner: `mind-agent`, bounded implementation with contract guard
Classification: `refer-script-factory` is a `node-consumer`
Method lineage: Sovereign Node discovery plus bounded Construct Method

## Objective

Add a factory-owned local stdio client and a thin standalone CLI surface that
reads current Sovereign Node discovery, workflow-ledger, and method-bank truth.
The Node remains authoritative for the raw records. Script Factory remains
authoritative for its CLI, rendering, and orchestration.

## Frozen boundaries

- Keep `src/core/**` byte-identical to the required start commit.
- Preserve existing `resolve`, JSON separation, help/version behavior,
  dependency injection, cancellation, and resolution exit codes.
- Use `process.execPath` with `<node-root>/mcp/server.mjs` as an argument through
  local MCP stdio with `shell: false`.
- Require an explicit resolvable `--node-root`; product code carries no fixed
  `E:\SovereignNode` path.
- Use a minimal child environment and exclude every
  `SOVEREIGN_MCP_MUTATION_*` value.
- Require MCP identity `sovereign-node`, version `>=1.1.0 <2.0.0`, and contract
  `refer-script-factory-node-read-v1`.
- Connect within 5 seconds, bound reads to 10 seconds, and bound
  close/termination to 2 seconds.
- Permit additive Node response fields while failing closed when required
  fields are absent or incompatible.
- Never represent a cache, guess, or stale packet as current Node truth.

## Exact read allowlist

1. `discover_node`
2. `validate_workflow_ledger`
3. `list_workflows`
4. `get_workflow`
5. `list_methods`
6. `get_method`

No generic tool invocation is exposed. Mutation tools are rejected by the
factory allowlist before transport.

## CLI surface

```text
refer-script-factory node discover --node-root <path> [--json]
refer-script-factory node validate --node-root <path> [--json]
refer-script-factory node workflows --node-root <path> [--json]
refer-script-factory node workflow <id> --node-root <path> [--json]
refer-script-factory node methods --node-root <path> [--json]
refer-script-factory node method <id-or-alias> --node-root <path> [--json]
```

JSON mode emits one result or error packet on stdout. Human mode is concise.
Diagnostics stay on stderr, and Node-local absolute source paths are stripped.
Node command exits are `0` for success, `2` for usage/config mistakes, and `1`
for operational failures and missing lookups.

## Typed failure contract

- `NODE_CONFIG_INVALID`
- `NODE_UNAVAILABLE`
- `NODE_TIMEOUT`
- `NODE_PROTOCOL_MISMATCH`
- `NODE_SCHEMA_MISMATCH`
- `NODE_LEDGER_INVALID`
- `NODE_NOT_FOUND`

## Owned implementation

- `src/integrations/sovereign-node/**` owns transport, contract checks, raw
  response validation, typed failures, and the six-method client API.
- `src/adapters/cli/node.ts` owns Node command execution and rendering.
- `src/adapters/cli/arguments.ts` and `src/adapters/cli/execute.ts` contain only
  the minimal static registration and dispatch changes.
- Deterministic fixtures prove protocol, schema, timeout, not-found, ledger,
  offline, and mutation-rejection behavior without Node writes.

## Verification route

1. TypeScript no-emit and compile checks.
2. Core-only compile and core-boundary verification.
3. Focused client and CLI fixture tests.
4. Existing CLI and compatibility tests.
5. Full repo suite with only proven generated-fixture reconciliation.
6. Compiled help/version and all-six-command fixture smoke checks.
7. Real read-only local stdio smoke against Node commit
   `d72f94ca6766d7184243fca6134378b36905fc1b`.
8. Final source freshness, path scope, core immutability, Node immutability,
   package/bin, and diff checks.

## Modular CLI expansion trigger

The current statically registered CLI remains the correct bounded architecture
for this phase. Recommend a separately ratified
`PLAN-REFER-FACTORY-CLI-MODULAR-EXPANSION-001` when any one condition appears:

1. a third independent command family is proposed after `resolve` and `node`;
2. parallel command work repeatedly collides in `arguments.ts`, `execute.ts`, or
   centralized help;
3. command-specific capability or permission metadata can no longer be enforced
   cleanly in the current dispatcher;
4. repeated additions duplicate parsing, help, rendering, dependency injection,
   or testing structure.

That successor should first use a statically allowlisted `CliCommandModule`
registry whose entries declare name/aliases, parser, handler, help,
capabilities, dependencies, output contract, and tests. External plug-in loading
is a later optional phase requiring explicit trust manifests and signing; it
must never auto-load arbitrary code. This section is a non-executing successor
recommendation, not authority to implement modularization now.

## Non-scope

- Node repo changes or canonical ledger/method changes
- provider-neutral core changes or a new core port
- mutation, credentials, auth, realtime, SMS, admin, or provider access
- HTTP, target registry, sync/update, background, telemetry, or release wiring
- commit, assimilation, merge, push, publish, deploy, or release

## Verified result

- The deterministic fixture server proves every command and all seven typed
  failure classes, including pre-transport mutation rejection.
- The full existing repo suite, standalone CLI compatibility, VS Code adapter
  compatibility, core compile, and core-boundary verifier remain green.
- A live local stdio read against the exact Node contract commit completed all
  six reads and normalized a missing workflow to `NODE_NOT_FOUND`.
- `src/core/**` and the read-only Sovereign Node worktree remained unchanged.
