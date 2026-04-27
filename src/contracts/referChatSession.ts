import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ReferIntakeContract } from "./referIntake";
import type { ReferResolutionEnvelope } from "./referOrchestrator";

export interface ReferChatTurn {
  turn_id: string;
  created_at: string;
  role: "contract";
  raw_input_ref: string;
  contract_id: string;
  contract: ReferIntakeContract;
  resolution?: ReferResolutionEnvelope;
  assistant_output: string;
  progress: string[];
}

export interface ReferChatSession {
  schema_version: 1;
  session_id: string;
  mode: "contract";
  created_at: string;
  updated_at: string;
  turns: ReferChatTurn[];
}

export function createReferChatSession(now = new Date()): ReferChatSession {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return {
    schema_version: 1,
    session_id: `refer.chat.${stamp}.${crypto.randomUUID().slice(0, 8)}`,
    mode: "contract",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    turns: [],
  };
}

export function appendReferChatTurn(
  session: ReferChatSession,
  turn: Omit<ReferChatTurn, "turn_id" | "created_at" | "role">,
  now = new Date(),
): ReferChatSession {
  return {
    ...session,
    updated_at: now.toISOString(),
    turns: [
      ...session.turns,
      {
        turn_id: `turn.${session.turns.length + 1}`,
        created_at: now.toISOString(),
        role: "contract",
        ...turn,
      },
    ],
  };
}

export function referChatSessionsDir(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "chat", "sessions");
}

export function referChatSessionPath(
  workspaceRoot: string,
  sessionId: string,
): string {
  return path.join(referChatSessionsDir(workspaceRoot), `${sessionId}.json`);
}

export function writeReferChatSession(
  workspaceRoot: string,
  session: ReferChatSession,
): string {
  const target = referChatSessionPath(workspaceRoot, session.session_id);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(session, null, 2)}\n`, "utf8");
  return target;
}

export function readLatestReferChatSession(
  workspaceRoot: string,
): ReferChatSession | null {
  const dir = referChatSessionsDir(workspaceRoot);
  if (!fs.existsSync(dir)) {
    return null;
  }

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dir, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  for (const file of files) {
    if (fs.statSync(file).size === 0) {
      continue;
    }
    try {
      return JSON.parse(fs.readFileSync(file, "utf8")) as ReferChatSession;
    } catch {
      continue;
    }
  }

  return null;
}
