// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** @typedef {{status: number | null, stdout: string, stderr: string, error?: Error, signal?: string | null}} CommandResult */
/** @typedef {(command: string, args: string[], root: string) => CommandResult} CommandExecutor */
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pythonVersionArguments = [
  "-I",
  "-c",
  'import sys; print(".".join(map(str, sys.version_info[:3])))',
];

/** @type {CommandExecutor} */
const executeCommand = (command, args, root) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });

/**
 * Install only the repository's locked development environments.
 * The executor boundary allows prerequisite/install failures to be tested without network effects.
 * @param {{root?: string, python?: string, npmCli?: string, execute?: CommandExecutor}} [options]
 */
export function setupDevelopment({
  root = repositoryRoot,
  python = process.env["PYTHON"] ??
    (process.platform === "win32" ? "python" : "python3"),
  npmCli = process.env["npm_execpath"],
  execute = executeCommand,
} = {}) {
  // npm validates devEngines before invoking this entry point, including on a
  // fresh clone with no node_modules. .node-version is a reference environment.
  const nodeVersion = process.versions.node;
  const pythonVersion = readFileSync(
    join(root, ".python-version"),
    "utf8",
  ).trim();
  assert.ok(
    npmCli,
    "Run npm run setup:development with the pinned npm version.",
  );
  /** @type {unknown} */
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.ok(
    manifest &&
      typeof manifest === "object" &&
      "packageManager" in manifest &&
      typeof manifest.packageManager === "string",
  );
  const npmVersion = /^npm@(\d+\.\d+\.\d+)$/.exec(manifest.packageManager)?.[1];
  assert.ok(npmVersion, "packageManager must pin an exact npm version.");

  /** @param {string} command @param {string[]} args */
  function checked(command, args) {
    const result = execute(command, args, root);
    if (result.error) throw result.error;
    if (result.signal)
      throw new Error(`Development setup interrupted by ${result.signal}.`);
    if (result.status !== 0)
      throw new Error(
        `Development command exited ${result.status}: ${result.stderr || result.stdout}`,
      );
    return result.stdout.trim();
  }
  assert.equal(
    checked(process.execPath, [npmCli, "--version"]),
    npmVersion,
    `Use npm ${npmVersion}.`,
  );
  assert.equal(
    checked(python, pythonVersionArguments),
    pythonVersion,
    `Use Python ${pythonVersion}.`,
  );
  const environment = join(root, ".venv");
  const interpreter = join(
    environment,
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
  const existingEnvironment = existsSync(environment);
  if (existingEnvironment) {
    assert.equal(
      checked(interpreter, pythonVersionArguments),
      pythonVersion,
      `The existing environment must use Python ${pythonVersion}.`,
    );
  }
  checked(process.execPath, [npmCli, "ci", "--ignore-scripts"]);
  for (const directory of [
    "tooling/type-coverage",
    "tooling/api-docs",
    "tooling/node-types/22",
    "tooling/node-types/24",
    "tooling/node-types/26",
  ]) {
    checked(process.execPath, [
      npmCli,
      "--prefix",
      directory,
      "ci",
      "--ignore-scripts",
    ]);
  }
  if (!existingEnvironment) checked(python, ["-I", "-m", "venv", ".venv"]);
  assert.equal(
    checked(interpreter, pythonVersionArguments),
    pythonVersion,
    `The environment must use Python ${pythonVersion}.`,
  );
  checked(interpreter, [
    "-B",
    "-m",
    "pip",
    "install",
    "--require-hashes",
    "--only-binary=:all:",
    "-r",
    "tooling/prose/requirements.txt",
  ]);
  return { node: nodeVersion, npm: npmVersion, python: pythonVersion };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const versions = setupDevelopment();
    console.log(
      `Standalone tooling ready: Node ${versions.node}, npm ${versions.npm}, Python ${versions.python}.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
