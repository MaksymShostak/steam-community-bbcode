# Steam Community BBCode: standalone repository extraction plan

**Planning baseline:** 10 September 2026.  
**Source:** `MaksymShostak/oxygen-not-included`, branch `steam-community-bbcode`.  
**Destination:** `MaksymShostak/steam-community-bbcode`.  
**Execution status:** Proposed implementation plan; no repository migration, publication or deletion has been performed.

## 1. Decision and implementer directive

Extract the completed package into a new, independent repository, with the package at the repository root, using a **selective, history-preserving export performed in a disposable clone**. Preserve the existing conversion architecture and qualification obligations. Adapt the already-built release pipeline rather than introduce a different release-management framework.

> **Mandatory handoff instruction**
>
> Complete the accepted module implementation and its implementation/qualification gates in the existing `steam-community-bbcode` worktree. Do not merge, squash-merge, rebase-merge, or wholesale cherry-pick that development branch into `MaksymShostak/oxygen-not-included:main`. Do not push the package branch as ONI `main`, enable auto-merge into ONI, or publish this package using the ONI repository's identity. After the build is accepted, freeze its exact commit and perform the extraction in a separate clone. The existing worktree and its evidence remain recoverable until destination acceptance. Changes to ONI `main` must come from a separate, narrowly scoped cleanup branch based on the then-current ONI `main`.

This directive changes **where repository-specific release acceptance and publication occur**, not the module's technical acceptance standard. The original implementation plan includes publication obligations; interpret the sequencing as:

```text
Original module implementation and qualification complete
  -> frozen, recoverable source handoff
  -> repository extraction and standalone adaptation
  -> destination CI, governance and publishing qualification
  -> approved publication from the destination
  -> source cleanup and worktree/branch retirement
```

Do not wait for a public ONI-origin release as a prerequisite for extraction. Conversely, do not call an unfinished implementation complete merely to migrate it. Record deferred destination-specific obligations explicitly; unresolved converter, security, performance or independent-review findings remain blockers. [R01, R02, R05]

**Excluded scope:** parser replacement; API redesign; ESM-to-TypeScript rewrite; dependency upgrades for their own sake; introducing a monorepo, submodule or permanent subtree synchronization; integrating the new npm dependency into ONI; switching to automated versioning or staged publishing without a separate approved decision. A future ONI consumer integration is a separate change.

## 2. Evidence baseline and limits

The repository investigation inspected these committed revisions:

| Item | Observed state |
|---|---|
| Development branch | `f92f16d943cb612350b706c8479358245671894c` |
| ONI `main` | `975acf599d06ec3d274c55bac8d1731278ffa153` |
| Comparison | Development branch 15 commits ahead, zero behind; the inspected main commit is the merge base |
| Package on inspected `main` | Absent from `tools/`; that directory contains `oni-mod-pipeline` |
| Original v2 plan on inspected `main` | Present at `docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md` |
| Original plan blob | `28cf4f2b74026b4f79e6304e6ecc61bf8fdca1e8`, the same on both inspected refs |
| Package identity | `steam-community-bbcode`, version `1.0.0`, `private: true`, `AGPL-3.0-only` |
| Existing release binding described by the repository | ONI repository, `steam-community-bbcode-release.yml`, environment `npm-release` |
| Destination lookup | Repository API returned 404; creation or access verification is required, not assumed complete |

The current `1.0.0` manifest value is not evidence of a public stable release. The execution record still identifies outstanding qualification/review matters and does not claim live trusted-publisher or public-registry verification. These observations establish a planning baseline, not an assessment of a later completed local worktree. [R01–R06]

The implementer MUST refresh all refs and read the final execution record before execution. This investigation did not inspect local uncommitted changes, ignored worktree files, npm account ownership, secrets, environment settings or a completed destination build. Source commands and workflows were read, not executed against the package.

## 3. Ownership and work-package sequence

The **migration implementer** prepares the export, changes and evidence. The **repository/npm owner** authorizes repository creation, access settings, first publication, destructive cleanup and any history rewrite. An **independent reviewer** checks preservation, release security and acceptance evidence. An agent's completion message does not substitute for the required owner or independent approvals.

| Work package | Purpose | Entry condition | Exit evidence |
|---|---|---|---|
| WP0 | Prevent accidental ONI integration/publication | This plan accepted | Handoff override; auto-merge/publication restrictions checked |
| WP1 | Freeze, inventory and preserve source | Module build accepted | Immutable source SHA, complete disposition manifest, verified backup and ignored-evidence archive |
| WP2 | Export selected history | WP1 approved | Filtered history, commit map, file/mode preservation and exclusion reports |
| WP3 | Make the repository self-contained | WP2 | Standalone bootstrap, package checks, package-boundary tests and reviewed portability diff |
| WP4 | Establish destination GitHub/SDLC/CI controls | WP3 local acceptance | Destination check runs, ruleset/environment readback, independent review |
| WP5 | Qualify release identity and publication | WP4 | Destination candidate, publishing authorization, registry/provenance verification |
| WP6 | Clean ONI and retire source worktree/branch | Destination acceptance and recoverability | Cleanup PR, ONI regression checks, exact-ref and worktree retirement record |
| WP7 | Optional historical purge | Separate owner approval | Coordinated rewritten-ref verification and documented residual limitations |

WP0 happens immediately. Repository creation and non-publishing configuration may be prepared before the build completes, but the export input must be the accepted final module commit. Ordinary branch/worktree retirement should wait for the new release route to be operational; an owner-approved exception must state any remaining publication blocker rather than claim full cutover.

## 4. WP0 — guardrails before the build completes

Put the directive in the current task's accepted handoff and execution record. Do not change unrelated root agent instructions for all concurrent ONI tasks. Check for an existing pull request from the source branch, remove it from auto-merge/merge queue, and close or clearly mark it as an extraction-only development branch that must not merge into ONI.

Keep `private: true` until an approved destination release-preparation commit. Do not configure an ONI trusted publisher for this package; disable any already-created package-specific source publication route. Qualification-only runs may continue, but their outputs must not be described as destination release evidence.

Use separate repository-aware sessions for later work: one new-repository implementation context and one ONI cleanup context. Before every push, inspect both the remote URL and the complete refspec. Do not change the source worktree's `origin` to the destination: worktrees are not separate repositories and ordinarily share repository configuration and refs. [E02]

**Exit:** the ongoing implementer has an unambiguous stop point: accepted private build, frozen handoff, no ONI merge or publication.

## 5. WP1 — inventory the complete extraction boundary

### 5.1 Required manifest

Generate a machine-readable manifest from the final source commit, not only a hand-maintained list. For each tracked path record source commit, path, Git blob ID, file mode, SHA-256 of blob content, destination path, disposition and reason. Record the pre-transformation and post-transformation hashes separately for edited files. For shared files, attach hunk-level disposition. For ignored evidence, record an archival location, digest and confidentiality classification rather than pretending it is a Git blob.

