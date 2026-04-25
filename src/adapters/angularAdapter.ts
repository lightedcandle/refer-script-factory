import { AdapterContract } from "./adapterContract";

export const angularAdapter: AdapterContract = {
  adapter_id: "angular",
  framework: "Angular",
  runtime: "browser",
  package_managers: ["npm", "pnpm", "yarn"],
  anchor_map: {
    routes: "src/app/app.routes.ts",
    features: "src/app/features",
    plans: "src/app/plans",
    core: "src/app/core",
  },
  target_path_rules: ["Prefer src/app/plans for MVI state and intent slices."],
  input_contracts: ["send_contract", "workspace_context", "target_manifest"],
  output_packets: ["script_packet", "artifact_manifest", "verification_result"],
  transform_contract: {
    portable_format: "json",
    consumes: ["intent_json", "adapter_contract", "local_anchors"],
    emits: ["component_operations_json", "route_operations_json", "provider_operations_json"],
  },
  placement_hooks: ["route registration", "store facade", "component shell"],
  style_hooks: ["component scss", "global styles only when shared"],
  verification_commands: ["npm run typecheck", "npm run test"],
  repair_artifact_outputs: ["reports/refer-factory/angular-repair.json"],
};
