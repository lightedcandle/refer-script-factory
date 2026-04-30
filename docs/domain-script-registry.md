# Domain Script Registry

## Rule

Script lookup is domain-scoped.

Before a chat instance or agent performs direct work, it should identify the domain and check that domain's registry/check-first surfaces:

- `refer-script-factory`: Codex/VS Code source and provider-neutral doctrine.
- `chat-surface`: current Codex chat, token useage, context reset, and script activity logging.
- `hive`: node identity, heartbeat, build plan, and ratification state.
- `refer-zo-bootstrap`: Zo computer bootstrap, file/API tandem, compression, dispatch, talkback, datasets, and live Zo ratification.

Heartbeat is split by domain:

- Hive director heartbeat records node status, activity, next pulse, and evidence in `.refer-factory/hive-node-registry.json`.
- Zo bootstrap heartbeat runs node-local train cars and adapts the next automation pulse from active work down to a 24-hour dormant maximum.

Machine-readable registry:

```text
.refer-factory/script-registry.json
```

Human-readable registry:

```text
.refer-factory/script-registry.md
```

Generator:

```powershell
npm run scripts:registry
```

## Authority Split

The TypeScript source registry remains authoritative for the VS Code extension and provider-neutral script contracts:

```text
src/contracts/scriptFactory.ts
src/contracts/scriptLegend.ts
docs/script-legend.md
```

The operational domain registry is authoritative for chat-surface, hive, and cross-repo automation routing:

```text
.refer-factory/script-registry.json
.refer-factory/script-registry.md
```

The Zo bootstrap repo keeps its Zo-specific registry and package scripts:

```text
refer-zo-bootstrap/scripts/factory/script-registry.json
refer-zo-bootstrap/package.json
```

## Agent Behavior

1. Classify the request domain.
2. Check the domain registry first.
3. Use an existing script when one fits.
4. If no script fits and the action is likely to repeat, create or update a script and then update the registry.
5. If a workflow crosses domains, update each affected domain registry or doc pointer.
