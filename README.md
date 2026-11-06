# steam-community-bbcode

Convert Steam Community BBCode to GitHub Flavored Markdown or a Markdown syntax tree in Node.js.
The default source profile is `workshop-item`.
Conversion in the other direction covers a subset of Markdown.

Inspect the diagnostics alongside the output.
An underline, for example, can become plain text without losing its words.
The diagnostic identifies the formatting that was lost.

## Install and use

The release candidate targets Node.js 22.11.0+, 24.11.0+ and 26.0.0+ within those majors.
Registry publication and stable acceptance are separate release steps.

To test a qualified tarball, replace the example path with its location on your computer.

```sh
npm install /path/to/steam-community-bbcode-1.0.0-rc.1.tgz
```

### Convert a Steam description

Run this example in an ES module.
The BBCode bold tags mark the span, while the asterisks inside it belong to the original text.

```js
import {steamCommunityBbcodeToGfm} from 'steam-community-bbcode';

const result = steamCommunityBbcodeToGfm('[b]Literal *text*[/b]');
console.log(result.value);
console.log(result.diagnostics);
```

The result contains the following Markdown and an empty diagnostics array.
The outer asterisks mark bold text.
The escaped asterisks around `text` display literally.

```markdown
**Literal \*text\***
```

The package includes TypeScript declarations and declaration maps.
Library conversion performs no network or filesystem I/O.
Unknown and unsupported constructs retain source with diagnostics; successful execution alone does not mean lossless conversion.

## Command line

```sh
npx --no steam-community-bbcode to-gfm --format=json --profile=workshop-item --fail-on=lossy description.bbcode
npx --no steam-community-bbcode to-steam README.md
npx --no steam-community-bbcode coverage --format=json
```

Omit the input path or use `-` for stdin.
Stdout contains converted text or the JSON result.
Stderr carries diagnostics.
Exit codes are 0 for acceptance, 1 for conversion/fidelity failure and 2 for argument, I/O or encoding failure.

Fidelity failures retain output for inspection: check the exit status before using it.
The `coverage` command reads the shipped conformance report; it does not measure runtime code coverage.

## Documentation

These links select the fixed documentation snapshot matching the current conversion API, rather than a moving branch:

- [Getting started and development setup](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/getting-started.md)
- [API reference](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/api.md)
- [CLI options and fidelity policy](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/cli.md)
- [Supported constructs and conversion limitations](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/steam-support-matrix.md)
- [Diagnostics](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/diagnostics.md)
- [Security model and resource limits](https://github.com/MaksymShostak/steam-community-bbcode/blob/6d0d731399c5afb6418c11682b2ad63bdb02d600/docs/security-model.md)

Detailed documentation, specifications, tests and release tooling remain in the [source repository](https://github.com/MaksymShostak/steam-community-bbcode).
They are maintained alongside the code and excluded from npm installations.

## Licence and reporting

Licensed under [AGPL-3.0-only](LICENSE).
Retained [third-party notices](docs/third-party-notices.md) preserve separate terms.
See [SECURITY.md](SECURITY.md) for private vulnerability reporting and [GitHub issues](https://github.com/MaksymShostak/steam-community-bbcode/issues) for other reports.
