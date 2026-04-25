import { AdapterContract } from "./adapterContract";

export const reactAdapter: AdapterContract = {
  adapter_id: "react",
  framework: "React",
  runtime: "browser",
  package_managers: ["npm", "pnpm", "yarn", "bun"],
  anchor_map: {
    app: "src/App.tsx",
    pages: "src/pages",
    styles: "src/styles.css",
  },
  target_path_rules: ["Keep route/page code separate from platform adapters."],
  input_contracts: ["send_contract", "workspace_context", "target_manifest"],
  output_packets: ["script_packet", "artifact_manifest", "verification_result"],
  transform_contract: {
    portable_format: "json",
    consumes: ["intent_json", "adapter_contract", "local_anchors"],
    emits: ["component_operations_json", "route_operations_json", "style_operations_json"],
  },
  placement_hooks: ["page registration", "component export", "platform service"],
  style_hooks: ["src/styles.css", "component css modules if present"],
  verification_commands: ["npm run build", "npm run test"],
  repair_artifact_outputs: ["reports/refer-factory/react-repair.json"],
};
