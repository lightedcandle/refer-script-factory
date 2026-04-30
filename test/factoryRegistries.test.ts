import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";

execFileSync("node", ["scripts/registry/script-class-registry.mjs", "build"], {
  cwd: process.cwd(),
  stdio: "pipe",
});
execFileSync("node", ["scripts/registry/forge-registry.mjs", "build"], {
  cwd: process.cwd(),
  stdio: "pipe",
});

const ajv = new Ajv2020({ allErrors: true });
const scriptClassRegistry = readJson(".refer-factory/script-class-registry.json");
const forgeRegistry = readJson(".refer-factory/forge-registry.json");
const lineageSample = JSON.parse(
  execFileSync("node", ["scripts/lineage/lineage-packet.mjs", "sample"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }),
);

validate("script-class-registry.schema.json", scriptClassRegistry);
validate("forge-registry.schema.json", forgeRegistry);
validate("lineage-packet.schema.json", lineageSample);

assert.ok(scriptClassRegistry.entries.length > 0);
assert.ok(
  scriptClassRegistry.entries.every((entry: { script_class?: string }) => entry.script_class),
);
assert.ok(forgeRegistry.forges.length > 0);
assert.ok(
  forgeRegistry.forges.every(
    (forge: { generated_scripts?: string[] }) => (forge.generated_scripts ?? []).length > 0,
  ),
);

function validate(schemaFile: string, payload: unknown): void {
  const schema = readJson(path.join("schemas", schemaFile));
  const validator = ajv.compile(schema);
  const valid = validator(payload);
  assert.equal(
    valid,
    true,
    `${schemaFile} validation failed: ${JSON.stringify(validator.errors)}`,
  );
}

function readJson(relativePath: string): any {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8"));
}
