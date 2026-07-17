import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { withIsolatedScriptWorkspace } from "./helpers/isolatedScriptWorkspace";

withIsolatedScriptWorkspace(
  [
    "scripts/reference/authority-resolver.mjs",
    "schemas/authority-reference.schema.json",
  ],
  (workspaceRoot) => {
    const ajv = new Ajv2020({ allErrors: true });

    resolve("Build Stripe checkout", "stripe");
    const stripePacket = readLatestPacket();
    validate(stripePacket);
    assert.equal(stripePacket.domain, "stripe");
    assert.equal(stripePacket.authority_state, "official");
    assert.ok(
      stripePacket.references.some((reference: { url?: string }) =>
        reference.url?.includes("docs.stripe.com"),
      ),
    );

    resolve("What is the standard branching workflow?");
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
        (reference: { id?: string }) =>
          reference.id === "refer.method.branch-assimilation",
      ),
    );
    assert.ok(
      branchingPacket.references.some(
        (reference: { id?: string }) =>
          reference.id === "refer.method.chat-branch-boundary",
      ),
    );

    resolve("Start a remote chat for the release follow-up.");
    const chatBranchPacket = readLatestPacket();
    validate(chatBranchPacket);
    assert.equal(chatBranchPacket.domain, "chat-branch");
    assert.ok(
      chatBranchPacket.references.some(
        (reference: { id?: string }) => reference.id === "refer.method.chat-branch",
      ),
    );

    resolve("Rename the branch label in the diagram.");
    const unrelatedBranchPacket = readLatestPacket();
    validate(unrelatedBranchPacket);
    assert.equal(unrelatedBranchPacket.authority_state, "created");

    resolve("Build a made up local ritual engine", "local-ritual-engine");
    const createdPacket = readLatestPacket();
    validate(createdPacket);
    assert.equal(createdPacket.authority_state, "created");
    assert.equal(createdPacket.created_authority.required, true);

    function resolve(intent: string, domain?: string): void {
      const args = [
        "scripts/reference/authority-resolver.mjs",
        "resolve",
        "--intent",
        intent,
      ];
      if (domain) args.push("--domain", domain);
      execFileSync("node", args, { cwd: workspaceRoot, stdio: "pipe" });
    }

    function validate(payload: unknown): void {
      const schema = JSON.parse(
        fs.readFileSync(
          path.join(workspaceRoot, "schemas", "authority-reference.schema.json"),
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
          path.join(workspaceRoot, ".refer-factory", "authority", "latest.json"),
          "utf8",
        ),
      );
    }
  },
);
