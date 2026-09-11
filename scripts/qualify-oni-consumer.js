// SPDX-License-Identifier: AGPL-3.0-only
// Consumer-specific composition of the existing ONI pipeline and native npm.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { registry, sha256File } from "./release-artifacts.js";

/** @typedef {{exitCode: number, diagnostics: unknown[], value: {hasDrift: boolean, changed: boolean, readmeSha256: string, descriptionSha256: string, conversionDiagnostics: unknown[], converterStandardError: string}}} OniReadmeResult */

/** @param {OniReadmeResult} result @param {string} readmeSha256 */
export function assertOniReadmeResult(result, readmeSha256) {
  assert.equal(result.exitCode, 0);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(result.value.hasDrift, false, "The ONI README is stale.");
  assert.equal(result.value.changed, false);
  assert.equal(result.value.readmeSha256, readmeSha256);
  assert.match(result.value.descriptionSha256, /^[0-9a-f]{64}$/u);
  assert.deepEqual(result.value.conversionDiagnostics, []);
  assert.equal(result.value.converterStandardError, "");
}

/** @param {string} executable @param {string[]} args @param {string} cwd */
export function runReleaseCommand(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(
    result.status,
    0,
    result.error?.message ?? result.stdout + result.stderr,
  );
  return result.stdout;
}

/** @param {{repository: string, directory: string, npmCli: string, tarballPath: string, integrity: string}} input */
export function qualifyOniConsumer({
  repository,
  directory,
  npmCli,
  tarballPath,
  integrity,
}) {
  const readme = join(repository, "README.md");
  const before = sha256File(readme);
  const sourceCommit = runReleaseCommand(
    "git",
    ["rev-parse", "HEAD"],
    repository,
  ).trim();
  const sourceDirty =
    runReleaseCommand("git", ["status", "--porcelain"], repository).length > 0;
  runReleaseCommand(
    process.execPath,
    [
      npmCli,
      "install",
      "--prefix",
      directory,
      "--cache",
      join(directory, "cache"),
      "--ignore-scripts",
      "--omit=dev",
      "--no-audit",
      "--no-fund",
      "--save-exact",
      `--registry=${registry}`,
      tarballPath,
    ],
    repository,
  );
  /** @type {{packages: Record<string, {integrity?: string}>}} */
  const lock = JSON.parse(
    readFileSync(join(directory, "package-lock.json"), "utf8"),
  );
  assert.equal(
    lock.packages["node_modules/steam-community-bbcode"]?.integrity,
    integrity,
  );
  /** @type {OniReadmeResult} */
  const result = JSON.parse(
    runReleaseCommand(
      process.execPath,
      [
        npmCli,
        "run",
        "--silent",
        "pipeline",
        "--",
        "sync-readme",
        "--mod",
        "mods/delivery-temperature-limit-supercooled",
        "--converter-package",
        join(directory, "node_modules", "steam-community-bbcode"),
        "--check",
        "--format",
        "json",
      ],
      repository,
    ),
  );
  assertOniReadmeResult(result, before);
  assert.equal(
    sha256File(readme),
    before,
    "The consumer check modified README bytes.",
  );
  assert.equal(
    runReleaseCommand("git", ["rev-parse", "HEAD"], repository).trim(),
    sourceCommit,
  );
  assert.equal(
    runReleaseCommand("git", ["status", "--porcelain"], repository).length > 0,
    sourceDirty,
  );
  return { sourceCommit, sourceDirty, integrity, ...result.value };
}
