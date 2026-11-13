// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  accessSync,
  closeSync,
  constants,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
// Official release assets and SHA-256 digests: https://github.com/jqlang/jq/releases/tag/jq-1.8.2
export const jqVersion = "1.8.2";
/** @type {Record<string, {asset: string, size: number, sha256: string}>} */
const artifacts = {
  "win32-x64": {
    asset: "jq-windows-amd64.exe",
    size: 1035264,
    sha256: "a6fc67fedaf9128a3309a1e2ebb8b986aeccf70122ee46d2cb4849e423f0c627",
  },
  "win32-arm64": {
    asset: "jq-windows-arm64.exe",
    size: 973312,
    sha256: "083b5377392bc57cf27052b6d20a2d927770683bca844632901ff38b4b7b0ac7",
  },
  "linux-x64": {
    asset: "jq-linux-amd64",
    size: 2267912,
    sha256: "b1c22172dd303f3be49e935aa56aa48a8b7a46e0bc838b4997d3bb451495870f",
  },
  "linux-arm64": {
    asset: "jq-linux-arm64",
    size: 1797688,
    sha256: "8b85c817833814ddca00a144c33705546355afccf0cf39b188f3cdb48b852309",
  },
  "darwin-x64": {
    asset: "jq-macos-amd64",
    size: 871768,
    sha256: "e94b266e3c26690550006abe63152b782280f4e14374accdf04cbde844f00bc0",
  },
  "darwin-arm64": {
    asset: "jq-macos-arm64",
    size: 841504,
    sha256: "2d75340ba57a4b4b4c8708a21c2dc8e958a48aaa8bba13b27f77f6e4c0eca07e",
  },
};

/** @param {string} platform @param {string} arch */
function target(platform, arch) {
  const selected = artifacts[`${platform}-${arch}`];
  if (!selected) throw new Error(`Unsupported jq host: ${platform}-${arch}`);
  return selected;
}

/**
 * Compute the pinned tool path; this alone does not establish executable trust.
 * @param {string} repositoryRoot @param {NodeJS.Platform} platform @param {string} arch
 */
export function repositoryJqPath(
  repositoryRoot = root,
  platform = process.platform,
  arch = process.arch,
) {
  target(platform, arch);
  return join(
    resolve(repositoryRoot),
    ".agent-tools",
    "jq",
    jqVersion,
    `${platform}-${arch}`,
    platform === "win32" ? "jq.exe" : "jq",
  );
}

/**
 * Refuse links/junctions rather than redirecting repository-owned installation.
 * @param {string} repositoryRoot @param {NodeJS.Platform} platform @param {string} arch @param {boolean} create
 */
function toolDirectory(
  repositoryRoot = root,
  platform = process.platform,
  arch = process.arch,
  create = false,
) {
  target(platform, arch);
  let directory = resolve(repositoryRoot);
  for (const part of [".agent-tools", "jq", jqVersion, `${platform}-${arch}`]) {
    directory = join(directory, part);
    let entry = lstatSync(directory, { throwIfNoEntry: false });
    if (!entry && create) {
      try {
        mkdirSync(directory);
      } catch (error) {
        if (!(
          error instanceof Error &&
          "code" in error &&
          error.code === "EEXIST"
        ))
          throw error;
      }
      entry = lstatSync(directory);
    }
    if (!entry)
      throw new Error(
        "Repository jq is missing; run npm run set-up:development.",
      );
    if (entry.isSymbolicLink() || !entry.isDirectory())
      throw new Error(
        `Refusing linked or non-directory jq location: ${directory}`,
      );
  }
  return directory;
}

/** @param {Uint8Array} bytes @param {{size: number, sha256: string}} selected */
function verifyBytes(bytes, selected) {
  assert.equal(bytes.byteLength, selected.size, "jq size mismatch");
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    selected.sha256,
    "jq checksum mismatch",
  );
}

/** @param {string} executable @param {{size: number, sha256: string}} selected */
function verifyFile(executable, selected) {
  const entry = lstatSync(executable, { throwIfNoEntry: false });
  if (!entry)
    throw new Error(
      "Repository jq is missing; run npm run set-up:development.",
    );
  assert.ok(
    entry.isFile() && !entry.isSymbolicLink(),
    "Refusing linked or non-file jq executable",
  );
  assert.equal(entry.size, selected.size, "jq size mismatch");
  verifyBytes(readFileSync(executable), selected);
  accessSync(executable, constants.X_OK);
}

