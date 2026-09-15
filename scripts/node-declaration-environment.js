// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/** @param {string} major */
export function nodeDeclarationEnvironment(major) {
  assert.ok(
    ["22", "24", "26"].includes(major),
    "Select Node declarations 22, 24 or 26.",
  );
  const root = fileURLToPath(
    new URL(`../tooling/node-types/${major}/`, import.meta.url),
  );
  const typeRoots = [join(root, "node_modules", "@types")];
  const nodeRoot = realpathSync(join(root, "node_modules", "@types", "node"));
  /** @type {{version: string}} */
  const manifest = JSON.parse(
    readFileSync(join(nodeRoot, "package.json"), "utf8"),
  );
  assert.equal(manifest.version.split(".")[0], major);
  return { root, typeRoots, nodeRoot, version: manifest.version };
}

/** Check the files actually selected by a native compiler/program.
 * @param {string[]} files
 * @param {string} nodeRoot
 */
export function verifyNodeDeclarationResolution(files, nodeRoot) {
  const normalize = (/** @type {string} */ path) =>
    path.replaceAll("\\", "/").toLowerCase();
  const expected = normalize(nodeRoot) + "/";
  const selected = files.filter((file) =>
    normalize(file).includes("/node_modules/@types/node/"),
  );
  assert.ok(selected.length > 0, "No Node declarations were resolved.");
  for (const file of selected) {
    assert.ok(
      normalize(realpathSync(file)).startsWith(expected),
      `Unexpected Node declaration: ${file}`,
    );
  }
  return selected.length;
}
