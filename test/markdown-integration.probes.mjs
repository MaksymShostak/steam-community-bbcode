// SPDX-License-Identifier: AGPL-3.0-only
// Consumer probes use the root-installed public contracts and Steam Community BBCode scope.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const sdkUrl = import.meta.resolve("@hadden-industries/markdown-quality");
const metadataPath = fileURLToPath(new URL("../package.json", sdkUrl));
const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const cli = resolve(dirname(metadataPath), metadata.bin["markdown-quality"]);
const { inspectSelection, processLogicalDocument, validateQualityResult } =
  await import(sdkUrl);

function validate(report, expected = {}) {
  assert.equal(
    report.schemaVersion,
    5,
    "Steam Community BBCode requires result schema 5",
  );
  validateQualityResult(report, expected);
  return report;
}

function fixture(t) {
  const path = mkdtempSync(join(tmpdir(), "steam-bbcode-markdown-consumer-"));
  t.after(() => {
    assert.equal(dirname(path), resolve(tmpdir()));
    assert.ok(
      path.startsWith(join(tmpdir(), "steam-bbcode-markdown-consumer-")),
    );
    rmSync(path, { recursive: true, force: true });
  });
  return path;
}

function native(args, options = {}) {
  const child = spawnSync(process.execPath, [cli, ...args], {
    cwd: repository,
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  });
  assert.ifError(child.error);
  assert.equal(child.signal, null, child.stderr);
  return child;
}

