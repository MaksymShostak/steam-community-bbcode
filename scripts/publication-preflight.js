// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from owlapi scripts/qualify-release.mjs and release-state.mjs
// at 2ac41c94e6630ca47ce110a484ec9af3b0b1f335.
// Changes: checked JSDoc, existing registry constant, lifecycle scripts disabled,
// bootstrap-only state classification; no reconciliation or immutable-release machinery.
import { registry } from "./release-artifacts.js";
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