/** @param {string} executable @param {Buffer} bytes */
function verifyPublished(executable, bytes) {
  const existing = lstatSync(executable);
  assert.ok(
    existing.isFile() && !existing.isSymbolicLink(),
    "Refusing linked or non-file jq artifact",
  );
  assert.equal(
    existing.size,
    bytes.length,
    `Existing jq artifact size differs: ${executable}`,
  );
  assert.ok(
    readFileSync(executable).equals(bytes),
    `Existing jq artifact differs: ${executable}`,
  );
}

/**
 * Publish complete verified bytes exclusively; preserve any existing different file.
 * @param {string} executable @param {Buffer} bytes @param {number} mode
 */
function publish(executable, bytes, mode) {
  const existing = lstatSync(executable, { throwIfNoEntry: false });
  if (existing) {
    verifyPublished(executable, bytes);
    return;
  }
  const staged = join(dirname(executable), `.jq-${randomUUID()}.tmp`);
  const descriptor = openSync(staged, "wx", mode);
  try {
    try {
      writeFileSync(descriptor, bytes);
    } finally {
      closeSync(descriptor);
    }
    // link is atomic and refuses an existing destination; rename would replace it.
    try {
      linkSync(staged, executable);
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "EEXIST"
      ))
        throw error;
      verifyPublished(executable, bytes);
    }
  } finally {
    unlinkSync(staged);
  }
}

/**
 * Acquire only the pinned official host binary; never execute unverified bytes.
 * Downloads are bounded by the published asset size and one minute.
 * @param {{root?: string, platform?: NodeJS.Platform, arch?: string, download?: typeof fetch}} [options]
 */
export async function setUpRepositoryJq({
  root: repositoryRoot = root,
  platform = process.platform,
  arch = process.arch,
  download = fetch,
} = {}) {
  const selected = target(platform, arch);
  const executable = repositoryJqPath(repositoryRoot, platform, arch);
  const directory = toolDirectory(repositoryRoot, platform, arch, true);
  if (!lstatSync(executable, { throwIfNoEntry: false })) {
    const response = await download(
      `https://github.com/jqlang/jq/releases/download/jq-${jqVersion}/${selected.asset}`,
      { signal: AbortSignal.timeout(60000) },
    );
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new Error(`jq download failed: HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    /** @type {Uint8Array[]} */
    const chunks = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        assert.ok(size <= selected.size, "jq download exceeds the pinned size");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
    const bytes = Buffer.concat(chunks);
    verifyBytes(bytes, selected);
    publish(executable, bytes, 0o755);
  }
  verifyFile(executable, selected);
  publish(
    join(directory, "COPYING"),
    readFileSync(new URL("repository-jq.COPYING", import.meta.url)),
    0o644,
  );
  const probe = spawnSync(executable, ["--version"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 10000,
    maxBuffer: 4096,
  });
  if (probe.error) throw probe.error;
  assert.equal(probe.status, 0, `Pinned jq cannot run: ${probe.stderr}`);
  assert.equal(
    probe.stdout.trim(),
    `jq-${jqVersion}`,
    "Pinned jq reports an unexpected version",
  );
  return executable;
}

/**
 * Supply a verified executable for Bash's native command table without altering PATH.
 * @returns {NodeJS.ProcessEnv}
 */
export function repositoryJqEnvironment({
  root: repositoryRoot = root,
  environment = process.env,
} = {}) {
  toolDirectory(repositoryRoot);
  const executable = repositoryJqPath(repositoryRoot);
  verifyFile(executable, target(process.platform, process.arch));
  return {
    ...environment,
    REPOSITORY_JQ_EXECUTABLE:
      process.platform === "win32"
        ? executable.replaceAll("\\", "/")
        : executable,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    assert.ok(
      process.argv.length <= 3,
      "Use node scripts/repository-jq.js [repository-root].",
    );
    console.log(
      `jq-${jqVersion}: ${await setUpRepositoryJq({ root: process.argv[2] ?? root })}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
