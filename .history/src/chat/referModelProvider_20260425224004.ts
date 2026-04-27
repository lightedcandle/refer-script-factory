import * as vscode from "vscode";
import { createOllamaReferPromptModel } from "./referOllamaPromptModel";
import type { ReferPromptModel } from "./referPromptModel";

export function createVsCodeReferPromptModel(
  model: vscode.LanguageModelChat,
): ReferPromptModel {
  return {
    label: "VS Code selected model",
    async sendPrompt(prompt, token) {
      const modelResponse = await model.sendRequest(
        [vscode.LanguageModelChatMessage.User(prompt)],
        {},
        token,
      );

      let text = "";
      for await (const fragment of modelResponse.text) {
        text += fragment;
      }
      return text;
    },
  };
}

export function createConfiguredReferPromptModel(
  fallbackModel: vscode.LanguageModelChat,
): ReferPromptModel {
  const config = vscode.workspace.getConfiguration("refer");
  const provider = config.get<string>("modelProvider", "vscode");
  if (provider !== "ollama") {
    return createVsCodeReferPromptModel(fallbackModel);
  }

  const baseUrl = config.get<string>("ollamaUrl", "http://127.0.0.1:11434");
  const model = config.get<string>("ollamaModel", "qwen3:0.6b");
  const timeoutMs = config.get<number>("ollamaTimeoutMs", 120_000);
  return createOllamaReferPromptModel({ baseUrl, model, timeoutMs });
}

export { createOllamaReferPromptModel };
