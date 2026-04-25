import assert from "node:assert/strict";
import { calculateMetrics, sampleMetricInput } from "../src/telemetry/metrics";

const metrics = calculateMetrics(sampleMetricInput);

assert.equal(metrics.response_mpg, 0.5);
assert.equal(metrics.codebase_mpg, 10.5);
assert.equal(metrics.input_tokens, 1800);
assert.equal(metrics.output_tokens, 900);
assert.equal(metrics.verified_lines_written, 42);
assert.equal(metrics.verified_file_changes, 8);
assert.equal(metrics.codebase_lines, 0);
assert.equal(metrics.dominant_gear, "factory");
assert.ok(metrics.secondary_gears.includes("repo"));
assert.ok(metrics.repo_health_score <= 100);
assert.ok(metrics.repo_health_score >= 0);
