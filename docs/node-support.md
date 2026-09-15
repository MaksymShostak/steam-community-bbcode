# Node support and qualification

## Support policy

| Major | Consumer minimum | Development minimum | Release phase |
| ----- | ---------------- | ------------------- | ------------- |
| 22    | 22.11.0          | 22.22.2             | LTS           |
| 24    | 24.11.0          | 24.15.0             | LTS           |
| 26    | 26.0.0           | 26.0.0              | Current       |

Support includes stable minor and patch releases at or above each minimum within that major.
Other majors and prereleases are outside the declared ranges.
Recommend the latest patched LTS release for ordinary use; historical minimums are compatibility targets, not recommended installations.
Reassess Node 26 when it enters LTS without silently changing its existing minimum.

Consumer minimums for Node 22 and 24 are their first LTS releases.
Development minimums also satisfy the locked development dependency graph, including npm 12.0.2 and Sigstore 5.
They are deliberately separate: consumers do not need the publisher's development tools.
These targets require passing qualification before a release can claim the tested compatibility.

`package.json#engines.node` declares consumer compatibility.
`package.json#devEngines.runtime` is enforced by npm before `install`, `ci` and `run`, including `npm run setup:development` on a fresh clone.
Use that npm entry point for setup.
The exact `.node-version` identifies a reference build environment; it does not constrain compatible contributor installations.
The existing npm and Python requirements remain unchanged.

## Qualification and reproducibility

On Windows and Linux, the package checks workflow runs the public fresh-clone setup, full checks and matching Node declaration qualification at each development minimum and the latest release within each supported major.
The consumer workflow runs the installed package's authored JavaScript and CLI cases at each consumer minimum and latest release.
It checks packed declarations against the matching isolated Node declaration environment using the publisher's compiler and development runtime.
Thus declaration compatibility does not assert that the compiler itself runs on every consumer runtime.

All consumer lanes download the same archive instead of rebuilding it.
Release publication additionally depends on these lanes passing against the actual retained release candidate.
The aggregate rejects failed, cancelled, skipped or absent consumer results.
Workflow configuration alone is not hosted qualification evidence; inspect the corresponding successful run before accepting a release.

Keep exact dependency locks and the reference build environment.
The `22.x`, `24.x` and `26.x` CI selectors intentionally resolve the latest release when a run starts, so compatibility checks detect new regressions.
The consumer artifacts retain `consumer-report.json` with actual runtime, tooling runtime, npm, platform, architecture, declaration version and archive SHA-256, plus `consumer-package-lock.json`, declaration resolution evidence and the qualification log.
The workflow run binds them to the source commit and retained archive.
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
