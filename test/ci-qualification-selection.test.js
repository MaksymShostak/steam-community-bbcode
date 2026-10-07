// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { selectQualification } from "../scripts/select-ci-qualification.js";

test("native Git selection skips only proven docs and fails closed across real comparisons", () => {
  const cwd = mkdtempSync(join(tmpdir(), "bbcode-selection-"));
  const git = (/** @type {string[]} */ args) =>
    execFileSync("git", args, { cwd, encoding: "utf8", windowsHide: true });
  const put = (/** @type {string} */ name) => {
    mkdirSync(dirname(join(cwd, name)), { recursive: true });
    writeFileSync(join(cwd, name), "fixture\n");
  };
  const commit = () => {
    git(["add", "."]);
    git([
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "-qm",
      "fixture",
    ]);
    return git(["rev-parse", "HEAD"]).trim();
  };
  try {
    git(["init", "-q", "-b", "main"]);
    put("package.json");
    const base = commit();
    put("docs/plans/Unicode-ț-warning.md");
    const head = commit();
    const event = {
      before: base,
      after: head,
      ref: "refs/heads/main",
      forced: false,
    };
    const select = (
      /** @type {Partial<Parameters<typeof selectQualification>[0]>} */ overrides = {},
    ) =>
      selectQualification({
        cwd,
        eventName: "push",
        event,
        head,
        ...overrides,
      });
    assert.equal(select().packageRequired, false);
    assert.deepEqual(select().paths, ["docs/plans/Unicode-ț-warning.md"]);
    assert.equal(
      select({ eventName: "workflow_dispatch" }).packageRequired,
      true,
    );
    assert.equal(select({ forcePackage: true }).packageRequired, true);
    assert.equal(
      select({ event: { ...event, forced: true } }).packageRequired,
      true,
    );
    assert.equal(
      select({ event: { ...event, before: "0".repeat(40) } }).packageRequired,
      true,
    );
    assert.equal(
      select({ event: { ...event, before: head } }).packageRequired,
      true,
    );
    put("README.md");
    const mixed = commit();
    assert.equal(
      select({ head: mixed, event: { ...event, after: mixed } })
        .packageRequired,
      true,
    );
    unlinkSync(join(cwd, "README.md"));
    const reverted = commit();
    // A docs-only final diff cannot hide a shipped-file change introduced and reverted in the push.
    assert.deepEqual(
      git(["diff", "--name-only", "-z", base, reverted]).split("\0"),
      ["docs/plans/Unicode-ț-warning.md", ""],
    );
    assert.equal(
      select({ head: reverted, event: { ...event, after: reverted } })
        .packageRequired,
      true,
    );
    renameSync(
      join(cwd, "docs/plans/Unicode-ț-warning.md"),
      join(cwd, "docs/plans/renamed.md"),
    );
    const renamed = commit();
    assert.equal(
      select({
        head: renamed,
        event: { ...event, after: renamed, before: head },
      }).packageRequired,
      true,
    );
    put("docs/plans/AGENTS.md");
    const control = commit();
    assert.equal(
      select({
        head: control,
        event: { ...event, before: renamed, after: control },
      }).packageRequired,
      true,
    );
    git(["checkout", "-qb", "docs"]);
    put("CONTRIBUTING.md");
    const prHead = commit();
    git(["checkout", "main"]);
    git([
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "merge",
      "--no-ff",
      "-qm",
      "merge",
      "docs",
    ]);
    const merge = git(["rev-parse", "HEAD"]).trim();
    assert.equal(
      select({
        eventName: "pull_request",
        head: merge,
        event: {
          pull_request: { base: { sha: control }, head: { sha: prHead } },
        },
      }).packageRequired,
      false,
    );
    assert.equal(
      select({
        eventName: "pull_request",
        head: merge,
        event: {
          pull_request: { base: { sha: control }, head: { sha: base } },
        },
      }).packageRequired,
      true,
    );
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
