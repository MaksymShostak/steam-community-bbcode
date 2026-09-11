# Releasing

The release implementation reuses owlapi's candidate, checksum and public-registry verification code.
The exact source revision and retained controls are recorded in [software selection](software-selection.md).
The package is still a private development package at version 1.0.0; that number does not identify a public release.

## Current delivery scope

The source implementation was selectively imported into the standalone `steam-community-bbcode` repository.
The destination identity is `MaksymShostak/steam-community-bbcode`.
In source checkouts, `docs/migration/standalone-portability.md` records the frozen source, verified import and local approval boundary.
ONI PR #4 is closed without merging; the source worktree and private recovery evidence remain intact.

The commands below qualify local artifacts and describe publication only after destination controls and separate owner authorization.
The workflows use destination paths and identity gates; hosted release qualification and live publication remain separate acceptance steps.
Do not publish through ONI or merge the package branch into ONI main.

Preserve source, tests, isolated locks, licence notices, original plans and their execution lineage.
The private recovery archive retains ignored qualification evidence, raw failures, original candidates and the unsent upstream report; none belongs in active destination lifecycle state or npm archives.
The copied Workshop-description fixture retains its local MIT/Klei notice, and the reused Python launcher retains its MIT notice.
The standalone prose commands use this repository's own launcher and `.venv`.
The installable development archive is not a complete recovery bundle.
The historical ONI trusted-base PR linkage failure remains recorded; destination lifecycle setup must support the accepted baseline.

## Qualify a candidate

From this package's source checkout with the locked development tools installed, run:

```sh
npm run check
npm run release:pack
```

The second command prints a new directory under `artifacts/release-candidates/`.
It builds declarations with TS 7, packs through native npm and installs that archive into a temporary consumer.
The existing authored JavaScript, CLI, declaration contracts, licence and package-boundary checks run against the installed package.
Native npm audits the actual installed production graph with the same low-severity floor as dependency review and emits its CycloneDX SBOM.
The candidate retains the archive, native pack inventory, consumer report, audit, SBOM, Git revision and dirty-state marker, archive SHA-256/SHA-512 integrity, and `SHA256SUMS`. Schema version 2 records the hosted repository ID, ref, workflow revision, run/attempt, tag and qualification results.
Local candidates record `release: null` and cannot pass the hosted publication gate.

Use `npm run release:pack -- --output artifacts/my-candidate` to choose an empty directory.
The empty-directory requirement prevents mixing files from different attempts; it does not impose an immutable-release policy.
Keep the printed archive with its evidence through publication and registry verification.
The owner-approved performance disposition and completed selected-renderer qualification are recorded in [testing](testing.md).
The explicit [licence compatibility assessment](licensing-review.md) covers the current graph and distribution boundary.
These local results do not activate the destination's renderer schedule, public CI or publication controls.

## Release acceptance

Prepare the frozen candidate with an agreed public identity and version.
Confirm every registered construct has an executed policy, source evidence and documented example, including the partial reverse limitations and current comparison results.
Complete independent R2 verification and applicable security review against the actual candidate.
The accepted plan and execution record retain the complete gates.

Require current Node 22/24/26 checks on Windows and Linux, CodeQL and dependency review, meaningful property/resource checks and review of generated HTML paths. Run `npm run test:mutation` for the configured library and CLI profiles, each requiring at least 90%, or retain equivalent results for unchanged source and tests. Preserve failures, survivors and native timeout/error counts; the numerical score does not establish semantic correctness or security approval.
Local package checks cannot substitute for remote CI or independent review.

Review the native archive allowlist and actual installed files, declaration maps pointing to shipped source, exact full dependency licence terms and retained notices.
Keep AGPL-3.0-only explicit and exclude tests, comparison environments, credentials and local artifacts from the distribution.
The release production SBOM supplements the existing main and isolated tooling inventories; SBOM metadata is not legal clearance.
Use the completed [licence compatibility assessment](licensing-review.md) for this unchanged graph and packaging boundary.
The accepted plan requires explicit legal review, not mandatory independent legal counsel; escalate concrete unresolved rights or terms if the destination changes the distribution.
Keep the original comparison and qualification evidence with the approved release.

## Publish an approved release

