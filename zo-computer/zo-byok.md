# Zo Computer BYOK

Last updated: 2026-04-20
Verification status: Confirmed at feature level, unverified at configuration-detail level

## Scope

This file captures what is currently safe to say about Bring Your Own Key or Bring Your Own Model behavior in Zo.

## Confirmed

- Zo publicly states that users can bring their own API keys.
- Zo's pricing and BYOK docs indicate this is a supported feature direction.

Sources:

- https://www.zo.computer/
- https://docs.zocomputer.com/byok
- https://www.zo.computer/pricing

## Not Yet Confirmed in This Corpus

The earlier version of this file included very specific configuration assumptions that are not yet validated here, including:

- exact environment variable names for each provider
- server-side `.env` setup expectations
- direct edits to other Zo reference docs as a configuration mechanism
- MCP restart requirements
- specific provider support details beyond what Zo currently documents

Those should be treated as unverified until directly documented or tested.

## Current Use Rule

For now, rely on official Zo BYOK documentation and current product UI before configuring provider keys.

Before treating BYOK as part of a deployment template, validate:

1. the current Zo settings path
2. the supported provider formats
3. the exact operational steps required in the live product
