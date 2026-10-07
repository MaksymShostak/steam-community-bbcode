// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  copyFileSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const cli = join(
  root,
  "tooling/markdown/node_modules/@hadden-industries/markdown-quality/src/cli.js",
);
const requireTool = createRequire(cli);
const Ajv = requireTool("ajv");
const validate = new Ajv({ allErrors: true, strict: true }).compile(
  JSON.parse(
    readFileSync(
      join(
        root,
        "tooling/markdown/node_modules/@hadden-industries/markdown-quality/schemas/result.schema.json",
      ),
      "utf8",
    ),
  ),
);
const policy = JSON.parse(
  readFileSync(join(root, ".markdown-quality.json"), "utf8"),
);

function run(mode, directory, ...args) {
  const result = spawnSync(
    process.execPath,
    [cli, mode, "--root", directory, "--json", ...args],
    {
      encoding: "utf8",
      timeout: 30000,
      windowsHide: true,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  const report = JSON.parse(result.stdout);
  assert.ok(validate(report), JSON.stringify(validate.errors));
  assert.equal(report.exitCode, result.status);
  return report;
}

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "steam-markdown-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(
    join(directory, ".markdown-quality.json"),
    JSON.stringify(policy),
  );
  writeFileSync(join(directory, ".gitignore"), "");
  writeFileSync(join(directory, ".prettierignore"), "");
  return directory;
}

test("full native selection includes every tracked and untracked repository Markdown file", () => {
  const report = run("inspect", root);
  assert.equal(report.exitCode, 0);
  assert.equal(report.selection.mode, "full");
  const files = execFileSync(
    "git",
    [
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "*.md",
    ],
    { cwd: root, encoding: "utf8" },
  )
    .split("\0")
    .filter(Boolean);
  assert.deepEqual(report.selection.files, [...new Set(files)].sort());
  assert.deepEqual(policy.include, ["**/*.md"]);
  assert.deepEqual(policy.exclude, []);
  assert.deepEqual(policy.ignoreFiles, [".gitignore"]);
});

test("manifest, lock and installed core/native tuple match the immutable release", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("package.json", import.meta.url), "utf8"),
  );
  const lock = JSON.parse(
    readFileSync(new URL("package-lock.json", import.meta.url), "utf8"),
  );
  const release = JSON.parse(
    readFileSync(new URL("release.json", import.meta.url), "utf8"),
  );
  assert.equal(
    manifest.devDependencies["@hadden-industries/markdown-quality"],
    release.version,
  );
  assert.equal(
    lock.packages[""].devDependencies["@hadden-industries/markdown-quality"],
    release.version,
  );
  for (const item of release.archives) {
    const record = lock.packages[`node_modules/${item.package}`];
    assert.equal(record.version, release.version);
    assert.equal(record.integrity, item.integrity);
  }
  assert.equal(
    JSON.parse(
      readFileSync(
        join(
          root,
          "tooling/markdown/node_modules/@hadden-industries/markdown-quality/package.json",
        ),
        "utf8",
      ),
    ).version,
    release.version,
  );
  assert.equal(
    requireTool(
      `@hadden-industries/markdown-quality-${process.platform}-${process.arch}/package.json`,
    ).version,
    release.version,
  );
  assert.equal(lock.packages["node_modules/katex"].version, "0.18.2");
});

test("native formatting converges and preserves Steam literals in every repository directory", (t) => {
  const directory = fixture(t);
  const literal =
    "```bbcode\n[b]Literal[/b]  \n[url=https://example.com]Link[/url]\n```\n";
  writeFileSync(
    join(directory, "README.md"),
    `# Fixture\n\nFirst line.  \nSecond line.\n\n${literal}`,
  );
  mkdirSync(join(directory, "docs/reference"), { recursive: true });
  mkdirSync(join(directory, "docs/plans"), { recursive: true });
  const included = [
    "docs/reference/api.md",
    "docs/plans/history.md",
    "docs/conversion-semantics.md",
    "docs/steam-support-matrix.md",
    ".github/pull_request_template.md",
    "tooling/type-coverage/README.md",
    "comparison/README.md",
    "test/fixtures/release/README.md",
  ];
  for (const path of included) {
    mkdirSync(dirname(join(directory, path)), { recursive: true });
    writeFileSync(
      join(directory, path),
      "# Included\n\nFirst sentence. Second sentence.\n",
    );
  }
  writeFileSync(join(directory, ".prettierignore"), "**/*.md\n");
  const original = readFileSync(join(directory, "README.md"), "utf8");
  const before = run("check", directory);
  assert.equal(before.exitCode, 1);
  assert.equal(readFileSync(join(directory, "README.md"), "utf8"), original);
  assert.equal(run("format", directory).exitCode, 0);
  const formatted = readFileSync(join(directory, "README.md"), "utf8");
  assert.ok(formatted.includes(literal));
  assert.ok(formatted.includes("First line.\\\nSecond line."));
  assert.equal(run("check", directory).exitCode, 0);
  assert.equal(run("format", directory).exitCode, 0);
  assert.equal(readFileSync(join(directory, "README.md"), "utf8"), formatted);
  for (const path of included)
    assert.equal(
      readFileSync(join(directory, path), "utf8"),
      "# Included\n\nFirst sentence.\nSecond sentence.\n",
    );
});

