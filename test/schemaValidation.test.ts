import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { angularAdapter } from "../src/adapters/angularAdapter";
import { genericAdapter } from "../src/adapters/genericAdapter";
import { nodeAdapter } from "../src/adapters/nodeAdapter";
import { reactAdapter } from "../src/adapters/reactAdapter";
import { createCodebaseRegistry } from "../src/bootstrap/codebases";
import { createBootstrapDryRun } from "../src/bootstrap/dryRun";
import { createSendContractDraft } from "../src/contracts/sendContract";
import { createScriptBlueprint } from "../src/contracts/scriptBlueprint";
import { createScriptDnaSeed } from "../src/contracts/scriptDna";
import { calculateMetrics, sampleMetricInput } from "../src/telemetry/metrics";
import { sampleProcessEvents } from "../src/telemetry/processEvents";

const ajv = new Ajv2020({ allErrors: true });

validate("send-contract.schema.json", createSendContractDraft("test-repo"));
validate("script-blueprint.schema.json", createScriptBlueprint());
validate("script-dna.schema.json", createScriptDnaSeed());
validate("process-event.schema.json", sampleProcessEvents[0]);
validate("adapter-contract.schema.json", angularAdapter);
validate("adapter-contract.schema.json", reactAdapter);
validate("adapter-contract.schema.json", nodeAdapter);
validate("adapter-contract.schema.json", genericAdapter);
validate(
  "bootstrap-dry-run.schema.json",
  createBootstrapDryRun({
    workspace_root: process.cwd(),
    repo_purpose: "schema test",
    framework: "generic",
  }),
);
validate("metrics.schema.json", calculateMetrics(sampleMetricInput));
validate("codebases.schema.json", createCodebaseRegistry(process.cwd(), "generic"));
validate(
  "update-manifest.schema.json",
  JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "updates", "refer-update.manifest.json"),
      "utf8",
    ),
  ),
);

function validate(schemaFile: string, payload: unknown): void {
  const schema = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "schemas", schemaFile), "utf8"),
  );
  const validator = ajv.compile(schema);
  const valid = validator(payload);
  assert.equal(
    valid,
    true,
    `${schemaFile} validation failed: ${JSON.stringify(validator.errors)}`,
  );
}
