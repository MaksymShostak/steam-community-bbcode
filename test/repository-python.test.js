// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runRepositoryPython } from "../scripts/runRepositoryPython.js";

/** @param {import('node:test').TestContext} t */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "bbcode Python root with spaces "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test("Python launcher explains the missing local environment", (t) => {
  assert.throws(
    () => runRepositoryPython(["-m", "unittest"], { root: fixture(t) }),
    /npm run setup:development/,
  );
});

test("Python launcher preserves Windows and Unix executable selection, arguments, cwd and exit status", (t) => {
  /** @type {NodeJS.Platform[]} */
  const platforms = ["win32", "linux"];
  for (const platform of platforms) {
    const root = fixture(t);
    const executable = join(
      root,
      ".venv",
      platform === "win32" ? "Scripts/python.exe" : "bin/python",
    );
    mkdirSync(dirname(executable), { recursive: true });
    writeFileSync(executable, "process boundary fixture; never executed");
    /** @type {import('../scripts/runRepositoryPython.js').PythonProcess} */
    const spawn = (command, args, options) => {
      assert.equal(command, executable);
      assert.deepEqual(args, [
        "-B",
        "a file with spaces.py",
        "literal argument",
      ]);
      assert.equal(options.cwd, root);
      assert.equal(options.stdio, "inherit");
      assert.equal(options.windowsHide, true);
      return { status: 7, signal: null };
    };
    assert.equal(
      runRepositoryPython(["a file with spaces.py", "literal argument"], {
        root,
        platform,
        spawn,
      }),
      7,
    );
  }
});

test("Python launcher rejects empty arguments and preserves process failures and termination", (t) => {
  const root = fixture(t);
  const executable = join(root, ".venv", "Scripts/python.exe");
  mkdirSync(dirname(executable), { recursive: true });
  writeFileSync(executable, "process boundary fixture; never executed");
  assert.throws(
    () => runRepositoryPython([], { root, platform: "win32" }),
    /Provide a repository Python/,
  );
  const failure = new Error("native launch failed");
  assert.throws(
    () =>
      runRepositoryPython(["-m", "unittest"], {
        root,
        platform: "win32",
        spawn: () => ({ status: null, signal: null, error: failure }),
      }),
    (error) => error === failure,
  );
  assert.throws(
    () =>
      runRepositoryPython(["-m", "unittest"], {
        root,
        platform: "win32",
        spawn: () => ({ status: null, signal: "SIGTERM" }),
      }),
    /SIGTERM/,
  );
  assert.equal(
    runRepositoryPython(["-m", "unittest"], {
      root,
      platform: "win32",
      spawn: () => ({ status: null, signal: null }),
    }),
    1,
  );
});
