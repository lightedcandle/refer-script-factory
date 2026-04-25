import * as fs from "node:fs";
import * as path from "node:path";
import { angularAdapter } from "../adapters/angularAdapter";
import { AdapterContract } from "../adapters/adapterContract";
import { genericAdapter } from "../adapters/genericAdapter";
import { nodeAdapter } from "../adapters/nodeAdapter";
import { reactAdapter } from "../adapters/reactAdapter";
import { calculateMetrics } from "../telemetry/metrics";
import { createCodebaseRegistry } from "./codebases";
import { fullUniversalLawFiles } from "./lawManifest";
import {
  BootstrapDryRunInput,
  BootstrapDryRunReport,
  bootstrapTargets,
  createBootstrapDryRun,
} from "./dryRun";
import { createWorkspacePlan } from "./workspacePlan";

const REFER_AGENT_BLOCK_START = "<!-- REFER GOVERNANCE START -->";
const REFER_AGENT_BLOCK_END = "<!-- REFER GOVERNANCE END -->";

export interface BootstrapApplyOptions {
  update_existing: boolean;
}

export interface BootstrapApplyReport {
  dry_run: BootstrapDryRunReport;
  created: string[];
  updated: string[];
  skipped: string[];
  unsafe_overwrites: string[];
}

export function applyBootstrap(
  input: BootstrapDryRunInput,
  options: BootstrapApplyOptions,
): BootstrapApplyReport {
  const dryRun = createBootstrapDryRun(input);
  const report: BootstrapApplyReport = {
    dry_run: dryRun,
    created: [],
    updated: [],
    skipped: [],
    unsafe_overwrites: [...dryRun.unsafe_overwrites],
  };

  if (report.unsafe_overwrites.length > 0) {
    return report;
  }

  const root = dryRun.workspace_root;
  for (const target of bootstrapTargets) {
    const targetPath = path.resolve(root, target.path);
    if (!isWithin(root, targetPath)) {
      report.unsafe_overwrites.push(target.path);
      continue;
    }

    const exists = fs.existsSync(targetPath);
    if (exists && !target.update_existing) {
      report.skipped.push(target.path);
      continue;
    }

    if (exists && target.update_existing && !options.update_existing) {
      report.skipped.push(target.path);
      continue;
    }

    if (target.kind === "directory") {
      fs.mkdirSync(targetPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      const existingContent = exists
        ? fs.readFileSync(targetPath, "utf8")
        : undefined;
      const nextContent = fileContentFor(target.path, dryRun, existingContent);
      if (exists && nextContent === existingContent) {
        report.skipped.push(target.path);
        continue;
      }
      fs.writeFileSync(targetPath, nextContent, "utf8");
    }

    if (exists) {
      report.updated.push(target.path);
    } else {
      report.created.push(target.path);
    }
  }

  return report;
}

function fileContentFor(
  targetPath: string,
  input: BootstrapDryRunReport,
  existingContent?: string,
): string {
  if (targetPath === ".refer-factory/adapter.json") {
    return `${JSON.stringify(adapterFor(input.framework), null, 2)}\n`;
  }

  if (targetPath === ".refer-factory/agent-profile.json") {
    return `${JSON.stringify(createAgentProfile(input), null, 2)}\n`;
  }

  if (targetPath === "AGENTS.md") {
    return mergeAgentInstructions(existingContent, referAgentBlock(input));
  }

  if (targetPath === ".refer-factory/metrics.json") {
    return `${JSON.stringify(
      calculateMetrics({
        input_tokens: 0,
        output_tokens: 0,
        token_groups: 1,
        mutations_count: 0,
        verified_file_changes: 0,
        verified_lines_written: 0,
        codebase_lines: 0,
        repo_file_count: 0,
        dirty_files: 0,
        failing_checks: 0,
        missing_anchors: 0,
        gear_weights: { bootstrap: 1 },
      }),
      null,
      2,
    )}\n`;
  }

  if (targetPath === ".refer-factory/codebases.json") {
    return `${JSON.stringify(
      createCodebaseRegistry(input.workspace_root, input.framework),
      null,
      2,
    )}\n`;
  }

  if (targetPath === ".refer-factory/plan/refer.plan.json") {
    return `${JSON.stringify(
      createWorkspacePlan(
        input.workspace_root,
        input.repo_purpose,
        input.framework,
      ),
      null,
      2,
    )}\n`;
  }

  if (targetPath.startsWith("REFER.OS/")) {
    return readReferLaw(targetPath.replace("REFER.OS/", ""));
  }

  throw new Error(`No bootstrap content generator for ${targetPath}`);
}

function readReferLaw(fileName: string): string {
  if (!fullUniversalLawFiles.includes(fileName as (typeof fullUniversalLawFiles)[number])) {
    throw new Error(`Law file is not part of the bootstrap pack: ${fileName}`);
  }
  const source = path.resolve(__dirname, "../../../law/REFER.OS", fileName);
  return ensureTrailingNewline(fs.readFileSync(source, "utf8"));
}

function createAgentProfile(input: BootstrapDryRunReport) {
  return {
    profile_id: "refer-governed-agent",
    repo_purpose: input.repo_purpose,
    framework: input.framework,
    discovery: {
      primary_agent_instructions: "AGENTS.md",
      refer_block_start: REFER_AGENT_BLOCK_START,
      refer_block_end: REFER_AGENT_BLOCK_END,
      machine_profile: ".refer-factory/agent-profile.json",
    },
    prompt_handling: {
      default_route: "refer.intake",
      contract_first: true,
      print_contract_summary: true,
      execute_scripts_automatically: false,
    },
    script_policy: {
      scripts_return_packets: true,
      scripts_may_detect_sensitive_files: true,
      scripts_must_not_read: [".env*", "*.pem", "*.key", "*.p12"],
    },
    tracking: {
      metrics: ".refer-factory/metrics.json",
      process_state: ".refer-factory/process-state.json",
      codebases: ".refer-factory/codebases.json",
      workspace_plan: ".refer-factory/plan/refer.plan.json",
    },
    verification: ["npm run verify"],
  };
}

function mergeAgentInstructions(
  existingContent: string | undefined,
  referBlock: string,
): string {
  if (!existingContent || existingContent.trim().length === 0) {
    return referBlock;
  }

  const blockPattern = new RegExp(
    `${escapeRegExp(REFER_AGENT_BLOCK_START)}[\\s\\S]*?${escapeRegExp(REFER_AGENT_BLOCK_END)}`,
  );
  const normalizedExisting = ensureTrailingNewline(existingContent);
  if (blockPattern.test(normalizedExisting)) {
    return normalizedExisting.replace(blockPattern, referBlock.trimEnd());
  }

  return `${normalizedExisting}\n${referBlock}`;
}

function referAgentBlock(input: BootstrapDryRunReport): string {
  return `${REFER_AGENT_BLOCK_START}
# REFER Agent Governance

This repo is governed by REFER.

## Repo Purpose

${input.repo_purpose}

## Default Prompt Flow

Treat user prompts as intake for a contract-first workflow:

1. Decode the prompt into a compact \`refer.intake\` contract.
2. If enough information exists, answer plainly and briefly.
3. If repo facts are needed, propose a bounded script request instead of guessing.
4. Do not execute scripts automatically unless the user or governed runner explicitly allows it.

## Script Rules

- Scripts return structured packets to REFER.
- Scripts may detect sensitive file names.
- Scripts must not read or send contents of \`.env*\`, keys, certificates, or private credentials.
- Repo facts should come from bounded scripts, not guessing.

## Tracking

- Process state: \`.refer-factory/process-state.json\`
- Metrics snapshot: \`.refer-factory/metrics.json\`
- Codebase/subspace registry: \`.refer-factory/codebases.json\`

## Verification

Use:

\`\`\`powershell
npm run verify
\`\`\`
${REFER_AGENT_BLOCK_END}
`;
}

function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function adapterFor(framework: string): AdapterContract {
  const normalized = framework.toLowerCase();
  if (normalized.includes("angular")) {
    return angularAdapter;
  }

  if (normalized.includes("react")) {
    return reactAdapter;
  }

  if (normalized.includes("node")) {
    return nodeAdapter;
  }

  return genericAdapter;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}
