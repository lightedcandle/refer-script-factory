import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";

const repoRoot = process.cwd();
const coreRoot = path.resolve(repoRoot, "src", "core");
const files = collectTypeScriptFiles(coreRoot);
const failures = [];
let importCount = 0;

for (const file of files) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );

  visit(source, (specifier, node) => {
    importCount += 1;
    checkSpecifier(file, specifier, node);
  });
}

if (failures.length > 0) {
  process.stderr.write(`Core boundary failed with ${failures.length} violation(s):\n`);
  for (const failure of failures.sort()) {
    process.stderr.write(`- ${failure}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Core boundary OK: ${files.length} files and ${importCount} imports stay provider-neutral inside src/core.\n`,
  );
}

function visit(source, onSpecifier) {
  const walk = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      onSpecifier(node.moduleSpecifier.text, node.moduleSpecifier);
    }

    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      onSpecifier(node.arguments[0].text, node.arguments[0]);
    }

    ts.forEachChild(node, walk);
  };
  walk(source);
}

function checkSpecifier(file, specifier, node) {
  const relativeFile = normalize(path.relative(repoRoot, file));
  const line = node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1;

  if (specifier === "vscode" || specifier.startsWith("vscode/")) {
    failures.push(`${relativeFile}:${line} imports forbidden VS Code module ${specifier}`);
    return;
  }

  if (!specifier.startsWith(".")) {
    return;
  }

  const resolved = path.resolve(path.dirname(file), specifier);
  const relativeToCore = path.relative(coreRoot, resolved);
  if (relativeToCore.startsWith("..") || path.isAbsolute(relativeToCore)) {
    failures.push(
      `${relativeFile}:${line} escapes src/core through ${specifier} (${normalize(path.relative(repoRoot, resolved))})`,
    );
  }
}

function collectTypeScriptFiles(directory) {
  const collected = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collected.push(...collectTypeScriptFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      collected.push(absolute);
    }
  }
  return collected.sort((a, b) => a.localeCompare(b));
}

function normalize(value) {
  return value.split(path.sep).join("/");
}
