import { AdapterContract } from "./adapterContract";

export const nodeAdapter: AdapterContract = {
  adapter_id: "node",
  framework: "Node",
  runtime: "server",
  package_managers: ["npm", "pnpm", "yarn", "bun"],
  anchor_map: {
    entry: "src/index.ts",
    routes: "src/routes",
    services: "src/services",
    scripts: "scripts",
  },
  target_path_rules: [
    "Keep HTTP/API entrypoints separate from domain services when both exist.",
    "Prefer existing package scripts before adding new runner commands.",
  ],
  input_contracts: ["send_contract", "workspace_context", "target_manifest"],
  output_packets: ["script_packet", "artifact_manifest", "verification_result"],
  transform_contract: {
    portable_format: "json",
    consumes: ["intent_json", "adapter_contract", "local_anchors"],
    emits: ["module_operations_json", "route_operations_json", "script_operations_json"],
  },
  placement_hooks: ["route registration", "service export", "package script"],
  style_hooks: [],
  verification_commands: ["npm run build", "npm test"],
  repair_artifact_outputs: ["reports/refer-factory/node-repair.json"],
};
