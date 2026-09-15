// SPDX-License-Identifier: MIT
// Adapted from the ONI workflow regression; see bbcode-workflow.LICENSE.
import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseDocument, isMap, isSeq, isScalar } from "yaml";

const source = readFileSync(
  new URL("../.github/workflows/steam-community-bbcode.yml", import.meta.url),
  "utf8",
);
const workflow = parseDocument(source);
assert.deepEqual(workflow.errors, []);
const consumers = parseDocument(
  readFileSync(
    new URL("../.github/workflows/node-consumers.yml", import.meta.url),
    "utf8",
  ),
);
const release = parseDocument(
  readFileSync(
    new URL(
      "../.github/workflows/steam-community-bbcode-release.yml",
      import.meta.url,
    ),
    "utf8",
  ),
);
assert.deepEqual(consumers.errors, []);
assert.deepEqual(release.errors, []);

test("consumer minimums and latest releases gate publication of the same candidate", () => {
  const matrix = consumers.getIn(
    ["jobs", "consumer", "strategy", "matrix", "node"],
    true,
  );
  assert.ok(isSeq(matrix));
  assert.deepEqual(matrix.toJSON(), [
    "22.11.0",
    "24.11.0",
    "26.0.0",
    "22.x",
    "24.x",
    "26.x",
  ]);
  assert.equal(
    workflow.getIn(["jobs", "consumers", "needs"]),
    "consumer-archive",
  );
  assert.equal(
    workflow.getIn(["jobs", "consumers", "with", "artifact"]),
    "bbcode-consumer-archive",
  );
  assert.equal(release.getIn(["jobs", "consumers", "needs"]), "candidate");
  assert.equal(
    release.getIn(["jobs", "consumers", "uses"]),
    "./.github/workflows/node-consumers.yml",
  );
  assert.equal(
    release.getIn(["jobs", "consumers", "with", "artifact"]),
    "steam-community-bbcode-candidate",
  );
  const gates = release.getIn(["jobs", "publish", "needs"], true);
  assert.ok(isSeq(gates));
  assert.deepEqual(gates.toJSON(), ["candidate", "consumers"]);
  const steps = consumers.getIn(["jobs", "consumer", "steps"], true);
  assert.ok(isSeq(steps));
  const download = steps.items.find(
    (step) =>
      isMap(step) &&
      String(step.get("uses")).startsWith("actions/download-artifact@"),
  );
  assert.ok(isMap(download));
  assert.equal(download.getIn(["with", "name"]), "${{ inputs.artifact }}");
  assert.equal(download.getIn(["with", "digest-mismatch"]), "error");
  const check = steps.items.find(
    (step) =>
      isMap(step) &&
      step.get("name") === "Check the retained package on the consumer runtime",
  );
  assert.ok(isMap(check));
  assert.match(
    String(check.get("run")),
    /--archive .*--runtime .*--node-types /,
  );
  assert.equal(check.get("if"), undefined);
  assert.equal(check.get("continue-on-error"), undefined);
});
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

/** @param {(string | number)[]} path */
function sequenceValues(path) {
  const node = workflow.getIn(path, true);
  assert.ok(isSeq(node));
  return node.items.map((item) => {
    assert.ok(isScalar(item));
    return item.value;
  });
}

test("short checks gate mutation without tolerating failed prerequisites", () => {
  assert.equal(
    workflow.getIn(["jobs", "converter", "needs"]),
    "dependency-review",
  );
  assert.equal(workflow.getIn(["jobs", "mutation", "needs"]), "converter");
  assert.equal(
    workflow.getIn(["jobs", "mutation", "if"]),
    "${{ inputs.run-mutation == true }}",
  );
  assert.equal(
    workflow.getIn([
      "on",
      "workflow_call",
      "inputs",
      "run-mutation",
      "default",
    ]),
    true,
  );
  assert.equal(
    workflow.getIn([
      "on",
      "workflow_dispatch",
      "inputs",
      "run-mutation",
      "default",
    ]),
    false,
  );
  for (const job of ["dependency-review", "converter"]) {
    assert.equal(workflow.getIn(["jobs", job, "if"]), undefined);
    assert.equal(workflow.getIn(["jobs", job, "continue-on-error"]), undefined);
  }
  assert.deepEqual(
    sequenceValues(["jobs", "mutation", "strategy", "matrix", "profile"]),
    ["library", "cli"],
  );
});

