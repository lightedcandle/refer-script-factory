export interface ReferCancellationToken {
  readonly isCancellationRequested: boolean;
  onCancellationRequested(
    listener: (event: unknown) => unknown,
    thisArgs?: unknown,
    disposables?: { dispose(): unknown }[],
  ): { dispose(): unknown };
}

export interface ReferPromptModel {
  label: string;
  sendPrompt(prompt: string, token: ReferCancellationToken): Promise<string>;
}
