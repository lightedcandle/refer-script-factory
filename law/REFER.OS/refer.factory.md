# refer.factory.md - App Factory Doctrine

## 1. Purpose

`refer.factory` governs the factory model for software manifestation.

REFER.OS should treat implementation as a governed production system:

- codebases are plants,
- scripts and interpreters are machines,
- contracts are production packets,
- artifacts travel through explicit stations,
- and outputs are registered for reuse.

## 2. Core Law

Known structure must be scripted, not inferred.

If an element or operation is already known to the system, Codex must prefer:

- a contract,
- a script route,
- an interpreter,
- and a registered artifact path,

over freeform regeneration.

## 3. Script Factory Prime Doctrine

AI should not repeatedly hand-write known code artifacts.

When the desired artifact is known, stable, or repeatable, the lawful path is:

1. capture intent as a contract,
2. select or create the appropriate script route,
3. run the target interpreter or compiler,
4. emit the artifact,
5. audit the output,
6. register the successful route for reuse.

AI may still author scripts, adapters, interpreters, templates, and missing factory machinery. AI may also handle novelty, ambiguity, and exceptions. But once a transformation is understood, the factory should move that work out of repeated conversational generation and into durable machinery.

The preferred progression is:

`chat intent -> Plan -> Send Contract -> script/interpreter/compiler -> artifact -> verification -> registry`

The chat surface does not need to be owned by the factory. A prevailing assistant, IDE assistant, or external chat provider may perform intake if it emits or requests the same contract and blueprint packets before execution.

## 4. Base Factory and Seed Factory Doctrine

REFER should ship a base factory so every operator does not start from zero.

The base factory should provide universal routes such as:

- bootstrap repo,
- emit Send Contract,
- emit Script Blueprint,
- emit Script DNA Seed,
- refresh codebases,
- update law and scripts,
- register repeatable routes.

Specialized factories grow from seed scripts. A seed script may begin with high AI consumption because the assistant is discovering local patterns, inputs, outputs, anchors, guards, and checks. Once the seed script works, it should be normalized into Script DNA and registered so future runs use machinery instead of renewed inference.

Therefore:

- base factory = common REFER machinery,
- seed script = first local specialization,
- specialized factory = registered reusable local machinery,
- repeated work = script/interpreter/compiler route.

## 5. Artifact Assembly

Artifacts do not jump directly from intent to code.

They travel through transform points such as:

1. intent
2. plan contract
3. send contract
4. primitive selection
5. composition
6. wiring
7. placement
8. verification
9. registration for reuse

These points may be decomposed into smaller stations when needed, but they must remain explicit.

## 6. Codebase Assembly

Artifact assembly requires codebase assembly.

The codebase is the factory floor. It must expose lawful places for artifacts to land and connect.

Codebase assembly should provide:

- clear ownership zones,
- clear anchors,
- known insertion points,
- known routing boundaries,
- known verification paths,
- known adapter targets.

Without this plant layout, scripts are forced to guess and the factory degrades back into inference-heavy handcrafting.

## 7. Send Contract Doctrine

Once intent is resolved, Planner output must condense into a **Send Contract** before it leaves conversational space.

A Send Contract is:

- smaller than the Plan,
- more exact than chat,
- machine-oriented,
- and suitable for scripts, runners, or sub-executors.

The Send Contract is the artifact seed that enters the factory.

## 8. Stations and Routes

Every factory route should define:

- the ordered stations,
- allowed inputs,
- emitted outputs,
- failure states,
- and the final registration step.

Station responsibilities must be narrow. One station should perform one lawful transformation.

## 9. Anchors

Scripts require lawful anchors.

Anchors may be:

- native framework structures,
- explicit repo markers,
- route registries,
- component slots,
- style entrypoints,
- store/service boundaries,
- manifest positions.

The factory should prefer explicit anchor maps over ad hoc placement.

## 10. Artifact Registry

Factory output should be reusable.

Manifested artifacts should be registrable by:

- kind,
- version,
- inputs,
- outputs,
- adapter requirements,
- and compatible targets.

No stable artifact should require fresh invention after it has been successfully built and registered.

## 11. Cross-References

- `refer.md`
- `refer.plan.md`
- `refer.flow.md`
- `refer.codebases.md`
- `refer.engine.md`
- `refer.efficiency.md`
