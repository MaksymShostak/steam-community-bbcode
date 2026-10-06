// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const verbs = new Set([
  "build",
  "check",
  "clean",
  "format",
  "generate",
  "install",
  "lint",
  "pack",
  "publish",
  "qualify",
  "run",
  "set-up",
  "test",
  "typecheck",
  "validate",
  "verify",
]);

test("first-party npm commands use verb-first names without noun-first aliases", () => {
  for (const name of Object.keys(manifest.scripts))
    assert.ok(verbs.has(name.split(":")[0] ?? ""), name);
  for (const name of [
    "generate:spec",
    "check:spec",
    "check:format",
    "run:comparison",
    "pack:release",
    "set-up:development",
  ])
    assert.equal(typeof manifest.scripts[name], "string", name);
  assert.match(manifest.scripts.build, /npm run generate:spec/u);
  assert.match(manifest.scripts["check:product"], /npm run check:spec/u);
  assert.match(
    manifest.scripts["set-up:development"],
    /scripts\/set-up-development\.js/u,
  );
});

test("root npm command chains reference existing first-party entry points", () => {
  for (const [name, command] of Object.entries(manifest.scripts)) {
    assert.equal(typeof command, "string", name);
    if (command.includes("npm --prefix")) continue;
    for (const match of command.matchAll(/npm run ([a-z][a-z:-]*)/gu))
      assert.equal(
        typeof manifest.scripts[match[1] ?? ""],
        "string",
        `${name}: ${match[1]}`,
      );
  }
});
