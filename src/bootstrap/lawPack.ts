export interface LawPackReference {
  source: string;
  required: boolean;
}

export const bootstrapLawReferences: LawPackReference[] = [
  { source: "E:/refer.os/REFER.OS/refer.plan.md", required: true },
  { source: "E:/refer.os/REFER.OS/refer.factory.md", required: true },
  { source: "E:/refer.os/REFER.OS/refer.engine.md", required: true },
  { source: "E:/refer.os/REFER.OS/refer.efficiency.md", required: true },
  { source: "E:/refer.os/REFER.OS/refer.odometer.md", required: false },
  { source: "E:/refer.os/REFER.OS/refer.gears.md", required: false },
];
