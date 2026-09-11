// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from owlapi scripts/qualify-release.test.js at 2ac41c94e6630ca47ce110a484ec9af3b0b1f335.
import assert from "node:assert/strict";
import test from "node:test";
import { assertOniReadmeResult } from "../scripts/qualify-oni-consumer.js";
import {
  assertDryRunMatchesCandidate,
  assertRegistryBootstrapState,
  normalizeNpmPublishDryRun,
} from "../scripts/publication-preflight.js";

const candidate = {
  package: { name: "steam-community-bbcode", version: "1.0.0-rc.1" },
  tarball: {
    fileName: "steam-community-bbcode-1.0.0-rc.1.tgz",
    sha256: "a".repeat(64),
    bytes: 1234,
  },
  packedPaths: ["README.md", "src/index.js", "package.json"],
};
const dryRun = {
  name: candidate.package.name,
  version: candidate.package.version,
  filename: candidate.tarball.fileName,
  size: 1234,
  entryCount: 3,
  files: candidate.packedPaths.map((path) => ({ path })),
  integrity: "sha512-example",
  shasum: "example",
};

test("ONI acceptance requires unchanged, fresh README bytes and no diagnostics", () => {
  const result = {
    exitCode: 0,
    diagnostics: [],
    value: {
      hasDrift: false,
      changed: false,
      readmeSha256: "a".repeat(64),
      descriptionSha256: "b".repeat(64),
      conversionDiagnostics: [],
      converterStandardError: "",
    },
  };
  assertOniReadmeResult(result, "a".repeat(64));
  assert.throws(() =>
    assertOniReadmeResult(
      { ...result, value: { ...result.value, hasDrift: true } },
      "a".repeat(64),
    ),
  );
  assert.throws(() => assertOniReadmeResult(result, "c".repeat(64)));
  assert.throws(() =>
    assertOniReadmeResult(
      { ...result, diagnostics: ["warning"] },
      "a".repeat(64),
    ),
  );
});

test("owlapi dry-run contract preserves exact coordinates and rejects extra packed files", () => {
  assert.equal(
    assertDryRunMatchesCandidate({ candidate, dryRun }).fileCount,
    3,
  );
  assert.throws(
    () =>
      assertDryRunMatchesCandidate({
        candidate,
        dryRun: {
          ...dryRun,
          files: [...dryRun.files, { path: "unexpected.js" }],
        },
      }),
    /packlist/,
  );
  assert.throws(
    () =>
      assertDryRunMatchesCandidate({
        candidate,
        dryRun: { ...dryRun, size: 12 },
      }),
    /byte count/,
  );
});
test("owlapi normalization rejects ambiguous npm dry-run envelopes", () => {
  assert.deepEqual(
    normalizeNpmPublishDryRun({ [dryRun.name]: dryRun }),
    dryRun,
  );
  assert.throws(
    () => normalizeNpmPublishDryRun({ first: dryRun, second: dryRun }),
    /exactly one/,
  );
  assert.throws(
    () => normalizeNpmPublishDryRun({ wrong: dryRun }),
    /key disagrees/,
  );
});
test("owlapi bootstrap contract refuses an existing coordinate or accepted tag", () => {
  const facts = {
    canonicalTagExists: false,
    registryVersion: null,
    retainedSha256: "a".repeat(64),
  };
  assert.equal(
    assertRegistryBootstrapState(facts).action,
    "DIRECT_BOOTSTRAP_READY",
  );
  assert.throws(
    () => assertRegistryBootstrapState({ ...facts, canonicalTagExists: true }),
    /already public or otherwise unavailable/,
  );
  assert.throws(
    () =>
      assertRegistryBootstrapState({
        ...facts,
        registryVersion: { tarballSha256: "a".repeat(64) },
      }),
    /already public or otherwise unavailable/,
  );
  assert.throws(
    () =>
      assertRegistryBootstrapState({
        ...facts,
        registryVersion: { tarballSha256: "b".repeat(64) },
      }),
    /do not match/,
  );
});
