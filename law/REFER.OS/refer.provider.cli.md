# Law 48: refer.provider.cli.md — CLI Provider Reference

This document captures the CLI rules from `codex/governance/domains/CLI.md` so REFER.OS knows how the command line interacts with the router.

## Article 48.1: 1. CLI behavior

- CLI sessions act as providers that run the refer directives; they expect prompts that begin with `refer.` or `refer.md:` as part of the command. Document the CLI guard rails here so every refer action can be executed via the terminal.
- CLI watchers may start `refer.*` events automatically; ensure context continuity is maintained by keeping the refer session active until you explicitly switch domains.

## Article 48.2: 2. Integration

- When a refer action spawns shell commands, mention this reference so the router knows to surface CLI-specific logging, watchers, or environment guards.
