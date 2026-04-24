# Refer Script Factory

`Refer Script Factory` is a VS Code extension and local cockpit for governed
REFER work. The first slice proves the product container: a REFER activity bar,
dashboard sample metrics, governed chat placeholder, live process panel, Send
Contract draft output, adapter contract, and repo bootstrap dry-run.

Telechurch is the pilot consumer, not a product dependency.

## First Slice

- REFER activity container
- Dashboard webview for MPG, gears, terrain drag, and repo health
- Governed chat placeholder that emits a Send Contract draft
- Process panel that renders local process events
- `REFER: Initialize Repo` dry-run command
- `REFER: Emit Send Contract Draft` command
- JSON schemas for contracts, metrics, process events, adapters, and bootstrap
- TypeScript tests for metrics, process events, and bootstrap dry-run

## Verify

```powershell
npm install
npm run verify
```

## Scope Guard

This repo must not import Telechurch app code. Use Telechurch only as a pilot
workspace after the extension can run independently.
