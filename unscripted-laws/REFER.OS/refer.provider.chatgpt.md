# Law 47: refer.provider.chatgpt.md — ChatGPT Provider Reference

This reference consolidates the ChatGPT-specific behavior from `codex/governance/domains/ChatGPT.md`.

## Article 47.1: 1. Provider semantics

- ChatGPT acts as a conversational provider that receives refer directives without requiring CLI semantics; describe any session expectations, prompt structure, or streaming behaviors here.
- Document how context alerts/interrogatories should surface in ChatGPT threads (notice of context switches, pending micro-law codifications) so the router stays compliant within the API context.

## Article 47.2: 2. Forward integration

- When `refer.*` actions interact with ChatGPT-based automation (e.g., watchers, autop-run loops), mention this reference so the router logs the provider interactions and coordinates the RETURN→COMMIT→PUBLISH reporting.
