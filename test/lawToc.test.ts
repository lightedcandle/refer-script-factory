import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fullUniversalLawFiles } from "../src/bootstrap/lawManifest";
import { referLawToc } from "../src/bootstrap/lawToc";

const lawRoot = path.join(process.cwd(), "law", "REFER.OS");
const lawFiles = fs
  .readdirSync(lawRoot)
  .filter((fileName) => fileName.endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));
const manifestFiles = [...fullUniversalLawFiles].sort((a, b) =>
  a.localeCompare(b),
);
const tocFiles = referLawToc.map((entry) => entry.file);
const tocSet = new Set(tocFiles);
const duplicateTocFiles = tocFiles.filter(
  (fileName, index) => tocFiles.indexOf(fileName) !== index,
);
const duplicateSequences = referLawToc
  .map((entry) => entry.sequence)
  .filter(
    (sequence, index, sequences) => sequences.indexOf(sequence) !== index,
  );

assert.deepEqual(manifestFiles, lawFiles);
assert.deepEqual(duplicateTocFiles, []);
assert.deepEqual(duplicateSequences, []);
assert.deepEqual(
  lawFiles.filter((fileName) => !tocSet.has(fileName)),
  [],
);
assert.ok(referLawToc[0].sequence < referLawToc[referLawToc.length - 1].sequence);
