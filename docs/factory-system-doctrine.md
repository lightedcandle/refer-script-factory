# Factory System Doctrine

In REFER language, the terms must stay separate:

- A `Forge` is one conversion unit.
- The `Script Factory` is the organized system that creates, manages, and runs script forges.
- The `Factory System` is the complete network of coordinated factories across domains.

At the fundamental level, a forge is the conversion layer. It takes what the system already has access to and turns it into the power, structure, or action the rest of the system can use.

A forge is not the identity of the system. It is the productive conversion unit inside the system.

The base pattern:

```text
Input
-> transformation process
-> usable output
-> feedback/status
-> repeat/improve
```

In REFER:

```text
user intent + repo context
-> script forges and orchestration
-> working artifacts/actions
-> status and history
```

## Local-First Maturity

The job of REFER is to become increasingly alive locally. In practical terms, that means each chat turn should feed the Script Factory enough information to make the next similar turn less dependent on a remote LLM.

Every response should leave behind at least one answer to this question:

```text
How could this have been resolved locally next time?
```

The answer can become a script, registry entry, scan artifact, context rule, prompt pattern, status event, test, or documentation update.

The maturity loop:

```text
chat response
-> identify repeatable local resolution path
-> encode as forge/script/context/artifact
-> update registry or doctrine
-> verify
-> use on future turns
```

## Self-Healing

Self-healing is not only bug fixing. In REFER, self-healing means detecting anything that blocked local resolution and turning it into governed structure.

The factory should treat these as healable gaps:

- bugs;
- missing scripts;
- missing context;
- stale scans;
- unclear terminology;
- ambiguous categories;
- weak descriptions;
- missing statuses;
- missing tests;
- missing documentation;
- missing relationships;
- unknown needs discovered during use.

The self-healing loop:

```text
chat/request happens
-> REFER resolves what it can
-> REFER detects gaps
-> REFER classifies each gap
-> REFER patches the right layer
-> REFER verifies the patch
-> REFER records what changed
-> future turns use the improved system
```

## Script Effect Determinism

In the Script Factory, a script is not judged as good or bad. It is compared
against the intended effect declared by the contract.

The effect loop:

```text
intent contract
-> script attempt
-> observed effect
-> compare observed effect to intended effect
```

If the observed effect matches the intended effect inside the allowed boundary,
the script is functional for that contract.

If the observed effect does not match, the script enters a modification loop:

```text
effect mismatch
-> classify mismatch
   contract unclear
   input missing
   script logic mismatch
   boundary conflict
   environment missing
   verification missing
-> apply smallest repair
-> rerun the same contract
-> compare effect again
```

The loop continues until one of these states is reached:

- `functional`: the intended effect is achieved and verified.
- `blocked`: the loop cannot continue without missing authority, input, environment, or permission.
- `superseded`: a different script or contract now owns the intended effect.

This principle replaces moral or stylistic judgment of scripts. Failure is not a
terminal identity. It is an unfinished loop.

Deterministic rule:

```text
No script is judged. It is iterated until the intended effect is achieved,
blocked, or superseded.
```

## Kernel And Natural Rule Intake

A clean Script Factory should not ship every REFER, provider, domain, or user
preference law as always-active force. The shipped kernel is limited to rules
required for Smart Intake and the Script Factory to operate deterministically:
contract intake, bounded clarification, registry lookup, effect comparison,
modification loops, evidence, lineage, and safe execution.

Users do not label laws as unscripted, dormant, domain, project, or user method.
They provide rules naturally by prompt, document, correction, or preference.
Smart Intake captures that material and routes it into doctrine compilation.

Historical REFER laws live as internal source material:

```text
unscripted-laws/REFER.OS/
```

A source document may inform a future script, validator, resolver, or rule pack,
but it does not control builds merely because it exists in the repository.

Activation path:

```text
rule document, correction, preference, or prompt
-> Smart Intake contract
-> doctrine compiler
-> candidate script/validator/resolver
-> fixture and modification loop
-> registry entry
-> active only inside declared scope
```

Canonical execution ranks:

```text
SEQ-A Kernel Governance
SEQ-B Request Intake
SEQ-C Clarification Resolver
SEQ-D Authority And Context
SEQ-E Strategy Selection
SEQ-F Forge Or Script Generation
SEQ-G Script Execution
SEQ-H Evidence Capture
SEQ-I Effect Comparison
SEQ-J Modification Loop
SEQ-K Promotion And Registration
SEQ-L Scriptionary Refresh
```

Sub-sequences live inside parent ranks. The first canonized sub-sequences are:

