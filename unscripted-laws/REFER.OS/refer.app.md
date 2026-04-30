# Law 9: refer.app.md - The Scoped Application Layer

## Article 9.1: Purpose

The `refer.app/` directory contains app-specific interpretations of universal REFER.OS laws. It bridges the gap between the universal mold (`REFER.OS/`) and the materialized code (`src/app/`).

## Article 9.2: Structure

`refer.app/` uses a **sparse inheritance** pattern. It does not need to duplicate every file in `REFER.OS/`; it only contains files that need to be specialized for the specific application.

### Section 9.2.1: State-law naming convention

App-specific overrides and exemptions are **state law**. Use explicit app naming so scope is unambiguous across multi-repo environments:

- Format: `refer.<appname>.<law>.md`
- Location: `refer.app/` (app scope) or `refer.app/features/<feature>/` (feature scope)
- Each state-law file must cite its parent `REFER.OS/refer.<law>.md`
- Trigger: when a request invokes app-specific terminology or a sanctioned exception, capture it as state law under `refer.app/` instead of altering universal law.

## Article 9.3: Scope Taxonomy

Every refer doc can be classified by scope, typically denoted in frontmatter:

| Scope         | Location                | Applies To               | Examples                                                         |
| ------------- | ----------------------- | ------------------------ | ---------------------------------------------------------------- |
| **universal** | `REFER.OS/`             | ALL apps using REFER.OS  | `refer.compiler.md`, `refer.structure.md`                        |
| **app**       | `refer.app/`            | ALL features in THIS app | `refer.telechurch.cloudflare.md`, `refer.telechurch.supabase.md` |
| **feature**   | `refer.app/features/*/` | ONE specific feature     | `refer.app/features/academy/blueprint.map.json`                  |

## Article 9.4: Inheritance Rules

1.  **Resolution Chain**: Start at **Feature Scope**. If doc is missing, check **App Scope**. If missing, check **Universal Scope**.
2.  **Specialization**: Scoped laws inherit from parenting laws. They can refine or restrict, but should not fundamentally contradict the universal law unless explicitly noting a divergence.
3.  **No Pollution**: App-specific details must NEVER be written to `REFER.OS/`. They belong in `refer.app/`.

## Article 9.4.1: Portable universal root

The universal scope does not need to live inside the app repo. A consumer repo may
resolve universal law from an attached standalone root (for example
`E:/refer.os/REFER.OS`) while still preserving the same inheritance behavior.

Portable rule:

- feature scope stays in the app repo
- app scope stays in the app repo
- universal scope may be shared outside the app repo

This changes where universal law is loaded from, not the inheritance order.

## Article 9.5: Directory Layout

```
REFER.OS/                           ← scope: universal
  ├── refer.cloudflare.md
  └── ...

refer.app/                          ← scope: app
  ├── refer.telechurch.cloudflare.md ← (Overrides/Extends universal)
  ├── features/                     ← scope: feature
  │   ├── academy/
  │   │   ├── blueprint.map.json
  │   │   └── refer.plan.md
  │   └── ...
```
