import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export function withIsolatedScriptWorkspace<T>(
  fixturePaths: readonly string[],
  run: (workspaceRoot: string) => T,
): T {
  const sourceRoot = process.cwd();
  const workspaceRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "refer-script-factory-test-"),
  );

  try {
    for (const fixturePath of fixturePaths) {
      copyFixture(sourceRoot, workspaceRoot, fixturePath);
    }
    return run(workspaceRoot);
  } finally {
    fs.rmSync(workspaceRoot, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 10,
    });
  }
}

function copyFixture(
  sourceRoot: string,
  workspaceRoot: string,
  fixturePath: string,
): void {
  const sourcePath = path.resolve(sourceRoot, fixturePath);
  const relativePath = path.relative(sourceRoot, sourcePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Fixture escapes source root: ${fixturePath}`);
  }

  const targetPath = path.join(workspaceRoot, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}
