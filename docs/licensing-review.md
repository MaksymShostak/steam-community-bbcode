# Licence compatibility assessment

Reviewed 10 September 2026 for the private `steam-community-bbcode` 1.0.0 source package, with a standalone development-tool supplement on 11 September 2026.
This is the documented assessment selected by the owner, not an independent lawyer's opinion or authorization to publish.
The accepted baseline requires explicit pre-release legal review; it does not prescribe independent legal counsel.

## Conclusion and distribution boundary

No incompatible licence term was identified for the converter's current AGPL-3.0-only distribution.
Its 66 production dependency entries comprise 60 MIT and six Apache-2.0 entries, all with retained full installed licence texts.
This conclusion depends on preserving those dependencies' separate grants, copyright notices and applicable notices.
AGPL-3.0-only describes this package's own work; it does not replace the licences of its dependencies or copied fixture material.

The lean npm archive contains authored runtime source, declarations and maps, the CLI's conformance data, a concise README, security guidance, the full AGPL and the [Microsoft notice for generated unist descriptions](third-party-notices.md).
Detailed documentation, source specifications and generation tooling remain available in the versioned source repository, outside the npm payload.
Dependencies are installed separately through npm; the archive does not bundle their implementations.
Tests, comparators, development tools, `node_modules`, local evidence and the historical mod-description fixture are outside its allowlist.
The owlapi release-script reuse retains attribution within the same AGPL-3.0-only boundary described in [software selection](software-selection.md#release-tooling-reuse-9-september-2026).

The assessment supports the currently authorized local source handoff.
Public identity, source availability, destination packaging and publication approval remain destination release responsibilities described in [releasing](releasing.md).
Reassess concrete changes to dependencies, copied material, bundling or service deployment; there is no blanket requirement to commission a lawyer before moving the unchanged source.

## Terms applied

The assessment applies the actual grants and conditions, not an SPDX allowlist alone.
The FSF describes permissive components retaining their original terms within a copyleft combination in its [compatibility guidance](https://www.gnu.org/licenses/license-compatibility.html).
Apache's [compatibility explanation](https://www.apache.org/licenses/GPL-compatibility) confirms compatibility with GPL version 3; the [AGPL text](https://www.gnu.org/licenses/agpl-3.0.html) supplies this package's actual conditions.
These sources support the following assessment of the observed distribution boundaries.

| Material                                                                            | Terms and disposition                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Authored converter and reused owlapi release scripts                                | AGPL-3.0-only. Preserve licence and notices, provide the applicable corresponding source when conveying covered work, and assess section 13 when deploying a modified network-interactive version. A local library package does not by itself establish such a deployment.                                                                                                     |
| Production MIT components                                                           | Keep the copyright and permission notices with redistributed copies or substantial portions, including declarations or copied documentation. Their permissive grants permit inclusion alongside this AGPL work.                                                                                                                                                                |
| Production Apache-2.0 components                                                    | Retain the full licence and applicable notices; preserve attribution and identify modifications if any are made. The patent and trademark provisions continue to apply. The selected dependencies are unmodified.                                                                                                                                                              |
| Development MIT, ISC, BSD-2-Clause, BSD-3-Clause, 0BSD and BlueOak-1.0.0 components | Inspect their separate notice, disclaimer and non-endorsement terms. [BlueOak](https://blueoakcouncil.org/license/1.0.0) additionally grants patent rights. These tools are not included in the npm archive; copying their binaries or source would require carrying the applicable terms.                                                                                     |
| `caniuse-lite` 1.0.30001810 data                                                    | CC-BY-4.0, with attribution, licence-reference and change-indication conditions if shared. It is development data, not incorporated into converter output or shipped as converter code.                                                                                                                                                                                        |
| Docs-only `argparse` 2.0.1                                                          | Its complete Python/PSF historical licence chain is retained, including notice retention and modification-summary conditions. The tool is unmodified and excluded from the archive; the label `Python-2.0` alone is not the assessment.                                                                                                                                        |
| Historical legacy comparator graph                                                  | The retired graph used `json-schema`'s BSD-3-Clause option in its AFL-2.1 OR BSD-3-Clause grant, alongside actual Unlicense and WTFPL grants. Six entries lacking modern lockfile licence fields were covered by their MIT texts or the versioned CSSOM receipt below. These receipts remain historical evidence; the graph is no longer selected or executed by this package. |
| Snapper 0.11.0                                                                      | The unmodified MIT development executable has a native inventory of 268 Rust components, including Unicode-3.0 and MPL-2.0. It formats authored text and is neither linked into the converter nor redistributed in its archive. Its dependencies do not relicense that authored text. Preserve its inventory and notices if carrying the installed tool separately.            |

The FSF's [licence list](https://www.gnu.org/licenses/license-list.html) provides supporting interpretation for the permissive, Python and Unicode families.
MPL obligations on a separately used formatter are not treated as obligations to relicense the converter.
This assessment does not authorize removing third-party notices, modifying vendor code or representing the software as endorsed by its dependencies' authors.

## Missing-text follow-up

The earlier collector recognized only licence filenames beginning with a small set of words.
The follow-up also reads `MIT-LICENSE.txt`, README grants and source-header terms.
That resolves omissions for CSSStyle, commander and esrecurse without changing their packages.
`natural-compare` 1.4.0 identifies Lauri Rooden's MIT grant in its source and README; the README's [author-hosted full text](https://lauri.rooden.ee/mit-license.txt) is retained.
`type-coverage` and `type-coverage-core` 2.30.1 use their exact upstream version's [MIT text](https://github.com/plantain-00/type-coverage/blob/v2.30.1/LICENSE).

Four additional cases required source-specific investigation:

The CSSOM and tr46 cases below now belong solely to the retired comparator's historical record.

| Component               | Evidence and resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@humanfs/types` 0.15.0 | npm binds the version to commit `85069f193cbacc371c3beb649ce746f8c5a493be`. Its [package README](https://github.com/humanwhocodes/humanfs/blob/85069f193cbacc371c3beb649ce746f8c5a493be/packages/types/README.md) declares Apache-2.0; the same revision contains the [full Apache text](https://github.com/humanwhocodes/humanfs/blob/85069f193cbacc371c3beb649ce746f8c5a493be/packages/core/LICENSE) in sibling packages. The types archive itself omits that text. Retain the declaration and full terms together. |
| `weapon-regex` 2.0.5    | npm identifies commit `a622adc177e36990c31080187f06dbfe1f7d801e`, whose [licence](https://github.com/stryker-mutator/weapon-regex/blob/a622adc177e36990c31080187f06dbfe1f7d801e/LICENSE) is Apache-2.0. Its compiled archive omits the licence and bundles other code; the bundle follow-up below covers those notices.                                                                                                                                                                                               |
| `cssom` 0.2.5           | The version tag resolves to `d46609dfd5b94cf5980eb987c633b2cbf9700395`, with Nikita Vasilyev's [full MIT notice](https://github.com/NV/CSSOM/blob/d46609dfd5b94cf5980eb987c633b2cbf9700395/MIT-LICENSE.txt). The archive's npm-ignore list excludes that file. Preserve the upstream notice with any redistributed copy.                                                                                                                                                                                              |
| `tr46` 0.0.3            | npm identifies `a8009f9ce80ff5dbe71dd71e203afe4e4c878d28`, with an explicit MIT declaration but no licence file. The maintainer [added the MIT text](https://github.com/jsdom/tr46/commit/3a6f29721e7063b9ffd421e461a54beae6170001) in response to [issue 4](https://github.com/jsdom/tr46/issues/4). This is a later clarification, not a file claimed to exist in the original archive. Its bundled Unicode data is assessed separately below.                                                                      |

The `weapon-regex` source map identifies Scala.js 1.22.0, Scala 2.13.18, Cats 2.12.0 and Cats Parse 1.1.0.
The [versioned build](https://github.com/stryker-mutator/weapon-regex/blob/a622adc177e36990c31080187f06dbfe1f7d801e/build.sbt) resolves the otherwise unversioned local source-map path to mutation-testing-metrics 3.9.0.
Full Apache/MIT terms, Scala/Scala.js notices and Cats' additional Scalaz BSD notice are retained from these versions.
The Scala.js notice also describes JUnit/EPL code elsewhere in that project; none of the 310 bundled source-map entries identifies JUnit or Hamcrest.
The source map and build establish the inspected bundle's origins; they are not a claim that every file in each upstream repository is bundled.

The `tr46` mapping table matches all 8,179 rows of [Unicode 8.0.0 IDNA data](https://www.unicode.org/Public/idna/8.0.0/IdnaMappingTable.txt) byte-for-byte after independently applying its versioned generator's transformation.
Its installed SHA-256 is `b6b39724dca9011113a08d9d6910204062b58169e98952acdfbd19bf2c31bbff`.
The generated JSON strips the source notice, so an MIT-only description misses third-party data attribution.
Retained evidence includes the original 1991–2015 Unicode notice, the generator, full data, the historical data-licence text and Unicode's [current terms](https://www.unicode.org/copyright.html) and [data licence](https://www.unicode.org/license.txt).
Those current terms include computer data files under `Public/`; keep the applicable copyright/permission notice and identify the JSON transformation if redistributing the comparator's data.
No Unicode table is copied into the converter or its distribution.

## Fixture and transfer rights

The [historical Steamify fixture record](https://github.com/MaksymShostak/oxygen-not-included/blob/fe75c5d8e29f68e43812439fbc6ec73df2f43b05/tools/steam-community-bbcode/test/fixtures/steamify/README.md) distinguishes independently authored AGPL fixtures from the recovered original mod description.
The original is user-authored repository material under the root MIT grant, with its SHA-256 and recovery provenance recorded.
Keep that original MIT copyright/permission text and the Klei disclaimer when transferring the fixture; the AGPL package licence does not replace them.
The fixture contains text and references, not copied game binaries or image assets.
Links do not establish rights to download and redistribute the referenced assets, and this implementation does not fetch them.

Transfer the source, lockfiles, authored notices and retained review evidence together.
Retained development/comparison dependencies are reproducible setup inputs, not part of the npm archive or a reason to copy `node_modules` into the new repository. Carry the retired comparator's results and licence receipts as historical evidence, without reintroducing its executable graph. If a separate offline bundle includes third-party implementations, carry their recovered full terms and bundled-code/data notices with it.

## Reproducible review record

The refreshed evidence is under `.sdlc/runtime/converter/release-qualification/licensing-followup/` in the source checkout.
The original `locked-licence-texts.json` records 570 lock entries across the five environments, including full installed texts and their hashes.
The subsequent comparator `qs` repair added six MIT entries and replaced `qs` 6.5.5 with BSD-3-Clause 6.16.0, bringing that historical snapshot to 576 entries.
The sibling `../ci-34524391937-licences.json` preserves supplemental full texts for all seven changed components, whose exact versions, archive integrities and complete notices match the already assessed main development graph.
Those terms continue to govern any separately retained copies of that historical tooling.
The owner-approved retirement removes the 129-entry legacy Node comparison graph from current selection, leaving 447 entries across four npm environments and preserving the unchanged 66-entry production graph.
The original and supplemental receipts remain intact; the table below identifies the source-handoff locks before the standalone release-tool additions.
There are 38 uninstalled entries across platform-specific optional development compiler packages; their declared Apache terms and the selected compiler's notices are recorded without claiming an installed-file inspection for those platforms.
Additional primary-source receipts record retrieval time, exact URL/revision, HTTP status and SHA-256. These local records supplement the existing SBOMs and archive/consumer checks; they are not included in Git or the npm archive and must be carried with the handoff.

| Lockfile relative to package              | SHA-256                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `package-lock.json`                       | `a81aa74d301361594437a200ba7336f4d3aa8a7fb5b4be1bcb3c96089a77c5d0` |
| `tooling/type-coverage/package-lock.json` | `4d759bb525c039b8e8036194317729b052b8a0d97f326620df5f5a842e9bf2e4` |
| `tooling/api-docs/package-lock.json`      | `2ca887f8c16c70f3c8634c2e03151f01e0df30a330ee182f7a00bd68f0afd346` |
| `comparison/bbob/package-lock.json`       | `06bf089fba6471e10fb92bb05b9c84e2085d8b978e09eacd58be18877b61cb2b` |

## Standalone release-tool supplement — 11 September 2026

The owner approved Sigstore 5.0.0 and its strict declaration prerequisites, `@types/make-fetch-happen` 10.0.4 and `@sigstore/rekor-types` 5.0.0, for authenticated release verification.
Native npm 12.0.2 added 53 development-only lock entries without changing any existing version or archive integrity.
The four environments now contain 500 entries; the 66-entry production graph remains unchanged.
At release-tool commit `ddf08f91695a0d5f7047c36a73f4fc3d5f09acab`, the root lock SHA-256 is `c2f9aff3d79d8d2d23f4f9938613e83bb1d3c0cd95f82425a7aba020ff81369f`; the other three hashes above are unchanged.
The subsequent `1.0.0-rc.1` preparation changes only the root package version fields, giving root lock SHA-256 `6fff66434168765710a530e4964bc95d4efa575a9ccc95cbad267f0c8309dbaa`; dependency entries and their terms are unchanged.

The additional entries declare 29 MIT, 14 ISC, eight Apache-2.0, one BSD-2-Clause and one BlueOak-1.0.0 licence.
Full installed notice texts were retained for 50 entries.
The omitted Apache text for `@sigstore/verify` 4.1.2 was recovered from its [exact upstream revision](https://github.com/sigstore/sigstore-js/blob/769a53d8713248a8bf49edfc2a5d1955b0dcc24d/LICENSE), bringing package-specific full-text coverage to 51 of 53.

Two notice gaps remain: `@npmcli/agent` 5.0.2 [declares ISC](https://github.com/npm/agent/blob/3fadae4d3ea4cc6c73003db2b42456afab9e3cdd/package.json), and `proxy-agent-negotiate` 1.1.0 [declares MIT](https://github.com/TooTallNate/proxy-agents/blob/b7e5f7ccce1a3ac5b339cc4c587974e8989cbc16/packages/negotiate/package.json), but neither inspected package or corresponding repository location contains its own full notice.
The canonical [ISC](https://spdx.org/licenses/ISC.html) and [MIT](https://spdx.org/licenses/MIT.html) terms are retained separately as the terms referenced by those declarations, not as recovered author-specific notices.
No copyright year or sibling-package notice is substituted.
This assessment supports using the declared permissive development tools locally; it does not establish complete notice evidence for redistributing those two packages.
They remain outside the converter archive, and any separately distributed tooling bundle must resolve those notice gaps first.

The Apache, MIT, ISC, BSD and BlueOak conditions above also apply to these additions.
No incompatible term was identified for the unchanged converter distribution boundary, and this supplement does not grant publication approval.
Full texts, declarations, retrieval URLs and hashes are retained in `artifacts/portability/release-development-license-texts.json` and `artifacts/portability/release-development-license-supplement.json`, with the private migration evidence.

## Formatting-tool supplement — 11 September 2026

The owner approved Prettier 3.9.6 and eslint-config-prettier 10.1.8 as development-only tools.
Both packages include full MIT licence notices, inspected in their installed package roots.
Prettier credits James Long and contributors; eslint-config-prettier credits Simon Lydell and contributors.
Their notices must accompany any redistribution of those tools; neither tool enters the converter's production package boundary.
The native npm 12.0.2 lock update has SHA-256 `ebc851735273a24d261ad9f34032ef1b7259a85c708a5bc1bf746e584dbdc762`.
