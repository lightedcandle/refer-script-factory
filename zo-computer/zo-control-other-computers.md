# Zo Computer Control of Other Computers

Last updated: 2026-04-20
Verification status: Unverified

## Scope

This file captures the current state of knowledge around Zo controlling other machines.

## Confirmed

- Zo's security documentation says the Zo agent/application can control other devices connected to your Zo Computer.

Source:

- https://docs.zocomputer.com/information/security

## Observed Direction

- The Zo desktop interface includes a `Computer` area.
- Zo documentation also references a `Devices` feature in beta-oriented material captured elsewhere in this corpus.

## Not Yet Confirmed

The earlier version of this file included detailed SSH- and fleet-style procedures that are not yet established as Zo-native behavior in this corpus, including:

- required Zo client installation on remote targets
- specific config files such as `zo-settings.md` or `zo-remote-hosts.md`
- CLI commands like `zo keys generate`
- MCP restart requirements for remote host pickup
- guaranteed support boundaries by operating system

Those details should not be treated as real Zo procedures unless directly documented or tested.

## Current Use Rule

Treat multi-computer control as a promising but still partially undefined capability.

Before designing around it, validate:

1. what Zo means by `control other devices`
2. whether the Devices feature is the intended mechanism
3. whether SSH-based orchestration is Zo-native, merely possible, or entirely external
