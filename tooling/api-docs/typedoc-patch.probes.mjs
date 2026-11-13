// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Application, TSConfigReader } from "typedoc";

// The patch is version-bound to this compiled module. Test its actual negated
// traversal, which Application's later exclusion filter cannot exercise.
const { glob } = await import(
  new URL("dist/node-utils.js", import.meta.resolve("typedoc/package.json"))
    .href
);

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "typedoc patch with spaces "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "src/nested"), { recursive: true });
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  writeFileSync(
    join(root, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        allowJs: true,
        checkJs: true,
        noEmit: true,
        types: [],
        module: "NodeNext",
      },
      include: ["src/**/*.js"],
    }),
  );
  for (const file of ["main.js", "nested/deep.js", "nested/skip.js"])
    writeFileSync(join(root, "src", file), "export const value = 1;\n");
  return root;
}

test("native TypeDoc traverses nested paths and preserves exclusion and negation", async (t) => {
  const root = fixture(t);
  const path = root.replaceAll("\\", "/");
  for (const [exclude, expected] of [
    [[`${path}/src/**/skip.js`], ["main.js", "nested/deep.js"]],
    [[`!${path}/src/nested/**`, `${path}/src/**/skip.js`], ["nested/deep.js"]],
  ]) {
    // Read only this fixture's native compiler configuration; the repository's
    // plugin-specific TypeDoc options belong to the production generator.
    const app = await Application.bootstrap(
      {
        tsconfig: join(root, "tsconfig.json"),
        entryPoints: [`${path}/src/**/*.js`],
        exclude,
      },
      [new TSConfigReader()],
    );
    const entries = app.getEntryPoints();
    assert.ok(entries);
    assert.deepEqual(
      entries
        .map((entry) => entry.sourceFile.fileName.replaceAll("\\", "/"))
        .sort(),
      expected.map((file) => `${path}/src/${file}`).sort(),
    );
    assert.equal(app.logger.hasErrors(), false);
    assert.equal(app.logger.hasWarnings(), false);
  }
});

test("pinned TypeDoc traversal retains nested matches for a negated entry point", (t) => {
  const root = fixture(t).replaceAll("\\", "/");
  assert.deepEqual(
    glob(`!${root}/src/**/skip.js`, `${root}/src`).sort(),
    [`${root}/src/main.js`, `${root}/src/nested/deep.js`].sort(),
  );
});

test("native patch application refuses changed upstream context without changing it", (t) => {
  const root = fixture(t);
  const packageRoot = join(root, "node_modules/typedoc");
  mkdirSync(join(packageRoot, "dist"), { recursive: true });
  mkdirSync(join(root, "patches"));
  writeFileSync(
    join(packageRoot, "package.json"),
    JSON.stringify({ name: "typedoc", version: "0.28.20" }),
  );
  const target = join(packageRoot, "dist/node-utils.js");
  const changed =
    "// Incompatible upstream context; do not replace this content.\n";
  writeFileSync(target, changed);
  copyFileSync(
    new URL("patches/typedoc+0.28.20.patch", import.meta.url),
    join(root, "patches/typedoc+0.28.20.patch"),
  );
  const child = spawnSync(
    process.execPath,
    [
      fileURLToPath(
        new URL("node_modules/patch-package/index.js", import.meta.url),
      ),
      "--error-on-fail",
    ],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      timeout: 30000,
    },
  );
  assert.ifError(child.error);
  assert.equal(child.status, 1, child.stdout + child.stderr);
  assert.match(child.stdout + child.stderr, /Failed to apply patch/u);
  assert.equal(readFileSync(target, "utf8"), changed);
});
