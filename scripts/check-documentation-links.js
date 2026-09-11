// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

/** @param {URL} packageUrl */
export async function checkDocumentationLinks(packageUrl) {
  const docs = await readdir(new URL("docs/", packageUrl), { recursive: true });
  const paths = [
    ...(await readdir(packageUrl)).filter((path) => path.endsWith(".md")),
    ...docs
      .map((path) => path.replaceAll("\\", "/"))
      .filter(
        (path) =>
          path.endsWith(".md") &&
          !path.startsWith("plans/") &&
          !path.startsWith("migration/"),
      )
      .map((path) => `docs/${path}`),
  ];
  let checked = 0;
  for (const path of paths) {
    const documentUrl = new URL(path, packageUrl);
    const tree = fromMarkdown(await readFile(documentUrl, "utf8"), {
      extensions: [gfm()],
      mdastExtensions: gfmFromMarkdown(),
    });
    /** @type {import('mdast').Nodes[]} */
    const pending = [tree];
    while (pending.length) {
      const node = pending.pop();
      assert.ok(node);
      if ("children" in node) pending.push(...node.children);
      if (
        node.type !== "link" &&
        node.type !== "image" &&
        node.type !== "definition"
      )
        continue;
      const destination = new URL(node.url, documentUrl);
      if (destination.protocol !== "file:") continue;
      assert.ok(
        destination.href.startsWith(packageUrl.href),
        `${path}: link escapes package: ${node.url}`,
      );
      await assert.doesNotReject(access(destination), `${path}: ${node.url}`);
      checked++;
    }
  }
  assert.ok(checked > 0, "the documentation must exercise actual local links");
}
