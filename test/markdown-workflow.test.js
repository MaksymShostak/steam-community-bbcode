// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse } from "yaml";

test("trusted Markdown caller uses an immutable producer and separate trusted/candidate identities", () => {
  const workflow = parse(
    readFileSync(
      new URL("../.github/workflows/markdown-quality.yml", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(Object.keys(workflow.on), ["workflow_dispatch"]);
  assert.deepEqual(workflow.permissions, {});
  assert.deepEqual(Object.keys(workflow.jobs), ["markdown"]);
  const job = workflow.jobs.markdown;
  assert.deepEqual(Object.keys(job).sort(), ["permissions", "uses", "with"]);
  assert.deepEqual(job.permissions, { contents: "read" });
  assert.equal(
    job.uses,
    "Hadden-Industries/markdown-quality/.github/workflows/markdown-quality.yml@47febbe1b6f3282814e77db7ea13eac72b4928ed",
  );
  assert.deepEqual(job.with, {
    "trusted-repository": "MaksymShostak/steam-community-bbcode",
    "trusted-sha": "${{ inputs.trusted_sha }}",
    "candidate-repository": "${{ inputs.candidate_repository }}",
    "candidate-sha": "${{ inputs.candidate_sha }}",
    profile: ".markdown-quality-execution.json",
  });
  for (const name of ["trusted_sha", "candidate_repository", "candidate_sha"]) {
    assert.equal(workflow.on.workflow_dispatch.inputs[name].required, true);
    assert.equal(workflow.on.workflow_dispatch.inputs[name].type, "string");
  }
});
