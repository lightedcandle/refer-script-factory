# Zo Computer API Notes

Last updated: 2026-04-20
Verification status: Partially verified

## Scope

This file captures current API-related working notes for Zo. It is intentionally conservative.

## Confirmed

- Zo publicly markets an API channel.
- Zo's public API page states the API gives access to Zo's AI, files, and tools.

Sources:

- https://www.zo.computer/channels/api

## Verified Live on 2026-04-21

- `GET https://api.zo.computer/models/available` authenticated successfully with a Zo access token stored locally in `.env.master`.
- `POST https://api.zo.computer/zo/ask` authenticated successfully and returned an `OK` response for a minimal validation prompt.
- The response included a conversation id.

Evidence:

- `E:\refer\zo-computer\zo-validation-log.md`

## Working Notes That Still Need Verification

The following items were captured into the corpus but are not yet treated as deployment-grade facts until directly validated against official docs or live calls:

- persona-list endpoint
- request and response schemas
- streaming semantics and event names
- detailed token creation flow
- rate limits, error shapes, and quotas

## Current Use Rule

Do not rely on this file alone for implementation.

Before building against the Zo API, verify:

1. official Zo API documentation pages
2. authentication flow in the current product UI
3. a successful live test recorded in `zo-validation-log.md`

## Next Validation Targets

- confirm persona discovery endpoint
- confirm whether structured output is officially documented or just inferred from examples
- confirm rate limits, errors, and quotas
