import * as http from "node:http";
import { createOllamaReferPromptModel } from "../chat/referOllamaPromptModel";
import {
  createNeverCancelledToken,
  runReferOrchestratorPrompt,
} from "../chat/referOrchestratorRunner";
import {
  loadReferEndpointTargetRegistry,
  resolveReferEndpointTarget,
} from "./referTargetRegistry";

const port = Number(process.env.REFER_ORCHESTRATOR_PORT ?? "39741");
const workspaceRoot = process.env.REFER_WORKSPACE_ROOT ?? process.cwd();
const targetRegistry = loadReferEndpointTargetRegistry(workspaceRoot);
const model = createOllamaReferPromptModel({
  baseUrl: process.env.REFER_OLLAMA_URL ?? "http://127.0.0.1:11434",
  model: process.env.REFER_OLLAMA_MODEL ?? "qwen3:0.6b",
  timeoutMs: Number(process.env.REFER_OLLAMA_TIMEOUT_MS ?? "120000"),
});

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      workspaceRoot,
      provider: model.label,
      targetRegistry: targetRegistry.source,
      endpoints: ["/health", "/refer/targets", "/refer/chat"],
    });
    return;
  }

  if (request.method === "GET" && request.url === "/refer/targets") {
    sendJson(response, 200, {
      ok: true,
      source: targetRegistry.source,
      targets: targetRegistry.targets,
    });
    return;
  }

  if (request.method === "POST" && request.url === "/refer/chat") {
    try {
      const body = await readJsonBody(request);
      const prompt = typeof body.prompt === "string" ? body.prompt : "";
      if (prompt.trim().length === 0) {
        sendJson(response, 400, { ok: false, error: "Missing prompt." });
        return;
      }

      const target = resolveReferEndpointTarget({
        registry: targetRegistry,
        target: body.target,
        workspaceRoot: body.workspaceRoot,
        defaultWorkspaceRoot: workspaceRoot,
      });
      const result = await runReferOrchestratorPrompt({
        workspaceRoot: target.workspaceRoot,
        prompt,
        model,
        token: createNeverCancelledToken(),
      });
      sendJson(response, result.ok ? 200 : 500, { ...result, target });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found." });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `REFER orchestrator endpoint listening on http://127.0.0.1:${port} for ${workspaceRoot}\n`,
  );
});

function sendJson(
  response: http.ServerResponse,
  status: number,
  payload: unknown,
): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

function readJsonBody(request: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        request.destroy(new Error("Request body too large."));
      }
    });
    request.on("error", reject);
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}") as Record<string, unknown>);
      } catch (error) {
        reject(error);
      }
    });
  });
}