The repository workflow **Steam Community BBCode release** has a manual `publish` input, defaulting to false.
Its default run qualifies and retains a candidate without publishing.
Supply the exact expected `version` and intended `tag` for both qualification and publication.
The release run calls the same-revision runtime/mutation, SDLC and CodeQL workflows before creating the candidate.
PR dependency review remains a reviewed-change gate; CodeQL analysis success does not itself mean zero findings.
After destination workflow qualification, approve and commit the actual public package version and complete the release obligations.
Configure npm's trusted publisher for that destination's reviewed workflow and environment; the current reusable names are `steam-community-bbcode-release.yml` and `npm-release`.
Do not bind this package's publisher to the ONI repository.
The binding must allow direct `npm publish`; a binding limited to staged publishing cannot authorize this workflow.
If npm requires an initial package before that binding can be created, the owner must arrange that first publication separately.
No bootstrap token or credential is stored by this implementation.

### First prerelease and GitHub release

The owner selected a local, owner-authenticated 2FA bootstrap for the first available `1.0.0-rc.N` version under `next`, followed by OIDC for subsequent releases.
Prepare and qualify the exact public candidate before requesting publication approval.
Publish its retained tarball with native npm, `--ignore-scripts`, the explicit public registry and `--tag next`; do not repack it during publication.
This local bootstrap has no GitHub workflow provenance and must not be reported as an OIDC release.
Verify its registry archive hashes, exact installed coordinate, API/CLI/declarations, registry signatures and production audit, retaining a separately labelled bootstrap report.
The normal `release:verify-registry` command remains strict about expected CI provenance; it is not a bootstrap success oracle.

Prepare a GitHub prerelease draft for the matching `v<version>` tag and exact qualified source commit.
Include release notes, the identical npm tarball, checksums, production SBOM and public qualification evidence.
Keep private recovery bundles and undisclosed security evidence out of release assets.
Publish the GitHub prerelease after the authorized npm publication passes registry verification, with the exact npm coordinate and bootstrap provenance limitation in its notes.
GitHub's automatically generated source archives are separate from the npm tarball; do not claim they are byte-identical.
Use the native GitHub CLI to create the draft and upload assets; this procedure adds no privileged project-code execution to the npm publishing job.
If immutable releases are enabled under a separately approved repository setting, attach and verify every asset while the release is still a draft, as recommended by [GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository).
Release publication remains a separate owner approval; creating a draft does not establish acceptance or npm publication.

Dispatch the reviewed `main` revision with `publish: true`, its exact package version and the intended distribution tag, such as `next` for a release candidate or `latest` for an approved stable release.
The private development flag and a dirty candidate prevent publication.
The publisher downloads the same run's artifact by ID, checks its native artifact digest, candidate metadata hash and `SHA256SUMS`, and publishes its exact archive with native npm OIDC/provenance.
The protected `npm-release` environment permits only `main`, requires the owner reviewer and disables administrator bypass.
The owner may approve a run they initiated; independent technical review remains a separate release obligation.
Only that job receives OIDC permission, and it executes no checked-out project code or package lifecycle scripts.
The workflow does not create an immutable GitHub release or impose a single distribution channel.

## Verify the registry

A separate job without publication credentials fetches the exact public version and requested tag.
It verifies that the registry archive has the retained SHA-256 and published SHA-512 integrity, then installs the exact coordinate with a fresh npm cache.
The installed lockfile must bind the package to the same archive integrity before the existing API, CLI and TS 7 consumers run.
Native `npm audit signatures --json --include-attestations` verifies registry signatures and returns verified provenance bundles, and native production audit runs again.
The native Sigstore verifier additionally requires the GitHub Actions issuer and exact destination workflow certificate identity.
Expected provenance must match the archive subject, repository, source revision, workflow, ref and run attempt before verification reports success.
Other distribution tags may coexist.

To repeat this read-only verification from a qualified source checkout:

```sh
npm run release:verify-registry -- --candidate artifacts/my-candidate --tag next --output artifacts/registry-verification
```

Retain the registry verification artifact with the candidate.
If publishing succeeds but verification fails, diagnose or rerun the verification job against that same candidate; do not republish the version to recover a verification failure.
Live trusted-publisher configuration and a successful public-registry run are required before claiming operational publication.
