import { AdapterContract } from "./adapterContract";

export const genericAdapter: AdapterContract = {
  adapter_id: "generic",
  framework: "Generic",
  anchor_map: {
    docs: "docs",
    source: "src",
    scripts: "scripts",
  },
  target_path_rules: ["Prefer explicit anchors before creating new structure."],
  placement_hooks: ["source root", "script root", "docs root"],
  style_hooks: [],
  verification_commands: ["npm test"],
  repair_artifact_outputs: ["reports/refer-factory/generic-repair.json"],
};
