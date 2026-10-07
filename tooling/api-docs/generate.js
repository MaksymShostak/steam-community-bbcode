// SPDX-License-Identifier: AGPL-3.0-only
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  Application,
  Converter,
  ReferenceType,
  ReflectionType,
  ReflectionKind,
  makeRecursiveVisitor,
} from "typedoc";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { format } from "prettier";
import { MarkdownTheme } from "typedoc-plugin-markdown";
import {
  nodeDeclarationEnvironment,
  verifyNodeDeclarationResolution,
} from "../../scripts/node-declaration-environment.js";

const packageRoot = new URL("../../", import.meta.url);
const options = fileURLToPath(new URL("typedoc.json", import.meta.url));
const { values } = parseArgs({
  options: { check: { type: "boolean" }, "node-types": { type: "string" } },
});
const environment = values["node-types"]
  ? nodeDeclarationEnvironment(values["node-types"])
  : undefined;

/** @param {import('typedoc-plugin-markdown').MarkdownThemeContext} context
 * @param {import('typedoc').Reflection} model
 */
function typeReferences(context, model) {
  /** @type {Map<string, import('mdast').Link>} */
  const links = new Map();
  /** @type {Set<import('typedoc').Reflection>} */
  const seen = new Set();
  const visitor = makeRecursiveVisitor({
    reference(type) {
      const target = type.reflection;
      const url =
        target &&
        target.kind !== ReflectionKind.TypeParameter &&
        context.router.hasUrl(target)
          ? context.urlTo(target)
          : type.externalUrl;
      if (url)
        links.set(url, {
          type: "link",
          url,
          children: [{ type: "inlineCode", value: target?.name ?? type.name }],
        });
    },
    reflection(type) {
      visit(type.declaration);
    },
  });
  /** @param {import('typedoc').Reflection} reflection */
  function visit(reflection) {
    if (seen.has(reflection)) return;
    seen.add(reflection);
    if (
      reflection.isDeclaration() ||
      reflection.isSignature() ||
      reflection.isParameter() ||
      reflection.isTypeParameter()
    )
      reflection.type?.visit(visitor);
    if (reflection.isTypeParameter()) reflection.default?.visit(visitor);
    reflection.traverse(visit);
  }
  visit(model);
  if (!links.size) return "";
  /** @type {import('mdast').PhrasingContent[]} */
  const children = [{ type: "text", value: "Type references: " }];
  for (const link of links.values()) {
    if (children.length > 1) children.push({ type: "text", value: ", " });
    children.push(link);
  }
  children.push({ type: "text", value: "." });
  return toMarkdown({
    type: "root",
    children: [{ type: "paragraph", children }],
  });
}

class RepositoryMarkdownTheme extends MarkdownTheme {
  /** @param {import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>} page */
  getRenderContext(page) {
    const context = super.getRenderContext(page);
    const declarationTitle = context.partials.declarationTitle;
    context.partials.declarationTitle = (model) =>
      [declarationTitle(model), typeReferences(context, model)]
        .filter(Boolean)
        .join("\n\n");
    const signatureTitle = context.partials.signatureTitle;
    context.partials.signatureTitle = (model, options) =>
      [signatureTitle(model, options), typeReferences(context, model)]
        .filter(Boolean)
        .join("\n\n");
    // Return types are TypeScript syntax, not prose or Markdown link punctuation.
    context.helpers.getReturnType = (type) =>
      type
        ? toMarkdown(
            {
              type: "root",
              children: [{ type: "code", lang: "ts", value: type.toString() }],
            },
            { fences: true },
          )
        : "";
    return context;
  }
}

/** Generate with the supported native application and preserve its diagnostics.
 * @param {import('typedoc').TypeDocOptions} overrides
 */
async function generate(overrides) {
  const app = await Application.bootstrapWithPlugins({
    options,
    ...overrides,
    ...(environment
      ? { compilerOptions: { typeRoots: environment.typeRoots } }
      : {}),
  });
  app.renderer.defineTheme("repository-markdown", RepositoryMarkdownTheme);
  app.options.setValue("theme", "repository-markdown");
  if (environment) {
    app.converter.on(Converter.EVENT_BEGIN, (context) => {
      const count = verifyNodeDeclarationResolution(
        context.programs.flatMap((program) =>
          program.getSourceFiles().map((source) => source.fileName),
        ),
        environment.nodeRoot,
      );
      console.log(
        `TypeDoc resolved ${count} files from Node declarations ${environment.version}: ${environment.nodeRoot}`,
      );
    });
  }
  const project = await app.convert();
  assert.ok(project, "TypeDoc must produce a native project.");
  app.validate(project);
  assert.ok(
    !app.logger.hasErrors() && !app.logger.hasWarnings(),
    "TypeDoc diagnostics must be clean.",
  );
  await app.generateOutputs(project);
  assert.ok(
    !app.logger.hasErrors() && !app.logger.hasWarnings(),
    "Native rendering must be clean.",
  );
  return project;
}

