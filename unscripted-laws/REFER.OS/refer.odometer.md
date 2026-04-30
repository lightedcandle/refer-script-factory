# refer.odometer.md - Prompt Mileage and Fuel Audit

## 1. Purpose

`refer.odometer` defines how REFER records prompt-by-prompt fuel use and progress mileage.

The purpose is diagnostic:

- make token burn visible,
- separate response quality from codebase friction,
- and show whether low efficiency is caused by steering, terrain, or cargo.

## 2. Core Model

`MPG` is a REFER acronym and must be explained prominently:

- **MPG = Mutations Per Group**

The familiar dashboard metaphor may still look like vehicle mileage, but the canonical REFER meaning is:

- **Mutations**: the useful state change yielded by a turn,
- **Per**: ratio,
- **Group**: the token batch sent and received for that turn.

Use this baseline formula:

- **Gallons** = `(input_tokens + output_tokens) / 1000`
- **MPG** = `miles / gallons`

REFER tracks two mileage views per prompt:

- **Response MPG**: how efficiently the prompt produced useful human-facing progress.
- **Codebase MPG**: how efficiently the same burn produced verified repo-facing progress.

REFER may also track:

- **Mutations Per Group**: useful state change yielded by a token group,
- and the **dominant gear** the engine was operating in during that prompt.

This allows one prompt to show both:

- a high response score,
- and a lower codebase score when the terrain is rough.

## 3. Definitions

**Fuel**

- total prompt tokens plus total response tokens,
- or an estimate when exact token counts are unavailable.

**Response Mutations**

- useful clarification,
- contract tightening,
- ambiguity removed,
- decisions resolved,
- or a response that materially moved the work forward.

**Codebase Mutations**

- verified repo progress,
- artifacts landed,
- routes or primitives integrated,
- tests passing,
- or lawful machinery created that reduces future burn.

## 4. Required Metrics

Each odometer record should carry at least:

- `input_tokens`
- `output_tokens`
- `gallons`
- `response_miles`
- `codebase_miles`
- `response_mpg`
- `codebase_mpg`

Useful optional fields:

- `prompt_id`
- `plan_id`
- `label`
- `terrain`
- `vehicle`
- `driver`
- `cargo`
- `notes`
- `dominant_gear`
- `secondary_gears`
- `mutations_per_group`

## 5. Estimation Rule

If exact token counts are unavailable, use a lightweight estimate:

- `estimated_tokens = ceil(characters / 4)`

Estimated fuel is acceptable for local diagnostics as long as the record marks itself as estimated.

## 6. Interpretation

When `response_mpg` is high but `codebase_mpg` is low:

- the answer quality may be fine,
- but the repo terrain is expensive.

When both are low:

- steering, law, cargo, or terrain are all likely contributing to waste.

When both rise over time:

- law, contracts, scripts, and anchors are reducing drag successfully.

## 7. First-Pass Discipline

REFER does not require perfect automated mutation scoring on day one.

The first lawful pass may use:

- manual `response_mutations`,
- manual `codebase_mutations`,
- estimated tokens,
- and simple per-prompt records.

The point is to establish a visible odometer before the scoring model becomes more sophisticated.

## 8. Cross-References

- `refer.md`
- `refer.efficiency.md`
- `inference.md`
- `refer.factory.md`
- `refer.engine.md`
- `refer.gears.md`
