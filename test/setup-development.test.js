// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setupDevelopment } from "../scripts/setup-development.js";

test("npm enforces the development range before running a fresh-clone script", (t) => {
  const f = fixture(t);
  const npmCli = process.env["npm_execpath"];
  assert.ok(npmCli, "Run this test through npm test.");
  /** @type {{devEngines: {runtime: {name: string, version: string, onFail: string}}}} */
  const { devEngines } = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.ok(devEngines?.runtime);
  /** @type {[typeof devEngines.runtime, number][]} */
  const cases = [
    [devEngines.runtime, 0],
    [{ ...devEngines.runtime, version: "99.0.0" }, 1],
  ];
  for (const [runtime, expectedStatus] of cases) {
    writeFileSync(
      join(f.root, "package.json"),
      JSON.stringify({
        devEngines: { runtime },
        scripts: { probe: 'node -e "console.log(123456789)"' },
      }),
    );
    /** @type {import('node:child_process').SpawnSyncReturns<string>} */
    const result = spawnSync(process.execPath, [npmCli, "run", "probe"], {
      cwd: f.root,
      encoding: "utf8",
      windowsHide: true,
    });
    assert.equal(result.status, expectedStatus, result.stdout + result.stderr);
    if (expectedStatus === 1) {
      assert.match(result.stderr, /EBADDEVENGINES/);
      assert.doesNotMatch(result.stdout, /123456789/);
    } else assert.match(result.stdout, /123456789/);
  }
});

/** @param {import('node:test').TestContext} t */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "bbcode setup with spaces "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, ".node-version"), `${process.versions.node}\n`);
  writeFileSync(join(root, ".python-version"), "3.14.7\n");
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ packageManager: "npm@12.0.2" }),
  );
  const npmCli = join(root, "npm path with spaces", "npm-cli.js");
  const python = join(root, "python path with spaces", "python");
  /** @type {{command: string, args: string[], root: string}[]} */
  const calls = [];
  /** @type {import('../scripts/setup-development.js').CommandExecutor} */
  const execute = (command, args, cwd) => {
    calls.push({ command, args, root: cwd });
    const stdout = args.includes("--version")
      ? "12.0.2\n"
      : args.includes("-c")
        ? "3.14.7\n"
        : "";
    return { status: 0, stdout, stderr: "" };
  };
  return { root, npmCli, python, execute, calls };
}

test("standalone setup installs exactly the locked graphs and isolated prose tools in a path with spaces", (t) => {
  const f = fixture(t);
  setupDevelopment(f);
  const installs = f.calls.filter((call) => call.args.includes("ci"));
  assert.deepEqual(
    installs.map((call) => call.args),
    [
      [f.npmCli, "ci", "--ignore-scripts"],
      [f.npmCli, "--prefix", "tooling/type-coverage", "ci", "--ignore-scripts"],
      [f.npmCli, "--prefix", "tooling/api-docs", "ci", "--ignore-scripts"],
      [f.npmCli, "--prefix", "tooling/node-types/22", "ci", "--ignore-scripts"],
      [f.npmCli, "--prefix", "tooling/node-types/24", "ci", "--ignore-scripts"],
      [f.npmCli, "--prefix", "tooling/node-types/26", "ci", "--ignore-scripts"],
    ],
  );
  assert.ok(
    installs.every(
      (call) => call.command === process.execPath && call.root === f.root,
    ),
  );
  assert.ok(
    f.calls.some(
      (call) =>
        call.command === f.python && call.args.join(" ") === "-I -m venv .venv",
    ),
  );
  const pip = f.calls.find((call) => call.args.includes("pip"));
  assert.ok(pip);
  assert.equal(
    pip.command,
    join(
      f.root,
      ".venv",
      process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
    ),
  );
  assert.deepEqual(pip.args, [
    "-B",
    "-m",
    "pip",
    "install",
    "--require-hashes",
    "--only-binary=:all:",
    "-r",
    "tooling/prose/requirements.txt",
  ]);
});

test("a compatible installed Node need not equal the reference pin", (t) => {
  const f = fixture(t);
  writeFileSync(join(f.root, ".node-version"), "24.20.0\n");
  const versions = setupDevelopment(f);
  assert.equal(versions.node, process.versions.node);
  assert.equal(f.calls.filter((call) => call.args.includes("ci")).length, 6);
});

test("mismatched npm and Python versions stop before installations", (t) => {
  for (const prerequisite of ["npm", "Python"]) {
    const f = fixture(t);
    const execute = f.execute;
    f.execute = (command, args, root) => {
      const result = execute(command, args, root);
      return args.includes(prerequisite === "npm" ? "--version" : "-c")
        ? { ...result, stdout: "0.0.0\n" }
        : result;
    };
    assert.throws(() => setupDevelopment(f), new RegExp(prerequisite));
    assert.ok(
      f.calls.every(
        (call) => !call.args.includes("ci") && !call.args.includes("venv"),
      ),
    );
  }
});

test("missing Python and interrupted probes retain the actual failure and do not install", (t) => {
  for (const result of [
    {
      status: null,
      stdout: "",
      stderr: "",
      error: new Error("missing Python executable"),
    },
    { status: null, stdout: "", stderr: "", signal: "SIGTERM" },
  ]) {
    const f = fixture(t);
    const execute = f.execute;
    f.execute = (command, args, root) =>
      command === f.python ? result : execute(command, args, root);
    assert.throws(
      () => setupDevelopment(f),
      /missing Python executable|SIGTERM/,
    );
    assert.ok(f.calls.every((call) => !call.args.includes("ci")));
  }
});

test("a failed install stops the sequence and preserves its exit status in the diagnostic", (t) => {
  const f = fixture(t);
  const execute = f.execute;
  f.execute = (command, args, root) => {
    const result = execute(command, args, root);
    return args.includes("ci")
      ? { ...result, status: 7, stderr: "fixture install failed" }
      : result;
  };
  assert.throws(() => setupDevelopment(f), /7.*fixture install failed/s);
  assert.equal(f.calls.filter((call) => call.args.includes("ci")).length, 1);
  assert.ok(
    f.calls.every(
      (call) => !call.args.includes("venv") && !call.args.includes("pip"),
    ),
  );
});

test("an existing environment is validated rather than overwritten", (t) => {
  const f = fixture(t);
  mkdirSync(join(f.root, ".venv"));
  const execute = f.execute;
  f.execute = (command, args, root) => {
    const result = execute(command, args, root);
    return command.includes(".venv")
      ? { ...result, stdout: "3.13.0\n" }
      : result;
  };
  assert.throws(() => setupDevelopment(f), /Python 3\.14\.7/);
  assert.ok(
    f.calls.every(
      (call) => !call.args.includes("ci") && !call.args.includes("venv"),
    ),
  );
});
