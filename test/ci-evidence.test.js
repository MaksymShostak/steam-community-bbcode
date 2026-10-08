// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import {
  collectEvidence,
  reportEvidence,
} from "../scripts/report-ci-evidence.js";

test("hostile diagnostic text stays data, full logs survive summary limits and commands resume after errors", () => {
  const hostile =
    "::error::forged\n::set-env name=TOKEN::stolen\n::fake-token::\n<script>evil</script>\n`$(echo injected)`\n";
  let log = "";
  let summary = "";
  const files = [
    {
      path: "<script>path</script>\n::warning::path",
      bytes: Buffer.from(hostile.repeat(1000)),
    },
    ...Array.from({ length: 1000 }, (/** @type {unknown} */ _, index) => ({
      path: `file-${index}-` + "x".repeat(300),
      bytes: Buffer.from(`record-${index}`),
    })),
  ];
  reportEvidence(files, {
    mode: "fixture",
    env: {
      GITHUB_SHA: "a".repeat(40),
      GITHUB_RUN_ID: "42",
      GITHUB_RUN_ATTEMPT: "2",
      EVIDENCE_OUTCOME: "failure",
    },
    write: (text) => {
      log += text;
    },
    summary: (text) => {
      summary += text;
    },
  });
  const token = (log.split("\n")[0] ?? "").slice("::stop-commands::".length);
  assert.match(token, /^bbcode-[a-f0-9]{64}$/u);
  assert.ok(log.includes(hostile.repeat(1000)));
  assert.ok(log.includes("record-999"));
  assert.ok(log.endsWith(`\n::${token}::\n`));
  assert.ok(Buffer.byteLength(summary) < 65 * 1024);
  assert.doesNotMatch(summary, /<script\b|::set-env/iu);
  assert.match(summary, /&lt;script&gt;path/u);
  assert.match(summary, /1001 complete files/u);
  const lines = /** @type {string[]} */ ([]);
  assert.throws(
    () =>
      reportEvidence(files.slice(0, 1), {
        mode: "fixture",
        write: (text) => {
          lines.push(text);
          if (text.startsWith("Evidence identity:"))
            throw new Error("sink failed");
        },
        summary: () =>
          assert.fail("summary cannot report success after failed streaming"),
      }),
    /sink failed/u,
  );
  assert.match(lines.at(-1) ?? "", /\n::bbcode-[a-f0-9]{64}::\n/u);
});

test("summary paths and identity fields escape HTML regardless of tag casing or syntax", () => {
  for (const [source, escaped] of [
    ["<SCRIPT>evil</SCRIPT>", "&lt;SCRIPT&gt;evil&lt;/SCRIPT&gt;"],
    [
      '<ScRiPt src="x">evil</sCrIpT ignored>',
      "&lt;ScRiPt src=&quot;x&quot;&gt;evil&lt;/sCrIpT ignored&gt;",
    ],
    ["<script\tonload='evil'", "&lt;script\tonload=&#39;evil&#39;"],
    [
      "</li><img src=x onerror=evil><li>",
      "&lt;/li&gt;&lt;img src=x onerror=evil&gt;&lt;li&gt;",
    ],
    ["&lt;SCRIPT&gt; & café 🦉", "&amp;lt;SCRIPT&amp;gt; &amp; café 🦉"],
  ]) {
    let log = "";
    let summary = "";
    reportEvidence([{ path: source, bytes: Buffer.from(source) }], {
      mode: "fixture",
      env: { EVIDENCE_LANE: source },
      write: (text) => {
        log += text;
      },
      summary: (text) => {
        summary += text;
      },
    });
    assert.ok(log.includes(`\n${source}\n`), source);
    assert.ok(summary.includes(`<li>${escaped}:`), source);
    // JSON string escaping precedes HTML escaping in the identity block.
    const escapedIdentity = escaped
      .replaceAll("&quot;", "\\&quot;")
      .replaceAll("\t", "\\t");
    assert.ok(
      summary.includes(`&quot;lane&quot;: &quot;${escapedIdentity}&quot;`),
      source,
    );
    assert.doesNotMatch(summary, /<script\b|<img\b/iu);
  }
});

