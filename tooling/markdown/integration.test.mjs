// SPDX-License-Identifier: AGPL-3.0-only
// Consumer probes exercise the installed public contracts with Steam Community BBCode's policy.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  readFileSync,
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";
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

test("the root policy selects authored anchors and explains operational exclusions", async () => {
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

test("consumer check commands retain fresh reports, stderr and exact native exits", (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "steam-markdown-reports-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  mkdirSync(join(fixture, "tooling/markdown"), { recursive: true });
  for (const path of [
    ".markdown-quality.json",
    ".markdown-quality-execution.json",
    ".node-version",
    ".python-version",
    "tooling/markdown/package.json",
    "tooling/markdown/package-lock.json",
  ])
    copyFileSync(join(root, path), join(fixture, path));
  symlinkSync(
    join(tooling, "node_modules"),
    join(fixture, "tooling/markdown/node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "Run through npm run test:markdown.");
  const reportPath = join(fixture, "artifacts/prose/check.json");
  const stderrPath = join(fixture, "artifacts/prose/check.stderr.txt");
  mkdirSync(join(fixture, "artifacts/prose"), { recursive: true });
  for (const expected of [0, 1, 2]) {
    writeFileSync(reportPath, "stale report");
    writeFileSync(stderrPath, "stale stderr");
    writeFileSync(
      join(fixture, "README.md"),
      expected === 1
        ? "# Fixture\n\n[Missing](absent.txt).\n"
        : "# Fixture\n\nSafe prose.\n",
    );
    if (expected === 2)
      writeFileSync(join(fixture, ".markdown-quality.json"), "{invalid");
    const completed = spawnSync(
      process.execPath,
      [npmCli, "--prefix", "tooling/markdown", "run", "check"],
      {
        cwd: fixture,
        encoding: "utf8",
        timeout: 30000,
        maxBuffer: 8388608,
        windowsHide: true,
      },
    );
    assert.ifError(completed.error);
    assert.equal(completed.signal, null);
    assert.equal(
      completed.status,
      expected,
      completed.stderr + readFileSync(stderrPath, "utf8"),
    );
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    validateQualityResult(report);
    assert.equal(report.exitCode, expected);
    assert.ok(!readFileSync(stderrPath, "utf8").includes("stale stderr"));
  }
});

test("the retained KaTeX override renders math and rejects inherited trust", () => {
  const mathRequire = createRequire(
    requireMarkdown.resolve("micromark-extension-math"),
  );
  const katex = mathRequire("katex");
  assert.equal(mathRequire("katex/package.json").version, "0.18.2");
  assert.ok(katex.renderToString("x^2").includes("katex"));
  const options = Object.create({ trust: true });
  options.throwOnError = false;
  const html = katex.renderToString(
    "\\href{javascript:alert(1)}{click}",
    options,
  );
  assert.ok(!html.includes('<a href="javascript:'));
  assert.ok(html.includes("<mtext>\\href</mtext>"));
  assert.ok(
    katex
      .renderToString("\\href{https://example.com}{click}", { trust: true })
      .includes('<a href="https://example.com"'),
  );
});
