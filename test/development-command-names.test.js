// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/** @type {{scripts: Record<string, string> & {build: string, "check:product": string, "set-up:development": string}}} */
const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const verbs = new Set([
  "build",
  "check",
  "clean",
  "compare",
  "format",
  "generate",
  "install",
  "lint",
  "pack",
  "publish",
  "qualify",
  "set-up",
  "test",
  "typecheck",
  "validate",
  "verify",
]);
const lifecycleNames = new Set([
  "dependencies",
  "prepare",
  "preprepare",
  "postprepare",
  "prepublish",
  "prepublishOnly",
  "prepack",
  "postpack",
  "install",
  "postinstall",
  "preinstall",
  "publish",
  "postpublish",
  "version",
  "preversion",
  "postversion",
  "start",
  "prestart",
  "poststart",
  "stop",
  "prestop",
  "poststop",
  "restart",
  "prerestart",
  "postrestart",
  "test",
  "pretest",
  "posttest",
]);

/**
 * @param {string} name
 * @param {ReadonlySet<string>} names
 * @returns {boolean}
 */
function isAllowedScriptName(name, names) {
  if (name === "run" || name.startsWith("run:")) return false;
  if (lifecycleNames.has(name) || name === "cli") return true;
  if (
    /^[a-z]+(?:-[a-z]+)*(?::[a-z]+(?:-[a-z]+)*)*$/u.test(name) &&
    verbs.has(name.split(":")[0] ?? "")
  )
    return true;
  for (const prefix of ["pre", "post"]) {
    if (!name.startsWith(prefix)) continue;
    const base = name.slice(prefix.length);
    if (names.has(base) && isAllowedScriptName(base, names)) return true;
  }
  return false;
}

test("first-party npm commands use verb-first names without noun-first aliases", () => {
  const names = new Set(Object.keys(manifest.scripts));
  for (const name of names) assert.ok(isAllowedScriptName(name, names), name);
  for (const name of [
    "generate:spec",
    "check:spec",
    "check:format",
    "cli",
    "compare:alternatives",
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

test("script names reject generic run verbs and imprecise dispatcher aliases", () => {
  const names = new Set(["cli", "compare:alternatives", "check:docs"]);
  for (const name of ["cli", "compare:alternatives", "check:docs"])
    assert.ok(isAllowedScriptName(name, names), name);
  for (const name of [
    "run",
    "run:cli",
    "run:comparison",
    "cli:help",
    "comparison:run",
    "check:Docs",
    "check:docs_extra",
    "check::docs",
    "preunknown",
    "prerun:cli",
  ])
    assert.equal(isAllowedScriptName(name, names), false, name);
});

test("npm lifecycle events and hooks retain their exact consumer-owned names", () => {
  const names = new Set(["cli", "check:docs", "test", "run:cli"]);
  for (const name of lifecycleNames)
    assert.ok(isAllowedScriptName(name, new Set()), name);
  for (const name of [
    "prepare",
    "prepack",
    "postpack",
    "prepublishOnly",
    "dependencies",
    "precheck:docs",
    "postcheck:docs",
    "precli",
    "posttest",
  ])
    assert.ok(isAllowedScriptName(name, names), name);
  assert.equal(isAllowedScriptName("prerun:cli", names), false);
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