test("report collection uses exact native outputs and exposes absent or redirected evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "bbcode-evidence-"));
  const outside = mkdtempSync(join(tmpdir(), "bbcode-outside-"));
  try {
    assert.throws(
      () => collectEvidence({ root, mode: "markdown" }),
      /unavailable/u,
    );
    mkdirSync(join(root, "artifacts/prose"), { recursive: true });
    writeFileSync(join(root, "artifacts/prose/check.json"), "{partial failure");
    writeFileSync(join(root, "artifacts/prose/check.stderr"), "native failure");
    const markdown = collectEvidence({ root, mode: "markdown" });
    assert.equal(markdown.length, 2);
    assert.ok(
      markdown.some((file) => file.bytes.toString() === "native failure"),
    );
    assert.ok(
      markdown.some((file) => file.bytes.toString() === "{partial failure"),
    );
    mkdirSync(join(root, "artifacts/github-rendering/run-current"), {
      recursive: true,
    });
    mkdirSync(join(root, "artifacts/github-rendering/run-old"));
    writeFileSync(
      join(root, "artifacts/github-rendering/run-current/response.html"),
      "current",
    );
    writeFileSync(
      join(root, "artifacts/github-rendering/run-old/response.html"),
      "old",
    );
    assert.throws(() => collectEvidence({ root, mode: "renderer" }), /exact/u);
    const renderer = collectEvidence({
      root,
      mode: "renderer",
      rendererDirectory: join(root, "artifacts/github-rendering/run-current"),
    });
    assert.deepEqual(
      renderer.map((file) => file.bytes.toString()),
      ["current"],
    );
    const window = join(outside, "markdown-window");
    mkdirSync(window);
    writeFileSync(join(window, "window.json"), "window identity");
    for (let index = 1; index <= 6; index++) {
      const sample = join(window, `sample-${index}`, "markdown-evidence");
      mkdirSync(sample, { recursive: true });
      writeFileSync(
        join(sample, "trusted-markdown-run.json"),
        `receipt ${index}`,
      );
      writeFileSync(join(sample, "../stdout.txt"), `stdout ${index}`);
      writeFileSync(join(sample, "../stderr.txt"), `stderr ${index}`);
    }
    assert.equal(
      collectEvidence({
        root,
        mode: "trusted-markdown",
        windowDirectory: window,
      }).length,
      19,
    );
    mkdirSync(join(root, "artifacts/runtime-coverage/tmp"), {
      recursive: true,
    });
    writeFileSync(
      join(root, "artifacts/runtime-coverage/coverage-final.json"),
      "native final coverage",
    );
    writeFileSync(
      join(root, "artifacts/runtime-coverage/tmp/coverage-process.json"),
      "temporary V8 process data",
    );
    assert.deepEqual(
      collectEvidence({ root, mode: "converter" }).map((file) =>
        file.bytes.toString(),
      ),
      ["native final coverage"],
    );
    symlinkSync(
      outside,
      join(root, "artifacts/prose/redirect"),
      process.platform === "win32" ? "junction" : "dir",
    );
    assert.throws(
      () => collectEvidence({ root, mode: "markdown" }),
      /Redirected/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
});

test("available diagnostics survive invalid siblings and missing records are explicit for failed producers", () => {
  const root = mkdtempSync(join(tmpdir(), "bbcode-partial-evidence-"));
  const outside = mkdtempSync(join(tmpdir(), "bbcode-partial-outside-"));
  try {
    mkdirSync(join(root, "artifacts/prose"), { recursive: true });
    writeFileSync(
      join(root, "artifacts/prose/a.json"),
      "available before error",
    );
    symlinkSync(
      outside,
      join(root, "artifacts/prose/redirect"),
      process.platform === "win32" ? "junction" : "dir",
    );
    writeFileSync(join(root, "artifacts/prose/z.log"), "available after error");
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(
          new URL("../scripts/report-ci-evidence.js", import.meta.url),
        ),
        "--mode",
        "markdown",
      ],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, EVIDENCE_OUTCOME: "failure" },
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stdout, /available before error/u);
    assert.match(result.stdout, /available after error/u);
    assert.match(result.stdout, /Redirected diagnostic input/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
  let log = "";
  let summary = "";
  reportEvidence(
    [
      {
        path: "consumer-qualification.log",
        bytes: Buffer.from("native failure"),
      },
    ],
    {
      mode: "consumer",
      env: { EVIDENCE_OUTCOME: "failure" },
      write: (text) => {
        log += text;
      },
      summary: (text) => {
        summary += text;
      },
    },
  );
  assert.match(log, /native failure/u);
  assert.match(
    log,
    /Missing evidence.*consumer-report\.json.*consumer-package-lock\.json/u,
  );
  assert.match(summary, /Missing required diagnostic records/u);
  assert.match(summary, /consumer-report\.json/u);
});

