// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { isMap, isScalar, parseDocument } from "yaml";

test("trusted Markdown caller uses an immutable producer and separate trusted/candidate identities", () => {
  const workflow = parseDocument(
    readFileSync(
      new URL("../.github/workflows/markdown-quality.yml", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(workflow.errors, []);
  /** @type {[string[], string[]][]} */
  const keyCases = [
    [["on"], ["workflow_dispatch"]],
    [["jobs"], ["markdown"]],
    [
      ["jobs", "markdown"],
      ["permissions", "uses", "with"],
    ],
  ];
  for (const [path, expected] of keyCases) {
    const node = workflow.getIn(path, true);
    assert.ok(isMap(node));
    const keys = node.items.map(({ key }) => {
      assert.ok(isScalar(key));
      return key.value;
    });
    assert.deepEqual(keys.sort(), expected);
  }
  const permissions = workflow.get("permissions", true);
  assert.ok(isMap(permissions));
  assert.deepEqual(permissions.items, []);
  const jobPermissions = workflow.getIn(
    ["jobs", "markdown", "permissions"],
    true,
  );
  assert.ok(isMap(jobPermissions));
  assert.equal(jobPermissions.items.length, 1);
  assert.equal(jobPermissions.get("contents"), "read");
  assert.equal(
    workflow.getIn(["jobs", "markdown", "uses"]),
    "Hadden-Industries/markdown-quality/.github/workflows/markdown-quality.yml@47febbe1b6f3282814e77db7ea13eac72b4928ed",
  );
  const inputs = {
    "trusted-repository": "MaksymShostak/steam-community-bbcode",
    "trusted-sha": "${{ inputs.trusted_sha }}",
    "candidate-repository": "${{ inputs.candidate_repository }}",
    "candidate-sha": "${{ inputs.candidate_sha }}",
    profile: ".markdown-quality-execution.json",
  };
  const withNode = workflow.getIn(["jobs", "markdown", "with"], true);
  assert.ok(isMap(withNode));
  assert.equal(withNode.items.length, Object.keys(inputs).length);
  for (const [name, value] of Object.entries(inputs)) {
    assert.equal(withNode.get(name), value);
  }
  for (const name of ["trusted_sha", "candidate_repository", "candidate_sha"]) {
    assert.equal(
      workflow.getIn(["on", "workflow_dispatch", "inputs", name, "required"]),
      true,
    );
    assert.equal(
      workflow.getIn(["on", "workflow_dispatch", "inputs", name, "type"]),
      "string",
    );
  }
});
