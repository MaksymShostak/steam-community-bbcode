// SPDX-License-Identifier: AGPL-3.0-only
// Consumer probes exercise the installed public contracts with Steam Community BBCode's policy.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const tooling = join(root, "tooling/markdown");
const requireMarkdown = createRequire(join(tooling, "package.json"));
const entry = requireMarkdown.resolve("@hadden-industries/markdown-quality");
const {
  inspectSelection,
  processDocument,
  readExecutionProfile,
  validateQualityResult,
} = await import(pathToFileURL(entry).href);
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const sourceSha = "47febbe1b6f3282814e77db7ea13eac72b4928ed";

test("installed public contracts bind Steam Community BBCode's retained source and resource policy", () => {
  const workflow = readFileSync(
    join(root, ".github/workflows/markdown-quality.yml"),
    "utf8",
  );
  assert.ok(workflow.includes(`markdown-quality.yml@${sourceSha}`));
  const profile = readExecutionProfile({ root });
  assert.equal(profile.samples, 6);
  assert.equal(profile.checkerMs, 30000);
  assert.equal(profile.windowMs, 180000);
  assert.equal(profile.memoryBytes, 536870912);
  assert.equal(profile.nodeOldSpaceMb, 128);
  assert.equal(profile.limits.workerHeapMb, 128);
  assert.equal(profile.runtimes.node, process.versions.node);
  const lock = json(join(root, profile.toolchain.lockFile));
  const manifest = json(join(tooling, "package.json"));
  const name = "@hadden-industries/markdown-quality";
  assert.equal(
    manifest.devDependencies[name],
    lock.packages[""].devDependencies[name],
  );
  assert.equal(
    lock.packages[`node_modules/${name}`].resolved,
    `file:archives/hadden-industries-markdown-quality-1.0.3.tgz`,
  );
  assert.equal(manifest.devDependencies[name], ">=1.0.3");
  const source = json(join(tooling, "source.json"));
  assert.equal(source.source, sourceSha);
  for (const archive of source.archives) {
    const bytes = readFileSync(join(tooling, "archives", archive.filename));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      archive.sha256,
    );
    const record = Object.values(lock.packages).find(
      (item) => item.resolved === `file:archives/${archive.filename}`,
    );
    assert.ok(record);
    assert.equal(
      record.integrity,
      `sha512-${createHash("sha512").update(bytes).digest("base64")}`,
    );
  }
  // The immutable core digest is the independently qualified source47 archive.
  assert.equal(
    createHash("sha256")
      .update(readFileSync(join(root, profile.toolchain.coreArchive)))
      .digest("hex"),
    "ad51a2ccb721a2b14a05e8c1a61d9a1b7b3276d55a90beadb4c9f33d49702127",
  );
  assert.ok(requireMarkdown.resolve(`${name}/result-schema`));
  assert.ok(requireMarkdown.resolve(`${name}/execution-schema`));
});

test("public logical formatting preserves Steam literals and converges at the real fixture path", async () => {
  const path = "test/fixtures/steamify/README.md";
  const original = readFileSync(join(root, path));
  const literal =
    "```bbcode\n[b]Literal[/b]  \n[url=https://example.com]Link[/url]\n```\n";
  const content = Buffer.from(
    `# Fixture\n\nFirst sentence. Second sentence.\n\n${literal}`,
  );
  const result = await processDocument({
    root,
    path,
    requestId: "steam-literal",
    content,
  });
  validateQualityResult(result, { requestId: "steam-literal" });
  assert.equal(result.exitCode, 0);
  const formatted = Buffer.from(result.document.contentBase64, "base64");
  assert.ok(formatted.toString("utf8").includes(literal));
  const repeated = await processDocument({
    root,
    path,
    requestId: "steam-convergence",
    content: formatted,
  });
  validateQualityResult(repeated, { requestId: "steam-convergence" });
  assert.equal(repeated.exitCode, 0);
  assert.equal(repeated.document.contentBase64, result.document.contentBase64);
  assert.deepEqual(result.written, []);
  assert.deepEqual(readFileSync(join(root, path)), original);
});

test("the root policy selects authored anchors and accounts for retained archives", async () => {
  const report = await inspectSelection({ root });
  validateQualityResult(report);
  assert.equal(report.exitCode, 0);
  for (const path of [
    "AGENTS.md",
    "README.md",
    "SECURITY.md",
    "docs/testing.md",
    "comparison/README.md",
    "test/fixtures/steamify/README.md",
  ]) {
    assert.ok(report.selection.files.includes(path), path);
  }
  for (const path of [
    "artifacts/fixture.md",
    ".sdlc/runtime/fixture.md",
    "coverage/fixture.md",
    "tooling/markdown/node_modules/fixture.md",
  ]) {
    const explicit = await inspectSelection({ root, files: [path] });
    validateQualityResult(explicit);
    assert.equal(explicit.exitCode, 0);
    assert.deepEqual(explicit.selection.files, []);
    assert.equal(explicit.selection.exclusions[0].reason, "excluded");
  }
  assert.equal(
    json(join(root, ".markdown-quality.json")).ignoreFiles,
    undefined,
  );
});
