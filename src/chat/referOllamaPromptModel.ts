import type { ReferPromptModel } from "./referPromptModel";

export function createOllamaReferPromptModel(input: {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
}): ReferPromptModel {
  const baseUrl = input.baseUrl.replace(/\/+$/, "");
  return {
    label: `Ollama ${input.model}`,
    async sendPrompt(prompt, token) {
      const controller = new AbortController();
      const cancellation = token.onCancellationRequested(() => controller.abort());
      const timeout = setTimeout(
        () => controller.abort(),
        Math.max(input.timeoutMs ?? 120_000, 1_000),
      );
      try {
        const response = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: input.model,
            stream: false,
            format: "json",
            messages: [
              {
                role: "system",
                content:
                  "You are the REFER bounded orchestrator. Return only the requested JSON object. Do not include analysis, markdown, or extra text.",
              },
              { role: "user", content: prompt },
            ],
          }),
          signal: controller.signal,
        });

        const bodyText = await response.text();
        if (!response.ok) {
          throw new Error(`Ollama returned HTTP ${response.status}: ${bodyText}`);
        }
        if (bodyText.trim().length === 0) {
          throw new Error("Ollama returned an empty response body.");
        }

        let payload: {
          message?: { content?: unknown };
          response?: unknown;
          error?: unknown;
        };
        try {
          payload = JSON.parse(bodyText) as typeof payload;
        } catch (error) {
          throw new Error(
            `Ollama returned invalid provider JSON: ${error instanceof Error ? error.message : String(error)}. Body: ${bodyText.slice(0, 240)}`,
          );
        }
        if (payload.error) {
          throw new Error(`Ollama error: ${String(payload.error)}`);
        }

        const content = payload.message?.content ?? payload.response;
        if (typeof content !== "string") {
          throw new Error("Ollama response did not include text content.");
        }
        if (content.trim().length === 0) {
          throw new Error("Ollama returned empty model text.");
        }

        return content;
      } finally {
        clearTimeout(timeout);
        cancellation.dispose();
      }
    },
  };
}
