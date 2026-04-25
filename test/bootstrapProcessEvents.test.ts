import assert from "node:assert/strict";
import {
  createBootstrapApplyEvent,
  createBootstrapCancelledEvent,
  createBootstrapDryRunEvent,
} from "../src/bootstrap/processEvents";

const dryRunEvent = createBootstrapDryRunEvent(
  {
    workspace_root: "E:/repo",
    repo_purpose: "test repo",
    framework: "generic",
    would_create: ["REFER.OS", "refer.app"],
    would_update: [".refer-factory/metrics.json"],
    would_skip: [".refer-factory"],
    unsafe_overwrites: [],
    required_confirmation: false,
  },
  {
    id_prefix: "evt",
    started_at: "2026-04-24T22:00:00.000Z",
    elapsed_ms: 12,
  },
);

assert.equal(dryRunEvent.id, "evt-dry-run");
assert.equal(dryRunEvent.script_name, "bootstrap-dry-run");
assert.equal(dryRunEvent.status, "completed");
assert.equal(dryRunEvent.error, null);
assert.match(dryRunEvent.message, /create 2, update 1, skip 1/);

const blockedDryRunEvent = createBootstrapDryRunEvent(
  {
    workspace_root: "E:/repo",
    repo_purpose: "test repo",
    framework: "generic",
    would_create: [],
    would_update: [],
    would_skip: [],
    unsafe_overwrites: ["../outside"],
    required_confirmation: true,
  },
  {
    id_prefix: "evt",
    started_at: "2026-04-24T22:00:00.000Z",
    elapsed_ms: 12,
  },
);

assert.equal(blockedDryRunEvent.status, "blocked");
assert.match(blockedDryRunEvent.error ?? "", /outside/);

const applyEvent = createBootstrapApplyEvent(
  {
    dry_run: {
      workspace_root: "E:/repo",
      repo_purpose: "test repo",
      framework: "generic",
      would_create: [],
      would_update: [],
      would_skip: [],
      unsafe_overwrites: [],
      required_confirmation: false,
    },
    created: ["REFER.OS"],
    updated: [".refer-factory/metrics.json"],
    skipped: [".refer-factory"],
    unsafe_overwrites: [],
  },
  {
    id_prefix: "evt",
    started_at: "2026-04-24T22:00:01.000Z",
    elapsed_ms: 20,
  },
);

assert.equal(applyEvent.id, "evt-apply");
assert.equal(applyEvent.status, "completed");
assert.match(applyEvent.message, /created 1, updated 1, skipped 1/);

const cancelledEvent = createBootstrapCancelledEvent({
  id_prefix: "evt",
  started_at: "2026-04-24T22:00:02.000Z",
  elapsed_ms: 0,
});

assert.equal(cancelledEvent.id, "evt-cancelled");
assert.equal(cancelledEvent.status, "blocked");
assert.equal(cancelledEvent.error, "user cancelled");
