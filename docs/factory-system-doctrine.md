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
3. Add or update a forge/script when the gap is repeatable work.
4. Add or refresh scan/context artifacts when the gap is missing knowledge.
5. Add tests when the gap could regress.
6. Add status/process events when the gap affects observability.

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
