import type { ReferCancellationToken } from "../../core";

export class CliCancellationToken implements ReferCancellationToken {
  constructor(private readonly signal: AbortSignal) {}

  get isCancellationRequested(): boolean {
    return this.signal.aborted;
  }

  onCancellationRequested(
    listener: (event: unknown) => unknown,
    thisArgs?: unknown,
    disposables?: { dispose(): unknown }[],
  ): { dispose(): unknown } {
    let disposed = false;
    const invoke = () => {
      if (!disposed) {
        listener.call(thisArgs, undefined);
      }
    };
    const subscription = {
      dispose: () => {
        disposed = true;
        this.signal.removeEventListener("abort", invoke);
      },
    };

    if (this.signal.aborted) {
      queueMicrotask(invoke);
    } else {
      this.signal.addEventListener("abort", invoke, { once: true });
    }
    disposables?.push(subscription);
    return subscription;
  }
}

export class CliCancelledError extends Error {
  constructor(message = "The CLI run was interrupted.") {
    super(message);
    this.name = "CliCancelledError";
  }
}

export function readPromptFromStdin(
  stream: NodeJS.ReadableStream,
  signal: AbortSignal,
  maximumBytes = 1_048_576,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let value = "";
    let bytes = 0;

    const cleanup = () => {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      stream.removeListener("error", onError);
      signal.removeEventListener("abort", onAbort);
    };
    const onData = (chunk: unknown) => {
      const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
      bytes += Buffer.byteLength(text, "utf8");
      if (bytes > maximumBytes) {
        cleanup();
        stream.pause();
        reject(new Error(`stdin exceeds the ${maximumBytes}-byte limit.`));
        return;
      }
      value += text;
    };
    const onEnd = () => {
      cleanup();
      resolve(value);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onAbort = () => {
      cleanup();
      stream.pause();
      reject(new CliCancelledError());
    };

    if (signal.aborted) {
      onAbort();
      return;
    }
    stream.on("data", onData);
    stream.once("end", onEnd);
    stream.once("error", onError);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
