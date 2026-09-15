// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { parseDocument, isMap, isSeq } from "yaml";

/** @param {string} name */
function readWorkflow(name) {
  const text = readFileSync(
    new URL(`../.github/workflows/${name}.yml`, import.meta.url),
    "utf8",
  );
  const document = parseDocument(text);
  assert.deepEqual(document.errors, []);
  return { text, document };
}

test("actual publication gate accepts exact identity and rejects mismatched inputs", () => {
  const { document } = readWorkflow("steam-community-bbcode-release");
  const jobs = document.get("jobs", true);
  assert.ok(isMap(jobs));
  /** @type {unknown} */
  let command;
  for (const job of jobs.items) {
    assert.ok(isMap(job.value));
    const steps = job.value.get("steps", true);
    if (!isSeq(steps)) continue;
    for (const step of steps.items) {
      assert.ok(isMap(step));
      if (step.get("name") === "Check publication eligibility")
        command = step.get("run");
    }
  }
  assert.equal(typeof command, "string");
  assert.ok(typeof command === "string");
  const directory = mkdtempSync(join(tmpdir(), "bbcode-release-gate-"));
  const sha = "a".repeat(40);
  const repository = "MaksymShostak/steam-community-bbcode";
  const workflowRef = `${repository}/.github/workflows/steam-community-bbcode-release.yml@refs/heads/main`;
  const candidate = {
    schemaVersion: 2,
    package: {
      name: "steam-community-bbcode",
      version: "1.0.0-rc.1",
      license: "AGPL-3.0-only",
      private: false,
    },
    source: { dirty: false, commit: sha },
    checks: { installedConsumers: "PASS", productionAudit: "PASS" },
    release: {
      repository,
      repositoryId: "1234",
      ref: "refs/heads/main",
      workflowRef,
      workflowSha: sha,
      runId: "5678",
      runAttempt: "1",
      tag: "next",
      qualification: {
        runtimeAndMutation: "success",
        security: "success",
      },
    },
  };
  const validEnvironment = {
    GITHUB_REPOSITORY: repository,
    GITHUB_REPOSITORY_ID: "1234",
    GITHUB_REF: "refs/heads/main",
    GITHUB_EVENT_NAME: "workflow_dispatch",
    GITHUB_WORKFLOW_REF: workflowRef,
    GITHUB_WORKFLOW_SHA: sha,
    GITHUB_SHA: sha,
    GITHUB_RUN_ID: "5678",
    GITHUB_RUN_ATTEMPT: "1",
    RELEASE_VERSION: "1.0.0-rc.1",
    RELEASE_TAG: "next",
    CANDIDATE_ARTIFACT_ID: "4321",
  };
  const bash =
    process.platform === "win32"
      ? resolve(
          execFileSync("git", ["--exec-path"], {
            encoding: "utf8",
            windowsHide: true,
          }).trim(),
          "../../../bin/bash.exe",
        )
      : "bash";
  try {
    /** @param {Record<string, unknown>} value @param {Record<string, string>} overrides @param {boolean} accepted */
    function exercise(value, overrides, accepted) {
      /** @type {string} */
      const json = JSON.stringify(value);
      writeFileSync(join(directory, "candidate.json"), json);
      assert.ok(typeof command === "string");
      /** @type {import('node:child_process').SpawnSyncReturns<string>} */
      const result = spawnSync(
        bash,
        ["--noprofile", "--norc", "-eo", "pipefail", "-c", command],
        {
          cwd: directory,
          encoding: "utf8",
          windowsHide: true,
          env: {
            ...process.env,
            ...validEnvironment,
            CANDIDATE_SHA256: createHash("sha256").update(json).digest("hex"),
            ...overrides,
          },
        },
      );
      assert.equal(result.error, undefined);
      assert.equal(
        result.status === 0,
        accepted,
        `${JSON.stringify(overrides)}\n${result.stderr}`,
      );
    }
    exercise(candidate, {}, true);
    for (const [key, value] of Object.entries({
      GITHUB_REPOSITORY: "wrong/repository",
      GITHUB_REPOSITORY_ID: "9876",
      GITHUB_REF: "refs/heads/other",
      GITHUB_EVENT_NAME: "push",
      GITHUB_WORKFLOW_REF: "other.yml@refs/heads/main",
      GITHUB_WORKFLOW_SHA: "b".repeat(40),
      GITHUB_SHA: "c".repeat(40),
      GITHUB_RUN_ID: "8765",
      GITHUB_RUN_ATTEMPT: "2",
      RELEASE_VERSION: "1.0.0-rc.2",
      RELEASE_TAG: "latest",
      CANDIDATE_ARTIFACT_ID: "",
      CANDIDATE_SHA256: "0".repeat(64),
    })) {
      exercise(candidate, { [key]: value }, false);
    }
    exercise(
      { ...candidate, package: { ...candidate.package, private: true } },
      {},
      false,
    );
    exercise(
      {
        ...candidate,
        package: { ...candidate.package, name: "other-package" },
      },
      {},
      false,
    );
    exercise(
      { ...candidate, source: { ...candidate.source, dirty: true } },
      {},
      false,
    );
    exercise(
      { ...candidate, source: { ...candidate.source, commit: "b".repeat(40) } },
      {},
      false,
    );
    for (const key of ["runtimeAndMutation", "security"]) {
      for (const result of ["failure", "skipped", "cancelled", ""]) {
        exercise(
          {
            ...candidate,
            release: {
              ...candidate.release,
              qualification: {
                ...candidate.release.qualification,
                [key]: result,
              },
            },
          },
          {},
          false,
        );
      }
    }
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test("release qualification reuses all same-revision runtime, mutation and security workflows", () => {
  const { document } = readWorkflow("steam-community-bbcode-release");
  assert.equal(
    document.getIn(["jobs", "qualification", "with", "run-mutation"]),
    true,
  );
  /** @type {[string, string][]} */
  const required = [
    ["qualification", "steam-community-bbcode"],
    ["security", "codeql"],
  ];
  for (const [job, file] of required) {
    assert.equal(
      document.getIn(["jobs", job, "uses"]),
      `./.github/workflows/${file}.yml`,
    );
    assert.equal(document.getIn(["jobs", job, "if"]), undefined);
    assert.ok(readWorkflow(file).document.hasIn(["on", "workflow_call"]));
  }
  const needs = document.getIn(["jobs", "candidate", "needs"], true);
  assert.ok(isSeq(needs));
  assert.deepEqual(needs.toJSON(), ["qualification", "security"]);
});

test("release uses root consumers and explicit immutable checkout without privileged project execution", () => {
  const { text, document } = readWorkflow("steam-community-bbcode-release");
  assert.doesNotMatch(text, /tools\/steam-community-bbcode|check:converter/u);
  assert.equal(
    document.getIn(["on", "workflow_dispatch", "inputs", "publish", "default"]),
    false,
  );
  assert.equal(document.getIn(["concurrency", "cancel-in-progress"]), false);
  const jobs = document.get("jobs", true);
  assert.ok(isMap(jobs));
  for (const pair of jobs.items) {
    assert.ok(isMap(pair.value));
    const steps = pair.value.get("steps", true);
    if (!isSeq(steps)) continue;
    for (const step of steps.items) {
      assert.ok(isMap(step));
      const action = step.get("uses");
      if (
        typeof action === "string" &&
        action.startsWith("actions/checkout@")
      ) {
        assert.equal(step.getIn(["with", "ref"]), "${{ github.sha }}");
        assert.equal(step.getIn(["with", "persist-credentials"]), false);
      }
    }
  }
  const publish = document.getIn(["jobs", "publish"], true);
  assert.ok(isMap(publish));
  assert.equal(publish.getIn(["permissions", "id-token"]), "write");
  assert.doesNotMatch(
    publish.toString(),
    /actions\/checkout|npm ci|npm run|node scripts|working-directory: tools/u,
  );
  for (const job of ["publish", "verify_registry"]) {
    const steps = document.getIn(["jobs", job, "steps"], true);
    assert.ok(isSeq(steps));
    const download = steps.items.find(
      (step) =>
        isMap(step) &&
        String(step.get("uses")).startsWith("actions/download-artifact@"),
    );
    assert.ok(isMap(download));
    assert.equal(
      download.getIn(["with", "artifact-ids"]),
      "${{ needs.candidate.outputs.artifact_id }}",
    );
    assert.equal(download.getIn(["with", "digest-mismatch"]), "error");
    assert.equal(download.getIn(["with", "run-id"]), undefined);
    assert.equal(download.getIn(["with", "repository"]), undefined);
  }
});
