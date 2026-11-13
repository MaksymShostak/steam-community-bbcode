// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { jqVersion } from "./repository-jq.js";

/** @typedef {{status: number | null, stdout: string, stderr: string, error?: Error, signal?: string | null}} CommandResult */
/** @typedef {(command: string, args: string[], root: string) => CommandResult} CommandExecutor */
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pythonVersionArguments = [
  "-I",
  "-c",
  'import sys\nminimum = tuple(map(int, sys.argv[1].split(".")))\nif sys.version_info < minimum or sys.version_info.releaselevel != "final":\n    sys.exit("Use stable Python >=" + sys.argv[1] + ".")\nprint(".".join(map(str, sys.version_info[:3])))',
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
export function setUpDevelopment({
  root = repositoryRoot,
  python = process.env["PYTHON"] ??
    (process.platform === "win32" ? "python" : "python3"),
  npmCli = process.env["npm_execpath"],
  execute = executeCommand,
} = {}) {
  // npm validates devEngines before invoking this entry point, including on a
  // fresh clone with no node_modules. .node-version is a reference environment.
  const nodeVersion = process.versions.node;
  const pythonMinimum = readFileSync(
    join(root, ".python-version"),
    "utf8",
  ).trim();
  assert.ok(npmCli, "Run npm run set-up:development to select npm.");

  /** @param {string} command @param {string[]} args */
  function checked(command, args) {
    const result = execute(command, args, root);
    if (result.error) throw result.error;
    if (result.signal)
      throw new Error(`Development setup interrupted by ${result.signal}.`);
    if (result.status !== 0) {
      // npm writes its banners to stderr; patch-package explains refusals on
      // stdout. Preserve both streams so the banner cannot hide the cause.
      const output = [result.stderr, result.stdout].filter(Boolean).join("\n");
      throw new Error(`Development command exited ${result.status}: ${output}`);
    }
    return result.stdout.trim();
  }
  const npmVersion = checked(process.execPath, [npmCli, "--version"]);
  // Python owns comparison of its runtime tuple against the reference minimum.
  const pythonArguments = [...pythonVersionArguments, pythonMinimum];
  checked(python, pythonArguments);
  const environment = join(root, ".venv");
  const interpreter = join(
    environment,
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
  const existingEnvironment = existsSync(environment);
  if (existingEnvironment) {
    checked(interpreter, pythonArguments);
  }
  checked(process.execPath, [
    fileURLToPath(new URL("repository-jq.js", import.meta.url)),
    root,
  ]);
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
  // Locked installs intentionally skip lifecycle scripts. Apply the temporary
  // TypeDoc compatibility patch explicitly before using the documentation tool.
  checked(process.execPath, [
    npmCli,
    "--prefix",
    "tooling/api-docs",
    "run",
    "apply:patches",
  ]);
  if (!existingEnvironment) checked(python, ["-I", "-m", "venv", ".venv"]);
  const pythonVersion = checked(interpreter, pythonArguments);
  return {
    node: nodeVersion,
    npm: npmVersion,
    python: pythonVersion,
    jq: jqVersion,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const args = process.argv.slice(2);
    assert.equal(args.length, 0, "Use npm run set-up:development.");
    const versions = setUpDevelopment();
    console.log(
      `Standalone tooling ready: Node ${versions.node}, npm ${versions.npm}, Python ${versions.python}, jq ${versions.jq}.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
