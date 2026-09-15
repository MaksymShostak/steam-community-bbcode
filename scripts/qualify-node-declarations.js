// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  nodeDeclarationEnvironment,
  verifyNodeDeclarationResolution,
} from "./node-declaration-environment.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const { values } = parseArgs({ options: { major: { type: "string" } } });
const majors = values.major ? [values.major] : ["22", "24", "26"];
const npmCli = process.env["npm_execpath"];
assert.ok(npmCli, "Run npm run qualify:node-types.");
/** @type {{name: string, version: string}} */
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const archive = join(
  root,
  "artifacts",
  `${manifest.name}-${manifest.version}.tgz`,
);
const archiveSha256 = createHash("sha256")
  .update(readFileSync(archive))
  .digest("hex");
const compilers = [
  ["ts7", "node_modules/typescript/bin/tsc"],
  ["ts6", "tooling/api-docs/node_modules/typescript/bin/tsc"],
  [
    "type-coverage-ts6",
    "tooling/type-coverage/node_modules/typescript/bin/tsc",
  ],
];
/** @param {string[]} args @param {string} log */
function run(args, log) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  writeFileSync(log, (result.stdout ?? "") + (result.stderr ?? ""));
  assert.equal(
    result.status,
    0,
    result.error?.message ?? `Qualification failed: ${log}`,
  );
  return result.stdout;
}
for (const major of majors) {
  const environment = nodeDeclarationEnvironment(major);
  const output = join(root, "artifacts", "node-declarations", major);
  mkdirSync(output, { recursive: true });
  for (const [compiler, bin] of compilers) {
    assert.ok(compiler && bin);
    for (const config of ["tsconfig.json", "tsconfig.api-docs.json"]) {
      const args = [
        join(root, bin),
        "--project",
        join(environment.root, config),
      ];
      const files = run(
        [...args, "--listFilesOnly"],
        join(output, `${compiler}-${config}-files.log`),
      );
      verifyNodeDeclarationResolution(
        files.split(/\r?\n/),
        environment.nodeRoot,
      );
      run(args, join(output, `${compiler}-${config}-check.log`));
    }
  }
  run(
    [
      npmCli,
      "--prefix",
      "tooling/api-docs",
      "run",
      "check",
      "--",
      "--node-types",
      major,
    ],
    join(output, "typedoc.log"),
  );
  for (const config of ["tsconfig.json", "tsconfig.api-docs.json"]) {
    run(
      [
        join(root, "tooling/type-coverage/qualify-node-declarations.js"),
        major,
        config,
      ],
      join(output, `${config}-coverage.log`),
    );
  }
  run(
    [
      npmCli,
      "run",
      "test:package",
      "--",
      "--archive",
      archive,
      "--node-types",
      major,
      "--output",
      join(output, "consumer"),
    ],
    join(output, "consumer.log"),
  );
  assert.equal(
    createHash("sha256").update(readFileSync(archive)).digest("hex"),
    archiveSha256,
    "Compatibility checks must preserve the canonical archive.",
  );
  writeFileSync(
    join(output, "result.json"),
    JSON.stringify(
      {
        runtime: process.version,
        nodeDeclarations: environment.version,
        nodeRoot: environment.nodeRoot,
        archive,
        archiveSha256,
        result: "PASS",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Node ${major} declarations (${environment.version}): source, tooling and retained archive passed.`,
  );
}
