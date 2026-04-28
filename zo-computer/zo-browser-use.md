# Zo Computer Browser Use

Last updated: 2026-04-20
Verification status: Confirmed with limitation

## Scope

This file captures what Zo's public docs currently support about browser-related capability.

## Confirmed

- Zo has a browser surface intended for AI use.
- Users can sign into sites in Zo's browser for later use.
- Zo can read webpages, search the web, and work with browser-oriented web research tools.

Sources:

- https://docs.zocomputer.com/integrations
- https://docs.zocomputer.com/intro
- https://docs.zocomputer.com/updates

## Confirmed Limitation

Zo's docs currently state that Zo cannot take actions in its browser.

Practical implication:

- treat browser reading and browsing as documented
- do not assume reliable browser clicking, typing, or full agentic web control until directly validated

Source:

- https://docs.zocomputer.com/integrations

## Unverified

The following should remain unverified until hands-on proof exists:

- full autonomous browser task execution in Zo's cloud browser
- account login automation inside Zo's browser
- parity between browser-related tool descriptions and current live browser behavior
- relationship between browser use and the separate Devices capability

## Guidance

For deployment planning, do not design a critical workflow that depends on Zo performing reliable authenticated browser actions unless:

- the workflow has been tested in `zo-validation-log.md`, or
- Zo publishes updated documentation that explicitly confirms the behavior
