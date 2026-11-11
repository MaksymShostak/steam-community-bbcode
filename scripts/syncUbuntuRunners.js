// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isMap, isScalar, isSeq, parseDocument, visit } from "yaml";

const root = new URL("../", import.meta.url);
const { ubuntuRelease } = JSON.parse(
  readFileSync(new URL(".github/runner-policy.json", root), "utf8"),
);
assert.match(
  ubuntuRelease,
  /^\d[02468]\.04$/u,
  "Expected an Ubuntu LTS release",
);
export const ubuntuRunner = "ubuntu-" + ubuntuRelease;

/** @type {Record<string, Record<string, "direct" | "matrix">>} */
const workflows = {
  "codeql.yml": { analyze: "direct" },
  "node-consumers.yml": { consumer: "matrix" },
  "steam-community-bbcode.yml": {
    selection: "direct",
    converter: "matrix",
    markdown: "matrix",
    "consumer-archive": "direct",
    mutation: "direct",
    qualification: "direct",
    "dependency-review": "direct",
  },
  "steam-community-bbcode-release.yml": {
    candidate: "direct",
    publish: "direct",
    verify_registry: "direct",
  },
  "steam-community-bbcode-renderer.yml": { renderer: "direct" },
};

/** @param {string} file @param {string} source */
export function projectUbuntuRunners(file, source, runner = ubuntuRunner) {
  assert.match(runner, /^ubuntu-\d[02468]\.04$/u);
  assert.ok(Object.hasOwn(workflows, file));
  const expected = workflows[file];
  assert.ok(expected, file);
  const document = parseDocument(source, { uniqueKeys: true });
  assert.deepEqual(document.errors, [], file);
  assert.ok(isMap(document.get("jobs", true)), file);
  /** @type {[number, number][]} */
  const selectors = [];
  for (const [job, kind] of Object.entries(expected)) {
    const path = ["jobs", job];
    const selector = file + "/" + job;
    let label = document.getIn([...path, "runs-on"], true);
    if (kind === "matrix") {
      assert.ok(
        isScalar(label) && label.value === "${{ matrix.os }}",
        selector,
      );
      const os = document.getIn([...path, "strategy", "matrix", "os"], true);
      assert.ok(isSeq(os), selector);
      const linux = os.items.filter(
        (entry) =>
          isScalar(entry) &&
          typeof entry.value === "string" &&
          entry.value.startsWith("ubuntu-"),
      );
      assert.equal(linux.length, 1, selector + " must select one Ubuntu lane");
      label = linux[0];
    }
    assert.ok(
      isScalar(label) && typeof label.value === "string" && label.range,
      selector,
    );
    assert.match(
      label.value,
      /^ubuntu-(?:\d[02468]\.04|latest)$/u,
      selector + " has no supported Ubuntu selector",
    );
    const [start, end] = label.range;
    const raw = source.slice(start, end);
    if (raw === label.value) selectors.push([start, end]);
    else {
      assert.ok(
        (raw.startsWith("'") && raw.endsWith("'")) ||
          (raw.startsWith('"') && raw.endsWith('"')),
        selector,
      );
      assert.equal(raw.slice(1, -1), label.value, selector);
      selectors.push([start + 1, end - 1]);
    }
  }
  let literals = 0;
  visit(document, {
    Scalar(_, node) {
      if (typeof node.value === "string")
        literals += (
          node.value.match(
            /\bubuntu-(?:\d{2}\.\d{2}|latest|slim)(?:-[a-z0-9]+)*/gu,
          ) ?? []
        ).length;
    },
  });
  assert.equal(
    literals,
    selectors.length,
    file + " has an unmanaged Ubuntu selector",
  );
  let projected = source;
  for (const [start, end] of selectors.sort(([a], [b]) => b - a)) {
    projected = projected.slice(0, start) + runner + projected.slice(end);
  }
  return projected;
}

export function synchronizeUbuntuRunners({ write = false } = {}) {
  const changes = Object.keys(workflows).flatMap((file) => {
    const url = new URL(".github/workflows/" + file, root);
    const source = readFileSync(url, "utf8");
    const projected = projectUbuntuRunners(file, source);
    return source === projected ? [] : [{ file, url, projected }];
  });
  if (!write && changes.length) {
    throw new Error(
      "Regenerate Ubuntu selectors for " +
        changes.map(({ file }) => file).join(", "),
    );
  }
  for (const { url, projected } of changes) writeFileSync(url, projected);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  assert.ok(args.length === 0 || (args.length === 1 && args[0] === "--write"));
  synchronizeUbuntuRunners({ write: args.length === 1 });
}
