# Getting started

This package is private and under qualification.
Use a source checkout; there is no published release to install.
Development supports Node 22.22.2+, 24.15.0+ and 26.0.0+ within those respective majors.
The complete documentation-tooling environment uses exact Node 24.21.0, also recorded in `.node-version`.
The converter's broader development and consumer runtime ranges are unchanged.
The package has separate, lower consumer minimums; see [Node support and qualification](node-support.md).

From the root of this standalone checkout with Node 24.21.0, npm 12.0.2 and Python 3.14.7 installed:

```text
npm run set-up:development
npm run check
npm run cli -- to-gfm path/to/description.bbcode
```

Setup installs the locked root, both isolated compiler-API tooling graphs, all three Node declaration environments and the separate Markdown graph, and retains a Python `.venv`.
Dependency installation scripts are disabled, and no ONI or optional comparison tooling is installed.
No Python formatter is installed or removed; the optional comparator keeps its own unchanged requirements.

On another supported converter development runtime:

```sh
npm run set-up:development -- --product-only
npm run check:product
```

Then select Node 24.21.0 for the independent documentation controls:

```sh
npm run install:markdown
npm run format:markdown
npm run test:markdown
npm run check:markdown
```

Unsupported Markdown runtimes fail explicitly; no installer runs automatically and no successful skip substitutes for checking.
The library executes ordinary JavaScript; checking and declaration generation are development steps.
See [JavaScript and types](javascript-and-types.md).

From an application with the packed package installed:

```js
import {steamCommunityBbcodeToGfm} from 'steam-community-bbcode';

const result = steamCommunityBbcodeToGfm('[h2]Guide[/h2][b]Text[/b]');
console.log(result.value);
for (const diagnostic of result.diagnostics) {
  console.error(diagnostic.code, diagnostic.fidelity, diagnostic.message);
}
```

The default profile is `workshop-item`.
Input punctuation stays literal until the Steam parser recognizes a qualified construct.
The native serializer escapes Markdown punctuation.
Unknown syntax and unsupported constructs retain source with diagnostics.
Neither conversion direction fetches images, follows links or reads files; the CLI reads only its selected file or stdin.

Before adopting output, inspect its diagnostics and occurrence coverage.
The [generated matrix](steam-support-matrix.md) describes executed policies, including lossy mappings.
[Reverse conversion](gfm-to-steam-limitations.md) is partial.
Use the [CLI fidelity policy](cli.md) when conversion participates in automation.

This package is [AGPL version 3 only](../LICENSE).
Copied helper and fixture material retains its separately recorded original notices.
