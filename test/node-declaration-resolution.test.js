// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verifyNodeDeclarationResolution } from "../scripts/node-declaration-environment.js";

test("declaration evidence rejects missing and mixed Node declaration environments", (t) => {
  const root = mkdtempSync(join(tmpdir(), "node declaration evidence "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const expected = join(root, "selected", "node_modules", "@types", "node");
  const foreign = join(root, "foreign", "node_modules", "@types", "node");
  for (const directory of [expected, foreign]) {
    mkdirSync(directory, { recursive: true });
    writeFileSync(join(directory, "index.d.ts"), "export {};\n");
  }
  assert.equal(
    verifyNodeDeclarationResolution([join(expected, "index.d.ts")], expected),
    1,
  );
  assert.throws(
    () => verifyNodeDeclarationResolution([], expected),
    /No Node declarations/,
  );
  assert.throws(
    () =>
      verifyNodeDeclarationResolution(
        [join(expected, "index.d.ts"), join(foreign, "index.d.ts")],
        expected,
      ),
    /Unexpected Node declaration/,
  );
});
