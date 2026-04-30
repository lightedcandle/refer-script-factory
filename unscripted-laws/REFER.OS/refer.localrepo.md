# Law 41: refer.localrepo.md — Local Repository Reference

This reference describes local repository expectations from `codex/governance/domains/LocalRepo.md`, complementing `refer.github.md` for offline/local workflows.

## Article 41.1: 1. Local workspace rules

- Keep the workspace clean before switching contexts; the forward-only lineage rule requires you to commit/stash before branch changes.
- Local repo operations (file scaffolding, local previews) are treated as part of the action’s local edge. Document how to capture RETURN verification for these tasks before pushing changes.

## Article 41.2: 2. Integration with refer actions

- When `refer.build`, `refer.repair`, or `refer.expand` perform local repository work (templates, scaffolding, non-Git files), refer to this document so the router knows the tasks are local-only and must still obey RETURN before COMMIT.

## Article 41.3: 3. Active-root containment

When multiple local repositories exist on the same machine, REFER execution MUST
bind to one active project root before mutation.

Required rules:

- Read-only comparison across sibling repos is allowed when lawful and relevant.
- Mutation defaults to the active project root only.
- Writing outside the active project root requires explicit user authorization and an explicit target repo.
- Universal law reads do not grant cross-repo write authority.

## Article 41.4: 4. Standalone universal governance attachment

An app repo may consume universal REFER law from a standalone local source such as
`E:/refer.os/REFER.OS`.

In that model:

- `REFER.OS/*` remains universal law
- `refer.app/**` remains app-local law
- feature docs remain feature-local law

Resolution order remains:

1. feature scope
2. app scope
3. universal scope

If a shared universal root is unavailable, a vendored fallback copy may be used
temporarily, but the repo must still keep app-local law separate from universal
law.

## Article 41.5: 5. Monorepo and internal codebases

When one repository contains multiple internal codebases, REFER still binds to
the active repo root as one governed workspace.

Internal apps, packages, services, and workers are routed as subspaces, not as
separate repos. Use `refer.codebases.md` for the registry, refresh behavior, and
target-path rules.
