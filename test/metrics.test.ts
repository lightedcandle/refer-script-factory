import assert from "node:assert/strict";
import { calculateMetrics, sampleMetricInput } from "../src/telemetry/metrics";

const metrics = calculateMetrics(sampleMetricInput);

assert.equal(metrics.response_mpg, 2.75);
assert.equal(metrics.codebase_mpg, 2);
assert.equal(metrics.dominant_gear, "factory");
assert.ok(metrics.secondary_gears.includes("repo"));
assert.ok(metrics.repo_health_score <= 100);
assert.ok(metrics.repo_health_score >= 0);