Allowed dispositions are `move`, `adapt`, `retain-in-oni`, `independent-fix-review`, `archive-evidence`, and `discard-reproducible-output`. There must be no unclassified branch change. Also scan the complete source tree, history, workflow references and local task outputs: a branch diff misses unchanged shared dependencies and the original plan already on main.

Store public migration records in the **new repository**, for example `docs/migration/`; store full source bundles and sensitive/raw operational evidence in access-controlled storage outside ONI. Do not create new permanent package-creation records in ONI as part of cleaning it.

### 5.2 Concrete path disposition

| Source material | Destination/disposition |
|---|---|
| `tools/steam-community-bbcode/**` | Promote to destination root, preserving package-relative layout and all reviewed source, tests, registry, docs and tool locks |
| `.github/workflows/steam-community-bbcode.yml` | Retain filename; adapt root paths, setup, scope selection and required-check identity |
| `.github/workflows/steam-community-bbcode-release.yml` | Retain filename; adapt root paths and destination publishing identity/security gates |
| `docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md` | Preserve verbatim at the same relative docs path in destination; delete the current-tree ONI copy through WP6 |
| `docs/plans/2026-09-08-steam-community-bbcode-execution.md` | Preserve historical execution record in destination, including unresolved/closed findings and evidence references |
| `docs/plans/2026-09-09-steam-community-bbcode-forward-refinements.md` | Preserve accepted refinement plan in destination |
| Additional final package plans, ADRs, research ledgers or fixture permissions | Include by explicit discovery and review; do not assume the above three documents are exhaustive |
| `scripts/runRepositoryPython.js`, `.python-version`, `.node-version` | Reuse/adapt for destination development tooling; preserve appropriate original notices |
| Root `package.json` and `package-lock.json` | Retain ONI's versions in ONI; destination root is the package's manifest/lock, not `oni-repository-controls` |
| `scripts/runSteamCommunityBbcodeChecks.js` | Do not transplant an unnecessary monorepo wrapper; destination callers use the package's root commands |
| `scripts/selectPullRequestChecks.js`, `scripts/runAffectedChecks.js`, scope-routing tests | Remove ONI-specific assumptions in the destination; preserve ONI routing for remaining components |
| Shared `.github/dependabot.yml`, CodeQL, CODEOWNERS, templates, agent/lifecycle controls | Rebuild the appropriate destination configuration from reviewed inputs; do not move these whole files out of ONI |
| `scripts/_sdlc_baseline.py`, changes to `scripts/sdlc.py`, `scripts/validate_sdlc_pr.py`, `docs/sdlc/howto.md`, `tests/sdlc/test_pipeline_controls.py` | Review as potentially general SDLC improvements; preserve/reapply independently where justified, not through a package-branch merge |
| `.sdlc/runtime/converter/**`, especially `release-qualification/`, local archives and frozen receipts | Selective, hashed archival copy before worktree deletion; never copy them into an active destination lifecycle state |
| ONI mods, game assets, `tools/oni-mod-pipeline`, ONI build projects and unrelated plans | Retain in ONI; exclude from destination history and current tree |

The source branch modifies shared SDLC controls as well as adding the package. The existing Python launcher is self-contained apart from Node built-ins and expects a root `.venv`; it does not require importing ONI's whole development bootstrap. [R03–R11]

### 5.3 Licensing and generic examples

Promote the package's existing `LICENSE`, not ONI's root MIT licence and Klei disclaimer. Preserve `AGPL-3.0-only`, checked-JavaScript architecture, generated declarations and the package's third-party notices, including reused release code. Copied MIT-licensed helpers retain their notices; do not relabel upstream code merely because the destination root has an AGPL licence. Retain the original plan's independent licence-review obligation. [R01, R03, R09, R12]

A game-specific historical regression fixture may remain a package test when its inclusion is licensed and its provenance recorded. General-purpose scope does not require deleting useful game-origin test coverage. It does require removing dependencies on an ONI checkout, installed game, Steam credentials or game build pipeline. Add generic README examples without silently replacing established regression expectations.

### 5.4 Freeze and backup

Record the final local branch SHA, remote branch SHA, ONI main SHA, merge base, all worktrees, relevant refs and clean tracked/untracked state. Reconcile any unpublished commits; do not export a stale GitHub branch while the local accepted build is ahead.

Create and verify a source Git bundle in external protected storage. Independently copy the package-owned ignored receipts, original candidate archives, raw failed controls and review evidence. A bundle transports Git history; it is not a backup of an ignored worktree directory. [E03]

Run a recovery rehearsal: open the bundle in a disposable location, resolve the frozen source commit, and retrieve selected source blobs and an archived receipt by digest. Verify that no unrelated worktree changes or credentials were collected accidentally.

**Exit:** one approved immutable input and a complete, recoverable disposition ledger. Stop on changed source HEAD, missing evidence, unclassified files or unresolved original implementation gates.

## 6. WP2 — selectively export history in an isolated clone

### 6.1 Export method

Use `git-filter-repo` on a fresh clone of the accepted source branch. Select package files **and explicitly owned out-of-directory files**, then rename the package prefix to the repository root. A pure `--subdirectory-filter` would omit the existing package workflows and external plans. A whole-repository fork would retain unrelated ONI contents/history. [E01, E04]

The initial reviewed keep-list should include:

```text
tools/steam-community-bbcode/
.github/workflows/steam-community-bbcode.yml
.github/workflows/steam-community-bbcode-release.yml
docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md
docs/plans/2026-09-08-steam-community-bbcode-execution.md
docs/plans/2026-09-09-steam-community-bbcode-forward-refinements.md
scripts/runRepositoryPython.js
.node-version
.python-version
```

This is a seed, not permission to omit newly discovered owned files. Include earlier names for retained paths when history shows renames. Detect source-to-target collisions before rewriting, including case-insensitive Windows collisions. Do not also select ONI root `package.json`, `package-lock.json`, `README.md`, `LICENSE` or `.gitignore`: these can collide with the promoted package files. Merge any needed shared settings later in ordinary destination commits.

### 6.2 Illustrative export runbook

The following Bash/Git Bash fragment is for a **reviewed migration session**, not automatic execution from this document. Set absolute locations and the independently approved final SHA. `EVIDENCE_DIR`, `KEEP_LIST` and `EXPORT_DIR` must be outside all source worktrees. `EXPORT_DIR` must not already exist. Complete WP1's separate ignored-evidence backup first.

