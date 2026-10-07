// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** @typedef {{before?: string, after?: string, ref?: string, forced?: boolean, pull_request?: {base: {sha: string}, head: {sha: string}}}} QualificationEvent */

/** Select only positively proven development documentation; every ambiguity runs package checks.
 * @param {{eventName: string, event: QualificationEvent, head: string, forcePackage?: boolean, cwd?: string}} input
 */
export function selectQualification({
  eventName,
  event,
  head,
  forcePackage = false,
  cwd = process.cwd(),
}) {
  const git = (/** @type {string[]} */ args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    });
  const record = {
    schemaVersion: 1,
    eventName,
    head,
    base: "",
    paths: /** @type {string[]} */ ([]),
    packageRequired: true,
    reason: "explicit-or-unknown-invocation",
  };
  if (forcePackage || !["pull_request", "push"].includes(eventName))
    return record;
  try {
    assert.match(head, /^[a-f0-9]{40}$/u);
    assert.equal(git(["rev-parse", "HEAD"]).trim(), head);
    if (eventName === "pull_request") {
      assert.ok(event.pull_request);
      record.base = event.pull_request.base.sha;
      // The checked-out PR merge must join the event base and exact event head.
      const parents = git(["rev-list", "--parents", "-n", "1", head])
        .trim()
        .split(" ");
      assert.deepEqual(parents, [
        head,
        record.base,
        event.pull_request.head.sha,
      ]);
    } else {
      assert.equal(event.ref, "refs/heads/main");
      assert.equal(event.after, head);
      assert.equal(event.forced, false);
      assert.ok(event.before);
      record.base = event.before;
    }
    assert.match(record.base, /^[a-f0-9]{40}$/u);
    assert.notEqual(record.base, "0".repeat(40));
    git(["merge-base", "--is-ancestor", record.base, head]);
    // Disable rename detection: a rename includes a deletion and cannot enter the exemption.
    let entries = git([
      "diff",
      "--name-status",
      "-z",
      "--no-renames",
      record.base,
      head,
      "--",
    ]).split("\0");
    assert.equal(entries.pop(), "");
    // Include every introduced commit, even when a control change or deletion was later reverted.
    const commits = git(["rev-list", `${record.base}..${head}`])
      .trim()
      .split("\n");
    for (const commit of commits) {
      assert.match(commit, /^[a-f0-9]{40}$/u);
      const changed = git([
        "diff-tree",
        "--no-commit-id",
        "--name-status",
        "-r",
        "-z",
        "--no-renames",
        "-m",
        commit,
        "--",
      ]).split("\0");
      assert.equal(changed.pop(), "");
      entries = entries.concat(changed);
    }
    assert.equal(entries.length % 2, 0);
    assert.ok(entries.length);
    let docsOnly = true;
    for (let index = 0; index < entries.length; index += 2) {
      const status = entries[index];
      const path = entries[index + 1];
      assert.ok(path);
      if (!record.paths.includes(path)) record.paths.push(path);
      const documentation =
        ["CONTRIBUTING.md", "CODE_OF_CONDUCT.md"].includes(path) ||
        /^docs\/(?:plans|migration)\/.+\.md$/u.test(path);
      const control = /(?:^|\/)(?:AGENTS|CLAUDE)\.md$/u.test(path);
      if (!status || !["A", "M"].includes(status) || !documentation || control)
        docsOnly = false;
    }
    record.packageRequired = !docsOnly;
    record.reason = docsOnly
      ? "proven-development-documentation"
      : "package-or-ambiguous-paths";
  } catch {
    record.packageRequired = true;
    record.reason = "comparison-unavailable-or-ambiguous";
  }
  return record;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  /** @type {QualificationEvent} */
  const event = JSON.parse(
    readFileSync(process.env["GITHUB_EVENT_PATH"] ?? "", "utf8"),
  );
  // Reusable workflows inherit the caller's event. A different root workflow is explicit qualification even on a PR.
  const rootWorkflow = `${process.env["GITHUB_REPOSITORY"]}/.github/workflows/steam-community-bbcode.yml@`;
  const explicit =
    !process.env["GITHUB_WORKFLOW_REF"]?.startsWith(rootWorkflow);
  const record = selectQualification({
    eventName: process.env["GITHUB_EVENT_NAME"] ?? "",
    event,
    head: process.env["GITHUB_SHA"] ?? "",
    forcePackage: explicit || process.env["FORCE_PACKAGE"] === "true",
  });
  const output = resolve("artifacts/ci-selection/selection.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(record, null, 2) + "\n");
  console.log(JSON.stringify(record, null, 2));
  if (process.env["GITHUB_OUTPUT"])
    appendFileSync(
      process.env["GITHUB_OUTPUT"],
      `package-required=${record.packageRequired}\n`,
    );
}
