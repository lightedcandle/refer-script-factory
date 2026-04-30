# refer.gears.md - AI Work Gears and Engine Profile

## 1. Purpose

`refer.gears` defines the five work gears used to classify AI activity in REFER.OS.

The point is not only to measure total cost. The point is to understand:

- what kind of work the engine was doing,
- which gears are expensive,
- which gears each AI handles well,
- and whether a mature factory is pushing more work into efficient cruising gears over time.

## 2. Core Law

Every meaningful AI turn should be classifiable by one dominant gear, and may include secondary gears.

Gears are not moral grades.

- Lower gears are not "bad"; they are torque-heavy and often necessary on rough terrain.
- Higher gears are not "smarter"; they are more efficient when the route is already prepared.

The mature-factory target is:

- use lower gears only where necessary,
- move repeated work out of chat,
- and spend more time cruising in higher gears.

## 3. The Five Gears

### Gear 1: Inventory

Purpose:

- orient,
- inspect,
- ask what/where/why/who/how,
- identify missing references,
- learn local terrain.

Typical signs:

- repo discovery,
- law discovery,
- file finding,
- system understanding,
- interrogatory intake.

### Gear 2: Collection

Purpose:

- gather the working set,
- read the relevant artifacts,
- collect references,
- compile the packet needed for action.

Typical signs:

- opening files,
- reading docs,
- gathering snippets,
- collecting plan evidence,
- assembling the scoped context.

### Gear 3: Transfer

Purpose:

- move prepared truth between lanes and systems.

Typical signs:

- converting chat into a Send Contract,
- passing work to scripts or runners,
- moving artifacts between law, plan, tool, and repo,
- preparing inputs for external systems or internal runners.

### Gear 4: Scaffolding

Purpose:

- place and bind artifacts into exact structure.

Typical signs:

- code edits,
- route placement,
- wiring,
- file creation,
- binding into frameworks,
- exact manifestation in the repo or execution surface.

### Gear 5: Response

Purpose:

- explain to the human,
- summarize the state,
- answer questions,
- present results and repair guidance.

Typical signs:

- conversational guidance,
- summaries,
- product explanation,
- human-facing feedback after build or diagnosis.

## 4. Gear Interpretation

In general:

- Gear 1 is discovery-heavy.
- Gear 2 is collection-heavy.
- Gear 3 is orchestration-heavy.
- Gear 4 is manifestation-heavy.
- Gear 5 is explanation-heavy.

Chat-only threads often sit mostly in Gear 5.
Code execution often mixes Gears 1 through 4 before returning to Gear 5.

## 5. Gear and Efficiency

Efficiency should be read within a gear, not only across all work.

Examples:

- an AI may be excellent at Gear 5 and poor at Gear 4,
- another may be strong at Gear 4 but weak at Gear 1,
- a mature repo should require less time in Gears 1 and 2 than an immature repo.

Therefore, REFER should measure:

- dominant gear per turn,
- optional secondary gears,
- MPG within gear,
- and engine strength by gear.

## 6. Engine Strength Card

Each AI engine may be profiled across the five gears.

Suggested fields:

- `g1_inventory_strength`
- `g2_collection_strength`
- `g3_transfer_strength`
- `g4_scaffolding_strength`
- `g5_response_strength`

These may be derived from:

- average MPG in that gear,
- repair rate,
- drift rate,
- completion quality,
- and operator satisfaction over time.

## 7. Odometer Relation

`refer.odometer` should record gear context whenever practical.

Suggested odometer additions:

- `dominant_gear`
- `secondary_gears`
- `mutations_per_group`
- `gear_mpg`

This allows one prompt to show not only total efficiency, but also whether the engine was:

- discovering,
- collecting,
- transferring,
- scaffolding,
- or responding.

## 8. Factory Target

Factory maturity should change the gear profile of work.

Desired long-term movement:

- less repeated Gear 1 discovery,
- less repeated Gear 2 collection,
- more deterministic Gear 3 transfer through Send Contracts,
- more script-owned Gear 4 scaffolding,
- and lighter, clearer Gear 5 response.

Fresh factory-native repos should begin with a lower baseline dependency on Gears 1 and 2 than retrofitted repos.

## 9. Cross-References

- `refer.md`
- `refer.efficiency.md`
- `refer.odometer.md`
- `refer.factory.md`
- `refer.engine.md`
- `inference.md`
