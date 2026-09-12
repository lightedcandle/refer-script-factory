# REFER Orchestrator Roadmap

This file tracks the missing pieces that make REFER a host-neutral,
Execution-Contract-governed operating layer. Items should be integrated only
when a concrete script, schema, host command, operator interface, or host adapter
exists to support them.

## Current Foundation

- No host adapter currently offers an interactive participant. The VS Code `@refer` participant was retired on 2026-09-12; the HTTP endpoint drives the same intake and loop.
- Contract Reader displays saved legacy intake-session turns below Refer Library.
- Raw prompt text is stored as an intake record under `.refer-factory/intake/`.
- Compact REFER intake envelopes are sent to the host-provided model; they do not authorize execution.
- Model responses return through REFER.
- The bounded loop terminates as `resolved_as_is`, `needs_more_info`,
  `needs_script`, `blocked_by_policy_or_scope`, or `failed_with_reason`.
- Script DNA, Script Blueprint, Send Contract planning artifacts, codebase registry, and
  Angular/React/Node/generic adapter packet schemas exist as first machinery.

## Integration Queue

| ID | Capability | Status | Integrate When Available | Target Hook |
| --- | --- | --- | --- | --- |
| ORCH-001 | Stronger intent extraction | scaffolded | A deterministic extractor can derive task type, framework, target paths, risk, and missing fields from raw prompt text. | `createReferIntakeRecord` |
| ORCH-002 | Intake preview and execution-ratification boundary | scaffolded | An operator interface can show the intake envelope and planning artifact, then separately capture or hand off a ratified Execution Contract before execution. | interactive host and runtime session viewer |
| ORCH-003 | Script registry lookup | scaffolded | A registry file or service can map ratified Execution Contract intents to existing Script DNA routes. | `needs_script` and `resolved_as_is` paths |
| ORCH-004 | Script execution protocol | scaffolded | A safe runner can execute registered scripts with bounded inputs and return packets. | `script_execution` station |
| ORCH-005 | Adapter file-operation interpreters | scaffolded | Angular/React/Node/generic adapters can translate portable JSON operations into concrete file edits. | `framework_operations` packets |
| ORCH-006 | Response validation | scaffolded | A validator can check model/script output against schema, policy, target paths, and acceptance criteria. | post-model resolution envelope |
| ORCH-007 | Drill-down form mechanics | scaffolded | A host adapter can render missing fields through its operator interface, using whatever control that host provides. | `needs_more_info` terminal |
| ORCH-008 | Script creation workflow | scaffolded | `needs_script` can emit a Script DNA seed, register the gap, and prompt the user to approve script creation. | `needs_script` terminal |
| ORCH-009 | Process event logging for chat cycles | scaffolded | Intake, pass decisions, terminal states, and failures can be collapsed into `.refer-factory/process-state.json`. | every `@refer` pass |
| ORCH-010 | Sensitive-data guard for raw fallback | scaffolded | Raw prompt fallback can redact or refuse secrets before the second model pass. | `scan_raw_input` path |
| ORCH-011 | Token savings telemetry | scaffolded | The factory can estimate raw prompt tokens versus compact intake-envelope tokens and record savings. | intake and dashboard metrics |
| ORCH-012 | Resolution-rate telemetry | scaffolded | Terminal states can be counted over time to show resolved, needs-info, needs-script, blocked, and failed rates. | dashboard/process panel |
| ORCH-013 | REFER Coach | scaffolded | A coach mode can inspect local readiness and guide the user through Ollama/Qwen/provider setup, workspace hygiene, and REFER usage patterns. | `@refer coach` |

## Integration Rule

Each new capability must land with:

- a bounded intake, planning, runtime, or execution schema with its authority class named
- a deterministic terminal state
- a test that proves the new path terminates
- no hidden interception of another assistant's private chat
- no automatic raw prompt fallback without a REFER-controlled rule
- no intake record, intake envelope, planning artifact, runtime session, or UI mode presented as execution authority

## Preferred Sequence

1. Add process event logging for `@refer` cycles.
2. Add sensitive-data guard before raw fallback.
3. Add the intake-preview and Execution Contract ratification boundary.
4. Add deterministic intent extraction.
5. Add script registry lookup.
6. Add `needs_script` Script DNA emission.
7. Add adapter file-operation interpreters.
8. Add response validation and acceptance checks.
9. Add token/resolution telemetry to the dashboard.
10. Add REFER Coach for local LLM/provider and codebase efficiency setup.
