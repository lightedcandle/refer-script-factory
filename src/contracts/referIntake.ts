import * as fs from "node:fs";
import * as path from "node:path";
import type { ReferIntakeRecord } from "../core/contracts/referIntake";

export * from "../core/contracts/referIntake";

export function writeReferIntakeRecord(
  workspaceRoot: string,
  record: ReferIntakeRecord,
): string {
  const absolutePath = path.join(workspaceRoot, record.contract.raw_input_ref);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return absolutePath;
}
