export type ScriptDnaValueType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "path"
  | "glob"
  | "contract"
  | "packet";

export type ScriptDnaOpcode =
  | "READ_CONTRACT"
  | "RESOLVE_TARGET"
  | "CHECK_GUARD"
  | "READ_FILE"
  | "WRITE_FILE"
  | "PATCH_FILE"
  | "EMIT_PACKET"
  | "RUN_CHECK"
  | "REGISTER_ROUTE";

export interface ScriptDnaPort {
  id: string;
  type: ScriptDnaValueType;
  required: boolean;
  description: string;
}

export interface ScriptDnaInstruction {
  opcode: ScriptDnaOpcode;
  reads: string[];
  writes: string[];
  args: Record<string, unknown>;
}

export interface ScriptDnaStation {
  id: string;
  title: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  instructions: ScriptDnaInstruction[];
}

export interface ScriptDnaGuard {
  id: string;
  rule: string;
  failure_packet: string;
}

export interface ScriptDnaSpec {
  script_id: string;
  title: string;
  version: string;
  status: "seed" | "active" | "deprecated";
  governing_refs: string[];
  trigger_intents: string[];
  adapters: string[];
  inputs: ScriptDnaPort[];
  outputs: ScriptDnaPort[];
  guards: ScriptDnaGuard[];
  stations: ScriptDnaStation[];
  verification: string[];
  registry: {
    route_id: string;
    reusable: boolean;
    promoted_from_seed: boolean;
  };
}

export function createScriptDnaSeed(
  title = "Custom Artifact Script",
): ScriptDnaSpec {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "custom-artifact-script";

  return {
    script_id: `script.${slug}`,
    title,
    version: "0.1.0",
    status: "seed",
    governing_refs: [
      "REFER.OS/refer.factory.md",
      "REFER.OS/refer.engine.md",
      "REFER.OS/refer.tooling.md",
      "REFER.OS/refer.qc.md",
    ],
    trigger_intents: [
      "Describe the repeated artifact this script should produce.",
      "Name the target files, anchors, and acceptance checks.",
    ],
    adapters: ["generic", "react", "angular", "node"],
    inputs: [
      {
        id: "send_contract",
        type: "contract",
        required: true,
        description: "Bounded machine-oriented truth derived from Plan.",
      },
      {
        id: "target_paths",
        type: "glob",
        required: true,
        description: "Authorized paths the script may inspect or mutate.",
      },
      {
        id: "workspace_context",
        type: "json",
        required: true,
        description:
          "Framework, language, package manager, entrypoint, and anchor metadata.",
      },
      {
        id: "artifact_name",
        type: "string",
        required: true,
        description: "Stable name for the artifact being produced.",
      },
    ],
    outputs: [
      {
        id: "script_packet",
        type: "packet",
        required: true,
        description: "Structured result consumed by later stations.",
      },
      {
        id: "artifact_manifest",
        type: "json",
        required: true,
        description: "Files, anchors, and generated artifacts emitted by the script.",
      },
      {
        id: "framework_operations",
        type: "json",
        required: true,
        description:
          "Portable JSON operations translated by the selected adapter.",
      },
    ],
    guards: [
      {
        id: "scope_guard",
        rule: "All writes must remain inside target_paths from the Send Contract.",
        failure_packet: "blocked_scope_violation",
      },
      {
        id: "input_guard",
        rule: "Required inputs must be present before any file operation.",
        failure_packet: "missing_required_input",
      },
    ],
    stations: [
      {
        id: "read_contract",
        title: "Read Contract",
        purpose: "Load the Send Contract and extract script inputs.",
        inputs: ["send_contract"],
        outputs: ["resolved_inputs"],
        instructions: [
          {
            opcode: "READ_CONTRACT",
            reads: ["send_contract"],
            writes: ["resolved_inputs"],
            args: {},
          },
        ],
      },
      {
        id: "resolve_target",
        title: "Resolve Target",
        purpose: "Map artifact intent to local anchors and target paths.",
        inputs: ["resolved_inputs", "target_paths", "workspace_context"],
        outputs: ["target_manifest"],
        instructions: [
          {
            opcode: "RESOLVE_TARGET",
            reads: ["resolved_inputs", "target_paths", "workspace_context"],
            writes: ["target_manifest"],
            args: {
              adapter: "from_workspace_context",
              portable_format: "json",
            },
          },
          {
            opcode: "CHECK_GUARD",
            reads: ["target_manifest"],
            writes: ["guard_result"],
            args: { guard: "scope_guard" },
          },
        ],
      },
      {
        id: "emit_artifact",
        title: "Emit Artifact",
        purpose:
          "Translate portable JSON operations into framework-specific writes or patches.",
        inputs: ["target_manifest"],
        outputs: ["framework_operations", "artifact_manifest"],
        instructions: [
          {
            opcode: "EMIT_PACKET",
            reads: ["target_manifest"],
            writes: ["framework_operations"],
            args: { packet: "portable_framework_operations" },
          },
          {
            opcode: "PATCH_FILE",
            reads: ["framework_operations"],
            writes: ["artifact_manifest"],
            args: { mode: "bounded" },
          },
        ],
      },
      {
        id: "verify_and_register",
        title: "Verify And Register",
        purpose: "Run checks and register repeatable success.",
        inputs: ["artifact_manifest"],
        outputs: ["script_packet"],
        instructions: [
          {
            opcode: "RUN_CHECK",
            reads: ["artifact_manifest"],
            writes: ["verification_result"],
            args: { command: "npm run verify" },
          },
          {
            opcode: "REGISTER_ROUTE",
            reads: ["verification_result", "artifact_manifest"],
            writes: ["script_packet"],
            args: { registry: "refer.app/tooling/refer.tooling.registry.json" },
          },
        ],
      },
    ],
    verification: ["schema validation", "scope guard", "configured repo checks"],
    registry: {
      route_id: `route.${slug}`,
      reusable: true,
      promoted_from_seed: false,
    },
  };
}
