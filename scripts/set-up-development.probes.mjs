// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setUpDevelopment } from "./set-up-development.js";

// This integration probe requires the repository .venv. Keep it in the tooling
// entry point; converter mutation sandboxes intentionally install only npm.
test("native Python accepts versions above the minimum and rejects older interpreters before installation", (t) => {
  const interpreter = join(
    fileURLToPath(new URL("../.venv/", import.meta.url)),
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
  const version = spawnSync(
    interpreter,
    ["-I", "-c", 'import sys; print(".".join(map(str, sys.version_info[:3])))'],
    { encoding: "utf8", windowsHide: true },
  );
  assert.equal(version.status, 0, version.stderr);
  const [major, minor, patch] = version.stdout.trim().split(".").map(Number);
  assert.ok(major !== undefined && minor !== undefined && patch !== undefined);
  const earlier =
    patch > 0
      ? `${major}.${minor}.${patch - 1}`
      : minor > 0
        ? `${major}.${minor - 1}.0`
        : `${major - 1}.0.0`;
  for (const [minimum, accepted] of [
    [earlier, true],
    [`${major}.${minor}.${patch + 1}`, false],
  ]) {
    const root = mkdtempSync(join(tmpdir(), "bbcode Python minimum "));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    writeFileSync(join(root, ".python-version"), `${minimum}\n`);
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ packageManager: "npm@12.2.0" }),
    );
    /** @type {string[][]} */
    const calls = [];
    /** @type {import('./set-up-development.js').CommandExecutor} */
    const execute = (_command, args) => {
      calls.push(args);
      if (!args.includes("-c"))
        return { status: 0, stdout: "12.2.0\n", stderr: "" };
      const probe = spawnSync(interpreter, args, {
        encoding: "utf8",
        windowsHide: true,
      });
      return {
        status: probe.status,
        stdout: probe.stdout,
        stderr: probe.stderr,
      };
    };
    const setup = () =>
      setUpDevelopment({
        root,
        python: interpreter,
        npmCli: process.env["npm_execpath"],
        execute,
        productOnly: true,
      });
    if (accepted) {
      assert.equal(setup().python, version.stdout.trim());
      assert.equal(calls.filter((args) => args.includes("ci")).length, 6);
    } else {
      assert.throws(setup, /Python/);
      assert.ok(calls.every((args) => !args.includes("ci")));
    }
  }
});
