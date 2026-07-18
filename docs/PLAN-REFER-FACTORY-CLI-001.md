# PLAN-REFER-FACTORY-CLI-001

Title: Implement the Standalone Script Factory CLI Adapter
Status: Implemented and verified locally
Date: 2026-07-16
Contract: `CONTRACT-REFER-FACTORY-CLI-001`
Target: `E:\refer-script-factory`
Required base: `c4ebb508079842fae2e4cd5af4dbb8f009291cf9`
Primary owner: `mind-agent`, bounded implementation
Model route: Mini requested; the host-exposed Codex implementation model is the disclosed substitute
Method lineage: Construct Method; branch assimilation, commit, and publish are not authorized

## Identity

The Script Factory is the provider-neutral system that converts ratified REFER
Execution Contracts and verified methods into bounded script plans, artifacts,
verification evidence, and reusable registrations.

`refer-script-factory` is the first standalone terminal adapter for that system.
It is an adapter, not a second core. It invokes the intentional public API in
`src/core/index.ts` and supplies model, workspace, evidence, cancellation, and
output ports without introducing a dependency from the core back to the CLI.

## Architecture

The dependency direction remains one-way:

```text
terminal -> CLI adapter -> src/core/index.ts
                     \-> shared local Ollama adapter
```

- `src/adapters/cli/**` owns parsing, workspace validation, terminal rendering,
  filesystem-backed runtime ports, SIGINT handling, and exit-code mapping.
- `src/adapters/ollama/**` owns the reusable local Ollama HTTP model adapter.
- `src/core/**` remains provider-neutral and unchanged unless a separately
  ratified boundary defect is found.
- The CLI calls `runReferCoreOrchestratorPrompt`; it does not duplicate intake,
  resolution-loop, five-state, or terminal-output logic.
- Existing VS Code and legacy import paths remain compatibility surfaces.

## Command Contract

The stable executable name is `refer-script-factory`.

```text
refer-script-factory resolve \
  --workspace <absolute-or-resolvable-path> \
  (--prompt <text> | --stdin) \
  --model <ollama-model> \
  [--base-url <loopback-url>] \
  [--timeout-ms <1000-300000>] \
  [--json]
```

Global commands:

- `--help` prints usage, safety rules, artifacts, and exit codes.
- `--version` prints the existing package version without changing it.

Resolve rules:

- `--workspace` is required and resolves against the current directory when it
  is relative. The resulting path must already exist and be a directory.
- Exactly one input source is required: non-empty `--prompt` text or `--stdin`;
  stdin is bounded to 1 MiB.
- `--model` is explicit and required.
- `--base-url` defaults to `http://127.0.0.1:11434` and accepts only credential-
  free loopback HTTP(S) URLs.
- `--timeout-ms` defaults to `120000` and is bounded from 1000 through 300000.
- `--json` emits one parseable result object on stdout. Progress remains on
  stderr so it cannot corrupt machine output.

## Machine Result And Exit Codes

JSON output carries a schema version, command, command success flag, exit code,
canonical workspace, local-provider configuration, the core run result, and a
structured adapter error when applicable.

| Exit | Meaning |
| ---: | --- |
| `0` | `resolved_as_is`, help, or version completed |
| `1` | unexpected CLI adapter or persistence failure |
| `2` | usage or invalid option/input combination |
| `3` | workspace missing, not a directory, or unsafe `.refer-factory` boundary |
| `4` | local Ollama/provider or orchestration transport failure |
| `10` | `needs_more_info` |
| `11` | `needs_script` |
| `12` | `blocked_by_policy_or_scope` |
| `13` | `failed_with_reason` |
| `130` | interrupted by `SIGINT` |

The five resolution states remain the core definitions. The CLI only maps them
to stable process exits.

## Workspace And Evidence Boundary

All CLI writes are contained by the selected workspace's `.refer-factory`
directory. Existing symbolic-link boundaries are rejected rather than followed.