test("aggregate observes every prerequisite even after failure", () => {
  assert.deepEqual(sequenceValues(["jobs", "qualification", "needs"]), [
    "dependency-review",
    "converter",
    "mutation",
    "consumers",
  ]);
  assert.equal(workflow.getIn(["jobs", "qualification", "if"]), "always()");
  assert.equal(
    workflow.getIn(["jobs", "qualification", "steps", 0, "if"]),
    undefined,
  );
  assert.equal(
    workflow.getIn(["jobs", "qualification", "steps", 0, "continue-on-error"]),
    undefined,
  );
  for (const [key, job] of [
    ["DEPENDENCY_REVIEW_RESULT", "dependency-review"],
    ["CHECK_RESULT", "converter"],
    ["CONSUMER_RESULT", "consumers"],
    ["MUTATION_RESULT", "mutation"],
  ]) {
    assert.equal(
      workflow.getIn(["jobs", "qualification", "steps", 0, "env", key]),
      "${{ needs." + job + ".result }}",
    );
  }
});

/** @type {Record<string, string>} */
const success = {
  MUTATION_REQUIRED: "true",
  DEPENDENCY_REVIEW_RESULT: "success",
  CHECK_RESULT: "success",
  CONSUMER_RESULT: "success",
  MUTATION_RESULT: "success",
};
const cases = [
  { name: "all succeed", env: success, status: 0 },
  ...[
    "DEPENDENCY_REVIEW_RESULT",
    "CHECK_RESULT",
    "MUTATION_RESULT",
    "CONSUMER_RESULT",
  ].flatMap((stage) =>
    ["failure", "cancelled", "skipped", ""].map((result) => ({
      name: `${stage} ${result || "absent"}`,
      env: { ...success, [stage]: result },
      status: 1,
    })),
  ),
  {
    name: "iteration permits only an unrequested skip",
    env: { ...success, MUTATION_REQUIRED: "false", MUTATION_RESULT: "skipped" },
    status: 0,
  },
  ...["success", "failure", "cancelled", ""].map((result) => ({
    name: `iteration rejects unexpected mutation ${result || "absence"}`,
    env: { ...success, MUTATION_REQUIRED: "false", MUTATION_RESULT: result },
    status: 1,
  })),
  ...["", "typo"].map((required) => ({
    name: `invalid mutation requirement ${required || "absence"}`,
    env: { ...success, MUTATION_REQUIRED: required },
    status: 1,
  })),
];
for (const scenario of cases) {
  test(`actual Bash aggregate: ${scenario.name}`, () => {
    const command = workflow.getIn([
      "jobs",
      "qualification",
      "steps",
      0,
      "run",
    ]);
    assert.ok(typeof command === "string");
    const result = spawnSync(
      bash,
      ["--noprofile", "--norc", "-eo", "pipefail", "-c", command],
      {
        encoding: "utf8",
        windowsHide: true,
        env: { ...process.env, ...scenario.env },
      },
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, scenario.status);
  });
}

