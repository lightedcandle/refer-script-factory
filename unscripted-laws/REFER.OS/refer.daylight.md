# Law 27: refer.daylight.md - Dynamic Daylight Theme (Concept Only)

Status: Documentation only. Do not implement automatically.

## Article 27.1: Purpose
Define a dynamic theme concept that derives a single base seed from local
daylight time and then uses the existing HL derivation rules to produce IMSCE
tokens (I/M/S/C/E). This preserves the canonical cascade and avoids adding a
new theme engine.

## Article 27.2: Core idea
- Sample a "sky band" color based on local time (0..1440 minutes).
- Use that color as `M.surface` seed.
- Apply HL derivation rules (refer.honeycomb.md + theme.spec.md) to generate
  all derived tokens.
- No per-component overrides; the theme plane remains authoritative.

## Article 27.3: Daylight sampling (band)
Define a set of color stops keyed by minutes since midnight. Example stops:

```
0    -> #071225 (midnight)
240  -> #0a1f3f (pre-dawn)
330  -> #3b2a66 (dawn violet)
390  -> #ff7a7a (sunrise)
450  -> #78b7ff (morning)
720  -> #74e6ff (noon)
930  -> #a6f7ff (afternoon)
1020 -> #ffd08a (golden hour)
1110 -> #ff6b5b (sunset)
1170 -> #3f2b78 (dusk)
1260 -> #0b1735 (night)
1440 -> #071225 (loop)
```

Sampling rule:
- Find the two adjacent stops around `t` (minutes since midnight).
- Linearly interpolate RGB between the two hex values to get `seedHex`.

## Article 27.4: Theme flow
1) `seedHex` -> `M.surface`
2) Run HL derivation to emit I/S/C/E surfaces + text/border/shadow.
3) Apply the canonical cascade: Local -> Theme -> Default.

## Article 27.5: Behavior rules
- Time-based seed changes must be gradual (no sudden jumps).
- Recompute on interval (e.g., every 10 minutes) or on visibility change.
- Never override E/C text directly; always derive from their surfaces.
- Must keep WCAG contrast targets for C/E text.

## Article 27.6: Optional UI (non-binding)
If a "sky band" preview is shown in a future tool, it is a visualizer only.
It should never become the source of truth for tokens beyond the seed.

## Article 27.7: Notes
- This is a doc-only concept. No runtime logic is defined here.
- The existing HL derivation and token map remain authoritative.
