// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from owlapi scripts/qualify-release.mjs and release-state.mjs
// at 2ac41c94e6630ca47ce110a484ec9af3b0b1f335.
// Changes: checked JSDoc, existing registry constant, lifecycle scripts disabled,
// bootstrap-only state classification; no reconciliation or immutable-release machinery.
import { registry } from "./release-artifacts.js";
import assert from "node:assert/strict";
/** @typedef {{id:number, name:string, run_id:number, run_attempt:number, head_sha:string, status:string, conclusion:string, runner_id:number, started_at:string, completed_at:string, steps?:{status:string, conclusion:string}[]}} BootstrapJob */
/** @typedef {{total_count:number, jobs:BootstrapJob[]}} BootstrapJobs */

/**
 * A later successful qualification can still carry the original build. The manual
 * bootstrap cannot take over a run in which the hosted publisher may have acted.
 * @param {import('./release-artifacts.js').ReleaseIdentity} identity
 * @param {number} latestAttempt @param {(attempt:number)=>BootstrapJobs} readJobs
 */
export function verifyBootstrapBuildOrigin(identity, latestAttempt, readJobs) {
  assert.match(identity.runAttempt, /^[1-9]\d*$/u);
  const origin = Number(identity.runAttempt);
  assert.ok(
    Number.isSafeInteger(latestAttempt) &&
      latestAttempt >= origin &&
      latestAttempt <= 50,
  );
  /** @type {Set<string>} */
  const earlier = new Set();
  /** @type {string | undefined} */
  let producingExecution;
  for (let n = 1; n <= latestAttempt; n++) {
    const { jobs, total_count } = readJobs(n);
    assert.ok(
      Array.isArray(jobs) && jobs.length > 0 && jobs.length === total_count,
    );
    assert.equal(new Set(jobs.map((job) => job.id)).size, total_count);
    for (const job of jobs) {
      assert.ok(Number.isSafeInteger(job.id) && job.id > 0);
      assert.equal(String(job.run_id), identity.runId);
      assert.equal(job.run_attempt, n);
      assert.equal(job.head_sha, identity.workflowSha);
      assert.equal(job.status, "completed");
    }
    const writers = jobs.filter(
      (job) => job.name === "Publish the qualified archive",
    );
    assert.ok(
      writers.length === 1 &&
        writers[0]?.conclusion === "skipped" &&
        (writers[0].steps ?? []).every(
          (step) =>
            step.status === "completed" && step.conclusion === "skipped",
        ),
      "Manual bootstrap requires a skipped hosted publisher on every attempt",
    );
    const builds = jobs.filter(
      (job) => job.name === "Qualify the release archive",
    );
    assert.ok(builds.length <= 1, "Ambiguous candidate producer");
    const build = builds[0];
    if (n < origin && (!build || build.conclusion === "skipped")) continue;
    assert.ok(build, "Missing candidate producer");
    const start = Date.parse(build.started_at),
      end = Date.parse(build.completed_at);
    assert.ok(
      Number.isSafeInteger(build.runner_id) &&
        build.runner_id > 0 &&
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        end >= start,
      "Unobservable candidate producer",
    );
    const execution = `${build.runner_id}/${start}/${end}`;
    if (n < origin) {
      earlier.add(execution);
      continue;
    }
    assert.equal(build.conclusion, "success");
    if (n === origin) {
      assert.ok(
        !earlier.has(execution),
        "Retained build was relabelled as a new producer",
      );
      producingExecution = execution;
    } else
      assert.equal(execution, producingExecution, "Candidate was superseded");
  }
}
/** @typedef {{name: string, version: string, filename: string, size: number, entryCount: number, files: {path: string}[], integrity: string, shasum: string}} NpmDryRun */
/** @typedef {{package: {name: string, version: string}, tarball: {fileName: string, bytes: number, sha256: string}, packedPaths: string[]}} PackedCandidate */
/** @typedef {{canonicalTagExists: boolean, registryVersion: {tarballSha256: string} | null, retainedSha256: string}} BootstrapFacts */
/** @param {string} left @param {string} right */
const compareCodeUnits = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;
const SHA256_PATTERN = /^[0-9a-f]{64}$/u;

