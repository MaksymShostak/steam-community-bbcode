# Node support and qualification

## Support policy

| Use                      | Owning declaration                                                                | Meaning                                                                         |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Installed consumers      | [`engines.node`](../package.json)                                                 | Supported stable Node families and their consumer minimums.                     |
| Source development       | [`devEngines.runtime`](../package.json)                                           | Separate minimums required by the locked development tools.                     |
| Reference CI and release | [`.node-version`](../.node-version)                                               | One exact Node reference for routine reference jobs, release and qualification. |
| Compatibility references | [Node 22](../.github/node-versions/22) and [Node 24](../.github/node-versions/24) | Exact older-family endpoints alongside the declared minimums.                   |

Support includes stable minor and patch releases at or above each minimum within that major.
Other majors and prereleases are outside the declared ranges.
Recommend the latest patched LTS release for ordinary use; historical minimums are compatibility targets, not recommended installations.
Changing a family's release phase does not silently change its existing compatibility minimum.

Consumer minimums for Node 22 and 24 are their first LTS releases.
Development minimums also satisfy the locked development dependency graph, including Sigstore 5.
They are deliberately separate: consumers do not need the publisher's development tools.
These targets require passing qualification before a release can claim the tested compatibility.

`package.json#engines.node` declares consumer compatibility.
`package.json#devEngines.runtime` is enforced by npm before `install`, `ci` and `run`, including `npm run set-up:development` on a fresh clone.
Use that npm entry point for setup.
The [`.node-version`](../.node-version) file identifies the exact reference build.
The converter support ranges are declared separately.
CI selects the exact npm version declared in [the root manifest](../package.json).
The shared setup action installs and verifies that selection before project npm commands.
Local development can use the npm bundled with a supported Node.js version; no separate local npm floor or exact-npm setup restriction is enforced.
Development requires stable Python at or above the minimum in `.python-version`.
That file selects the reproducible Python reference for setup and CI; setup also accepts newer stable interpreters and compatible existing environments.
Markdown Quality is an ordinary root development dependency declared at `>=3.0.1`, with core and matching optional native packages frozen by the root lock.
Its Node floor of 22.13.0 is already within this repository's declared development ranges; setup has no separate Markdown-only runtime restriction.
Development dependencies are excluded from the shipped converter dependency graph.
Use `npm run set-up:development` on a supported development runtime, then `npm run check:product` for converter-only checks or `npm run check` for the complete local aggregate.

## Qualification and reproducibility

On Windows and Linux, the package checks workflow runs the public fresh-clone setup, product checks and matching Node declaration qualification at each development minimum and each pinned reference.
Dedicated Markdown jobs check the entire authored corpus on both qualified platforms, even when only a link target or code changes.
`BBCode / Qualification` requires both product and Markdown results; failure, cancellation, skip or absence cannot satisfy either gate.

The consumer workflow runs the installed package's authored JavaScript and CLI cases at each consumer minimum and each pinned reference.
It checks packed declarations against the matching isolated Node declaration environment using the publisher's compiler and development runtime.
Thus declaration compatibility does not assert that the compiler itself runs on every consumer runtime.

All consumer lanes download the same archive instead of rebuilding it.
Release publication additionally depends on these lanes passing against the actual retained release candidate.
The aggregate rejects failed, cancelled, skipped or absent consumer results.
Workflow configuration alone is not hosted qualification evidence; inspect the corresponding successful run before accepting a release.

Keep exact dependency locks and the reference build environment.
The two compatibility workflows share exact patch references for [Node 22](../.github/node-versions/22), [Node 24](../.github/node-versions/24) and [Node 26](../.node-version).
Update these pins deliberately when qualifying newer patches.

Consumer diagnostics remain at their native runner paths and are streamed into the qualification log: `consumer-report.json` with actual runtime, tooling runtime, npm, platform, architecture, declaration version and archive SHA-256, plus `consumer-package-lock.json`, declaration resolution evidence and the qualification log.
The reporting step binds them to the source commit, run/attempt, lane and retained archive; its summary lists file sizes and hashes.

Package qualification retains one shared consumer archive for seven days, including reusable Release prechecks.
Proven development-documentation-only PR/main checks skip package jobs and create no consumer archive; explicit qualification and Release always construct and exercise the package.

After expiry, start a newly qualified run when the preliminary archive is needed; do not rebuild under an old run identity.
Replay with those exact versions and bytes; a floating selector alone is not a reproducible environment identity.

For local consumer qualification with an installed alternate Node executable:

```sh
npm run test:package -- --archive /path/to/candidate.tgz --runtime /path/to/node --node-types 22 --output artifacts/consumer-node22
```

Passing tested versions substantiates those executions and supports a SemVer-based expectation for later compatible releases.
It does not guarantee future correctness or claim that every intervening release was executed.

## Authoritative references

- [Node package support guidance](https://github.com/nodejs/package-maintenance/blob/main/docs/PACKAGE-SUPPORT.md): first-LTS support is an explicitly broader project promise than the default latest-release interpretation.
- [Node 22.11.0 LTS announcement](https://nodejs.org/en/blog/release/v22.11.0) and [Node 24.11.0 LTS announcement](https://nodejs.org/en/blog/release/v24.11.0).
- [Node release schedule](https://nodejs.org/en/about/previous-releases).
- [npm engine and development engine contracts](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/).
- [Semantic Versioning](https://semver.org/).
