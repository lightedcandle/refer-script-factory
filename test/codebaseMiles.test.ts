import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { countCodebaseMiles } from "../src/telemetry/codebaseMiles";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "refer-miles-"));
fs.mkdirSync(path.join(root, "src"));
fs.mkdirSync(path.join(root, "dist"));
fs.mkdirSync(path.join(root, "node_modules"));

fs.writeFileSync(path.join(root, "src", "index.ts"), "one\ntwo\nthree\n");
fs.writeFileSync(path.join(root, "README.md"), "one\ntwo");
fs.writeFileSync(path.join(root, "dist", "ignored.js"), "one\ntwo\nthree\n");
fs.writeFileSync(path.join(root, "node_modules", "ignored.ts"), "one\n");
fs.writeFileSync(path.join(root, "binary.bin"), "ignored\n");

const miles = countCodebaseMiles(root);

assert.equal(miles.codebase_lines, 5);
assert.equal(miles.counted_files, 2);
