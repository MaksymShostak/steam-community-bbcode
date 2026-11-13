// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import {
  existsSync,
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  jqVersion,
  repositoryJqPath,
  repositoryJqEnvironment,
  setUpRepositoryJq,
} from "../scripts/repository-jq.js";

/** @param {import('node:test').TestContext} t */
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "bbcode jq with spaces "));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, executable: repositoryJqPath(root) };
}

// Setup installs the actual publisher-checksummed binary before these tooling tests.
const binary = () => readFileSync(repositoryJqPath());

test("jq acquisition installs verified publisher bytes and reuses them offline", async (t) => {
  const f = fixture(t);
  let downloads = 0;
  const bytes = binary();
  const executable = await setUpRepositoryJq({
    root: f.root,
    download: async (url) => {
      downloads++;
      assert.match(
        String(url),
        /https:\/\/github\.com\/jqlang\/jq\/releases\/download\//u,
      );
      return new Response(bytes);
    },
  });
  assert.equal(executable, f.executable);
  assert.deepEqual(readFileSync(executable), bytes);
  assert.match(
    readFileSync(join(dirname(executable), "COPYING"), "utf8"),
    /Stephen Dolan/u,
  );
  assert.equal(
    execFileSync(executable, ["--version"], {
      encoding: "utf8",
      windowsHide: true,
    }).trim(),
    `jq-${jqVersion}`,
  );
  await setUpRepositoryJq({
    root: f.root,
    download: async () => {
      assert.fail("a verified installed binary must not need the network");
    },
  });
  assert.equal(downloads, 1);
});

test("HTTP, size and checksum failures never publish an executable", async (t) => {
  const bytes = binary();
  const corrupted = Buffer.from(bytes);
  corrupted[0] = corrupted.readUInt8(0) ^ 1;
  /** @type {Array<[Buffer, number, RegExp]>} */
  const cases = [
    [bytes, 503, /503/u],
    [Buffer.from("short"), 200, /size/u],
    [Buffer.concat([bytes, Buffer.from("x")]), 200, /size/u],
    [corrupted, 200, /checksum/u],
  ];
  for (const [body, status, expected] of cases) {
    const f = fixture(t);
    await assert.rejects(
      setUpRepositoryJq({
        root: f.root,
        download: async () => new Response(new Uint8Array(body), { status }),
      }),
      expected,
    );
    assert.equal(existsSync(f.executable), false);
  }
});

test("an altered existing jq is preserved and refused without downloading", async (t) => {
  const f = fixture(t);
  mkdirSync(dirname(f.executable), { recursive: true });
  writeFileSync(f.executable, "user-owned bytes");
  await assert.rejects(
    setUpRepositoryJq({
      root: f.root,
      download: async () => assert.fail("do not replace an existing file"),
    }),
    /checksum|size/u,
  );
  assert.equal(readFileSync(f.executable, "utf8"), "user-owned bytes");
});

test("concurrent native setup processes both accept the verified installation", async (t) => {
  const f = fixture(t);
  const module = new URL("../scripts/repository-jq.js", import.meta.url).href;
  const source = `
    import { readFileSync, writeFileSync, existsSync } from "node:fs";
    import { join } from "node:path";
    import { setTimeout } from "node:timers/promises";
    import { setUpRepositoryJq } from ${JSON.stringify(module)};
    const [root, binary, id] = process.argv.slice(1);
    await setUpRepositoryJq({root, download: async () => {
      writeFileSync(join(root, "ready-" + id), "");
      const deadline = Date.now() + 10000;
      while (!existsSync(join(root, "ready-0")) || !existsSync(join(root, "ready-1"))) {
        if (Date.now() > deadline) throw new Error("concurrent setup did not reach download");
        await setTimeout(1);
      }
      return new Response(readFileSync(binary));
    }});
  `;
  const run = promisify(execFile);
  const results = await Promise.allSettled(
    ["0", "1"].map((id) =>
      run(
        process.execPath,
        ["--input-type=module", "-e", source, f.root, repositoryJqPath(), id],
        { windowsHide: true, timeout: 15000 },
      ),
    ),
  );
  for (const result of results) {
    assert.equal(
      result.status,
      "fulfilled",
      result.status === "rejected" ? String(result.reason) : "",
    );
  }
  assert.deepEqual(readFileSync(f.executable), binary());
});

test("jq setup refuses linked tool directories and unsupported hosts", async (t) => {
  const f = fixture(t);
  const outside = fixture(t);
  symlinkSync(
    outside.root,
    join(f.root, ".agent-tools"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(setUpRepositoryJq({ root: f.root }), /link/u);
  assert.equal(existsSync(join(outside.root, "jq")), false);
  await assert.rejects(
    setUpRepositoryJq({ root: outside.root, platform: "aix" }),
    /Unsupported/u,
  );
});

test("Bash receives the pinned local jq path while preserving its inherited environment", async (t) => {
  const f = fixture(t);
  const checkout = join(
    f.root,
    process.platform === "win32" ? "checkout with spaces" : "checkout\\literal",
  );
  mkdirSync(checkout);
  const executable = repositoryJqPath(checkout);
  assert.throws(
    () => repositoryJqEnvironment({ root: checkout }),
    /set-up:development/u,
  );
  await setUpRepositoryJq({
    root: checkout,
    download: async () => new Response(binary()),
  });
  const environment = repositoryJqEnvironment({
    root: checkout,
    environment: {
      PATH: "inherited",
      ...(process.platform === "win32" ? { Path: "stale" } : {}),
      KEEP: "yes",
    },
  });
  assert.equal(environment["KEEP"], "yes");
  assert.equal(environment["PATH"], "inherited");
  assert.equal(
    environment["REPOSITORY_JQ_EXECUTABLE"],
    process.platform === "win32"
      ? executable.replaceAll("\\", "/")
      : executable,
  );
  if (process.platform === "win32") assert.equal(environment["Path"], "stale");
});

test(
  "a cached jq without POSIX execute access is refused",
  { skip: process.platform === "win32" },
  async (t) => {
    const f = fixture(t);
    await setUpRepositoryJq({
      root: f.root,
      download: async () => new Response(binary()),
    });
    chmodSync(f.executable, 0o644);
    assert.throws(() => repositoryJqEnvironment({ root: f.root }), /EACCES/u);
  },
);
