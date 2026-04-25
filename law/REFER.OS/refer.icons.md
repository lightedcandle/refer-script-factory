# Law 66: refer.icons.md - Icon Standards (Agnostic)

Goal: one icon language that inherits tokens and never hardcodes color.

Rules
- Default style: 24x24 viewBox, 1px stroke, `fill="none"`, `stroke="currentColor"`.
- Color: icon color must come from CSS (`currentColor`) and tokens only.
- Variants: change size/weight via component inputs or CSS, never by baking new SVG colors.
- No hardcoded fills or strokes inside SVG paths.

App-specific registries, component names, and migration scopes belong in app state law (for example, `refer.app/refer.telechurch.icons.md`).