- Intake records use the core-owned reference under `.refer-factory/intake/`.
- Successful CLI turns are written under `.refer-factory/cli/turns/`.
- Structured process events are appended as JSON Lines at
  `.refer-factory/cli/process-events.jsonl`.
- Evidence artifacts are additive and are never silently overwritten.
- No workspace file outside `.refer-factory` is read or written by the CLI.

## Safety Boundaries

- Local Ollama is the only provider adapter in this wave.
- The CLI reads no credentials, `.env` files, keys, certificates, provider
  profiles, or cloud configuration.
- Remote/non-loopback provider URLs, redirects, URL credentials, arbitrary
  commands, provider shell hooks, and executable model hooks are rejected or
  absent.
- Model requests have a bounded timeout and cancellation signal.
- SIGINT aborts the pending request, records failure evidence when intake began,
  and exits `130` without a stack trace.
- No commit, merge, assimilation, push, publish, deploy, release, version bump,
  dependency upgrade, or provider mutation is part of this plan.

## File Ownership

Primary implementation paths:

- `src/adapters/cli/**`
- `src/adapters/ollama/**`
- `test/cliAdapter.test.ts`
- `package.json` for the `bin` target and test inclusion only

Compatibility updates are limited to forwarding the existing Ollama import
through the shared adapter. Deterministic operational registry mirrors may be
regenerated because `package.json` is their owning source.

## Tests And Verification

Focused deterministic tests use in-memory prompt models, temporary workspaces,
and a loopback stub that speaks the Ollama response shape. They never require a
live model, external network, credential, or provider mutation.

Coverage must include:

- prompt and stdin input;
- JSON stdout isolation and human output;
- all five resolution states and exit mappings;
- intake, turn, and process-event persistence;
- invalid options/input combinations and missing workspaces;
- provider failure and cancellation;
- compiled executable `resolve`, `--help`, and `--version` smoke paths;
- package/bin target correctness.

Contracted gates:

1. `npx.cmd tsc -p . --noEmit`
2. `npm.cmd run compile:core`
3. `npm.cmd run compile`
4. `npm.cmd run verify:core-boundary`
5. focused CLI tests
6. existing core, adapter, and standalone tests
7. full `npm.cmd test` with exact fixture-residue reconciliation only
8. compiled help/version and stubbed resolve smoke tests
9. package/bin target audit
10. `git diff --check` and final scope/status audit

## Implemented Result

- `src/adapters/cli/**` supplies the standalone command parser, filesystem
  runtime ports, cancellation bridge, terminal/machine rendering, and executable
  entrypoint.
- `src/adapters/ollama/referOllamaPromptModel.ts` is the shared local-provider
  adapter; the legacy chat import remains a forwarding compatibility surface.
- `package.json` and `package-lock.json` expose only the stable
  `refer-script-factory` bin target at the compiled CLI entrypoint.
- `test/cliAdapter.test.ts` proves prompt/stdin behavior, stdout isolation, all
  five states, persistence, failures, cancellation, redirect refusal, package
  wiring, and compiled help/version/resolve behavior without a live provider.
- The provider-neutral core was not changed and its boundary verifier remains
  green.

## Non-Scope

- changing core resolution semantics or its five states;
- adding cloud, hosted, credentialed, or non-loopback model providers;
- adding arbitrary command execution or model shell hooks;
- implementing the later HTTP/MCP or Sovereign Node control-plane adapter;
- renaming legacy runtime/session fields, extension IDs, participant IDs,
  command IDs, settings, or storage schemas;
- changing the package version, dependencies, or release metadata;
- publishing or installing the package outside local verification.

## Successor Boundary

- `PLAN-REFER-FACTORY-NODE-INTEGRATION-001` owns governed Sovereign Node and MCP
  integration under a separate contract.
- `PLAN-REFER-FACTORY-RELEASE-001` owns packaging, versioning, distribution, and
  publication readiness.
- A separate compatibility-migration contract must own any legacy identifier,
  session schema, command ID, or storage migration.
