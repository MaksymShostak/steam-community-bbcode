# steam-community-bbcode

This AGPL-3.0-only package implements Steam Community BBCode parsing, MDAST conversion and GFM serialization.
All 39 registry entries have executed conversion policies: 37 observable source constructs and two context-only renderer rules.
The [generated matrix](docs/steam-support-matrix.md) distinguishes preserved, approximated and unsupported semantics.
Stable release qualification remains unfinished; the private `1.0.0` development label does not attest readiness.

The [accepted implementation plan](https://github.com/MaksymShostak/oxygen-not-included/blob/fe75c5d8e29f68e43812439fbc6ec73df2f43b05/docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md) (source checkout) defines an ESM JavaScript package with checked JSDoc, generated declarations, source-provenanced Steam constructs, MDAST semantics and native GFM serialization.
Steam-to-GFM is the primary direction; GFM-to-Steam implements an explicit subset.
The default source profile is `workshop-item`.
The library performs no network or filesystem I/O.
Unavoidable loss must receive structured diagnostics.

This standalone repository retains the package's AGPL-3.0-only licence.
The historical Workshop fixture and copied Python launcher retain their original MIT notices; the fixture also retains the Klei disclaimer.
See [LICENSE](LICENSE) for AGPL version 3 only.
Dependency notices retain their original terms; [third-party notices](docs/third-party-notices.md) accompany the descriptions copied into generated API documentation.
The retained licence assessment and source qualification do not authorize destination publication.
The [release guide](docs/releasing.md) describes candidate construction, manual publication and registry verification.

Use Node 24.20.0, npm 12.0.2 and Python 3.14.7 for development, matching the retained version pins.
From the repository root, run:

```text
npm run setup:development
npm run check
```

Setup installs the unchanged root, type-coverage and API-documentation locks with lifecycle scripts disabled, creates or validates the local `.venv`, and installs the hash-locked prose formatter.
It requires the selected tools to be installed already and stops on a version mismatch or command failure.
Set `PYTHON` to the selected interpreter's executable path if `python` on Windows or `python3` on Unix does not resolve to Python 3.14.7.
No ONI checkout, game installation, global npm link or optional comparator is required.
TypeScript 7 owns primary checking, declarations and consumers; the two TS 6 environments retain their metric and API-generation roles.
`npm run docs:format` applies semantic sentence line breaks to maintained package guides; `npm run docs:format:check` checks without writing.
Historical plans and migration evidence are excluded from formatting and npm distribution.
Chevrotain 13.2.0 now supplies the qualified grammar foundation.
Source parsing qualification is separate from the converter API and conformance requirements.

Historical Steamify evidence and independently defined regression contracts live under `test/fixtures/steamify/`.
All 16 current-description obligations and 17 additional cases pass the new converter's accounted-for preservation expectations.
`qualify:parser` checks the selected native grammar foundation separately.

```js
import {steamCommunityBbcodeToGfm} from 'steam-community-bbcode';

const result = steamCommunityBbcodeToGfm('[b]Literal *text*[/b]');
console.log(result.value);
console.log(result.diagnostics);
```

`parseSteamCommunityBbcode` returns immutable source syntax, positions and parsing diagnostics.
`steamCommunityBbcodeToMdast` accepts a source string or a result issued by that parser.
Prepared results retain their profile and parsing limits; changing those requires parsing the source string again.
MDAST preserves Steam extensions until GFM lowering applies the target policy.
Per-input `coverage` describes observed construct outcomes, not completion of the source registry.
Its `contextOnlyPolicies` separately identifies remote effects whose occurrences cannot be inferred from input.
Those entries do not count as observed constructs.

Conformance executes canonical, nested, literal-text and malformed contexts for each source case across all six profiles.
Profile membership records source evidence; these passes do not establish current Steam rendering on every surface or support for every parameter variant.
Some GitHub surfaces additionally autolink escaped text; `GFM_RENDERER_AUTOLINK_POSSIBLE` reports that possibility separately from GFM syntax fidelity.

The CLI, comparative corpus, seeded properties and resource contracts have local execution evidence.
Runtime coverage and mutation results are recorded with their assessed source snapshots in [testing](docs/testing.md).
Independent security/release review and the complete remote Node/OS matrix remain separate gates.
See [testing](docs/testing.md) for exact scope and retained evidence.

Start with [getting started](docs/getting-started.md), the [API](docs/api.md), [CLI](docs/cli.md), [per-construct examples](docs/conversion-semantics.md) and [diagnostics](docs/diagnostics.md).
Local package checks pass on Windows x64 with Node 22.23.2, 24.20.0 and 26.8.1.
The original source passed all six Windows/Linux jobs and both mutation gates at `fe75c5d8`; destination CI and release identity still require qualification. The [security model](docs/security-model.md) states resource and HTML boundaries, and [SECURITY.md](SECURITY.md) provides private reporting.
[Comparison](docs/comparison.md) and [release qualification](docs/releasing.md) distinguish recorded results from outstanding acceptance.

The forward URL policy uses native WHATWG parsing, permits HTTP/HTTPS and relative references (plus `mailto:` for links), and rejects control characters and backslashes before normalization.
Rejected destinations remain literal source with diagnostics.
The package never fetches destinations.
Unknown and currently unmapped constructs also retain their complete source with explicit diagnostics.

`gfmToSteamCommunityBbcode` is intentionally partial.
Its [independent support matrix](docs/steam-support-matrix.md#partial-gfm-to-steam) records mappings and literal preservation for unsupported GFM.
Check `unsupportedSourceNodes` and `diagnostics` before using its output.
Reverse resources must be safe absolute URLs: a relative Markdown destination has no qualified document base in Steam.
Images with meaningful alternative text, metadata and other unsupported nodes retain their complete Markdown source as literal text.

```js
import {gfmToSteamCommunityBbcode} from 'steam-community-bbcode';

const partial = gfmToSteamCommunityBbcode('## Heading\n\n**Text**');
console.log(partial.value);
console.log(partial.unsupportedSourceNodes);
```

Reverse `resourceLimits` default to 1 MiB of UTF-8 input, 100,000 native MDAST nodes, depth 128 and 8 MiB of UTF-8 output.
The root counts as one node at depth zero.
Input bytes are checked before native parsing; node/depth limits apply after native parsing and before rendering.
Output limits are checked as rendered subtrees are assembled.
Exceeding a limit returns an input-scoped error and an empty target, never a truncated document.
These bounds are not a parser timeout or a limit on the native parser's intermediate allocations.
Caller limits must be positive safe integers; supported renderer depth cannot exceed 256.

## Command line

The installed package exposes `steam-community-bbcode`.
From this source checkout, use `npm run cli -- COMMAND ...`.
The CLI executes the same public converters:

```text
steam-community-bbcode to-gfm STEAM_DESCRIPTION.bbcode
steam-community-bbcode to-gfm --fail-on=lossy STEAM_DESCRIPTION.bbcode
steam-community-bbcode to-gfm --format=json --profile=workshop-item description.bbcode
steam-community-bbcode to-steam README.md
steam-community-bbcode coverage --format=json
```

`to-steam` is **partial**.
Unsupported GFM is preserved as literal source and reported; inspect `unsupportedSourceNodes` in JSON output.
Omit the input path or use `-` to read stdin.
Use `--` before an input filename that starts with `-`.
Input is UTF-8; malformed byte sequences fail instead of becoming replacement characters.
The CLI enforces the default 1-MiB input bound while reading, with `--max-input-bytes=N` for an explicit positive safe-integer override.

Stdout contains only converted text, or the public result object with `--format=json`.
Stderr contains one JSON object per diagnostic.
`--fail-on` accepts `none` (default), `approximate`, `lossy` or `unsupported`, and rejects the chosen fidelity or worse.
Exit status is 0 for acceptance, 1 for conversion or fidelity failure, and 2 for argument, I/O or encoding failure.
Fidelity failures retain output for inspection; check the exit status before adopting it.
No output-file overwrite option is provided.
`--profile` applies to `to-gfm` only.

The `coverage` command prints the shipped **conformance** report.
It does not measure runtime code coverage or run a Steam renderer.
`--help` describes the commands and partial reverse contract.
Archive consumer checks exercise the actual installed npm binary and shipped report without network resolution.