```text
SEQ-E.1 Condition Read
SEQ-E.2 Chain Decision
SEQ-E.3 Collision Check
SEQ-J.1 Mismatch Classifier
SEQ-J.2 Repair Action
SEQ-J.3 Replay Gate
```

The conditional chain controller governs `continue`, `branch`, `fork`, `merge`,
`modify`, `delete`, `skip`, `block`, `supersede`, and `promote`. These are not
stylistic choices. They are deterministic actions selected from measured
conditions. Forks require collision checks. Deletes require reason, affected
surfaces, archive or rollback path, and registry update. Merges must produce a
single evidence packet or effect comparison unless a branch is blocked or
superseded.

Methods and strategies must be named against this sequence. A method is a
repeatable way of working. A strategy is a coordinated plan pattern. Both should
state activation trigger, sequence ranks, intended effect, scope, and evidence
path before they are registered.

This preserves the original REFER reference library without forcing every user
or project to inherit laws they never invoked.

## AI Build And Canonicalization

Scripts do not exist to keep a capable AI from building. They exist to
canonicalize a build that worked so the same intent can be replayed
deterministically later.

When no script exists for a valid intent, the factory should not treat the
missing script as a permanent blocker. It should create a draft/gap record,
allow an authorized AI build lane to explore and produce the first working
artifact, then capture the working path as factory knowledge:

```text
intent contract
-> script registry miss
-> script-gap draft
-> AI exploratory build
-> build trace
-> working artifact
-> distill repeatable script/forge
-> replay script against the intent
-> register and ratify
-> future turns use the script
```

The draft is a birth record for a future forge, not a stop sign. The AI build
lane may use judgment, iteration, and tool calls within the approved intent
contract. The deterministic requirement applies to the canonicalized replay:
inputs, outputs, side effects, verification, and status must become explicit
before the script is marked active or ratified.

This must happen in the request path whenever the intent is safe and sufficiently
specified. Users should not see "gap" as the outcome of an ordinary request.
Heartbeat and evolution loops may recover interrupted drafts, but they are not a
substitute for satisfying the current user request.

The factory should preserve the AI's successful path in durable evidence:

- intent contract;
- files, routes, datasets, or artifacts changed;
- errors and fixes encountered;
- verification commands or live checks;
- talkback/evidence packets;
- distilled script inputs and outputs;
- replay result.

Every resolved turn should ask:

```text
What did we need that did not exist yet?
What was ambiguous?
What had to be manually inferred?
What should become a script, context asset, test, status, or doctrine rule?
```

If the answer reveals a gap, the preferred repair order is:

1. Update terminology or doctrine when the gap is conceptual.
2. Update the script registry when the gap is about available capabilities.
3. For missing repeatable capability, let the authorized AI build the first
   working solution from the intent contract and record a build trace.
4. Distill the working trace into a forge/script and replay it.
5. Add or refresh scan/context artifacts when the gap is missing knowledge.
6. Add tests when the gap could regress.
7. Add status/process events when the gap affects observability.
8. Register and ratify only after evidence and replay exist.

## Naming Rules

Use these names consistently:

- `Forge`: a bounded conversion unit with inputs, transformation, outputs, status, and feedback.
- `Script Forge`: a forge that performs one script-specific conversion.
- `Script Factory`: the workspace and governance layer for script forges, orchestration, registry, scan tools, status, and history.
- `Factory System`: the larger body of factories across domains, such as Script Factory, Context Factory, Model Factory, Artifact Factory, and future factories.

Do not use `factory` when the thing being described is only one conversion unit. Use `forge`.

## Doctrine

Every mature system needs a factory layer, and every factory layer is made of forges.

The factory layer:

- receives raw material;
- routes it through repeatable forges;
- emits usable output;
- records status;
- learns from feedback;
- improves future runs.

For REFER, the Script Factory is the governance body for script forges. It converts prompts, context, codebase structure, and script definitions into durable work by routing them through inspectable conversion units.

The maturity goal is local-first production: the factory should increasingly convert local codebase knowledge, local artifacts, and local model capability into useful output without depending on remote AI for every step.

Remote AI is allowed as a bootstrap helper. It should not be the permanent center of the system. When remote AI solves something, REFER should ask what local forge, local context, or local artifact would have made that solve possible without the remote model.

## Deterministic Use

Use this doctrine to explain purpose and implementation boundaries.

- Do not treat the factory as a vague brand term.
- A forge must have inputs, transformations, outputs, status, and feedback.
- A factory must coordinate multiple forges or manage the governance around them.
- A factory system must coordinate multiple factories.
- A script becomes factory-grade when it is repeatable, inspectable, and governed.
- Biology terms may be used as temporary analogy, but they are not canonical factory vocabulary.
