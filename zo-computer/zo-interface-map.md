# Zo Interface Map

Last updated: 2026-04-20
Status: Active
Scope: Interface map for Zo Computer based on public documentation and direct observation

## Purpose

This document tracks the known Zo interface surfaces so future deployment, operations, and multi-instance coordination work can rely on a stable UI reference.

## Evidence Rules

- Mark `Documented` when the interface element is supported by public Zo documentation.
- Mark `Observed` when the interface element is visible in direct user screenshots or hands-on testing.
- Mark `Inferred` only when the structure is a reasonable interpretation of documented or observed UI.

## Desktop App Evidence

### Observed on 2026-04-20

Source:

- User-provided screenshot of the first initialized Zo desktop instance named `refer`

Observed shell characteristics:

- Desktop window title shows `Zo`
- Top menu includes:
  - `File`
  - `History`
  - `Sync`
- Main header shows `Zo Computer`
- A top-right browser-style nav cluster is visible:
  - back
  - forward
  - refresh
- An account entrypoint is visible on the upper-right side of Settings

Observed primary left navigation:

- `Home`
- `Files`
- `Chats`
- `Automations`
- `Space`
- `Skills`
- `Computer`
- `More`
- `Terminal`
- `Hosting`
- `Datasets` with `Beta` tag
- lower `More` action opening a support/community menu

Observed lower-left persistent items:

- `Bookmarks`
- `Settings`
- active instance/account chip labeled `refer`
- plan marker `Free`

## Settings Surface

### Observed settings top tabs

- `AI`
- `Channels`
- `Integrations`
- `UX`
- `Advanced`

### Observed AI settings sub-navigation

- `Models`
- `Personas`
- `Providers`
- `Rules`
- `Personalization`

### Observed Models section behavior

The screenshot shows channel-specific model/persona assignment rows for:

- `Chat`
- `Text` with phone number `+1 (310) 279-6697`
- `Email` with address `refer@zo.computer`
- `Telegram`

Each visible row appears to support:

- a persona selector
- a model selector

Visible selected examples in the screenshot:

- persona label appears truncated as `Architectura...`
- model shown as `MiniMax 2.7`

### Observed Providers section

Visible provider call-to-action:

- `Add Claude Code, Codex, or bring your own API keys`

### Observed Rules section

Visible guidance text:

- Rules customize how Zo behaves generally or in specific scenarios.

## More Menu

### Observed support/community links

- `Product Updates`
- `Documentation`
- `Discord Community`
- `Fan Club`
- `Contact Support`

## Cross-check with Public Docs

The following public documentation aligns with the observed desktop shape:

- Desktop app exists and supports syncing files to Zo.
  - Documented
  - Source: https://docs.zocomputer.com/intro

- Settings-based integrations are documented.
  - Documented
  - Source: https://docs.zocomputer.com/connections

- Channels including text, email, Telegram, and API are documented.
  - Documented
  - Source: https://www.zo.computer/channels

- Hosting, services, and SSH-oriented server use are documented.
  - Documented
  - Source: https://docs.zocomputer.com/sites
  - Source: https://docs.zocomputer.com/ssh-zo

- Product updates mention terminal mode, developer settings, notifications, and SQLite viewers.
  - Documented
  - Source: https://docs.zocomputer.com/updates

## Current Interface Understanding

What is currently established:

- Zo has a desktop application shell, not just a browser experience.
- The desktop app exposes a left-nav workspace model with operational surfaces for files, chats, automations, hosting, terminal, and datasets.
- Settings appear to be a major control surface for AI, channels, integrations, UX, and advanced configuration.
- Channel-specific persona/model selection is part of the AI settings experience.

What remains unverified:

- exact behavior of each left-nav section
- web versus desktop differences for every surface
- whether `Computer` exposes system-level state, snapshots, or machine controls
- how `Skills` are installed, managed, and shared in-app
- how `Datasets` behaves and whether it is tied to file indexing, structured data, or agent context

## Update Log

### 2026-04-20

- Created initial interface map.
- Added first direct desktop UI observation from the `refer` Zo instance.
