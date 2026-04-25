# Law 24: refer.compiler.pages.md

Canonical registry of compiler conversion across routed pages.

Use this as the single source of truth when answering:
- "Is this page compiler-driven yet?"
- "What does 100% mean for this page?"
- "What's next to compile?"

Canonical metric definitions live in `REFER.OS/refer.compiler.metrics.md`.

---

## Article 24.1: Status Legend

- `none` - no compiler plan for this page yet (or intentionally excluded).
- `plan` - plan exists, work not started.
- `in_progress` - compiler migration active.
- `complete` - meets the page's definition of "100% compiler-driven" (usually Copy + Selection; sometimes Presentation too).

---

## Article 24.2: Page Registry

| Route | Feature | Status | Copy | Selection | Presentation | Cards | Behavior | Plan Doc |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | landing | none | 0% | 0% | 0% | - | 0% | - |
| `/login` | auth | none | 0% | 0% | 0% | - | 0% | - |
| `/ichurch/:churchId` | ichurch-shell | in_progress | 100% | 25% | 100% | - | 20% | `refer.app/plan/refer.compiler.ichurch.md` |
| `/imeeting/:orgId` | imeeting | plan | 0% | 0% | 0% | - | 0% | `refer.app/plan/refer.imeeting.todo.md` |
| `/:churchId` | ichurch-shell (legacy deep link) | none | 0% | 0% | 0% | - | 0% | - |
| `/:churchId/invitedby=:invited` | ichurch-shell (legacy deep link) | none | 0% | 0% | 0% | - | 0% | - |
| `/events` | events | complete | 100% | 100% | 100% | - | 10% | `REFER.OS/refer.compiler.init.md` |
| `/events/:id` | events-detail | complete | 100% | 100% | 100% | - | 10% | `REFER.OS/refer.compiler.init.md` |
| `/events/:id/share` | events-share | complete | 100% | 100% | 100% | - | 10% | `REFER.OS/refer.compiler.init.md` |
| `/startchurch` | startchurch | plan | 0% | 0% | 0% | - | 0% | `refer.app/plan/refer.compiler.startchurch.md` |
| `/orgs` | orgs-directory | complete | 100% | 100% | 25% | 100% | 10% | `REFER.OS/refer.compiler.metrics.md` |
| `/orgs-b` | orgs-directory (legacy) | none | 0% | 0% | 0% | - | 0% | - |
| `/orgs-c-gen` | orgs-directory (generated artifact) | none | - | - | - | - | - | - |
| `/cardcompiler` | cardcompiler | in_progress | 50% | 50% | 50% | 100% | 0% | `REFER.OS/refer.compiler.metrics.md` |
| `/card-compiler` | cardcompiler (alias) | in_progress | 50% | 50% | 50% | 100% | 0% | `REFER.OS/refer.compiler.metrics.md` |
| `/labs/cards` | cardcompiler (alias) | in_progress | 50% | 50% | 50% | 100% | 0% | `REFER.OS/refer.compiler.metrics.md` |
| `/designlab` | designlab | plan | 0% | 0% | 0% | - | 0% | `REFER.OS/refer.designlab.md` |
| `/design-lab` | designlab (alias) | plan | 0% | 0% | 0% | - | 0% | `REFER.OS/refer.designlab.md` |
| `/labs/design` | designlab (alias) | plan | 0% | 0% | 0% | - | 0% | `REFER.OS/refer.designlab.md` |
| `/refer-runtime` | refer-runtime | none | - | - | - | - | - | - |
| `/refer-runtime/:feature` | refer-runtime | none | - | - | - | - | - | - |
| `/labs/runtime` | refer-runtime (alias) | none | - | - | - | - | - | - |
| `/plan` | plan-lab (alias) | none | - | - | - | - | - | - |
| `/plan-lab` | plan-lab (alias) | none | - | - | - | - | - | - |
| `/labs/plan` | plan-lab (alias) | none | - | - | - | - | - | - |
| `/prayerwall` | prayer-wall | none | 0% | 0% | 0% | - | 0% | - |
| `/ordination` | ordination | none | 0% | 0% | 0% | - | 0% | - |
| `/ordination/:code` | ordination | none | 0% | 0% | 0% | - | 0% | - |
| `/ordination/org/:orgId` | ordination | none | 0% | 0% | 0% | - | 0% | - |
| `/data` | legal | none | 0% | 0% | 0% | - | 0% | - |
| `/privacy` | legal | none | 0% | 0% | 0% | - | 0% | - |
| `/tos` | legal | none | 0% | 0% | 0% | - | 0% | - |

Notes:
- For `/orgs`, "complete" is defined as: Copy + template selection + card specs are DB-driven; IO remains in store/effects.
- `Cards` is "100% data" for pages using `refer_card_templates` + a stable renderer. If the page doesn't use cards, use `-`.