test("a successful producer with missing required records cannot qualify through a partial summary", () => {
  let log = "";
  let summary = "";
  assert.throws(
    () =>
      reportEvidence(
        [
          {
            path: "artifacts/consumer-report.json",
            bytes: Buffer.from('{"result":"PASS"}'),
          },
        ],
        {
          mode: "archive",
          env: { EVIDENCE_OUTCOME: "success" },
          write: (text) => {
            log += text;
          },
          summary: (text) => {
            summary += text;
          },
        },
      ),
    /Missing required diagnostic record/u,
  );
  assert.ok(log.includes('"result":"PASS"'));
  assert.match(log, /\n::bbcode-[a-f0-9]{64}::\n/u);
  assert.match(summary, /Missing required diagnostic records/u);
});

test("all diagnostic modes summarize unavailable outputs before any success rejection", () => {
  for (const mode of [
    "converter",
    "mutation",
    "renderer",
    "markdown",
    "archive",
    "consumer",
    "release",
    "registry",
    "trusted-markdown",
  ]) {
    let summary = "";
    reportEvidence(
      [{ path: "partial.log", bytes: Buffer.from("partial output") }],
      {
        mode,
        env: { EVIDENCE_OUTCOME: "failure" },
        write: () => {},
        summary: (text) => {
          summary += text;
        },
      },
    );
    assert.match(summary, /Missing required diagnostic records/u, mode);
    assert.throws(
      () =>
        reportEvidence(
          [{ path: "partial.log", bytes: Buffer.from("partial output") }],
          {
            mode,
            env: { EVIDENCE_OUTCOME: "success" },
            write: () => {},
            summary: (text) => {
              assert.match(text, /Missing required diagnostic records/u, mode);
            },
          },
        ),
      /Missing required diagnostic record/u,
      mode,
    );
  }
});

test("only package transport and unfiltered SARIF are retained by Actions", () => {
  const expected = {
    "steam-community-bbcode": ["bbcode-consumer-archive"],
    "node-consumers": [],
    "steam-community-bbcode-renderer": [],
    "markdown-quality": [],
    "steam-community-bbcode-release": ["steam-community-bbcode-candidate"],
    codeql: ["codeql-unfiltered-javascript-${{ github.run_attempt }}"],
  };
  for (const [name, inventory] of Object.entries(expected)) {
    /** @type {{jobs: Record<string, {steps?: {uses?: string, with: Record<string, unknown>}[]}>}} */
    const workflow = parse(
      readFileSync(
        new URL(`../.github/workflows/${name}.yml`, import.meta.url),
        "utf8",
      ),
    );
    const uploads = Object.values(workflow.jobs).flatMap((job) =>
      (job.steps ?? []).filter((step) =>
        step.uses?.startsWith("actions/upload-artifact@"),
      ),
    );
    assert.deepEqual(
      uploads.map((step) => step.with["name"]),
      inventory,
      name,
    );
    for (const upload of uploads) {
      assert.equal(
        upload.with["retention-days"],
        name === "codeql"
          ? undefined
          : name === "steam-community-bbcode"
            ? 7
            : 30,
      );
    }
  }
});

test("documentation selection is required while explicit release checks stay broad", () => {
  /** @type {{jobs: {selection: unknown, qualification: {needs: string[]}, markdown: {if?: unknown}}, on: Record<'workflow_call' | 'workflow_dispatch', {inputs: Record<string, {default: boolean}>}>}} */
  const workflow = parse(
    readFileSync(
      new URL(
        "../.github/workflows/steam-community-bbcode.yml",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  assert.ok(workflow.jobs.selection);
  assert.ok(workflow.jobs.qualification.needs.includes("selection"));
  assert.ok(workflow.jobs.qualification.needs.includes("consumer-archive"));
  assert.equal(
    workflow.on.workflow_call.inputs["force-package"]?.default,
    true,
  );
  assert.equal(
    workflow.on.workflow_dispatch.inputs["force-package"]?.default,
    true,
  );
  assert.equal(workflow.jobs.markdown.if, undefined);
});
