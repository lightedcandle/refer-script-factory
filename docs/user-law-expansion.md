# User Law Expansion

Status: Draft  
Date: 2026-04-30  
Scope: Clean Script Factory installs, natural rule intake, and user-supplied rule expansion.

## Operating Position

The clean Script Factory install should ship only the rules required for Smart
Intake and Script Factory operation:

- contract-first intake;
- bounded clarification;
- deterministic resolver routing;
- registry lookup;
- effect comparison;
- modification loops;
- safe script execution;
- evidence and lineage recording.

Provider, domain, project, and user preference laws should not be active by
default. The user does not manage that state. They become active only after the
factory compiles, checks, categorizes, and registers them.

## Internal Rule Source State

Historical REFER laws live here:

```text
unscripted-laws/REFER.OS/
```

This folder is internal source material, not user-facing workflow. A document in
this folder does not control builds until it is converted into a script,
validator, resolver, fixture, or active rule pack.

## Natural Rule Intake

Users can provide rules naturally:

- upload a document;
- paste rules into a prompt;
- ask the factory to use a rule or method;
- reject an output and explain what should change.

The user does not need to know there is an unscripted state or a rule-to-script
generator. Smart Intake treats ordinary rule input as rule material, routes it to
the doctrine compiler, and returns normal interaction only when clarification or
confirmation is needed.

## Compilation Flow

```text
rule document or prompt
-> Smart Intake contract
-> doctrine compiler
-> classify internally as kernel, domain, project, provider, or user method
-> generate candidate script, validator, resolver, or rule pack
-> generate fixtures
-> run modification loop until functional, blocked, or superseded
-> register verified output
-> activate only inside declared scope
```

## Execution Sequence

User laws and methods follow the same canonical sequence as factory work:

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

A compiled user law must declare its sequence rank, activation trigger, scope,
and evidence path before it becomes active.

If a compiled law changes a chain, it must use a conditional chain action:
`continue`, `branch`, `fork`, `merge`, `modify`, `delete`, `skip`, `block`,
`supersede`, or `promote`. Deleting or replacing a user-law chain link requires
an archive or rollback path and registry update.

## Activation Rule

Only these rule classes are active on clean install:

- Script Factory kernel rules;
- Smart Intake resolver rules.

Everything else starts inactive internally. A rule may be activated when:

- the prompt domain matches its activation trigger;
- a user explicitly requests it;
- a project contract requires it;
- a verified dissatisfaction repair promotes it;
- an authority resolver confirms the domain source and lineage.

## Storage Rule

Keep the source and active layers separate:

```text
unscripted-laws/        internal prose/reference inputs
.refer-factory/         active local state, registries, lineage, receipts
scripts/                executable factory scripts
schemas/                validation contracts
docs/                   doctrine and operator explanation
```

Future installer work may migrate installed reference sources from `REFER.OS/`
to `.refer-factory/rule-packs/inactive/`. Until then, `REFER.OS/` remains a
compatibility target for bootstrap/update behavior and should be treated as
reference material, not user-facing required terminology.
