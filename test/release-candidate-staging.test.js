// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stageReleaseTransfer } from "../scripts/stage-release-transfer.js";

test("slim transfer retains native consumers' exact bytes and rejects lost or divergent evidence", () => {
  const root = mkdtempSync(join(tmpdir(), "bbcode-transfer-"));
  const source = join(root, "source");
  mkdirSync(source);
  const archive = Buffer.from(
    "synthetic archive identity; native readCandidate checks hashes and SRI",
  );
  const filename = "steam-community-bbcode-1.0.0-rc.1.tgz";
  const integrity =
    "sha512-" + createHash("sha512").update(archive).digest("base64");
  const candidate = {
    schemaVersion: 2,
    package: {
      name: "steam-community-bbcode",
      version: "1.0.0-rc.1",
      license: "AGPL-3.0-only",
      private: false,
    },
    tarball: {
      filename,
      integrity,
      sha256: createHash("sha256").update(archive).digest("hex"),
    },
    source: { commit: "a".repeat(40) },
  };
  writeFileSync(join(source, filename), archive);
  writeFileSync(join(source, "candidate.json"), JSON.stringify(candidate));
  writeFileSync(
    join(source, "pack-actual.json"),
    JSON.stringify({ filename, integrity, files: [{ path: "package.json" }] }),
  );
  writeFileSync(
    join(source, "production.cdx.json"),
    '{"bomFormat":"CycloneDX"}',
  );
  writeFileSync(join(source, "consumer-report.json"), '{"result":"PASS"}');
  writeFileSync(join(source, "SHA256SUMS"), "obsolete full-source manifest");
  try {
    const output = join(root, "output");
    stageReleaseTransfer(source, output, "a".repeat(40));
    assert.deepEqual(
      readdirSync(output).sort(),
      [
        filename,
        "candidate.json",
        "pack-actual.json",
        "production.cdx.json",
        "SHA256SUMS",
      ].sort(),
    );
    for (const file of [
      filename,
      "candidate.json",
      "pack-actual.json",
      "production.cdx.json",
    ])
      assert.deepEqual(
        readFileSync(join(output, file)),
        readFileSync(join(source, file)),
      );
    const sums = readFileSync(join(output, "SHA256SUMS"), "utf8")
      .trim()
      .split("\n");
    assert.equal(sums.length, 4);
    for (const line of sums) {
      const [hash, file] = line.split("  ");
      assert.ok(file);
      assert.equal(
        hash,
        createHash("sha256")
          .update(readFileSync(join(output, file)))
          .digest("hex"),
      );
    }
    assert.throws(
      () => stageReleaseTransfer(source, output, "a".repeat(40)),
      /empty/u,
    );
    assert.throws(() =>
      stageReleaseTransfer(source, join(root, "wrong-source"), "b".repeat(40)),
    );
    unlinkSync(join(source, "pack-actual.json"));
    assert.throws(() =>
      stageReleaseTransfer(source, join(root, "missing"), undefined),
    );
    writeFileSync(
      join(source, "pack-actual.json"),
      JSON.stringify({
        filename,
        integrity,
        files: [{ path: "package.json" }],
      }),
    );
    writeFileSync(join(source, filename), "corrupt");
    assert.throws(
      () => stageReleaseTransfer(source, join(root, "corrupt"), undefined),
      /bytes changed/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
