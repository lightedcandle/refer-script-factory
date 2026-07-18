#!/usr/bin/env node

import { runCli } from "./execute";

export * from "./arguments";
export * from "./cancellation";
export * from "./execute";
export * from "./runtime";

if (require.main === module) {
  const controller = new AbortController();
  const interrupt = () => controller.abort();
  process.once("SIGINT", interrupt);

  void runCli(process.argv.slice(2), { signal: controller.signal })
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      process.stderr.write(
        `refer-script-factory: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    })
    .finally(() => {
      process.removeListener("SIGINT", interrupt);
    });
}
