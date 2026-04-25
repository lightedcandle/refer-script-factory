import { AdapterContract } from "./adapterContract";

export const genericAdapter: AdapterContract = {
  adapter_id: "generic",
  framework: "Generic",
  runtime: "unknown",
  package_managers: ["npm", "pnpm", "yarn", "bun", "unknown"],
  anchor_map: {
    docs: "docs",
    source: "src",
    scripts: "scripts",
  },
  target_path_rules: ["Prefer explicit anchors before creating new structure."],
  input_contracts: ["send_contract", "workspace_context", "target_manifest"],
  output_packets: ["script_packet", "artifact_manifest", "verification_result"],
  transform_contract: {
    portable_format: "json",
    consumes: ["intent_json", "adapter_contract", "local_anchors"],
    emits: ["file_operations_json", "dependency_changes_json"],
  },
  placement_hooks: ["source root", "script root", "docs root"],
  style_hooks: [],
  verification_commands: ["npm test"],
  repair_artifact_outputs: ["reports/refer-factory/generic-repair.json"],
};