```bash
set -euo pipefail
: "${SOURCE_WORKTREE:?Set the absolute path of the accepted source worktree}"
: "${EXPECTED_SOURCE_SHA:?Set the approved full source commit SHA}"
: "${EVIDENCE_DIR:?Set an existing external evidence directory}"
: "${KEEP_LIST:?Set the reviewed external keep-list file}"
: "${EXPORT_DIR:?Set a new disposable export directory}"

test -d "$EVIDENCE_DIR"
test -f "$KEEP_LIST"
test ! -e "$EXPORT_DIR"
test "$(git -C "$SOURCE_WORKTREE" branch --show-current)" = steam-community-bbcode
test "$(git -C "$SOURCE_WORKTREE" rev-parse HEAD)" = "$EXPECTED_SOURCE_SHA"
test "$(git -C "$SOURCE_WORKTREE" rev-parse --is-shallow-repository)" = false
test -z "$(git -C "$SOURCE_WORKTREE" status --porcelain=v1 --untracked-files=all)"

# The branch bundle contains reachable source history; keep it private.
test ! -e "$EVIDENCE_DIR/source.bundle"
git -C "$SOURCE_WORKTREE" bundle create "$EVIDENCE_DIR/source.bundle" \
  refs/heads/steam-community-bbcode
git -C "$SOURCE_WORKTREE" bundle verify "$EVIDENCE_DIR/source.bundle"

git clone --no-local --single-branch --no-tags \
  --branch steam-community-bbcode "$SOURCE_WORKTREE" "$EXPORT_DIR"
test "$(git -C "$EXPORT_DIR" rev-parse HEAD)" = "$EXPECTED_SOURCE_SHA"

git -C "$EXPORT_DIR" filter-repo \
  --paths-from-file "$KEEP_LIST" \
  --path-rename 'tools/steam-community-bbcode/:'
```

Do not use `--force` to ignore a failed fresh-clone safety check. Diagnose and recreate the disposable clone. Do not run this filter in the original worktree, alter its common Git directory, or push the export anywhere until verification completes.

### 6.3 Verify the export before adapting it

Compare the source-to-target blob contents and file modes using the manifest. Check all retained refs, not only the working tree. Confirm no ONI mod, game-asset or mod-pipeline files remain reachable through exported refs. Retained mixed commit messages may still explain the historical source of shared controls. Run repository integrity checks and retain the filter tool's commit map. Preserve source author information where retained, but expect rewritten commit IDs and loss of the original commit signatures; the protected source bundle is the record of the original signed history. [E04, E05]

Save the filtered import commit separately from subsequent adaptation commits. Review the latter as the actual portability/security change. Do not represent an old signed candidate or review receipt as acceptance of rewritten destination commits.

**Exit:** audited selective history plus exact content preservation before transformation; source repository and its remote are unchanged.

## 7. WP3 — make the promoted package self-contained

### 7.1 Target layout

Use the package's current layout at root, adding only the repository controls it actually needs:

```text
.github/
  workflows/
    steam-community-bbcode.yml
    steam-community-bbcode-release.yml
    codeql.yml
    ...approved standalone lifecycle workflows...
  CODEOWNERS
  dependabot.yml
  ISSUE_TEMPLATE/
  pull_request_template.md
.sdlc/                         # freshly bound controls, when retained
.gitattributes
.gitignore
.node-version
.python-version
AGENTS.md
README.md
LICENSE                        # existing package AGPL-3.0-only licence
SECURITY.md
CONTRIBUTING.md
CHANGELOG.md
CODE_OF_CONDUCT.md
package.json
package-lock.json
src/
spec/
test/
scripts/
tooling/
  api-docs/
  type-coverage/
  prose/
comparison/
docs/
  decisions/
  reference/
  plans/                       # archived implementation/acceptance lineage
  migration/                   # extraction records; not npm payload
  ...package user and maintainer guides...
types/                         # generated; preserve the accepted tracking policy
artifacts/                     # ignored local/CI output
```

Do not require the destination to be nested under, adjacent to, or configured with a remote to ONI. Keeping an original-repository URL in a clearly identified historical provenance record is acceptable; using that URL as an operational dependency is not.

### 7.2 Manifest and script edits

Change active package metadata to:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/MaksymShostak/steam-community-bbcode.git"
  },
  "bugs": {
    "url": "https://github.com/MaksymShostak/steam-community-bbcode/issues"
  },
  "homepage": "https://github.com/MaksymShostak/steam-community-bbcode#readme"
}
```

Remove `repository.directory`; the package will be at root. Keep the package name, ESM exports, CLI entry point, generated-type contract and licence unchanged. Keep `private: true` during migration qualification; public identity/version/private-flag changes are a reviewed release-preparation commit under WP5. Reconcile any corresponding lockfile root metadata with the qualified npm version, and inspect the diff to ensure dependency resolutions did not change accidentally. [R03]

Replace the three known outward-calling package scripts with root-local equivalents:

```json
{
  "docs:format": "node scripts/runRepositoryPython.js tooling/prose/format_docs.py --write",
  "docs:format:check": "node scripts/runRepositoryPython.js tooling/prose/format_docs.py --check",
  "qualify:prose": "node scripts/runRepositoryPython.js -m unittest discover -s tooling/prose -p test_format_docs.py"
}
```

Reuse the inspected Python launcher, adapting its missing-environment guidance and integrating it into the package's lint/type-check/test policy. Add or adapt a standalone `setup:development` entry point that installs the package's locked npm graph, the two isolated tooling graphs and the hash-locked prose formatter into the repository `.venv`. It must not install ONI/.NET/game development prerequisites. Test the launcher's Windows and Unix paths, missing environment, propagated exit status, signal handling and paths with spaces. [R03, R11]

Use a checked, explicit setup sequence equivalent to:

```text
Select the accepted Node/npm and Python versions
npm ci --ignore-scripts
npm --prefix tooling/type-coverage ci --ignore-scripts
npm --prefix tooling/api-docs ci --ignore-scripts
Create repository .venv with the accepted Python interpreter
node scripts/runRepositoryPython.js -m pip install
  --require-hashes --only-binary=:all:
  -r tooling/prose/requirements.txt
