// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { assertExpectedProvenanceClaims } from "../scripts/release-artifacts.js";

/** @type {import('../scripts/release-artifacts.js').ReleaseCandidate} */
const candidate = {
  schemaVersion: 2,
  package: {
    name: "steam-community-bbcode",
    version: "1.0.0-rc.1",
    license: "AGPL-3.0-only",
    private: false,
  },
  tarball: {
    filename: "steam-community-bbcode-1.0.0-rc.1.tgz",
    sha256: "",
    integrity: `sha512-${Buffer.alloc(64, 1).toString("base64")}`,
  },
  source: {
    commit: "a".repeat(40),
    dirty: false,
    node: "v24.20.0",
    npm: "12.0.2",
  },
  checks: { installedConsumers: "PASS", productionAudit: "PASS" },
  release: {
    repository: "MaksymShostak/steam-community-bbcode",
    repositoryId: "1234",
    ref: "refs/heads/main",
    workflowRef:
      "MaksymShostak/steam-community-bbcode/.github/workflows/steam-community-bbcode-release.yml@refs/heads/main",
    workflowSha: "a".repeat(40),
    runId: "5678",
    runAttempt: "1",
    tag: "next",
    qualification: {
      runtimeAndMutation: "success",
      security: "success",
    },
  },
};

test("successful native signature audit without target provenance cannot qualify a release", () => {
  assert.throws(
    () =>
      assertExpectedProvenanceClaims(candidate, {
        invalid: [],
        missing: [],
        verified: [],
      }),
    /provenance/u,
  );
});

// Native npm 12.0.2 libnpmpublish/provenance.js GitHub SLSA v1 shape;
// pacote/lib/registry.js exposes the verified original {predicateType, bundle} array.
// These are identity fixtures, not a replacement for npm's cryptographic tests.
const statement = {
  _type: "https://in-toto.io/Statement/v1",
  predicateType: "https://slsa.dev/provenance/v1",
  subject: [
    {
      name: "pkg:npm/steam-community-bbcode@1.0.0-rc.1",
      digest: { sha512: "01".repeat(64) },
    },
  ],
  predicate: {
    buildDefinition: {
      buildType:
        "https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1",
      externalParameters: {
        workflow: {
          repository: "https://github.com/MaksymShostak/steam-community-bbcode",
          path: ".github/workflows/steam-community-bbcode-release.yml",
          ref: "refs/heads/main",
        },
      },
      internalParameters: {
        github: {
          event_name: "workflow_dispatch",
          repository_id: "1234",
          repository_owner_id: "6131830",
        },
      },
      resolvedDependencies: [
        {
          uri: "git+https://github.com/MaksymShostak/steam-community-bbcode@refs/heads/main",
          digest: { gitCommit: "a".repeat(40) },
        },
      ],
    },
    runDetails: {
      builder: { id: "https://github.com/actions/runner/github-hosted" },
      metadata: {
        invocationId:
          "https://github.com/MaksymShostak/steam-community-bbcode/actions/runs/5678/attempts/1",
      },
    },
  },
};
/** @param {unknown} payload */
function nativeAudit(payload) {
  return {
    invalid: [],
    missing: [],
    verified: [
      {
        name: "steam-community-bbcode",
        version: "1.0.0-rc.1",
        registry: "https://registry.npmjs.org/",
        attestationBundles: [
          {
            predicateType: "https://slsa.dev/provenance/v1",
            bundle: {
              dsseEnvelope: {
                payloadType: "application/vnd.in-toto+json",
                payload: Buffer.from(JSON.stringify(payload)).toString(
                  "base64",
                ),
              },
            },
          },
        ],
      },
    ],
  };
}

test("expected identity accepts native npm verified provenance for the exact source, archive and run", () => {
  assertExpectedProvenanceClaims(candidate, nativeAudit(statement));
});

test("expected identity rejects a validly signed but different source, workflow, run or archive", () => {
  /** @type {((value: typeof statement) => void)[]} */
  const mutations = [
    (value) => {
      value.predicate.buildDefinition.externalParameters.workflow.repository =
        "https://github.com/other/repository";
    },
    (value) => {
      value.predicate.buildDefinition.externalParameters.workflow.path =
        ".github/workflows/other.yml";
    },
    (value) => {
      value.predicate.buildDefinition.externalParameters.workflow.ref =
        "refs/heads/other";
    },
    (value) => {
      value.predicate.buildDefinition.resolvedDependencies = [
        {
          uri: "git+https://github.com/MaksymShostak/steam-community-bbcode@refs/heads/main",
          digest: { gitCommit: "b".repeat(40) },
        },
      ];
    },
    (value) => {
      value.predicate.buildDefinition.internalParameters.github.repository_id =
        "9999";
    },
    (value) => {
      value.predicate.buildDefinition.internalParameters.github.event_name =
        "push";
    },
    (value) => {
      value.predicate.runDetails.metadata.invocationId += "0";
    },
    (value) => {
      value.predicate.runDetails.builder.id =
        "https://github.com/actions/runner/self-hosted";
    },
    (value) => {
      value.subject = [
        {
          name: "pkg:npm/other-package@1.0.0",
          digest: { sha512: "01".repeat(64) },
        },
      ];
    },
    (value) => {
      value.subject = [
        {
          name: "pkg:npm/steam-community-bbcode@1.0.0-rc.1",
          digest: { sha512: "02".repeat(64) },
        },
      ];
    },
  ];
  for (const mutate of mutations) {
    const changed = structuredClone(statement);
    mutate(changed);
    assert.throws(() =>
      assertExpectedProvenanceClaims(candidate, nativeAudit(changed)),
    );
  }
  assert.throws(
    () =>
      assertExpectedProvenanceClaims(
        { ...candidate, release: null },
        nativeAudit(statement),
      ),
    /hosted candidate/u,
  );
});
