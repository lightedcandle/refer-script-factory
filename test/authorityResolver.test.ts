import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";

const ajv = new Ajv2020({ allErrors: true });

execFileSync(
  "node",
  [
    "scripts/reference/authority-resolver.mjs",
    "resolve",
    "--intent",
    "Build Stripe checkout",
    "--domain",
    "stripe",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const stripePacket = readLatestPacket();
validate(stripePacket);
assert.equal(stripePacket.domain, "stripe");
assert.equal(stripePacket.authority_state, "official");
assert.ok(
  stripePacket.references.some((reference: { url?: string }) =>
    reference.url?.includes("docs.stripe.com"),
  ),
);

execFileSync(
  "node",
  [
    "scripts/reference/authority-resolver.mjs",
    "resolve",
    "--intent",
    "What is the standard branching workflow?",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const branchingPacket = readLatestPacket();
validate(branchingPacket);
assert.equal(branchingPacket.domain, "branching-methodology");
assert.ok(
  branchingPacket.references.some(
    (reference: { id?: string }) => reference.id === "refer.method.branching",
  ),
);
assert.ok(
  branchingPacket.references.some(
    (reference: { id?: string }) => reference.id === "refer.method.branch-assimilation",
  ),
);
assert.ok(
  branchingPacket.references.some(
    (reference: { id?: string }) => reference.id === "refer.method.chat-branch-boundary",
  ),
);

execFileSync(
  "node",
  [
    "scripts/reference/authority-resolver.mjs",
    "resolve",
    "--intent",
    "Start a remote chat for the release follow-up.",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const chatBranchPacket = readLatestPacket();
validate(chatBranchPacket);
assert.equal(chatBranchPacket.domain, "chat-branch");
assert.ok(
  chatBranchPacket.references.some(
    (reference: { id?: string }) => reference.id === "refer.method.chat-branch",
  ),
);

execFileSync(
  "node",
  [
    "scripts/reference/authority-resolver.mjs",
    "resolve",
    "--intent",
    "Rename the branch label in the diagram.",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const unrelatedBranchPacket = readLatestPacket();
validate(unrelatedBranchPacket);
assert.equal(unrelatedBranchPacket.authority_state, "created");

execFileSync(
  "node",
  [
    "scripts/reference/authority-resolver.mjs",
    "resolve",
    "--intent",
    "Build a made up local ritual engine",
    "--domain",
    "local-ritual-engine",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const createdPacket = readLatestPacket();
validate(createdPacket);
assert.equal(createdPacket.authority_state, "created");
assert.equal(createdPacket.created_authority.required, true);

function validate(payload: unknown): void {
  const schema = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "schemas", "authority-reference.schema.json"),
      "utf8",
    ),
  );
  const validator = ajv.compile(schema);
  const valid = validator(payload);
  assert.equal(
    valid,
    true,
    `authority-reference.schema.json validation failed: ${JSON.stringify(validator.errors)}`,
  );
}

function readLatestPacket(): any {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), ".refer-factory", "authority", "latest.json"),
      "utf8",
    ),
  );
}
