export interface MetricInput {
  input_tokens: number;
  output_tokens: number;
  token_groups: number;
  mutations_count: number;
  verified_file_changes: number;
  verified_lines_written: number;
  codebase_lines: number;
  repo_file_count: number;
  dirty_files: number;
  failing_checks: number;
  missing_anchors: number;
  gear_weights: Record<string, number>;
}

export interface FactoryMetrics {
  input_tokens: number;
  output_tokens: number;
  response_mpg: number;
  codebase_mpg: number;
  mutations_per_group: number;
  verified_lines_written: number;
  verified_file_changes: number;
  codebase_lines: number;
  dominant_gear: string;
  secondary_gears: string[];
  terrain_drag: number;
  repo_health_score: number;
  running_scripts: number;
  script_status: string;
  script_elapsed_ms: number;
}

export const sampleMetricInput: MetricInput = {
  input_tokens: 1800,
  output_tokens: 900,
  token_groups: 4,
  mutations_count: 11,
  verified_file_changes: 8,
  verified_lines_written: 42,
  codebase_lines: 0,
  repo_file_count: 240,
  dirty_files: 2,
  failing_checks: 0,
  missing_anchors: 1,
  gear_weights: {
    plan: 2,
    factory: 8,
    repo: 4,
  },
};

export function calculateMetrics(input: MetricInput): FactoryMetrics {
  const groups = Math.max(input.token_groups, 1);
  const terrain_drag = clamp(
    Math.round(
      input.repo_file_count / 100 +
        input.dirty_files * 4 +
        input.failing_checks * 12 +
        input.missing_anchors * 8,
    ),
    0,
    100,
  );
  const sortedGears = Object.entries(input.gear_weights)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]);
  const dominant_gear = sortedGears[0]?.[0] ?? "unknown";
  const response_mpg =
    input.input_tokens > 0 ? input.output_tokens / input.input_tokens : 0;

  return {
    input_tokens: input.input_tokens,
    output_tokens: input.output_tokens,
    response_mpg,
    codebase_mpg: input.verified_lines_written / groups,
    mutations_per_group: input.mutations_count / groups,
    verified_lines_written: input.verified_lines_written,
    verified_file_changes: input.verified_file_changes,
    codebase_lines: input.codebase_lines,
    dominant_gear,
    secondary_gears: sortedGears.slice(1).map(([gear]) => gear),
    terrain_drag,
    repo_health_score: clamp(100 - terrain_drag, 0, 100),
    running_scripts: 1,
    script_status: "running",
    script_elapsed_ms: 1200,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
