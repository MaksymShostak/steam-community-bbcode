// SPDX-License-Identifier: AGPL-3.0-only
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2];
const report = resolve(root, "artifacts/prose/check.json");
if (mode === "check") {
  mkdirSync(dirname(report), { recursive: true });
  writeFileSync(report, "");
  writeFileSync(resolve(root, "artifacts/prose/check.stderr.txt"), "");
}
if (process.versions.node !== "24.21.0") {
  console.error(
    "Markdown tooling requires the qualified Node 24.21.0 runtime.",
  );
  process.exitCode = 2;
} else if (!["check", "format"].includes(mode) || process.argv.length !== 3) {
  console.error("Use npm run check:markdown or npm run format:markdown.");
  process.exitCode = 2;
} else {
  const cli = resolve(
    root,
    "tooling/markdown/node_modules/@hadden-industries/markdown-quality/src/cli.js",
  );
  const result = spawnSync(
    process.execPath,
    [cli, mode, "--root", root, "--json"],
    {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
      timeout: 300000,
      maxBuffer: 8 * 1024 * 1024,
    },
  );
  if (mode === "check") {
    writeFileSync(report, result.stdout ?? "");
    writeFileSync(
      resolve(root, "artifacts/prose/check.stderr.txt"),
      result.stderr ?? "",
    );
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.signal || ![0, 1, 2].includes(result.status)) {
    console.error(
      result.error?.message ?? "Markdown checker completion was not proven.",
    );
    process.exitCode = 2;
  } else {
    try {
      const requireTool = createRequire(cli);
      const Ajv = requireTool("ajv");
      const validate = new Ajv({ strict: true }).compile(
        JSON.parse(
          readFileSync(
            resolve(dirname(cli), "../schemas/result.schema.json"),
            "utf8",
          ),
        ),
      );
      const nativeReport = JSON.parse(result.stdout);
      if (
        !validate(nativeReport) ||
        nativeReport.exitCode !== result.status ||
        nativeReport.operation !== mode ||
        nativeReport.selection.mode !== "full"
      )
        throw new Error("Invalid or inconsistent native Markdown report.");
      process.exitCode = result.status;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
    }
  }
}