```

This is a sequence specification, not a multiline shell command. Bind interpreter selection to the final `.python-version` and report the actual interpreter/tool versions in verification evidence.

Preserve **all** isolated lockfiles, including the comparison environments. Optional comparative qualification may need Python and .NET tools belonging to the package's comparison harness; give those tools their own explicit configuration. Do not confuse removal of ONI's .NET mod build with permission to delete a valid .NET comparator. Do not silently make optional comparator tooling a runtime or ordinary consumer dependency.

### 7.3 Path and configuration audit

Review active scripts, tests, configuration and documentation for the old repository identity and monorepo assumptions. Cover workflow working directories, cache keys, lockfile paths, upload/download paths, typedoc source links, comparison commands, formatter selections, security-report URLs, badges, contribution instructions, CODEOWNERS and Dependabot directories.

Avoid a global replacement of `../`: several release/test scripts already resolve their own package root with `import.meta.url`, and the Python formatter's package-root calculation remains valid after the complete directory is moved. Modify only paths whose meaning changes. [R09–R11]

Promote/merge the package's `.gitignore` with only necessary root rules, including `.venv`, generated types according to the existing policy, package artifacts and lifecycle runtime state. Reconcile `.gitattributes` deliberately to preserve line endings and executable modes. Record expected formatting-only changes separately from functional ones.

### 7.4 Preserve historical plans without publishing or rewriting them

Keep the original v2 plan's contents and Git blob/SHA-256 as an immutable historical baseline. Add a separate migration ADR or handoff explaining that this extraction plan supersedes its old repository and publication instructions. Do not edit the old text to make earlier research or approvals appear to have named the destination all along.

The current prose formatter recursively selects documents under `docs/`, so add and test explicit exclusions for immutable historical plan/evidence paths. Do not let `docs:format` change a signed/frozen acceptance baseline. Active maintainer documentation, including `docs/releasing.md`, must nevertheless be fully updated. [R01, R05, R10]

### 7.5 Tighten the npm distribution boundary

The existing manifest includes the whole `docs/` tree in its package `files` list. Promoting repository-level plans into `docs/plans` would otherwise make them candidates for inclusion in npm archives. Replace the broad documentation entry with a reviewed allowlist of intended user/maintainer documentation, or an equivalent explicitly tested exclusion mechanism. Do not assume ignored Git paths imply excluded npm payloads. [R03, R13]

Extend the **installed archive** checks to reject `docs/plans`, `docs/migration`, `.github`, `.sdlc`, `tooling`, tests, comparison environments, build scripts, raw archives, logs, secrets and unrelated ONI files. Preserve any notices required by code actually distributed. Verify generated declaration maps resolve only to source files shipped inside the installed package. Inspect both `npm pack`'s inventory and a real installed package; a repository-directory test is insufficient. [R09, R13]

### 7.6 Standalone preservation tests

Run from a fresh destination-only checkout outside the ONI tree, including a path with spaces on Windows. No ancestor/sibling source repository, global npm link, workspace hoisting or local `file:`/`link:` dependency may be needed. Exercise locked setup, checked JSDoc, generated declarations, documentation, conformance, performance/resource limits, API/CLI and installed JS/TypeScript consumers.

Compare original and relocated source/spec/test hashes before adaptation, then compare semantic outputs and public contracts after adaptation. Expect changed package metadata, source links and release attestations; the old and new npm tarballs need not be byte-identical. The new candidate must be byte-identical to what is eventually published.

**Exit:** a reviewed portability diff and an independently reproducible standalone package, without weakening the final module's accepted quality gates.

## 8. WP4 — destination repository, Git workflows and CI

### 8.1 Repository bootstrap and branch policy

Confirm owner access and create `MaksymShostak/steam-community-bbcode` as a standalone repository, not an ONI fork or repository transfer. For the planned public npm provenance route, use a public source repository. Create it empty: do not auto-generate an unrelated README/licence commit. Inspect an existing destination before proceeding; never overwrite a repository merely because a prior unauthenticated/limited lookup returned 404.

After local WP3 review, use one explicitly approved **destination-only bootstrap push** of the sanitized history and adaptation commits to its initial `main`. Keep publication disabled. This unavoidable initial-main exception is not permission to push package development to ONI `main` or to bypass review for later changes. Verify the destination remote's exact owner/name immediately before the explicit refspec. Never `push --mirror`, `push --all`, or push ONI tags.

Then set destination `main` as default, establish protections and conduct subsequent migration/release work through branches and pull requests, for example:

```text
chore/standalone-repository-controls
chore/release-publisher-cutover
chore/remove-extracted-package-artifacts   # ONI cleanup; based on ONI main
```

Use small commits for import, portability, lifecycle/CI and release security so reviewers can separate source preservation from behavioral change. Sign new commits if the repository's policy requires it; do not pretend that rewritten imported commits retain their old signatures.

### 8.2 Recreate settings; Git does not carry the whole service configuration

Maintain a destination configuration/readback checklist covering visibility/default branch, collaborators and app access, Actions policy, required checks, review rules, environments, variables, webhooks, package ownership, security reporting and issue labels/templates. Inventory secret **names and purposes**, not values; recreate only necessary credentials through an authorized secure route.

Configure normal `main` changes through PRs, required qualification/security checks and the approved independent-review process. Protect workflows/release scripts with appropriate CODEOWNERS. Do not require self-review by a sole maintainer: choose an actually available independent reviewer and feasible owner-approval policy. Disallow ordinary force pushes/deletion after bootstrap. Add merge-queue-specific triggers only when that queue is enabled and tested.

Do not copy Steam login credentials, workshop publication secrets, ONI release keys, game paths, package-independent webhooks or unrelated repository automation. A generic source environment name such as `npm-release` is not proof that the environment belongs exclusively to this package.

### 8.3 Rebind the existing SDLC rather than transplant live state

Retain the accepted development/review discipline, but provision destination controls from the recorded upstream SDLC package/version or an explicitly reviewed export. Reconcile `.sdlc/UPSTREAM.json`, `.sdlc/SOURCE_PACKAGE.json` and any generated/hash-tracked controls through their supported setup/update process. Do not edit manifest hashes or statuses simply to make stale copied controls appear valid.

Create destination-specific `AGENTS.md`, contribution/review instructions, setup scripts, issue acceptance rules, PR validation and verification profiles. Replace ONI affected-scope routing and `.sdlc/verification.json` commands/fingerprint inputs with package-specific checks and actual package/tooling lockfiles. Remove ONI `global.json` fingerprints unless an explicitly adopted package comparator genuinely owns a replacement. The inspected source verification profile calls ONI routing, so copying it unchanged would not define a meaningful standalone gate. [R07, R08]

Do not copy `.sdlc/runtime/active.json`, worktree locks, old issue snapshots or approval receipts as the destination's current task state. Archive relevant old evidence with its original identity; initialize a fresh accepted destination task and rerun verification. Preserve independent R2 and security/legal acceptance where required by the original plan.

General SDLC improvements discovered in the source package branch are separate changes. Review them against their upstream and ONI baselines, preserve them with focused tests where justified, and document any deferred upstream contribution. Their existence is not a reason to merge the package branch into ONI.

### 8.4 Adapt, do not replace, package CI

Retain the existing two package workflow filenames. Replace monorepo `--prefix tools/steam-community-bbcode`, working-directory/artifact prefixes and `check:converter` wrappers with root operations. Remove the dependency on ONI's converter scope selector. Run qualification on all relevant standalone PRs and main changes, including documentation, workflows and setup changes. [R04]

Preserve the final accepted coverage matrix: currently Windows/Linux on Node 22/24/26, plus independent Linux library and CLI mutation jobs. The observed exact Node versions are `22.23.2`, `24.20.0`, `26.8.1`, with npm `12.0.2`; use the accepted completion snapshot's pins and change them only deliberately with qualification. Runtime support and the maintainer's primary development version remain distinct concepts.

Keep both mutation profiles and their at-least-90% thresholds. Preserve the aggregate check's explicit rejection of failed, cancelled, skipped or absent dependencies. Use stable, intelligible destination check names, and configure protections from **actual emitted names** after a real run. Do not leave a required ONI check that can never execute in the new repository. [R02, R04]

Retain strict dependency review, locked installs, coverage and supply-chain reports. Adapt CodeQL to the languages actually present: JavaScript/TypeScript, Python and Actions are relevant; the ONI C# scanning/build configuration is not automatically appropriate. Review optional comparator sources on their own merits. Do not remove source-repository security jobs needed by ONI's remaining tooling. [R04, R14]

Use least-privilege jobs, full-SHA action pins, no persistent checkout credentials, and no publication secrets in PR jobs. Support fork PRs without privileged untrusted checkout or silently claiming a skipped required security check succeeded. Keep non-PR publication runs out of superseded-PR cancellation groups. These are consistent with GitHub's documented workflow-hardening controls. [E06]

### 8.5 Checks outside ordinary `npm run check`

The inspected `check` script does not execute the separate mutation scripts or live GitHub rendering qualification. It also cannot establish remote review or account settings. Build an explicit qualification matrix linking each accepted requirement to its actual command/run/review evidence. Preserve comparative conformance, live renderer qualification, security review and current dependency-licence evidence where the final original plan requires them. [R01–R05]

Keep live network qualifications isolated from ordinary secret-free tests. Bind any approved GitHub rendering context and minimal credentials to the destination, and retain the results with their source SHA and renderer observation date. A failed or missing external qualification must remain visibly unresolved rather than replaced by a stale success.

**Exit:** actual destination PR/main qualification runs, reviewed lifecycle configuration and settings readback. A locally parsed YAML file is not evidence that GitHub emitted the required checks or enforced an environment rule.

## 9. WP5 — release identity, pipeline and public verification

### 9.1 Preserve the existing pipeline's security properties

The source already implements a useful separation:

```text
Qualified source and required evidence
  -> candidate archive + checksums + installed-consumer evidence
  -> protected publisher downloads that same run's artifact by ID
  -> exact archive is published, without project checkout/build hooks
  -> separate unprivileged job verifies public bytes and installed consumers