test("new Markdown under tooling, hidden, generated, history and fixture directories cannot hide a broken link", (t) => {
  const directory = fixture(t);
  for (const path of [
    "tooling/tool/README.md",
    ".github/new.md",
    "docs/reference/new.md",
    "docs/plans/new.md",
    "test/fixtures/new.md",
  ]) {
    mkdirSync(dirname(join(directory, path)), { recursive: true });
    writeFileSync(join(directory, path), "# Added\n\n[Missing](absent.txt).\n");
    const report = run("check", directory);
    assert.equal(report.exitCode, 1);
    assert.ok(report.selection.files.includes(path));
    assert.ok(
      report.diagnostics.some(
        (item) => item.path === path && item.rule === "local-target",
      ),
    );
  }
});

test("target-only deletion fails a full check and invalid configuration reports exit two", (t) => {
  const directory = fixture(t);
  writeFileSync(
    join(directory, "README.md"),
    "# Fixture\n\n[Local target](target.txt).\n",
  );
  writeFileSync(join(directory, "target.txt"), "target\n");
  assert.equal(run("check", directory).exitCode, 0);
  rmSync(join(directory, "target.txt"));
  const broken = run("check", directory);
  assert.equal(broken.exitCode, 1);
  assert.ok(
    broken.diagnostics.some(
      (item) => item.source === "links" && item.rule === "local-target",
    ),
  );
  const malformed = run("check", directory, "--config", "absent.json");
  assert.equal(malformed.exitCode, 2);
  assert.ok(malformed.errors.length > 0);
});

test("the scoped KaTeX override rejects inherited trust and still renders ordinary math", () => {
  const mathRequire = createRequire(
    requireTool.resolve("micromark-extension-math"),
  );
  const katex = mathRequire("katex");
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

test("a native Git checkout with autocrlf enabled preserves LF policy identity", (t) => {
  const directory = fixture(t);
  writeFileSync(join(directory, ".gitattributes"), "* text=auto eol=lf\n");
  writeFileSync(join(directory, "README.md"), "# Fixture\n\nSafe prose.\n");
  execFileSync("git", ["init", "--quiet", directory]);
  execFileSync("git", ["-C", directory, "add", "."]);
  const checkout = mkdtempSync(join(tmpdir(), "steam-markdown-checkout-"));
  t.after(() => rmSync(checkout, { recursive: true, force: true }));
  execFileSync("git", [
    "-C",
    directory,
    "-c",
    "core.autocrlf=true",
    "checkout-index",
    "--all",
    `--prefix=${checkout.replaceAll("\\", "/")}/`,
  ]);
  assert.deepEqual(
    readFileSync(join(checkout, ".markdown-quality.json")),
    readFileSync(join(directory, ".markdown-quality.json")),
  );
  assert.equal(
    run("check", checkout).configDigest,
    run("check", directory).configDigest,
  );
});

test("the repository launcher persists fresh native reports and exact exits", (t) => {
  const directory = fixture(t);
  mkdirSync(join(directory, "scripts"));
  mkdirSync(join(directory, "tooling/markdown"), { recursive: true });
  copyFileSync(
    join(root, "scripts/run-markdown.mjs"),
    join(directory, "scripts/run-markdown.mjs"),
  );
  symlinkSync(
    join(root, "tooling/markdown/node_modules"),
    join(directory, "tooling/markdown/node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const reportPath = join(directory, "artifacts/prose/check.json");
  function launch(expected) {
    const result = spawnSync(
      process.execPath,
      [join(directory, "scripts/run-markdown.mjs"), "check"],
      { encoding: "utf8", timeout: 30000, windowsHide: true },
    );
    assert.ifError(result.error);
    assert.equal(result.status, expected, result.stderr);
    assert.equal(readFileSync(reportPath, "utf8"), result.stdout);
    const report = JSON.parse(result.stdout);
    assert.ok(validate(report), JSON.stringify(validate.errors));
    assert.equal(report.exitCode, expected);
  }
  writeFileSync(join(directory, "README.md"), "# Fixture\n\nSafe prose.\n");
  launch(0);
  writeFileSync(
    join(directory, "README.md"),
    "# Fixture\n\n[Missing](absent.txt).\n",
  );
  launch(1);
  writeFileSync(join(directory, ".markdown-quality.json"), "{invalid");
  launch(2);
  rmSync(join(directory, "tooling/markdown/node_modules"));
  const missing = spawnSync(
    process.execPath,
    [join(directory, "scripts/run-markdown.mjs"), "check"],
    { encoding: "utf8", timeout: 30000, windowsHide: true },
  );
  assert.ifError(missing.error);
  assert.equal(missing.status, 2);
  assert.equal(readFileSync(reportPath, "utf8"), "");
  assert.ok(
    readFileSync(
      join(directory, "artifacts/prose/check.stderr.txt"),
      "utf8",
    ).includes("MODULE_NOT_FOUND"),
  );
});
