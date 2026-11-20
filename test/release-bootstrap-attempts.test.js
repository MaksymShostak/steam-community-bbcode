// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { verifyBootstrapBuildOrigin } from "../scripts/publication-preflight.js";

/** @type {import('../scripts/release-artifacts.js').ReleaseIdentity} */
const identity = {
  repository: "MaksymShostak/steam-community-bbcode",
  repositoryId: "1",
  ref: "refs/heads/main",
  workflowRef: "release",
  workflowSha: "a".repeat(40),
  runId: "123",
  runAttempt: "1",
  tag: "next",
  qualification: { runtimeAndMutation: "success", security: "success" },
};

/** @param {number} n @returns {import('../scripts/publication-preflight.js').BootstrapJobs} */
function inventory(n) {
  const build = {
    id: n * 10,
    name: "Qualify the release archive",
    run_id: 123,
    run_attempt: n,
    head_sha: identity.workflowSha,
    status: "completed",
    conclusion: "success",
    runner_id: 7,
    started_at: "2026-11-20T10:00:00Z",
    completed_at: "2026-11-20T10:01:00Z",
  };
  return {
    total_count: 2,
    jobs: [
      build,
      {
        ...build,
        id: n * 10 + 1,
        name: "Publish the qualified archive",
        conclusion: "skipped",
        steps: [],
      },
    ],
  };
}

test("bootstrap accepts the same retained build only when hosted publishing was skipped throughout", () => {
  verifyBootstrapBuildOrigin(identity, 1, inventory);
  verifyBootstrapBuildOrigin(identity, 2, inventory);
  assert.throws(
    () =>
      verifyBootstrapBuildOrigin(
        { ...identity, runAttempt: "2" },
        2,
        inventory,
      ),
    /relabelled/u,
  );
  assert.throws(() =>
    verifyBootstrapBuildOrigin({ ...identity, runAttempt: "3" }, 2, inventory),
  );
  for (const change of [
    "actual write",
    "contradictory skip",
    "truncated",
    "different build",
    "failed build",
    "foreign",
  ]) {
    assert.throws(
      () =>
        verifyBootstrapBuildOrigin(identity, 2, (n) => {
          const result = inventory(n);
          const [build, writer] = result.jobs;
          assert.ok(build && writer);
          if (n === 1 && change === "actual write")
            writer.conclusion = "failure";
          if (n === 1 && change === "contradictory skip")
            writer.steps = [{ status: "completed", conclusion: "failure" }];
          if (n === 1 && change === "truncated") result.total_count++;
          if (n === 2 && change === "different build") build.runner_id++;
          if (n === 2 && change === "failed build")
            build.conclusion = "failure";
          if (n === 1 && change === "foreign") build.head_sha = "b".repeat(40);
          return result;
        }),
      change,
    );
  }
});
