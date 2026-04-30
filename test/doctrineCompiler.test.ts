import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";

const ajv = new Ajv2020({ allErrors: true });

execFileSync(
  "node",
  [
    "scripts/doctrine/doctrine-compiler.mjs",
    "compile",
    "--rule",
    "Stripe checkout must use official Stripe docs before script generation.",
    "--domain",
    "stripe",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const stripeCandidate = readLatestCandidate();
validate(stripeCandidate);
assert.equal(stripeCandidate.classification, "domain_rule");
assert.equal(stripeCandidate.domain, "stripe");
assert.equal(stripeCandidate.status, "candidate");
assert.equal(stripeCandidate.natural_rule_intake.user_label_required, false);
assert.equal(stripeCandidate.authority_packet.authority_state, "official");
assert.ok(stripeCandidate.fixtures.length >= 2);

execFileSync(
  "node",
  [
    "scripts/doctrine/doctrine-compiler.mjs",
    "compile",
    "--rule",
    "UI buttons should use compact labels and avoid bulky layouts.",
    "--domain",
    "ui",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);
const uiCandidate = readLatestCandidate();
validate(uiCandidate);
assert.equal(uiCandidate.classification, "user_method_rule");
assert.equal(uiCandidate.domain, "ui");
assert.equal(uiCandidate.script_blueprint.script_class, "UI Script");

function validate(payload: unknown): void {
  const schema = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "schemas", "doctrine-candidate.schema.json"),
      "utf8",
    ),
  );
  const validator = ajv.compile(schema);
  const valid = validator(payload);
  assert.equal(
    valid,
    true,
    `doctrine-candidate.schema.json validation failed: ${JSON.stringify(validator.errors)}`,
  );
}

function readLatestCandidate(): any {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), ".refer-factory", "doctrine-candidates", "latest.json"),
      "utf8",
    ),
  );
}
