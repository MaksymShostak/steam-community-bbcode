// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { join } from "node:path";
import ts from "typescript";
import { lintSync } from "type-coverage-core";
import {
  nodeDeclarationEnvironment,
  verifyNodeDeclarationResolution,
} from "../../scripts/node-declaration-environment.js";

const [, , major, configName] = process.argv;
assert.ok(major && configName);
const environment = nodeDeclarationEnvironment(major);
const config = ts.getParsedCommandLineOfConfigFile(
  join(environment.root, configName),
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
      );
    },
  },
);
assert.ok(config);
assert.equal(config.errors.length, 0);
const result = lintSync(config.options, config.fileNames, {
  strict: true,
  notOnlyInCWD: true,
});
const diagnostics = ts.getPreEmitDiagnostics(result.program);
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (name) => name,
    getNewLine: () => ts.sys.newLine,
  }),
);
const count = verifyNodeDeclarationResolution(
  result.program.getSourceFiles().map((file) => file.fileName),
  environment.nodeRoot,
);
assert.ok(result.totalCount > 0);
assert.equal(
  result.correctCount,
  result.totalCount,
  JSON.stringify(
    result.anys.map(({ file, line, character }) => ({ file, line, character })),
  ),
);
console.log(
  `${result.correctCount}/${result.totalCount} (100%); ${count} Node declaration files from ${environment.version}.`,
);
