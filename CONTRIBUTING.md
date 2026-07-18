# Contributing

This repository is the canonical home for Refer Script Factory.

## Scope

- Keep extension source, scripts, schemas, docs, and test coverage in this repo.
- Keep Zo/bootstrap-specific runtime work in `refer-zo-bootstrap/`.
- Keep app-specific product work in the sibling app repos referenced by the factory.

## Change Rules

- Update the root `README.md` when the repo purpose or surface areas change.
- Update `AGENTS.md` when governance or operating assumptions change.
- Prefer small, reviewable edits over broad rewrites.
- Avoid committing build outputs or local environment files.

## Review Standard

Before merging, confirm that:

1. The repo still reads as a VS Code extension plus local factory tooling.
2. The README matches the current shipped surfaces.
3. New scripts or schemas have tests or clear verification steps.
