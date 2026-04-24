import { AdapterContract } from "./adapterContract";

export const angularAdapter: AdapterContract = {
  adapter_id: "angular",
  framework: "Angular",
  anchor_map: {
    routes: "src/app/app.routes.ts",
    features: "src/app/features",
    plans: "src/app/plans",
    core: "src/app/core",
  },
  target_path_rules: ["Prefer src/app/plans for MVI state and intent slices."],
  placement_hooks: ["route registration", "store facade", "component shell"],
  style_hooks: ["component scss", "global styles only when shared"],
  verification_commands: ["npm run typecheck", "npm run test"],
  repair_artifact_outputs: ["reports/refer-factory/angular-repair.json"],
};
