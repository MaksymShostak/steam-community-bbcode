// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  formatSha256Sums,
  readCandidate,
  sha256Buffer,
  sha256File,
} from "./release-artifacts.js";

/** Stage the exact native candidate transport without rebuilding or changing its metadata/schema.
 * Diagnostic reports stay in the source directory and logs; transfer checksums describe only copied files.
 * @param {string} source @param {string} output @param {string | undefined} expectedCommit
 */
export function stageReleaseTransfer(source, output, expectedCommit) {
  source = resolve(source);
  output = resolve(output);
  assert.equal(
    realpathSync(source),
    source,
    "Candidate source must not be redirected.",
  );
  assert.ok(lstatSync(source).isDirectory());
  const metadata = join(source, "candidate.json");
  assert.ok(
    lstatSync(metadata).isFile() && !lstatSync(metadata).isSymbolicLink(),
  );
  /** @type {import('./release-artifacts.js').ReleaseCandidate} */
  const descriptor = JSON.parse(readFileSync(metadata, "utf8"));
  // Admit the native filename before the native reader opens it.
  assert.equal(
    descriptor.tarball.filename,
    `steam-community-bbcode-${descriptor.package.version}.tgz`,
  );
  assert.ok(!/[\\/]/u.test(descriptor.tarball.filename));
  const inventory = [
    descriptor.tarball.filename,
    "candidate.json",
    "pack-actual.json",
    "production.cdx.json",
  ];
  for (const name of inventory) {
    const stat = lstatSync(join(source, name));
    assert.ok(
      stat.isFile() && !stat.isSymbolicLink(),
      `Expected regular source ${name}`,
    );
    assert.equal(realpathSync(join(source, name)), join(source, name));
  }
  const candidate = readCandidate(source);
  if (expectedCommit) assert.equal(candidate.source.commit, expectedCommit);
  /** @type {{filename: string, integrity: string, files: unknown[]}} */
  const pack = JSON.parse(
    readFileSync(join(source, "pack-actual.json"), "utf8"),
  );
  assert.equal(pack.filename, candidate.tarball.filename);
  assert.equal(pack.integrity, candidate.tarball.integrity);
  assert.ok(
    Array.isArray(pack.files) && pack.files.length,
    "Native npm pack inventory is required.",
  );
  JSON.parse(readFileSync(join(source, "production.cdx.json"), "utf8"));
  mkdirSync(output, { recursive: true });
  assert.equal(
    realpathSync(output),
    output,
    "Transfer output must not be redirected.",
  );
  assert.equal(readdirSync(output).length, 0, "Transfer output must be empty.");
  const entries = inventory.map((fileName) => {
    const bytes = readFileSync(join(source, fileName));
    const sha256 = sha256Buffer(bytes);
    writeFileSync(join(output, fileName), bytes, { flag: "wx" });
    assert.equal(
      sha256File(join(source, fileName)),
      sha256,
      "Candidate source changed while copying.",
    );
    assert.equal(sha256File(join(output, fileName)), sha256);
    return { fileName, sha256 };
  });
  writeFileSync(join(output, "SHA256SUMS"), formatSha256Sums(entries), {
    flag: "wx",
  });
  assert.deepEqual(readCandidate(output), candidate);
  assert.deepEqual(
    readdirSync(output).sort(),
    [...inventory, "SHA256SUMS"].sort(),
  );
  return entries;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const { values } = parseArgs({
    options: {
      source: { type: "string", default: "artifacts/release-candidate" },
      output: { type: "string", default: "artifacts/release-transfer" },
    },
  });
  console.log(
    JSON.stringify(
      stageReleaseTransfer(
        values.source,
        values.output,
        process.env["GITHUB_SHA"],
      ),
      null,
      2,
    ),
  );
}
