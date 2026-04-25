export interface LawPackReference {
  source: string;
  title: string;
  required: boolean;
  description: string;
}

export { fullUniversalLawFiles } from "./lawManifest";

export const bootstrapLawReferences: LawPackReference[] = [
  {
    title: "Plan",
    source: "E:/refer.os/REFER.OS/refer.plan.md",
    required: true,
    description: "Planning contract and workspace intent rules.",
  },
  {
    title: "Factory",
    source: "E:/refer.os/REFER.OS/refer.factory.md",
    required: true,
    description: "Factory process, governed script, and output rules.",
  },
  {
    title: "Engine",
    source: "E:/refer.os/REFER.OS/refer.engine.md",
    required: true,
    description: "Execution loop and orchestration rules.",
  },
  {
    title: "Efficiency",
    source: "E:/refer.os/REFER.OS/refer.efficiency.md",
    required: true,
    description: "Token return, MPG, and consumption model.",
  },
  {
    title: "Odometer",
    source: "E:/refer.os/REFER.OS/refer.odometer.md",
    required: false,
    description: "Miles, line movement, and historical distance tracking.",
  },
  {
    title: "Gears",
    source: "E:/refer.os/REFER.OS/refer.gears.md",
    required: false,
    description: "Work mode signals and gear labels.",
  },
];

export const minimumBootstrapLawFiles = [
  "refer.md",
  "refer.os.md",
  "refer.plan.md",
  "refer.flow.md",
  "refer.governance.md",
  "refer.build.md",
  "refer.combing.md",
  "refer.expand.md",
  "refer.qc.md",
  "refer.commit.md",
  "refer.branch.md",
  "refer.github.md",
  "refer.factory.md",
  "refer.engine.md",
  "refer.efficiency.md",
  "refer.odometer.md",
  "refer.gears.md",
  "refer.tooling.md",
  "refer.subagents.md",
  "refer.skills.md",
  "refer.localrepo.md",
  "refer.init.md",
  "inference.md",
] as const;
