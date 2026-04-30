import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";

execFileSync(
  "node",
  [
    "scripts/scriptionary/scriptionary-term.mjs",
    "candidate",
    "--term",
    "Fixture Effect",
    "--plain",
    "Fixture Reusable Effect",
    "--meaning",
    "A test-only term candidate that proves scriptionary vocabulary can be captured.",
    "--use",
    "Use only as a test fixture.",
    "--kind",
    "Term",
    "--effect",
    "A reusable system effect was discovered.",
  ],
  { cwd: process.cwd(), stdio: "pipe" },
);

const candidate = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), ".refer-factory", "scriptionary", "term-candidates", "latest.json"),
    "utf8",
  ),
);
const schema = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "schemas", "scriptionary-term-candidate.schema.json"),
    "utf8",
  ),
);
const ajv = new Ajv2020({ allErrors: true });
const validator = ajv.compile(schema);
const valid = validator(candidate);

assert.equal(
  valid,
  true,
  `scriptionary-term-candidate.schema.json validation failed: ${JSON.stringify(validator.errors)}`,
);
assert.equal(candidate.term, "Fixture Effect");
assert.equal(candidate.status, "candidate");
assert.equal(candidate.sequence.rank, "SEQ-L");
