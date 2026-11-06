// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, "Run through npm run test:markdown.");
const scripts = JSON.parse(
  readFileSync(join(repository, "package.json"), "utf8"),
).scripts;

function npm(args, root = repository) {
  const child = spawnSync(process.execPath, [npmCli, "--silent", ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 8 * 1024 * 1024,
    windowsHide: true,
  });
  assert.ifError(child.error);
  assert.equal(child.signal, null, child.stderr);
  return child;
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "steam-markdown-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const path of [
    ".markdown-quality.json",
    ".markdown-quality-execution.json",
  ])
    copyFileSync(join(repository, path), join(root, path));
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({
      private: true,
      scripts: {
        "check:markdown": scripts["check:markdown"],
        "format:markdown": scripts["format:markdown"],
      },
    }),
  );
  symlinkSync(
    join(repository, "node_modules"),
    join(root, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  return root;
}

test("root selection includes authored Markdown and independently excludes historical records", () => {
  const git = spawnSync("git", ["ls-files", "-z", "--", "*.md"], {
    cwd: repository,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.ifError(git.error);
  assert.equal(git.status, 0, git.stderr);
  const tracked = git.stdout.split("\0").filter(Boolean).sort();
  const historical = tracked.filter((path) =>
    /^docs\/(?:plans|migration)\//u.test(path),
  );
  assert.ok(historical.length > 0);
  const child = npm(["run", "inspect:markdown"]);
  assert.equal(child.status, 0, child.stderr);
  const selection = JSON.parse(child.stdout).selection;
  assert.deepEqual(
    selection.files.filter((path) => tracked.includes(path)).sort(),
    tracked.filter((path) => !historical.includes(path)),
  );
  for (const path of historical) {
    assert.ok(!selection.files.includes(path), path);
    assert.ok(
      selection.omissions.some(
        (item) => item.path === path && item.reason === "excluded",
      ),
      path,
    );
  }
});

test("root check and format preserve Steam literals and historical source bytes", (t) => {
  const root = fixture(t);
  const path = join(root, "README.md");
  const literal =
    "```bbcode\n[b]Literal[/b]  \n[url=https://example.com]Link[/url]\n```\n";
  const original = Buffer.from(`#   Steam guide\n\n${literal}`);
  const historical = Buffer.from("#   Historical record\n");
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  const retained = join(root, "docs/plans/retained.md");
  writeFileSync(retained, historical);
  writeFileSync(path, original);
  const check = npm(["run", "check:markdown"], root);
  assert.equal(check.status, 1, check.stderr);
  assert.deepEqual(readFileSync(path), original);
  assert.deepEqual(readFileSync(retained), historical);
  const format = npm(["run", "format:markdown"], root);
  assert.equal(format.status, 0, format.stderr);
  assert.equal(readFileSync(path, "utf8"), `# Steam guide\n\n${literal}`);
  assert.deepEqual(readFileSync(retained), historical);
  assert.equal(npm(["run", "check:markdown"], root).status, 0);
});

test("root check propagates native success, quality failure and configuration failure", (t) => {
  const root = fixture(t);
  const path = join(root, "README.md");
  for (const [content, expected] of [
    ["# Steam guide\n\nA clear sentence.\n", 0],
    ["# Steam guide\n\n[Missing target](absent.md).\n", 1],
    ["# Steam guide\n", 2],
  ]) {
    writeFileSync(path, content);
    if (expected === 2)
      writeFileSync(join(root, ".markdown-quality.json"), "{invalid");
    const child = npm(["run", "check:markdown"], root);
    assert.equal(child.status, expected, child.stderr);
    assert.equal(readFileSync(path, "utf8"), content);
  }
});