function result(root, mode, args = [], options = {}) {
  const child = native([mode, "--root", root, "--json", ...args], options);
  assert.equal(child.stderr, "", "JSON emits one complete stdout report");
  const report = validate(JSON.parse(child.stdout), {
    operation: mode,
    exitCode: child.status,
  });
  return { ...child, report };
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
function treeHashes(root, prefix = "") {
  return readdirSync(join(root, prefix), { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return treeHashes(root, path);
      assert.ok(entry.isFile(), "Fixtures contain only ordinary files");
      return [[path, sha256(readFileSync(join(root, path)))]];
    });
}

test("root policy selects authored anchors and reconciles retained Markdown", async () => {
  const git = spawnSync("git", ["ls-files", "-z", "--", "*.md"], {
    cwd: repository,
    encoding: "utf8",
  });
  assert.ifError(git.error);
  assert.equal(git.status, 0, git.stderr);
  const tracked = git.stdout.split("\0").filter(Boolean).sort();
  const report = validate(
    await inspectSelection({
      root: repository,
      reconciliationInventory: "git",
    }),
    { operation: "inspect", exitCode: 0 },
  );
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
  assert.deepEqual(
    report.selection.reconciliationDecisions.map(({ path }) => path).sort(),
    tracked,
  );
  const omitted = report.selection.omissions
    .filter(
      ({ reason, path }) => reason === "excluded" && tracked.includes(path),
    )
    .map(({ path }) => path)
    .sort();
  assert.deepEqual(
    report.selection.files.filter((path) => tracked.includes(path)).sort(),
    tracked.filter((path) => !omitted.includes(path)),
  );
});

test("public logical formatting preserves Steam literals at the authored fixture path", async () => {
  const path = "test/fixtures/steamify/README.md";
  const original = readFileSync(join(repository, path));
  const literal =
    "```bbcode\n[b]Literal[/b]  \n[url=https://example.com]Link[/url]\n```\n";
  const content = Buffer.from(
    `# Fixture\n\nFirst sentence. Second sentence.\n\n${literal}`,
  );
  const formatted = validate(
    await processLogicalDocument({
      root: repository,
      path,
      requestId: "steam-literal",
      content,
    }),
    { requestId: "steam-literal", exitCode: 0 },
  );
  const bytes = Buffer.from(formatted.document.contentBase64, "base64");
  assert.ok(bytes.toString("utf8").includes(literal));
  const repeated = validate(
    await processLogicalDocument({
      root: repository,
      path,
      requestId: "steam-convergence",
      content: bytes,
    }),
    { requestId: "steam-convergence", exitCode: 0 },
  );
  assert.equal(
    repeated.document.contentBase64,
    formatted.document.contentBase64,
  );
  assert.deepEqual(formatted.writtenPaths, []);
  assert.deepEqual(repeated.writtenPaths, []);
  assert.deepEqual(readFileSync(join(repository, path)), original);
});

test("root npm check emits complete stdout JSON and preserves native exits", (t) => {
  const root = fixture(t);
  const npmCli = process.env.npm_execpath;
  assert.ok(npmCli, "Run through npm run test:markdown.");
  const scripts = JSON.parse(
    readFileSync(join(repository, "package.json"), "utf8"),
  ).scripts;
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({
      private: true,
      scripts: { "check:markdown": scripts["check:markdown"] },
    }),
  );
  symlinkSync(
    join(repository, "node_modules"),
    join(root, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  for (const expected of [0, 1, 2]) {
    writeFileSync(
      join(root, "README.md"),
      expected === 1
        ? "# Fixture\n\n[Missing target](absent.txt).\n"
        : "# Fixture\n\nSafe prose.\n",
    );
    if (expected === 2)
      writeFileSync(join(root, ".markdown-quality.json"), "{invalid");
    const child = spawnSync(
      process.execPath,
      [npmCli, "--silent", "run", "check:markdown", "--", "--json"],
      {
        cwd: root,
        encoding: "utf8",
        timeout: 60000,
        maxBuffer: 8 * 1024 * 1024,
        windowsHide: true,
      },
    );
    assert.ifError(child.error);
    assert.equal(child.signal, null, child.stderr);
    assert.equal(child.status, expected, child.stderr);
    const report = validate(JSON.parse(child.stdout), {
      operation: "check",
      exitCode: expected,
    });
    assert.equal(report.exitCode, expected);
    assert.equal(child.stderr, "");
    assert.deepEqual(report.writtenPaths, []);
  }
});

test("installed check finds missing links despite inert ignore files and lifecycle scripts", (t) => {
  const root = fixture(t);
  writeFileSync(
    join(root, "README.md"),
    "# Consumer\n\n[Missing target](missing-target.md)\n",
  );
  writeFileSync(join(root, ".gitignore"), "**/*.md\n");
  writeFileSync(join(root, ".prettierignore"), "**/*.md\n");
  writeFileSync(
    join(root, "package.json"),
    JSON.stringify({ scripts: { preinstall: "node marker.mjs" } }),
  );
  writeFileSync(
    join(root, "marker.mjs"),
    'import { writeFileSync } from "node:fs"; writeFileSync("executed", "unsafe");\n',
  );
  const before = treeHashes(root);
  const checked = result(root, "check");
  assert.equal(checked.status, 1);
  assert.equal(checked.report.operationStatus, "completed");
  assert.equal(checked.report.qualityStatus, "findings");
  assert.deepEqual(checked.report.selection.files, ["README.md"]);
  assert.ok(
    checked.report.diagnostics.some(
      ({ source, rule, path, line, severity }) =>
        source === "links" &&
        rule === "local-target" &&
        path === "README.md" &&
        line === 3 &&
        severity === "error",
    ),
    JSON.stringify(checked.report.diagnostics),
  );
  assert.deepEqual(checked.report.errors, []);
  assert.deepEqual(checked.report.writtenPaths, []);
  const quiet = native(["check", "--root", root, "--quiet"]);
  assert.equal(quiet.status, 1);
  assert.equal(quiet.stdout, "");
  assert.match(quiet.stderr, /local-target|missing/i);
  assert.deepEqual(treeHashes(root), before);
  writeFileSync(join(root, "missing-target.md"), "# Target\n");
  assert.equal(result(root, "check").status, 0);
});

test("physical repair requires one mode and applies exactly the previewed bytes", (t) => {
  const root = fixture(t);
  const path = join(root, "README.md");
  const original = Buffer.from("#   Consumer\r\n");
  const expected = Buffer.from("# Consumer\n");
  writeFileSync(path, original);
  const before = treeHashes(root);
  for (const flags of [[], ["--write", "--dry-run"]]) {
    const refused = result(root, "format", flags);
    assert.equal(refused.status, 2);
    assert.deepEqual(refused.report.writtenPaths, []);
    assert.deepEqual(treeHashes(root), before);
  }
  const preview = result(root, "format", ["--dry-run"]);
  assert.equal(preview.status, 0);
  assert.equal(preview.report.operationStatus, "previewed");
  assert.equal(preview.report.qualityBasis, "candidate");
  assert.deepEqual(preview.report.writtenPaths, []);
  assert.deepEqual(treeHashes(root), before);
  assert.deepEqual(preview.report.documentResults[0].candidate, {
    inputSha256: sha256(original),
    inputBytes: original.length,
    outputSha256: sha256(expected),
    outputBytes: expected.length,
    changed: true,
  });
  const applied = result(root, "format", ["--write"]);
  assert.equal(applied.status, 0);
  assert.deepEqual(applied.report.writtenPaths, ["README.md"]);
  assert.deepEqual(readFileSync(path), expected);
  assert.deepEqual(
    applied.report.documentResults[0].candidate,
    preview.report.documentResults[0].candidate,
  );
  const second = result(root, "format", ["--write"]);
  assert.equal(second.status, 0);
  assert.deepEqual(second.report.writtenPaths, []);
  assert.equal(result(root, "check").report.qualityStatus, "clean");
});

test("literal and empty selections preserve scope from nested cwd", (t) => {
  const root = fixture(t);
  const nested = join(root, "nested");
  mkdirSync(nested);
  writeFileSync(join(root, "package.json"), "{}");
  const names = ["--quiet.md", "a [draft].md", "space name.md"];
  for (const name of names) writeFileSync(join(root, name), "# Consumer\n");
  const before = treeHashes(root);
  const child = native(["inspect", "--json", "--", ...names], { cwd: nested });
  assert.equal(child.status, 0, child.stderr);
  const report = validate(JSON.parse(child.stdout), { exitCode: 0 });
  assert.equal(resolve(report.root), resolve(root));
  assert.deepEqual(report.selection.files, names);
  for (const flags of [["--files-json", "[]"], ["--"]]) {
    const empty = result(root, "check", flags);
    assert.equal(empty.status, 0);
    assert.deepEqual(empty.report.selection.files, []);
  }
  for (const args of [
    ["--files-json", "{"],
    ["--", "missing.md"],
  ]) {
    assert.equal(result(root, "check", args).status, 2);
  }
  for (const flag of ["--help", "--version"])
    assert.equal(native([flag], { cwd: root }).status, 0);
  assert.deepEqual(treeHashes(root), before);
});

test("logical bytes are authoritative and JSON/base64 never writes checkout data", async (t) => {
  const root = fixture(t);
  writeFileSync(join(root, "README.md"), "# Disk\n");
  const before = treeHashes(root);
  const transformed = result(root, "format", ["--stdin-request"], {
    input: JSON.stringify({
      path: "README.md",
      requestId: "steam-bbcode-buffer",
      contentBase64: Buffer.from("#   Buffer\n").toString("base64"),
    }),
  });
  assert.equal(transformed.status, 0);
  assert.equal(transformed.report.document.requestId, "steam-bbcode-buffer");
  assert.equal(
    Buffer.from(transformed.report.document.contentBase64, "base64").toString(),
    "# Buffer\n",
  );
  const invalid = validate(
    await processLogicalDocument({
      root,
      path: "README.md",
      content: Buffer.from([0xff]),
    }),
    { exitCode: 2 },
  );
  assert.ok(invalid.errors.some(({ code }) => code === "INVALID_UTF8"));
  assert.deepEqual(invalid.writtenPaths, []);
  assert.deepEqual(treeHashes(root), before);
});

test("strict hidden warnings refuse writes and raw stdin preserves physical files", (t) => {
  const root = fixture(t);
  const path = join(root, "README.md");
  writeFileSync(path, "# Disk\n");
  const before = treeHashes(root);
  const rawArgs = [
    "format",
    "--root",
    root,
    "--stdin",
    "--stdin-filepath",
    "README.md",
  ];
  const raw = native(rawArgs, { input: "#   Buffer\n" });
  assert.equal(raw.status, 0, raw.stderr);
  assert.equal(raw.stdout, "# Buffer\n");
  for (const flag of ["--json", "--write", "--dry-run"]) {
    assert.equal(native([...rawArgs, flag], { input: "# Buffer\n" }).status, 2);
  }
  assert.deepEqual(treeHashes(root), before);
  writeFileSync(
    join(root, ".markdown-quality.json"),
    JSON.stringify({
      schemaVersion: 3,
      lint: { "quality/long-prose-line": "warn" },
    }),
  );
  writeFileSync(
    path,
    "# Consumer\n\n" + "Independent prose example ".repeat(10).trim() + ".\n",
  );
  const warningBytes = treeHashes(root);
  const strict = result(root, "format", [
    "--write",
    "--strict",
    "--quiet",
    "--diagnostic-display-level",
    "error",
  ]);
  assert.equal(strict.status, 1);
  assert.equal(strict.report.operationStatus, "refused");
  assert.ok(
    strict.report.diagnostics.some(({ severity }) => severity === "warning"),
  );
  assert.deepEqual(strict.report.writtenPaths, []);
  assert.deepEqual(treeHashes(root), warningBytes);
});
