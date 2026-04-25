# refer.engine.md - Script Engine Doctrine

## 1. Purpose

`refer.engine` governs the script engine that executes factory work.

The script engine is the layer that translates compact contracts into deterministic operations through portable script packs and target-specific interpreters.

## 2. Core Model

Use this execution stack:

1. natural-language intent
2. Plan
3. Send Contract
4. assembly-like script instructions
5. target interpreter
6. repo/runtime manifestation

Scripts are not the same as chat. Scripts should be:

- explicit,
- composable,
- parameterized,
- low-ambiguity,
- and close to execution.

## 3. Universal Intent, Local Interpretation

The system may use one universal intent language, but it must not assume one universal concrete implementation.

Therefore:

- universal command language stays stable,
- local interpreters translate intent for each codebase,
- manifestation remains framework/runtime-specific.

This mirrors assembly language being target-specific to the machine it drives.

## 4. Script DNA

Every reusable script should share a common Script DNA so scripts can interrelate like universal building blocks.

Script DNA should define:

- script id,
- version,
- governing references,
- trigger intents,
- adapters,
- typed inputs,
- typed outputs,
- guards,
- stations,
- assembly-like instructions,
- verification,
- registry metadata.

The assembly-like instruction layer is intentionally small and explicit. It should use stable operations such as:

- `READ_CONTRACT`
- `RESOLVE_TARGET`
- `CHECK_GUARD`
- `READ_FILE`
- `WRITE_FILE`
- `PATCH_FILE`
- `EMIT_PACKET`
- `RUN_CHECK`
- `REGISTER_ROUTE`

AI may help author a seed script, but the seed must be normalized into this shared DNA before it becomes reusable factory machinery.

## 5. Portable Script Packs

Script packs should be portable and versioned.

Recommended characteristics:

- hosted outside individual app repos when possible,
- fetchable by git, raw file URL, package manager, or private registry,
- described by a small manifest/index,
- updateable without cross-repo copy/paste drift.

Portable scripts reduce duplication; local adapters keep realization lawful.

## 6. Interpreters

Each target codebase should provide an interpreter or adapter that knows:

- local file layout,
- local anchors,
- local primitives,
- local routing conventions,
- local style/wiring rules,
- local verification paths.

Scripts should not be forced to rediscover those rules on every run.

## 7. Chaining and Packets

Scripts may chain.

Each script should accept explicit inputs and emit explicit outputs that later stations can consume.

Typical packet fields include:

- artifact kind,
- target,
- anchor,
- dependencies,
- emitted node/file identifiers,
- required follow-up stations,
- verification requirements.

## 8. Script Blueprint

The engine should expose script routes as a blueprint graph when the relationship between chat, contracts, scripts, interpreters, and artifacts is not obvious.

A script blueprint should show:

- intake node,
- contract interrogatory node,
- Send Contract node,
- script registry lookup node,
- existing script execution node,
- missing-route correction node,
- target interpreter node,
- artifact emission node,
- verification node,
- registration node,
- input/output packets between each node.

The blueprint is the replacement for relying on a bespoke internal chat window. The prevailing assistant can remain the conversational surface, but it must ask for or derive the contract and then follow the blueprint.

If no lawful script route exists, the blueprint must route to correction rather than allowing silent ad hoc generation.

## 9. Script-First Doctrine

If the system already knows how to perform a transformation, Codex should prefer:

- selecting the correct script,
- parameterizing it,
- running it,
- and auditing it,

instead of regenerating the same structure in prose.

The engine exists so AI can author or invoke durable machinery instead of repeatedly hand-writing known code artifacts. For known artifacts, the preferred work is to maintain contracts, scripts, adapters, interpreters, templates, compilers, and registries that produce the code.

Freeform AI generation is reserved for:

- novelty,
- unresolved ambiguity,
- missing scripts,
- and exception handling.

## 10. Existing Machinery Precedence

When a valid script, interpreter, compiler, or registered route already exists, Codex must prefer executing and auditing that route before manually generating equivalent code.

Manual artifact generation is allowed only when:

- no route exists,
- the existing route is invalid for the target,
- the route fails and emits a bounded repair artifact,
- or governance/Plan explicitly authorizes a new route.

Successful manual transformations that are likely to recur should be promoted into factory machinery.

## 11. Registry Pattern

The preferred long-term pattern is:

- portable script host,
- manifest/index,
- versioned script packs,
- local install/bootstrap,
- target interpreter,
- execution runner.

## 12. Cross-References

- `refer.md`
- `refer.plan.md`
- `refer.flow.md`
- `refer.factory.md`
- `refer.efficiency.md`