```

Keep this structure, the manual `publish` input defaulting to `false`, explicit distribution tags, concurrency that does not cancel publication, and the credential-free verification job. Only the publishing job receives `id-token: write`. Preserve SHA-256/SHA-512 integrity checks and the existing archive-consumer checks. Do not rebuild or repack inside the privileged job. [R05, R09, R13]

Keep the current release workflow filename for identity continuity, but change its binding to the destination. Do not introduce immutable GitHub releases, a single-channel policy, semantic-release, Changesets or a staged-publication redesign as an unannounced migration requirement. Durable release evidence is required; the owner's release-management policy determines its final publication surface.

### 9.2 Bind publication to a reviewed destination commit

Add explicit guards so public release is possible only from `MaksymShostak/steam-community-bbcode`, through the intended manual workflow, from an approved `main` revision. The release environment must independently restrict allowed deployment refs. Qualification-only runs may use other approved branches; publication may not.

Checkout the event's immutable SHA explicitly in unprivileged jobs. Bind the candidate to that exact source revision, repository identity, workflow/run and qualification evidence. Extend the current candidate metadata schema and its tests where necessary: a bare commit hash, tool versions and a dirty flag do not describe the full destination release identity. Preserve original source lineage separately from the new release identity.

Require all applicable accepted gates for the candidate's exact input revision: runtime matrix, both mutation profiles, generated contracts/docs, package consumers, security checks, reviewed dependency changes and the required independent approvals. Either run the full qualification in the release workflow or consume verifiable evidence for the exact accepted inputs through an approved mechanism. Never substitute the latest green run or a different PR merge commit. Do not make a PR-only dependency-review status an impossible main-release prerequisite; retain its reviewed change evidence and run the applicable current production/security checks.

The present candidate stage's `npm run check:converter` is not, by itself, proof that every original release gate passed. Preserve this distinction after replacing it with root `npm run check`. [R03–R05]

### 9.3 Configure the new trusted publisher

Use this intended binding:

| Field | Value |
|---|---|
| GitHub owner | `MaksymShostak` |
| Repository | `steam-community-bbcode` |
| Workflow filename | `steam-community-bbcode-release.yml` |
| Environment | `npm-release` |
| Allowed operation for the retained pipeline | Direct `npm publish` |

npm currently distinguishes direct from staged publishing. Its documentation says configurations created after 3 September 2026 default to staged publication; explicitly enable direct publishing to retain this workflow. Read back the actual saved configuration and do not assume a successful settings save proves operational OIDC. Use supported GitHub-hosted runners. Revoke an old ONI binding after destination publication has been verified. [E07]

The CLI can manage trust relationships after package existence/ownership and 2FA prerequisites are met. A representative owner-operated command is:

```bash
npm trust github steam-community-bbcode \
  --repo MaksymShostak/steam-community-bbcode \
  --file steam-community-bbcode-release.yml \
  --environment npm-release \
  --allow-publish
