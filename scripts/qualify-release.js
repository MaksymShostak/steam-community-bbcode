// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from owlapi scripts/qualify-release.mjs at
// 2ac41c94e6630ca47ce110a484ec9af3b0b1f335. Reuses its dry-run and bootstrap
// contracts; adds the existing hosted candidate and ONI consumer boundaries.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { readCandidate, registry, sha256File } from "./release-artifacts.js";
import {
  assertDryRunMatchesCandidate,
  assertRegistryBootstrapState,
  normalizeNpmPublishDryRun,
  npmPublishDryRunInvocation,
} from "./publication-preflight.js";
import {
  qualifyOniConsumer,
  runReleaseCommand,
} from "./qualify-oni-consumer.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const npmCli = process.env["npm_execpath"];
assert.ok(
  npmCli,
  "Run npm run release:preflight or release:publish-bootstrap.",
);
const { values } = parseArgs({
  options: {
    candidate: { type: "string" },
    "oni-repository": { type: "string" },
    output: { type: "string" },
    publish: { type: "boolean", default: false },
  },
});
assert.ok(
  values.candidate && values["oni-repository"] && values.output,
  "Require --candidate, --oni-repository and --output.",
);
for (const name of ["NODE_AUTH_TOKEN", "NPM_TOKEN"]) {
  assert.ok(
    !process.env[name],
    "Bootstrap uses owner npm login, without environment tokens.",
  );
}
const directory = resolve(values.candidate);
const output = resolve(values.output);
// Reserve a new report before any work; a failed run cannot leave an old PASS.
writeFileSync(output, JSON.stringify({ result: "INCOMPLETE" }) + "\n", {
  flag: "wx",
});
const scratch = mkdtempSync(join(tmpdir(), "bbcode release preflight "));
try {
  const candidate = readCandidate(directory);
  const tarballPath = join(directory, candidate.tarball.filename);
  assert.equal(candidate.package.private, false);
  assert.match(candidate.package.version, /^1\.0\.0-rc\.[1-9][0-9]*$/u);
  assert.equal(
    candidate.source.dirty,
    false,
    "Require a committed release candidate.",
  );
  assert.equal(candidate.checks.installedConsumers, "PASS");
  assert.equal(candidate.checks.productionAudit, "PASS");
  const identity = candidate.release;
  assert.ok(
    identity,
    "Require the retained hosted release candidate, not a local pack.",
  );
  const repository = "MaksymShostak/steam-community-bbcode";
  assert.equal(identity.repository, repository);
  assert.equal(identity.ref, "refs/heads/main");
  assert.equal(identity.tag, "next");
  assert.equal(identity.workflowSha, candidate.source.commit);
  assert.equal(
    identity.workflowRef,
    `${repository}/.github/workflows/steam-community-bbcode-release.yml@refs/heads/main`,
  );
  assert.deepEqual(identity.qualification, {
    runtimeAndMutation: "success",
    controls: "success",
    security: "success",
  });
  const git = /** @param {string[]} args */ (args) =>
    runReleaseCommand("git", args, root).trim();
  assert.equal(git(["rev-parse", "HEAD"]), candidate.source.commit);
  assert.equal(
    git(["status", "--porcelain"]),
    "",
    "Require a clean release checkout.",
  );
  assert.match(identity.runId, /^[0-9]+$/u);
  /** @type {{head_sha: string, conclusion: string, path: string, run_attempt: number}} */
  const run = JSON.parse(
    runReleaseCommand(
      "gh",
      ["api", `repos/${repository}/actions/runs/${identity.runId}`],
      root,
    ),
  );
  assert.equal(run.head_sha, candidate.source.commit);
  assert.equal(run.conclusion, "success");
  assert.equal(
    run.path,
    ".github/workflows/steam-community-bbcode-release.yml",
  );
  assert.equal(String(run.run_attempt), identity.runAttempt);
  const hosted = join(scratch, "hosted");
  mkdirSync(hosted);
  runReleaseCommand(
    "gh",
    [
      "run",
      "download",
      identity.runId,
      "--repo",
      repository,
      "--name",
      "steam-community-bbcode-candidate",
      "--dir",
      hosted,
    ],
    root,
  );
  for (const name of [
    "candidate.json",
    candidate.tarball.filename,
    "pack-actual.json",
  ]) {
    assert.equal(
      sha256File(join(directory, name)),
      sha256File(join(hosted, name)),
      `Retained ${name} differs from the hosted artifact.`,
    );
  }
  /** @type {{files: {path: string}[]}} */
  const pack = JSON.parse(
    readFileSync(join(directory, "pack-actual.json"), "utf8"),
  );
  const invocation = npmPublishDryRunInvocation({ npmCli, tarballPath });
  const dryRun = normalizeNpmPublishDryRun(
    JSON.parse(
      runReleaseCommand(invocation.command, invocation.arguments, root),
    ),
  );
  const dryRunResult = assertDryRunMatchesCandidate({
    candidate: {
      package: candidate.package,
      tarball: {
        fileName: candidate.tarball.filename,
        bytes: statSync(tarballPath).size,
        sha256: candidate.tarball.sha256,
      },
      packedPaths: pack.files.map(({ path }) => path),
    },
    dryRun,
  });
  assert.equal(dryRun.integrity, candidate.tarball.integrity);
  const publint = runReleaseCommand(
    process.execPath,
    [npmCli, "run", "release:lint-package", "--", tarballPath],
    root,
  );
  const oniRepository = resolve(values["oni-repository"]);
  assert.equal(
    runReleaseCommand("git", ["status", "--porcelain"], oniRepository).trim(),
    "",
    "Commit the ONI consumer before release qualification.",
  );
  const oni = qualifyOniConsumer({
    repository: oniRepository,
    directory: join(scratch, "installed consumer"),
    npmCli,
    tarballPath,
    integrity: candidate.tarball.integrity,
  });
  assert.equal(oni.sourceDirty, false);
  // Re-read public state immediately before publishing. Any HTTP failure blocks;
  // only an explicit 404 permits bootstrap. Never retry a publication.
  const coordinateUrl = new URL(
    `${encodeURIComponent(candidate.package.name)}/${encodeURIComponent(candidate.package.version)}`,
    registry,
  );
  const response = await fetch(coordinateUrl, {
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(
    response.status,
    404,
    "The registry coordinate must be absent; otherwise verify it separately.",
  );
  const canonicalTag = `v${candidate.package.version}`;
  const remoteTag = git([
    "ls-remote",
    "--tags",
    "origin",
    `refs/tags/${canonicalTag}`,
  ]);
  const localTag = git(["tag", "--list", canonicalTag]);
  const state = assertRegistryBootstrapState({
    canonicalTagExists: Boolean(remoteTag || localTag),
    registryVersion: null,
    retainedSha256: candidate.tarball.sha256,
  });
  assert.equal(git(["rev-parse", "HEAD"]), candidate.source.commit);
  assert.equal(git(["status", "--porcelain"]), "");
  assert.equal(sha256File(tarballPath), candidate.tarball.sha256);
  const report = {
    result: "PREFLIGHT_PASS",
    checkedAt: new Date().toISOString(),
    candidate: dryRunResult,
    hostedRun: identity.runId,
    registryState: state.action,
    publint,
    oni,
  };
  writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
  if (values.publish) {
    writeFileSync(
      output,
      JSON.stringify(
        {
          ...report,
          result: "PUBLICATION_ATTEMPTED_REQUIRES_REGISTRY_VERIFICATION",
        },
        null,
        2,
      ) + "\n",
    );
    const published = spawnSync(
      process.execPath,
      [
        npmCli,
        "publish",
        tarballPath,
        "--ignore-scripts",
        "--tag",
        "next",
        "--access",
        "public",
        `--registry=${registry}`,
      ],
      { cwd: root, stdio: "inherit", windowsHide: true },
    );
    assert.equal(
      published.status,
      0,
      published.error?.message ??
        "Publication failed or is uncertain. Inspect the registry before retrying.",
    );
    console.log(
      "Published archive; registry verification and GitHub prerelease acceptance remain required.",
    );
  }
  console.log(`Retained preflight evidence: ${output}`);
} finally {
  // mkdtemp created this exact task-owned absolute directory under the OS temp root.
  assert.ok(scratch.startsWith(join(tmpdir(), "bbcode release preflight ")));
  rmSync(scratch, { recursive: true, force: true });
}
