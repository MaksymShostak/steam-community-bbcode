// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { checkDocumentationLinks } from "../scripts/check-documentation-links.js";
import { steamConstructDefinitions } from "../src/steam/construct-registry.js";
import { constructCases } from "./conformance/construct-cases.js";
import { steamCommunityBbcodeToGfm } from "../src/index.js";

test("each construct has an executed example or an explicit context-only explanation", async () => {
  const source = await readFile(
    new URL("../docs/conversion-semantics.md", import.meta.url),
    "utf8",
  );
  const tree = fromMarkdown(source);
  const headings = tree.children
    .filter((node) => node.type === "heading")
    .filter((node) => node.depth === 2);
  assert.deepEqual(
    headings.map((heading) =>
      heading.children
        .map((child) => (child.type === "text" ? child.value : ""))
        .join(""),
    ),
    steamConstructDefinitions.map((definition) => definition.id),
  );
  for (const definition of steamConstructDefinitions) {
    const index = tree.children.findIndex(
      (node) =>
        node.type === "heading" &&
        node.children.some(
          (child) => child.type === "text" && child.value === definition.id,
        ),
    );
    const next = tree.children.findIndex(
      (node, candidate) =>
        candidate > index && node.type === "heading" && node.depth === 2,
    );
    const section = tree.children.slice(index + 1, next < 0 ? undefined : next);
    if (
      "observation" in definition &&
      definition.observation === "contextOnly"
    ) {
      assert.ok(
        section.some(
          (node) =>
            node.type === "paragraph" &&
            node.children.some(
              (child) =>
                child.type === "text" &&
                child.value
                  .replace(/\s+/gu, " ")
                  .includes(definition.contextReason),
            ),
        ),
      );
      assert.ok(
        !section.some((node) => node.type === "code"),
        "remote behavior cannot acquire invented source syntax",
      );
    } else {
      const fixture = constructCases.find((candidate) =>
        candidate.constructIds.includes(definition.id),
      );
      assert.ok(fixture);
      assert.ok(
        section.some(
          (node) =>
            node.type === "code" &&
            node.lang === "bbcode" &&
            node.value === fixture.source,
        ),
      );
      assert.ok(
        section.some(
          (node) =>
            node.type === "code" &&
            node.lang === "markdown" &&
            node.value === steamCommunityBbcodeToGfm(fixture.source).value,
        ),
      );
    }
  }
});

test("package-local documentation links resolve to real files", async () => {
  await checkDocumentationLinks(new URL("../", import.meta.url));
});

test("generated API pages retain every qualified link target beside fenced type syntax", async () => {
  /** @type {Record<string, string[]>} */
  const pages = JSON.parse(
    await readFile(
      new URL(
        "documentation-fixtures/reference-link-targets.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const [path, expected] of Object.entries(pages)) {
    const tree = fromMarkdown(
      await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
      { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] },
    );
    /** @type {import('mdast').Nodes[]} */
    const pending = [tree];
    const links = new Set();
    while (pending.length) {
      const node = pending.pop();
      assert.ok(node);
      if ("children" in node) pending.push(...node.children);
      if (node.type === "link") links.add(node.url);
    }
    for (const target of expected)
      assert.ok(links.has(target), `${path}: lost link target ${target}`);
  }
});

test("generated API pages retain the complete baseline heading inventory", async () => {
  /** @type {Record<string, Array<{depth: number, text: string}>>} */
  const pages = JSON.parse(
    await readFile(
      new URL(
        "documentation-fixtures/reference-headings.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  for (const [path, expected] of Object.entries(pages)) {
    const tree = fromMarkdown(
      await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
      { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] },
    );
    assert.deepEqual(
      tree.children
        .filter((node) => node.type === "heading")
        .map((node) => ({
          depth: node.depth,
          text: node.children
            .map((child) => ("value" in child ? child.value : ""))
            .join(""),
        })),
      expected,
      `${path}: changed baseline headings or duplicate-name ordering`,
    );
  }
});

test("public API parameter sections retain their empty-object defaults", async () => {
  const pages = new Map([
    [
      "index-1.md",
      [
        "gfmToSteamCommunityBbcode()",
        "steamCommunityBbcodeToGfm()",
        "steamCommunityBbcodeToMdast()",
      ],
    ],
    ["steam/parse-steam-bbcode.md", ["parseSteamCommunityBbcode()"]],
  ]);
  for (const [path, names] of pages) {
    const tree = fromMarkdown(
      await readFile(
        new URL(`../docs/reference/${path}`, import.meta.url),
        "utf8",
      ),
      { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] },
    );
    for (const name of names) {
      const start = tree.children.findIndex(
        (node) =>
          node.type === "heading" &&
          node.depth === 3 &&
          node.children.some(
            (child) => child.type === "text" && child.value === name,
          ),
      );
      assert.ok(start >= 0, `${path}: missing ${name}`);
      const next = tree.children.findIndex(
        (node, index) =>
          index > start && node.type === "heading" && node.depth <= 3,
      );
      const section = tree.children.slice(
        start + 1,
        next < 0 ? undefined : next,
      );
      assert.ok(
        section.some(
          (node) =>
            node.type === "paragraph" &&
            node.children.some(
              (child) => child.type === "text" && child.value.includes(" = "),
            ) &&
            node.children.some(
              (child) => child.type === "inlineCode" && child.value === "{}",
            ),
        ),
        `${path}: ${name} lost options = {}`,
      );
    }
  }
});
