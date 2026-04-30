# refer.efficiency.md - Inference Efficiency Law

## 1. Purpose

`refer.efficiency` defines how REFER.OS should reason about cost, friction, and durable reuse while planning and executing work.

Efficiency is not measured by speed alone. It is measured by the ratio of:

- useful verified progress,
- to token burn, retries, repair loops, and repeated re-inference.

## 2. The Efficiency Model

Use this common model when assessing work:

- **Fuel**: tokens, context budget, iteration budget.
- **Vehicle**: the active AI/model/tooling surface.
- **Driver**: the human or agent shaping intent and steering execution.
- **Terrain**: the framework, codebase, law quality, repo cleanliness, and task ambiguity.
- **Cargo**: the weight of scope, novelty, coupling, and unresolved design.
- **Road Law**: REFER governance, which reduces drift and keeps routing explicit.

High token burn is usually a systems signal:

- cargo is too heavy,
- terrain is too rough,
- steering is too vague,
- or the vehicle is mismatched to the terrain.

## 3. Core Duties

- Spend tokens to eliminate future token spend.
- Do not keep paying conversational tax for stable repeated work.
- Burn fuel on novelty, ambiguity, and exception handling.
- Convert known work into contracts, scripts, registries, and reusable machinery.
- Treat repeated repair loops as efficiency failure, not normal progress.

## 4. Friction Sources

Common causes of inefficient execution:

- freeform prose carrying too much execution intent,
- missing or weak contracts,
- framework-vehicle mismatch,
- unresolved design going straight to live wiring,
- repo structures without lawful anchors,
- repeated manifestation of already-known elements,
- scripts that are local-only and cannot travel.

## 5. Capital vs Operating Burn

High token spend is acceptable when it produces durable infrastructure:

- interpreters,
- portable scripts,
- registries,
- anchor maps,
- contract compilers,
- verification runners.

High token spend is not acceptable when it is used to repeatedly:

- add the same UI element,
- rewire the same pattern,
- rediscover the same route,
- or restate the same build intent.

Use this distinction:

- **capital burn**: one-time or low-frequency investment that removes future cost,
- **operating burn**: recurring cost caused by missing machinery.

## 6. Required Agent Behavior

Before heavy execution, agents should assess:

- what terrain they are on,
- whether the active vehicle matches the terrain,
- whether the cargo should be split,
- whether the task should move to script-first execution,
- whether law, anchors, or contracts are missing.

If a task is stable and repeated, agents should recommend factory/engine treatment instead of continuing freeform generation.

Agents should also identify the dominant work gear using `refer.gears.md`, because efficiency is only comparable when the kind of work is known.

## 7. Odometer Discipline

Efficiency should be visible, not merely felt.

When practical, record prompt-level mileage using `refer.odometer.md` so fuel burn can be compared against:

- response progress,
- codebase progress,
- and terrain drag.

In REFER terms, the key ratio is `MPG = Mutations Per Group`, which should remain visible and prominent whenever odometer data is shown.

This is especially useful when:

- one model appears fluent in chat but slow in repo execution,
- a codebase burns double the fuel of the response,
- or repeated repair loops make cost hard to diagnose.

## 8. Cross-References

- `refer.md`
- `refer.plan.md`
- `refer.flow.md`
- `refer.factory.md`
- `refer.engine.md`
- `refer.odometer.md`
- `refer.gears.md`
