import { AdapterContract } from "./adapterContract";

export const reactAdapter: AdapterContract = {
  adapter_id: "react",
  framework: "React",
  anchor_map: {
    app: "src/App.tsx",
    pages: "src/pages",
    styles: "src/styles.css",
  },
  target_path_rules: ["Keep route/page code separate from platform adapters."],
  placement_hooks: ["page registration", "component export", "platform service"],
  style_hooks: ["src/styles.css", "component css modules if present"],
  verification_commands: ["npm run build", "npm run test"],
  repair_artifact_outputs: ["reports/refer-factory/react-repair.json"],
};