/** @param {string} value @param {string} label */
const assertSha256 = (value, label) => {
  if (!SHA256_PATTERN.test(value ?? "")) {
    throw new Error(`${label} must be a lowercase SHA-256 digest.`);
  }
};

/** @param {BootstrapFacts} facts */
const classifyReleaseState = ({
  canonicalTagExists,
  registryVersion,
  retainedSha256,
}) => {
  assertSha256(retainedSha256, "Retained tarball");
  if (registryVersion) {
    assertSha256(registryVersion.tarballSha256, "Registry tarball");
    if (registryVersion.tarballSha256 !== retainedSha256) {
      throw new Error(
        "The registry bytes do not match the retained release candidate.",
      );
    }
    return { action: "VERIFY_EXISTING_PUBLICATION" };
  }

  if (canonicalTagExists) {
    return { action: "ABANDON_TAGGED_VERSION" };
  }
  return { action: "DIRECT_BOOTSTRAP_READY" };
};

/** @param {{candidate: PackedCandidate, dryRun: NpmDryRun}} input */
export const assertDryRunMatchesCandidate = ({ candidate, dryRun }) => {
  const expectedPaths = [...candidate.packedPaths].sort(compareCodeUnits);
  const actualPaths = (dryRun.files ?? [])
    .map(({ path }) => path)
    .sort(compareCodeUnits);
  if (
    dryRun.name !== candidate.package.name ||
    dryRun.version !== candidate.package.version ||
    dryRun.filename !== candidate.tarball.fileName
  ) {
    throw new Error("The npm dry-run coordinate disagrees with the candidate.");
  }
  if (dryRun.size !== candidate.tarball.bytes) {
    throw new Error("The npm dry-run byte count disagrees with the candidate.");
  }
  if (
    dryRun.entryCount !== expectedPaths.length ||
    JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)
  ) {
    throw new Error(
      "The npm dry-run packlist differs from the retained tarball.",
    );
  }
  return {
    coordinate: `${candidate.package.name}@${candidate.package.version}`,
    fileCount: expectedPaths.length,
    tarballSha256: candidate.tarball.sha256,
  };
};

/** @param {BootstrapFacts} facts */
export const assertRegistryBootstrapState = (facts) => {
  const state = classifyReleaseState(facts);
  if (state.action !== "DIRECT_BOOTSTRAP_READY") {
    throw new Error(
      `The reviewed coordinate is already public or otherwise unavailable for direct bootstrap: ${state.action}.`,
    );
  }
  return state;
};

/** @param {unknown} parsed @returns {NpmDryRun} */
export const normalizeNpmPublishDryRun = (parsed) => {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The npm dry run must contain exactly one package record.");
  }
  const object = /** @type {Record<string, unknown>} */ (parsed);
  if (
    typeof object["name"] === "string" &&
    typeof object["version"] === "string"
  ) {
    return /** @type {NpmDryRun} */ (parsed);
  }
  const entries = Object.entries(object);
  const entry = entries[0];
  if (
    entries.length !== 1 ||
    !entry ||
    !entry[1] ||
    typeof entry[1] !== "object" ||
    Array.isArray(entry[1])
  ) {
    throw new Error("The npm dry run must contain exactly one package record.");
  }
  const [key, record] = entry;
  if (/** @type {Record<string, unknown>} */ (record)["name"] !== key) {
    throw new Error("The npm dry-run package key disagrees with its record.");
  }
  return /** @type {NpmDryRun} */ (record);
};

/** @param {{npmCli: string, tarballPath: string}} input */
export const npmPublishDryRunInvocation = ({ npmCli, tarballPath }) => {
  if (!npmCli || !tarballPath) {
    throw new Error("The publication dry run requires the exact npm CLI.");
  }
  return {
    command: process.execPath,
    arguments: [
      npmCli,
      "publish",
      tarballPath,
      "--dry-run",
      "--ignore-scripts",
      "--tag",
      "next",
      "--access",
      "public",
      `--registry=${registry}`,
      "--json",
    ],
  };
};