const fixtureRoot = new URL(
  "artifacts/api-documentation-fixture/",
  packageRoot,
);
const fixture = await generate({
  entryPoints: ["api.js", "model.js"].map((name) =>
    fileURLToPath(
      new URL(`test/documentation-fixtures/${name}`, packageRoot),
    ).replaceAll("\\", "/"),
  ),
  out: fileURLToPath(new URL("markdown/", fixtureRoot)),
  json: fileURLToPath(new URL("model.json", fixtureRoot)),
});
const callable = fixture.getChildByName(["api", "envelope"]);
assert.ok(callable?.isDeclaration());
const signature = callable.signatures?.[0];
assert.ok(signature);
assert.ok(signature.type instanceof ReferenceType);
assert.equal(signature.type.name, "Envelope");
const argument = signature.type.typeArguments?.[0];
assert.ok(argument instanceof ReferenceType);
assert.equal(
  argument.reflection,
  signature.typeParameters?.[0],
  "The result must retain the caller generic.",
);
const definition = signature.type.reflection;
assert.ok(
  definition?.isDeclaration() && definition.type instanceof ReflectionType,
);
const value = definition.type.declaration.getChildByName("value");
assert.ok(value?.isDeclaration() && value.type instanceof ReferenceType);
assert.equal(
  value.type.reflection,
  definition.typeParameters?.[0],
  "The imported value must retain the alias generic.",
);
assert.ok(
  signature.comment?.summary.some((part) =>
    part.text.includes("Retain the input"),
  ),
);
const renderedFixture = await readFile(
  new URL("markdown/api.md", fixtureRoot),
  "utf8",
);
assert.match(renderedFixture, /Envelope/);
assert.match(renderedFixture, /Retain the input in a labelled envelope/);
assert.match(renderedFixture, /The same generic value and a label/);
assert.ok(
  fromMarkdown(renderedFixture).children.some(
    (node) =>
      node.type === "paragraph" &&
      node.children.some(
        (child) => child.type === "link" && child.url === "model.md#envelope",
      ),
  ),
  "Fenced signatures must retain clickable references to imported generic types.",
);
const renderedModel = fromMarkdown(
  await readFile(new URL("markdown/model.md", fixtureRoot), "utf8"),
);
assert.ok(
  renderedModel.children.some(
    (node) =>
      node.type === "code" && node.lang === "ts" && node.value === "value: T;",
  ),
  "The rendered imported property must retain its generic type in native code syntax.",
);

const reference = await generate({});
const sourceSpan = reference.getChildByName(["index", "SourceSpan"]);
assert.ok(
  sourceSpan?.isDeclaration(),
  "The exported native source-span contract must be documented.",
);
assert.deepEqual(sourceSpan.children?.map((child) => child.name).sort(), [
  "end",
  "start",
]);
assert.ok(sourceSpan.getChildByName("start")?.isDeclaration());
const generatedRoot = new URL("artifacts/api-reference/markdown/", packageRoot);
const referenceRoot = new URL("docs/reference/", packageRoot);

/** @param {URL} root */
async function files(root) {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(
        fileURLToPath(root),
        join(entry.parentPath, entry.name),
      ).replaceAll("\\", "/"),
    )
    .sort();
}

const names = await files(generatedRoot);
assert.ok(names.length > 1 && names.every((name) => name.endsWith(".md")));
/** @param {import('mdast').Nodes} node
 * @returns {Array<{type: string, value: string, lang?: string | null, meta?: string | null}>}
 */
function literals(node) {
  if (node.type === "code")
    return [
      {
        type: node.type,
        value: node.value,
        lang: node.lang ?? null,
        meta: node.meta ?? null,
      },
    ];
  if (node.type === "inlineCode" || node.type === "html")
    return [{ type: node.type, value: node.value }];
  return "children" in node ? node.children.flatMap(literals) : [];
}
// Serialize rendered type punctuation as Markdown text, not accidental media
// syntax. The native tree retains links, anchors and TypeDoc's code signatures.
for (const name of names) {
  const target = new URL(name, generatedRoot);
  const tree = fromMarkdown(await readFile(target, "utf8"), {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  const content = await format(
    toMarkdown(tree, { extensions: [gfmToMarkdown()], fences: true }),
    {
      parser: "markdown",
      proseWrap: "preserve",
      embeddedLanguageFormatting: "off",
    },
  );
  assert.deepEqual(
    literals(
      fromMarkdown(content, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown()],
      }),
    ),
    literals(tree),
    `Generated signatures, literals and anchors must survive Markdown serialization: ${name}`,
  );
  await writeFile(target, content);
}
if (values.check) {
  assert.deepEqual(
    await files(referenceRoot),
    names,
    "Generated API documentation file inventory is stale.",
  );
  for (const name of names) {
    assert.equal(
      await readFile(new URL(name, referenceRoot), "utf8"),
      await readFile(new URL(name, generatedRoot), "utf8"),
      `Generated API documentation is stale: ${name}`,
    );
  }
} else {
  await mkdir(referenceRoot, { recursive: true });
  for (const name of await files(referenceRoot)) {
    assert.ok(
      name.endsWith(".md"),
      "Only generated Markdown belongs in the reference folder.",
    );
    if (!names.includes(name)) await unlink(new URL(name, referenceRoot));
  }
  for (const name of names) {
    const destination = new URL(name, referenceRoot);
    await mkdir(dirname(fileURLToPath(destination)), { recursive: true });
    await writeFile(destination, await readFile(new URL(name, generatedRoot)));
  }
}
console.log(
  `Qualified imported generic JSDoc and ${names.length} native API reference files.`,
);