```

Check the qualified CLI's help and current account readback before using it. npm's overview and CLI reference currently differ on the number of simultaneous publisher configurations supported; this plan does not rely on overlapping configurations. Retire the ONI binding and establish the destination binding under a controlled publication pause as needed. Never revoke another package's trust. [E07, E08]

### 9.4 Resolve first-publication bootstrapping explicitly

Check the registry and owner account immediately before release. A GitHub repository name does not establish npm name availability. Distinguish an authoritative npm `E404` from network/authentication failures. An existing package under someone else's control is a blocker, not permission to publish under the same name.

Current npm trust commands require that the package already exist, and staged publishing also cannot create a brand-new package. Therefore, "configure OIDC first, then make the first ever publication" is not a complete bootstrap runbook. [E08, E09]

When the package already exists and the owner has access, configure the destination directly. Otherwise, use an owner-approved first-publication procedure for a real, fully reviewed prerelease archive from the new repository, such as the next available `1.0.0-rc.N` under `next`. Do not publish an empty name-reservation package, use ONI's identity, or mislabel this as the final stable OIDC release.

A local owner-authenticated 2FA bootstrap is an explicit exception to normal CI publication and must not be reported as CI/OIDC provenance. Where provenance for the bootstrap itself is mandatory, qualify an authorized one-use, shortest-practical-lived CI authentication route from the public destination, preserving the same artifact separation, then immediately revoke/remove the bootstrap credential. Do not silently introduce this exception: owner approval and the retained security review must precede the external publication. If no permitted bootstrap route is approved, record publication as blocked while preserving the migrated repository.

Once package existence is established, configure and verify OIDC and use it for the approved stable version. Do not overwrite an existing version or reuse a published prerelease version. No repository migration step itself authorizes publication.

### 9.5 Test and verify the release path

Before enabling publication, execute negative controls for wrong repository, wrong ref, dirty/private candidate, missing required qualification, changed source revision, incorrect package/version/channel, wrong artifact ID and mutated archive. Test the actual gate implementation, not a separately simplified expression. Confirm privileged jobs do not run checked-out project code or dependency/package lifecycle scripts.

Run `publish: false` in the new repository and retain the resulting candidate with a destination source identity. After approval, publish through the protected workflow and verify the exact public package coordinate with a fresh npm cache and isolated installed consumers. Check registry archive SHA-256 against the retained candidate, published SHA-512 integrity, JS API, CLI, declarations and production audit. Preserve the signature audit and require expected package provenance to be present and tied to the new repository/commit/workflow; "any available signatures verified" is not the same assertion. npm provenance describes source/build identity, not proof that software is defect-free. [R09, R13, E10]

Retain candidate metadata, pack inventory, checksums, SBOMs, audit results, runtime/mutation/review receipts and registry verification beyond transient CI-artifact retention. Publish or archive them against the new version and source commit under the approved release policy. Never upload the full private source bundle as a package or public release asset.

If publication succeeds and verification fails, preserve the published version and rerun the read-only verification against the same candidate. Repair a mistaken distribution tag or deprecate a defective version through an authorized incident procedure; ship a new version for corrected bytes. Do not republish an existing coordinate. [R05]

**Exit:** the new repository owns an operational, independently verified publishing path. A successful candidate-only run establishes packaging readiness, not live trusted-publishing success.

## 10. WP6 — remove active package-creation traces from ONI

### 10.1 Scope of ordinary cleanup

The recommended default is **current-tree and operational cleanup without rewriting ONI's established history**. This removes the package's active ownership, files, branches/worktree and publishing controls from ONI, but it does not make an old plan commit disappear. WP7 addresses the stricter interpretation separately.

Create `chore/remove-extracted-package-artifacts` from the then-current ONI `origin/main`, preferably in its own clean worktree. Do not derive the cleanup branch from the package-development branch, and do not merge that branch merely to revert it afterward. That would import the history the user explicitly wants to keep out of main.

The concrete known main-tree deletion is:

```text
docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md
```

At the inspected main revision, the package folder and its two workflows are not present. Do not manufacture removal commits for files never merged there, restore an older whole repository snapshot, or delete shared files because their source-branch versions contained a converter addition. Recheck the actual main tree before making changes. [R06]

### 10.2 Inspect all possible residuals, not only that one file

Search current tracked path names and contents for the exact package name, old package path, script names, workflow filenames, package-specific check contexts, plan IDs and accepted-baseline blob references. Review related docs, agent instructions, lock/manifests, templates, ownership routes, scripts, tests and committed task snapshots. Classify each match by ownership. Do not delete generic Steam/BBCode documentation needed by ONI, or an independently useful SDLC capability.

Delete or edit only confirmed package-creation material that actually exists on current main. For mixed files, remove the owned sections and retain unrelated changes. Maintain a deletion/hunk allowlist and have the cleanup diff independently checked against it. Do not use an indiscriminate text replacement for words such as `Steam`, `converter` or `BBCode`.

Preserve the original plan and associated evidence in the destination before removing the ONI copy. Leave no redirect stub in ONI when the selected acceptance criterion is no current-tree package-creation artifact. Store the detailed cleanup receipt and source/destination mapping in the destination or external evidence store, not as a new package plan under ONI.

### 10.3 Reconcile shared SDLC fixes independently

The source package branch contains general accepted-plan validation changes. Decide explicitly for each whether it is already present in ONI/upstream, should be delivered as an independent generic fix, should only be adopted in the new repository, or is being intentionally declined. Preserve any valuable implementation and tests before retiring the branch. [R08]

Where a generic fix is required in ONI, apply just the independently reviewed generic patch in a separate PR based on current ONI main. Do not wholesale cherry-pick mixed package commits. This preservation work must not recreate a package source directory, package plan or package-specific workflow in ONI.

### 10.4 Clean up remote operational resources by ownership

Inventory and reconcile package-specific PRs/issues, release records, workflow runs/artifacts/caches, deployment records, npm trusted-publisher bindings, environments, variables, secrets, branch rules and webhook/app configuration. Move package-owned issues through the permitted platform mechanism or create a clearly mapped destination issue; keep provenance of discussions. Close old source PRs without merging them. Do not describe a new PR as having retained the original PR's identity or reviews.

Retain needed evidence before deleting source Actions runs or artifacts. Do not remove ONI's shared CodeQL, Dependabot, lifecycle policies or unrelated release configuration. An environment or token shared with another release flow must be separated before removing this package's access. The owner must verify that the old ONI publisher can no longer publish **this package** after destination acceptance.

Closed PR discussions and GitHub-managed refs may remain historical traces even after the branch is deleted. Do not count closing a PR as deleting its history. [E05]

### 10.5 Validate ONI before merging cleanup

Run ONI's actual remaining SDLC, pipeline and relevant mod tests using its current accepted toolchain. Validate affected-scope routing and required-check names. Review the diff to ensure no package-development commit has entered main and no unrelated main work was reverted. Current package-creation matches must be absent or explicitly justified as outside scope.

Merge only the cleanup PR (and any separately accepted generic-fix PR). A package-specific absence check used for the migration should live in external/destination verification tooling, not create a permanent new package-specific ONI test file merely to prove cleanup.

### 10.6 Retire the source worktree and exact branch

Before deletion, verify again that the source branch HEAD equals the accepted frozen SHA, no other writer added commits, source evidence archives are recoverable, and no live task requires the old worktree. Stop on any discrepancy.

Remove the clean worktree through `git worktree remove` without force. Recreateable ignored environments may be discarded only after the owned ignored evidence is archived and verified. Delete the local development branch separately. Because it was deliberately never merged, normal safe branch deletion may refuse; an explicitly approved `git branch -D steam-community-bbcode` is appropriate only after the preservation and destination gates, not as a shortcut before them. Never merge the branch merely to satisfy a safe-deletion test. [E02]

Remove the exact remote branch after verifying its current tip, preferably using an expected-tip lease. A reviewed command shape is:

```bash
# Preconditions: origin has been verified to be the ONI repository;
# EXPECTED_REMOTE_SHA is its just-read, approved source-branch tip.
: "${EXPECTED_REMOTE_SHA:?Set the expected full remote branch SHA}"
git push \
  --force-with-lease="refs/heads/steam-community-bbcode:$EXPECTED_REMOTE_SHA" \
  origin :refs/heads/steam-community-bbcode