test("qualification preserves the supported runtime matrix and unprivileged actions", () => {
  const declarationLanes = workflow.getIn(
    ["jobs", "converter", "strategy", "matrix", "include"],
    true,
  );
  assert.ok(isSeq(declarationLanes));
  assert.deepEqual(declarationLanes.toJSON(), [
    { node: "22.22.2", nodeTypes: "22" },
    { node: "24.15.0", nodeTypes: "24" },
    { node: "26.0.0", nodeTypes: "26" },
    { node: "22.x", nodeTypes: "22" },
    { node: "24.x", nodeTypes: "24" },
    { node: "26.x", nodeTypes: "26" },
  ]);
  assert.deepEqual(
    sequenceValues(["jobs", "converter", "strategy", "matrix", "os"]),
    ["ubuntu-latest", "windows-latest"],
  );
  assert.deepEqual(
    sequenceValues(["jobs", "converter", "strategy", "matrix", "node"]),
    ["22.22.2", "24.15.0", "26.0.0", "22.x", "24.x", "26.x"],
  );
  assert.equal(workflow.getIn(["permissions", "contents"]), "read");
  assert.doesNotMatch(
    source,
    /id-token:|secrets\.|pull_request_target|continue-on-error:/u,
  );
  const jobs = workflow.get("jobs", true);
  assert.ok(isMap(jobs));
  for (const pair of jobs.items) {
    assert.ok(isMap(pair.value));
    const reusable = pair.value.get("uses");
    if (reusable !== undefined) {
      assert.equal(reusable, "./.github/workflows/node-consumers.yml");
      continue;
    }
    const steps = pair.value.get("steps", true);
    assert.ok(isSeq(steps));
    for (const step of steps.items) {
      assert.ok(isMap(step));
      const action = step.get("uses");
      if (action === undefined) continue;
      assert.ok(typeof action === "string");
      assert.match(action, /@[a-f0-9]{40}$/u);
      if (action.startsWith("actions/checkout@"))
        assert.equal(step.getIn(["with", "persist-credentials"]), false);
    }
  }
});

test("standalone qualification runs root checks and native bootstrap for every development lane without ONI routing", () => {
  assert.doesNotMatch(
    source,
    /tools\/steam-community-bbcode|selectPullRequestChecks|steps\.scope|check:converter/u,
  );
  assert.equal(
    workflow.getIn(["jobs", "qualification", "name"]),
    "BBCode / Qualification",
  );
  assert.equal(workflow.getIn(["on", "pull_request", "paths"]), undefined);
  assert.equal(
    workflow.getIn(["on", "pull_request", "paths-ignore"]),
    undefined,
  );
  assert.equal(workflow.getIn(["on", "push", "paths"]), undefined);
  assert.equal(workflow.getIn(["on", "push", "paths-ignore"]), undefined);
  const steps = workflow.getIn(["jobs", "converter", "steps"], true);
  assert.ok(isSeq(steps));
  const bootstrap = steps.items.find(
    (step) =>
      isMap(step) &&
      step.get("name") === "Exercise standalone development setup",
  );
  assert.ok(isMap(bootstrap));
  assert.equal(bootstrap.get("if"), undefined);
  assert.equal(
    bootstrap.get("run"),
    "npm exec --yes --package=npm@12.0.2 -- npm run setup:development",
  );
  const check = steps.items.find(
    (step) =>
      isMap(step) &&
      step.get("name") === "Check the converter and real packed consumer",
  );
  assert.ok(isMap(check));
  assert.equal(check.get("if"), undefined);
  assert.equal(
    check.get("run"),
    "npm exec --yes --package=npm@12.0.2 -- npm run check",
  );
});

test("dependency review is PR-only while the job remains an unconditional prerequisite", () => {
  const events = workflow.get("on", true);
  assert.ok(isMap(events));
  assert.deepEqual(
    events.items.map((pair) => {
      assert.ok(isScalar(pair.key));
      return pair.key.value;
    }),
    ["pull_request", "push", "workflow_call", "workflow_dispatch"],
  );
  const review = workflow.getIn(["jobs", "dependency-review"], true);
  assert.ok(isMap(review));
  assert.equal(review.get("if"), undefined);
  assert.equal(review.get("needs"), undefined);
  const steps = review.get("steps", true);
  assert.ok(isSeq(steps));
  const check = steps.items.find(
    (step) =>
      isMap(step) && step.get("name") === "Review introduced dependencies",
  );
  assert.ok(isMap(check));
  assert.equal(check.get("if"), "github.event_name == 'pull_request'");
  assert.equal(check.getIn(["with", "fail-on-severity"]), "low");
  assert.equal(
    check.getIn(["with", "fail-on-scopes"]),
    "runtime, development, unknown",
  );
});
