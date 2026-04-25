export interface AdapterContract {
  adapter_id: string;
  framework: string;
  runtime: "browser" | "server" | "fullstack" | "unknown";
  package_managers: string[];
  anchor_map: Record<string, string>;
  target_path_rules: string[];
  input_contracts: string[];
  output_packets: string[];
  transform_contract: {
    portable_format: "json";
    consumes: string[];
    emits: string[];
  };
  placement_hooks: string[];
  style_hooks: string[];
  verification_commands: string[];
  repair_artifact_outputs: string[];
}
