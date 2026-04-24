export interface AdapterContract {
  adapter_id: string;
  framework: string;
  anchor_map: Record<string, string>;
  target_path_rules: string[];
  placement_hooks: string[];
  style_hooks: string[];
  verification_commands: string[];
  repair_artifact_outputs: string[];
}
