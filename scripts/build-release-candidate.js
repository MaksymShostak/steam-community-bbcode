// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from Hadden-Industries/owlapi scripts/build-release-candidate.mjs
// at 2ac41c94e6630ca47ce110a484ec9af3b0b1f335.
// Changes (2026-09-09): reuse converter consumers and native npm archive parsing;
// retain a small qualification bundle without immutable GitHub-release policy.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  formatSha256Sums,
  readCandidate,
  sha256File,
} from "./release-artifacts.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const npmCli = process.env["npm_execpath"];
assert.ok(npmCli, "Run npm run release:pack.");
const { values } = parseArgs({ options: { output: { type: "string" } } });
const candidates = join(root, "artifacts", "release-candidates");
mkdirSync(candidates, { recursive: true });
const output = values.output
  ? resolve(values.output)
  : mkdtempSync(join(candidates, "candidate-"));
mkdirSync(output, { recursive: true });
assert.equal(
  readdirSync(output).length,
  0,
  "Use an empty candidate output directory to prevent mixing release artifacts.",
);

/** @param {string} executable @param {string[]} args */
function run(executable, args) {
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(
    result.status,
    0,
    result.error?.message ?? result.stdout + result.stderr,
  );
  return result.stdout;
}

console.log(
  run(process.execPath, [
    npmCli,
    "run",
    "test:package",
    "--",
    "--output",
    output,
    "--audit",
  ]),
);
/** @type {{filename: string, integrity: string}} */
const pack = JSON.parse(readFileSync(join(output, "pack-actual.json"), "utf8"));
/** @type {{result: string, productionAudit: string, package: import('./release-artifacts.js').ReleaseCandidate['package']}} */
const consumer = JSON.parse(
  readFileSync(join(output, "consumer-report.json"), "utf8"),
);
assert.equal(consumer.result, "PASS");
assert.equal(consumer.productionAudit, "PASS");
/** @param {string} name */
function requiredEnvironment(name) {
  const value = process.env[name];
  assert.ok(value, `Missing release environment ${name}.`);
  return value;
}
/** @type {import('./release-artifacts.js').ReleaseIdentity | null} */
let release = null;
if (process.env["GITHUB_ACTIONS"] === "true") {
  assert.equal(
    consumer.package.version,
    requiredEnvironment("RELEASE_VERSION"),
  );
  for (const name of [
    "QUALIFICATION_RESULT",
    "CONTROL_RESULT",
    "SECURITY_RESULT",
  ]) {
    assert.equal(
      requiredEnvironment(name),
      "success",
      `Missing successful ${name}.`,
    );
  }
  release = {
    repository: requiredEnvironment("GITHUB_REPOSITORY"),
    repositoryId: requiredEnvironment("GITHUB_REPOSITORY_ID"),
    ref: requiredEnvironment("GITHUB_REF"),
    workflowRef: requiredEnvironment("GITHUB_WORKFLOW_REF"),
    workflowSha: requiredEnvironment("GITHUB_WORKFLOW_SHA"),
    runId: requiredEnvironment("GITHUB_RUN_ID"),
    runAttempt: requiredEnvironment("GITHUB_RUN_ATTEMPT"),
    tag: requiredEnvironment("RELEASE_TAG"),
    qualification: {
      runtimeAndMutation: "success",
      controls: "success",
      security: "success",
    },
  };
  assert.equal(
    run("git", ["rev-parse", "HEAD"]).trim(),
    requiredEnvironment("GITHUB_SHA"),
  );
  assert.equal(
    run("git", ["status", "--porcelain"]).length,
    0,
    "Hosted candidate inputs must be clean.",
  );
}
/** @type {import('./release-artifacts.js').ReleaseCandidate} */
const candidate = {
  schemaVersion: 2,
  package: consumer.package,
  tarball: {
    filename: pack.filename,
    sha256: sha256File(join(output, pack.filename)),
    integrity: pack.integrity,
  },
  source: {
    commit: run("git", ["rev-parse", "HEAD"]).trim(),
    dirty: run("git", ["status", "--porcelain"]).length > 0,
    node: process.version,
    npm: run(process.execPath, [npmCli, "--version"]).trim(),
  },
  checks: { installedConsumers: "PASS", productionAudit: "PASS" },
  release,
};
writeFileSync(
  join(output, "candidate.json"),
  JSON.stringify(candidate, null, 2) + "\n",
);
readCandidate(output);
const entries = readdirSync(output).map((fileName) => ({
  fileName,
  sha256: sha256File(join(output, fileName)),
}));
writeFileSync(join(output, "SHA256SUMS"), formatSha256Sums(entries));
console.log(`Qualified candidate: ${output}`);
console.log(JSON.stringify(candidate, null, 2));
