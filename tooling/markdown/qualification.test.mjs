// SPDX-License-Identifier: AGPL-3.0-only
// Consumer probes exercise the installed public contracts with Steam Community BBCode's policy.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const tooling = join(root, "tooling/markdown");
const requireMarkdown = createRequire(join(tooling, "package.json"));
const entry = requireMarkdown.resolve("@hadden-industries/markdown-quality");
const {
  executeQuality,
  readExecutionProfile,
  stageCandidate,
  validateQualityResult,
} = await import(pathToFileURL(entry).href);

test("Steam Community BBCode's trusted policy rejects a real missing link despite candidate controls", async () => {
  // This tool-managed fixture remains available for failed-run diagnosis.
  const fixture = mkdtempSync(
    join(tmpdir(), "steam-bbcode-markdown-consumer-"),
  );
  const sourceRoot = join(fixture, "candidate");
  const outputRoot = join(fixture, "staged");
  mkdirSync(sourceRoot);
  const content = "# Candidate\n\n[Missing target](missing-target.md)\n";
  writeFileSync(join(sourceRoot, "README.md"), content);
  writeFileSync(
    join(sourceRoot, ".markdown-quality.json"),
    JSON.stringify({
      schemaVersion: 2,
      preset: "authored-gfm@1",
      include: ["**/*.md"],
      exclude: ["**"],
    }),
  );
  writeFileSync(join(sourceRoot, ".prettierignore"), "**/*.md\n");
  writeFileSync(join(sourceRoot, ".gitignore"), "**/*.md\n");
  writeFileSync(
    join(sourceRoot, ".markdown-quality-execution.json"),
    JSON.stringify({ checkerMs: 1, memoryBytes: 1 }),
  );
  writeFileSync(
    join(sourceRoot, "package.json"),
    JSON.stringify({ scripts: { preinstall: "node marker.mjs" } }),
  );
  writeFileSync(
    join(sourceRoot, "marker.mjs"),
    'import { writeFileSync } from "node:fs"; writeFileSync("executed", "unsafe");\n',
  );
  const staged = stageCandidate({ sourceRoot, trustedRoot: root, outputRoot });
  const profile = readExecutionProfile({ root });
  const report = await executeQuality(
    {
      root: outputRoot,
      mode: "check",
      config: staged.configPath,
      limits: profile.limits,
    },
    {
      checkerMs: profile.checkerMs,
      requestBytes: profile.requestBytes,
      reportBytes: profile.reportBytes,
      nodeOldSpaceMb: profile.nodeOldSpaceMb,
    },
  );
  validateQualityResult(report);
  assert.equal(report.exitCode, 1);
  assert.deepEqual(report.selection.files, ["README.md"]);
  assert.ok(
    report.diagnostics.some(
      (item) =>
        item.source === "links" &&
        item.rule === "local-target" &&
        item.path === "README.md" &&
        item.line === 3,
    ),
    JSON.stringify(report.diagnostics),
  );
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.written, []);
  assert.equal(readFileSync(join(outputRoot, "README.md"), "utf8"), content);
  assert.equal(existsSync(join(outputRoot, "executed")), false);
  assert.equal(existsSync(join(sourceRoot, "executed")), false);
});