```

This is a narrowly authorized branch deletion, not a history-rewrite push or permission to force-update main. If the lease fails, investigate the new commits; do not override it. Inspect other refs for package-specific temporary tags/branches and retire only approved ones. If an unrelated active branch contains package work, stop and plan its separation rather than delete that branch.

Remove stale local task locks, worktree-specific configuration and remote-tracking refs through the supported tools. Do not edit/delete the shared `.git` directory, recursively delete unrelated worktrees, or blindly expire everyone's reflogs. Keep the private recovery bundle according to the approved retention policy.

**Exit:** ONI has no active package implementation/creation artifacts, package worktree/branch or package publishing authority; its unrelated functionality and independently useful development controls remain intact. Historical main commits remain unless WP7 is separately selected.

## 11. WP7 — optional removal from ONI's reachable history

### 11.1 Separate decision, not a disguised cleanup step

Deleting the plan on main creates a deletion commit. Its previous contents remain in earlier commits. Deleting a worktree or branch does not remove already-merged plan history, cached PR views or other clones. Literal historical removal therefore requires an additional, disruptive repository maintenance operation. [E02, E05]

Select WP7 only when the owner explicitly requires the package's creation material to be removed from ONI's reachable history as well as its current state. This is unnecessary for ordinary independent package operation, and should not delay the safe extraction itself.

### 11.2 Inventory and rehearse the rewrite

Freeze ONI writers and automations for an agreed maintenance event. Capture all branch/tag tips and relevant PR refs, make a full verified private backup, and identify integrations, signatures, release references and active worktrees affected by changed commit IDs.

Build an exact historical removal manifest covering the package directory, package-only workflows, all historical names of package plans/research/evidence and other exclusively owned files. For mixed files such as root manifests or shared SDLC controls, define reviewed path/content transformations rather than removing the entire path from all history. Inspect commit/tag messages and ref names as well as tree contents; path filtering alone does not make all textual traces disappear.

Rehearse in a separate clone with all intended writable refs. Use `git-filter-repo` for approved package-only path removal, with explicit historical-path coverage; use separately tested, path-scoped transformations for mixed content. A conceptual local-only path-removal command is:

```bash
git filter-repo --invert-paths --paths-from-file approved-package-only-history-paths.txt
```

This command is not a complete purge recipe. It does not handle mixed-file contents, message references, external records or server-managed refs. It must never be run in a shared live ONI worktree or followed automatically by `git push --mirror`. [E04, E05]

### 11.3 Verify and publish only approved rewritten refs

Verify the rewritten current tree equals the accepted post-cleanup ONI tree, except for separately approved changes. Run current ONI checks. Audit every retained branch/tag history for removed paths/content and retain the old-to-new commit map privately. A simple successful grep on main is not sufficient.

Review the proposed ref update list with expected old and new tips. Temporarily permit only the owner-approved maintenance updates, publish explicit reviewed writable refs with expected-tip protection, restore protections immediately and read back the new tips. Do not attempt to overwrite GitHub-managed pull-request refs through a mirror push.

Coordinate clean reclones or carefully specified resets/rebases for every active local checkout/worktree and automation. An old clone must not reintroduce the removed ancestry. Reconcile release links, task baselines and tooling that referenced changed SHAs. Do not recreate invalid historical signatures or claim that newly signed commits are the original signed objects.

### 11.4 State the actual limit of erasure

History rewriting changes commit IDs, can remove signatures and affects PRs, forks and clones. GitHub documents that cached commits and PR references may still expose removed data; it also states that Support will not remove non-sensitive data. Ordinary package-creation history is not evidence of a sensitive-data incident. [E05]

Consequently, the strongest honest acceptance statement is bounded: the owned writable refs and agreed current operational surfaces no longer retain the package-creation material, with any inaccessible historical copies recorded. Do not promise erasure from all forks, private clones, backups or GitHub-managed caches. Keep the old backup access-controlled and outside ONI, with a deliberate retention/disposal decision.

## 12. Verification matrix and acceptance evidence

Each result must name the exact source/destination revision, command or platform run, exit/conclusion, evidence location and reviewer. A prose statement that a task was completed is not a substitute for a test result. The following tests supplement, rather than replace, the original module gates.

| ID | Test / negative control | Required outcome |
|---|---|---|
| MIG-01 | Accepted build handoff | Original technical gates complete; destination-only publication obligations explicitly deferred |
| MIG-02 | Frozen HEAD / changed-head control | Export uses the approved full SHA; a changed source head blocks export/retirement |
| MIG-03 | Recovery rehearsal | Source bundle resolves the accepted commit; selected ignored receipts/archives recover by digest |
| MIG-04 | Disposition completeness | Every branch change and discovered external dependency/evidence item has an approved disposition |
| MIG-05 | Selective-history boundary | Retained refs exclude ONI mods/assets/pipeline; expected package history and original plan are retained |
| MIG-06 | File and mode preservation | Source-to-import hashes/modes match; later differences are in the reviewed transformation ledger |
| MIG-07 | Standalone bootstrap | Fresh Windows/Linux checkout outside ONI installs only documented locked prerequisites |
| MIG-08 | Dependency locality | No operational dependency on sibling/parent ONI paths, local npm links or ONI workspaces |
| MIG-09 | Contract preservation | Existing JS API, CLI, checked JSDoc, generated declarations and installed TS consumers pass |
| MIG-10 | Semantic preservation | Final original conformance/regression corpus and forward/reverse claims remain valid |
| MIG-11 | Runtime/mutation qualification | Accepted Node/OS matrix and both full mutation profiles meet unchanged gates |
| MIG-12 | Distribution boundary | Real installed archive contains required source/maps/notices but no plans, migration records, tooling, secrets or ONI files |
| MIG-13 | Historical-document preservation | Original plan bytes/hash remain unchanged after destination formatting/build commands |
| MIG-14 | CI failure propagation | Aggregate rejects failure/cancellation/skipping/absence; new required contexts exist in GitHub |
| MIG-15 | Lifecycle rebinding | Destination controls/identities/fingerprints valid; old runtime receipts are not active approvals |
| MIG-16 | Publisher authorization controls | Wrong repository/ref, private/dirty candidate and missing qualifications cannot publish |
| MIG-17 | Artifact/source identity controls | Changed bytes, mismatched source/run/package/version or wrong retained artifact are rejected |
| MIG-18 | Privilege separation | Only intended publish job has OIDC; it performs no project checkout/build/lifecycle execution |
| MIG-19 | Live publication | Approved destination OIDC run publishes exact retained archive; no token fallback masks failure |
| MIG-20 | Public verification | Hashes/integrity, installed consumers, production audit and expected provenance pass for exact coordinate |
| MIG-21 | ONI cleanup boundary | Main cleanup diff contains only approved deletions/edits; no package development is merged |
| MIG-22 | ONI preservation | Remaining mod/pipeline/SDLC checks pass; shared controls and generic fixes are preserved appropriately |
| MIG-23 | Source retirement | Owned source branch/worktree and obsolete package publishing authority removed only after destination acceptance |
| MIG-24 | Post-publish failure recovery | Verification can be rerun read-only without republishing existing coordinates |
| MIG-25 | Optional historical purge | Agreed writable ref histories clean; changed SHA/signature impacts and residual external traces documented |

MIG-19 and MIG-20 cannot be marked passed merely because a dry-run candidate succeeds. MIG-25 is `NOT_SELECTED` when ordinary operational cleanup is the approved scope; it must not silently be reported as a historical purge.

## 13. Rollback and failure handling

| Failure point | Recovery |
|---|---|
| Before destination bootstrap | Discard only the disposable export, correct manifest/transformation and recreate it from the frozen source |
| After bootstrap but before publication | Fix destination through reviewed commits; leave source frozen and recoverable; do not merge package into ONI as a fallback |
| Incomplete destination CI/governance | Keep publication disabled; retain the original worktree/evidence until blockers are resolved or an explicit archive-only handoff is accepted |
| npm bootstrap unavailable or name ownership conflict | Mark release cutover blocked; do not select a different name, publish a placeholder or use ONI credentials without a separate decision |
| Publication succeeded, verification failed | Re-run read-only verification on retained candidate; incident-manage tag/deprecation/new version if needed |
| ONI cleanup regression | Revert the narrow cleanup or independent generic-fix PR, not the whole repository; investigate before branch retirement |
| Source branch changed before deletion | Abort deletion; reconcile and requalify/export additional work |
| History rewrite rehearsal fails | Do not update server refs; retain ordinary cleanup state and inspect the failed rehearsal |
| Post-rewrite recontamination | Pause writes, compare approved ref map, recover through an owner-led incident procedure; do not run indiscriminate repeated force pushes |

## 14. Deliverables and completion statement

Retain the approved extraction manifest; source-to-import commit map; protected recovery bundle and ignored-evidence inventory; portability transformation ledger; original plan and execution lineage; new repository controls and readback; CI/qualification results; release candidate/provenance/public-registry evidence; ONI cleanup and generic-fix PR references; and source retirement receipt. Keep public and restricted artifacts separate, and exclude migration artifacts from the npm payload.

The completion statement should distinguish **source imported**, **standalone qualification passed**, **GitHub controls verified**, **live release cutover verified**, **ONI operational cleanup complete**, and **historical purge selected/not selected**. Record unresolved items explicitly.

The intended final state is one autonomous `steam-community-bbcode` repository with its own source, tests, specification lineage, development lifecycle, security controls, release pipeline and support ownership. ONI remains an independent game/mod repository, not the package's source or publisher. No package-development branch is merged into ONI main. A later decision to consume the released npm package in ONI is a normal separately reviewed consumer change.

## 15. Source register

Repository findings refer to the inspected revisions, not mutable branch tips. External documentation was checked on 10 September 2026. The requirements and work-package design above are this plan's proposed controls; source references establish observed implementation facts and relevant platform behavior, not proof that proposed actions have been performed.

### Repository evidence

For R01–R05 and R07–R14, paths below use this source prefix unless stated otherwise:

`https://github.com/MaksymShostak/oxygen-not-included/blob/f92f16d943cb612350b706c8479358245671894c/`

- **R01 — Original accepted plan:** `docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md`. Includes stable-release gates, ESM/JSDoc/declaration architecture and licence requirements. Its text identifies document v2.0 as 7 September 2026 despite the filename date.
- **R02 — Execution record and refinements:** `docs/plans/2026-09-08-steam-community-bbcode-execution.md`; `docs/plans/2026-09-09-steam-community-bbcode-forward-refinements.md`. The execution record records release/mutation implementation and local ignored qualification evidence; the refinement document's presence is included in the inspected change inventory.
- **R03 — Package/root manifests:** `tools/steam-community-bbcode/package.json`; `package.json`. Establishes private development identity, published-file selection, outward Python calls and root ONI wrapper.
- **R04 — Existing package CI:** `.github/workflows/steam-community-bbcode.yml`. Establishes runtime matrix, parallel mutation gates, aggregate-result enforcement, dependencies and artifact paths.
- **R05 — Existing release route:** `.github/workflows/steam-community-bbcode-release.yml`; `tools/steam-community-bbcode/docs/releasing.md`. Establishes candidate/publish/verify separation, source publisher identity, private flag and release-review obligations.
- **R06 — Main/branch boundary:** compare `975acf599d06ec3d274c55bac8d1731278ffa153...f92f16d943cb612350b706c8479358245671894c`; original v2 plan and `tools/` tree at `975acf599d06ec3d274c55bac8d1731278ffa153`. Main plan URL: `https://github.com/MaksymShostak/oxygen-not-included/blob/975acf599d06ec3d274c55bac8d1731278ffa153/docs/plans/2026-09-08-steam-community-bbcode-implementation-plan-v2.md`.
- **R07 — Current lifecycle/check integration:** `.sdlc/verification.json`; `scripts/runAffectedChecks.js`; `scripts/runSteamCommunityBbcodeChecks.js`; `scripts/selectPullRequestChecks.js` (main variant also inspected).
- **R08 — Shared SDLC changes:** `scripts/_sdlc_baseline.py` and the compare inventory for `scripts/sdlc.py`, `scripts/validate_sdlc_pr.py`, `docs/sdlc/howto.md` and `tests/sdlc/test_pipeline_controls.py`. Hunk-level final disposition remains an execution task.
- **R09 — Candidate implementation and checks:** `tools/steam-community-bbcode/scripts/build-release-candidate.js`; `tools/steam-community-bbcode/scripts/release-artifacts.js`.
- **R10 — Prose path selection:** `tools/steam-community-bbcode/tooling/prose/format_docs.py`.
- **R11 — Cross-platform Python launcher:** `scripts/runRepositoryPython.js`.
- **R12 — Source licensing boundary:** ONI `LICENSE` at main `975acf599d06ec3d274c55bac8d1731278ffa153`, plus package manifest/licensing requirements in R01/R03. The ONI root licence contains its MIT terms and game-specific disclaimer.
- **R13 — Actual packed/registry consumers:** `tools/steam-community-bbcode/scripts/test-package-consumers.js`.
- **R14 — Shared security workflow:** `.github/workflows/codeql.yml`.

### Primary external documentation

- **E01 — GitHub, splitting a subfolder into a new repository:** `https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository`
- **E02 — Git, worktree:** `https://git-scm.com/docs/git-worktree`
- **E03 — Git, bundle:** `https://git-scm.com/docs/git-bundle`
- **E04 — git-filter-repo maintainer documentation:** `https://raw.githubusercontent.com/newren/git-filter-repo/main/Documentation/git-filter-repo.txt`
- **E05 — GitHub, history-removal effects and limitations:** `https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository`
- **E06 — GitHub Actions, secure use:** `https://docs.github.com/en/actions/reference/security/secure-use`
- **E07 — npm, trusted publishing:** `https://docs.npmjs.com/trusted-publishers/`
- **E08 — npm CLI v12, trust:** `https://docs.npmjs.com/cli/v12/commands/npm-trust/`
- **E09 — npm, staged publishing:** `https://docs.npmjs.com/staged-publishing/`
- **E10 — npm, provenance:** `https://docs.npmjs.com/generating-provenance-statements/`
