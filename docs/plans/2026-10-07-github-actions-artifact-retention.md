# GitHub Actions artifact retention implementation plan

Date: 7 October 2026.
Status: revised draft for owner review; document revision is authorized, implementation and configuration changes are not yet approved.
Decision owner: Maksym Shostak.

## Purpose and governing baseline

Reduce routine GitHub Actions artifact storage while keeping package qualification, failure diagnosis, security evidence and publication recovery meaningful.
The proposed outcome removes report archives from ordinary and Release runs, except the owner's explicit CodeQL SARIF file exception.
Protected logs preserve required report detail; bounded summaries provide identities, outcomes and navigation.
Development-documentation-only checks skip package construction and the consumer matrix.
When package qualification runs, it still uses one same-run consumer archive, retained for seven days.
Do not claim artifact-free checks, runner-minute savings or measured billing savings.

The inspected source is `main` at `44f9a081b3c37cd63ff206d520df29d934e83d16`, with a clean tree before the initial draft.
This synthesis updates that untracked draft only.
The owner's subsequent instruction explicitly retains CodeQL SARIF as a file because streaming it into a log would be excessive; its current artifact/filter/upload behavior stays unchanged.
Current constraints come from [AGENTS.md](../../AGENTS.md), [Node qualification](../node-support.md), [release acceptance](../releasing.md), the [accepted converter plan](2026-09-08-steam-community-bbcode-implementation-plan-v2.md) and its [execution record](2026-09-08-steam-community-bbcode-execution.md).
The historical converter R2 baseline remains governing context; it does not preapprove this new retention policy.
Requirements, acceptance criteria, quality scenarios and decisions below are proposed amendment records, not assertions of owner acceptance.

The requested producer reference is `C:\Users\maksy\Desktop\github-actions-artifact-handoff-2026-10-07.md`, SHA-256 `5016f5cfc0af347ca07cb6863c6a02bd12fb649f9930394fc53fed606c15b52b`.
Its reference implementation is Hadden-Industries/software-engineering-workflow at `a02e8435646ef1573dfa14c6b4bf87f9fc033ca6`.
That exact Git object was inspected locally, including its workflow diagnostic reporter and release retention conditions.
The local producer checkout is at another revision; its working-tree files were not treated as the handoff implementation.
The handoff records a zero-artifact hosted run with an incomplete aggregate and a later local verification pass; neither establishes hosted acceptance for this repository.

HISEW inspection found personal applicability active, no active change execution, and configured `focused`, `affected` and `full` profiles.
The prior handoff requires a new execution to have its own accepted scope.
No engine execution, configuration mutation, task adoption, review dispatch or remote workflow run is part of this planning request.
The inspected pending feedback continuation is separate from this change and remains unclaimed by this plan.

## Risk route

**Risk class:** proposed R2, retaining the converter's existing elevated assurance boundary.

**Decision owner:** Maksym Shostak accepts the exact amendment and configuration scope.

**Reasoning:** inference from cross-job package qualification, release evidence retention and the handling of candidate-controlled diagnostics in GitHub Actions logs.
A reporting defect could hide failure context, misstate qualification or interpret diagnostic text as runner commands.
Report removal must not change the release or same-archive contracts.

**Potential blast radius:** maintainers diagnosing CI, all supported Windows/Linux consumer lanes, security reviewers and the package publisher; no intended public API or conversion change.

**Reversibility:** review and revert the specific workflow/reporting changes through Git.
This restores future uploads, but cannot recreate reports discarded by earlier runners or expired provider records.
Existing archives and historical recovery evidence remain untouched.

**Principal unknowns:** report growth/log limits, native failure-output completeness, external file consumers, documentation input independence, reporter behavior on partial setup, log retention and slim-candidate compatibility.
Resolve these with the slice experiments and owner confirmation of external evidence consumers before removing the affected upload.

**Required artifacts:** this draft traceability record, accepted exact revision before implementation, native execution route record, frozen verification/review references and hosted inventories for the eventual changed workflows.
Use the currently configured external HISEW evidence destination for personal receipts; keep product-owned report paths unchanged.

**Required specialist lenses:** independent CI/release-contract verification and security assessment of untrusted diagnostic streaming and summary construction.
Use the maintained reviewer/security procedures selected for the accepted route; this plan grants no scan or delegation authority.

**Required verification:** focused reporter/workflow contracts, affected native producer/consumer regressions, full relevant product checks, and both hosted platforms against the final candidate.
The profile coverage gap described below must be resolved before engine assurance is claimed.

**Required human approvals:** acceptance of this exact revised amendment and configuration scope before implementation, including log-based release evidence, documentation selection and seven-day consumer retention; separate existing authorities for commits, pushes, review dispatch, release approval and npm publication.
CodeQL file retention is already explicitly owner-selected and requires no repeated approval.

**Maximum sensible autonomy:** inspect, research and draft this plan now; after acceptance, implement and verify the accepted local scope without changing unrelated configuration or qualification thresholds.

**Next lifecycle step:** owner acceptance of the concrete draft and configuration proposal, followed by applicability/ownership recheck and native execution start for that accepted baseline.
Do not manufacture acceptance or replace the completed prior task with a newly approved interpretation.

## Selected design and reuse

The producer contributes protected diagnostic streaming, honest missing-evidence reporting and separation of publication payloads from reports.
Its compressed dependency-lock transport solves a different contract and is not adopted.
When consumer qualification runs, all required lanes still download the same tarball; they do not independently repack or resolve a substitute.
The decision to run that matrix is separate: a proven development-documentation change needs no archive, previous receipt, cache or proof-reuse service.
Explicit qualification and Release always exercise the actual package candidate.

Research checked on 7 October 2026:

| Capability or alternative             | Evidence and fit                                                                                                                                                                                                                           | Selection                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Native logs and summaries             | [Workflow commands](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands) provide command suspension and summaries; summaries have a 1 MiB per-step limit.                                                 | Required raw diagnostics in protected logs; compact summaries. Keep large SARIF as a file.                        |
| Producer reporter                     | [Exact source](https://github.com/Hadden-Industries/software-engineering-workflow/blob/a02e8435646ef1573dfa14c6b4bf87f9fc033ca6/.github/workflows/ci.yml) streams non-JSON diagnostics under an unpredictable token restored in `finally`. | Reuse behavior through repository standard-library tooling and npm entry points, without another reporting graph. |
| Native artifact handoff               | [GitHub artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data) serve existing pinned package consumers.                                                                                                             | Retain package transport, names, digest rejection and candidate identity; preserve existing SARIF retention.      |
| Native Git inventory                  | Git supplies exact comparison paths; existing `yaml` tests own local workflow structure.                                                                                                                                                   | Bounded repository logic selects only proven documentation paths; GitHub owns hosted expression/action semantics. |
| Binary job outputs                    | [Output limits/redaction](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idoutputs) introduce a new transport contract.                                                                        | Reject tarball encoding. Small selection identities remain ordinary job outputs.                                  |
| Repacking, caches or external storage | Changes the shared package subject or adds storage/transport/recovery contracts.                                                                                                                                                           | Reject in this amendment.                                                                                         |

Residual code is repository-specific change selection, native report mapping, safe streaming and slim release-file staging.
Use native JSON/schema consumers, Git, npm, CodeQL, Sigstore and existing `yaml` parsing; no shadow Markdown, SARIF, archive, expression or dependency grammar.
Do not add a third-party reporter or perform action/runtime/dependency upgrades for this work.
Existing versions are baseline identities, not claims they are latest; new adoption needs current support/version and complete licence/terms research.

The producer's inspected root licence is AGPL version 3; this package remains AGPL-3.0-only.
Inspect exact file notices before literal reuse and preserve attribution and copied MIT notices.
No code is copied by this draft, no new legal clearance is asserted, and no shim override is granted.

## Scope and artifact disposition

Proposed workflow changes cover checks, Node consumers, renderer, trusted Markdown and Release.
CodeQL's unfiltered SARIF archive, repository-default retention, approved filter and native security upload remain unchanged.
Scope also includes narrowly necessary npm scripts, selector/reporter/stager/workflow regressions, operational docs and project-specific HISEW verification coverage.
Change consumer archive retention from thirty to seven days; keep publication candidates at thirty days.
Triggers, supported matrices, package schema version, quality/resource thresholds, credentials and publisher/OIDC/environment gates remain unchanged.
Checks job selection changes only as specified below.

| Current artifact                                     | Proposed disposition                                                                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bbcode-consumer-archive`                            | Keep one same-run tarball for seven days when package qualification runs, including reusable Release prechecks; create none for the proven development-documentation path. |
| `bbcode-<os>-node-<version>`                         | Remove upload for every caller, including Release; keep native runner files and report required evidence in logs/summaries.                                                |
| `bbcode-markdown-<os>`                               | Remove upload; log the validated native result and stderr with a compact summary.                                                                                          |
| `<archive>-<os>-<version>-consumer`                  | Remove upload; log exact archive/tool/runtime identities, declaration evidence and native outcomes.                                                                        |
| `bbcode-mutation-<profile>`                          | Remove upload even for Release; log native survivors, failures, timeouts and errors, plus a bounded summary.                                                               |
| `bbcode-github-renderer`                             | Remove upload; log current-run request/response/provenance and mismatch evidence.                                                                                          |
| `codeql-unfiltered-javascript-<attempt>`             | Keep the complete SARIF file in its existing artifact with existing repository-default retention. Do not stream full SARIF into logs.                                      |
| `trusted-markdown-linux`, `trusted-markdown-windows` | Remove archives; log window identity, all available sample receipts, measurements, stdout/stderr and limitations.                                                          |
| `steam-community-bbcode-candidate`                   | Keep the slim exact publication/recovery payload described below for thirty days.                                                                                          |
| `steam-community-bbcode-registry-verification`       | Remove archive; log registry-byte/integrity, signature/provenance/consumer results and full failures.                                                                      |

| Invocation                                         | Expected Actions archive allowlist                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Documentation-only PR/main checks                  | None within checks; separately triggered CodeQL still retains its SARIF file.                                             |
| Package-affecting or explicit checks qualification | `bbcode-consumer-archive` only within checks.                                                                             |
| Standalone CodeQL                                  | Existing `codeql-unfiltered-javascript-<attempt>`; native code-scanning upload also continues.                            |
| Renderer or trusted-Markdown qualification         | None.                                                                                                                     |
| Release, including `publish=false`                 | Preliminary consumer archive, called CodeQL SARIF artifact and qualified publication candidate; no other report archives. |

CodeQL is the explicit owner-selected file exception.
Any additional report archive needs an identified file consumer/recovery operation or a concrete log-size problem, exact inventory, bounded retention and an accepted amendment.
The initial draft's `retain-release-evidence` toggle is superseded; no such input is needed.

Non-goals: artifact-free package qualification, binary job outputs, proof reuse, caches as transport, old-artifact deletion, CodeQL/release-candidate retention changes, trigger/matrix changes, threshold relaxation, dependency/action/runtime upgrades, new package schema, publisher/billing changes, ONI adoption, source retirement and publication.

## Observed storage and retention budget

Read-only GitHub API inspection on 7 October 2026 found the latest consumer archive at 77,047 bytes, about 75 KiB.
Sixteen non-expired copies totaled 1,232,404 bytes, about 1.18 MiB.
All 625 non-expired repository archives totaled 2,430,639,421 bytes, about 2.26 GiB; qualification bundles approached 7.6 MiB individually.
These are snapshot downloadable archive sizes, not account billing, remaining allowance, future size or measured savings.

At that tarball size, ten PRs daily with one PR run and one merge run each retain roughly 44 MiB over thirty days or 10 MiB over seven days at steady state.
Updates, reruns, release runs and package growth change the estimate; documentation selection reduces the number of package runs.
Prioritize removing bulky report bundles and then shortening tarball retention; separately count retained CodeQL files.

GitHub lists 500 MB artifact storage for Free and 1 GB for Pro, shared with GitHub Packages; logs/summaries do not count toward artifact storage.
Removing future uploads cannot erase earlier accrued usage, and this inventory does not establish the owner's account plan.
See [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

## Conservative documentation selection

The archive guarantees within-run package identity, not mandatory reconstruction after every commit.
The npm allowlist ships `src/`, `types/`, `coverage.json`, `docs/third-party-notices.md`, `README.md`, `SECURITY.md`, `LICENSE` and native npm-required manifest content.
A `.md` suffix alone never proves packaging or qualification irrelevance.

Start with a small development-documentation allowlist: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, Markdown under `docs/plans/`, and Markdown under `docs/migration/`.
Before accepting this list, trace native build/consumer-test inputs for indirect reads of those paths.
An executable/qualification dependency removes its path from the family unless separately addressed.
Broader paths require demonstrated input independence.
Agent/policy instructions, shipped docs, specifications, generated files, package/lockfiles, scripts, tests, tooling, workflow/configuration inputs and unknown paths require broad package qualification.

Bind PR comparisons to exact event base and checked-out tested merge/head revisions; main pushes use the exact before/after range including every pushed commit.
Native Git supplies NUL-delimited paths from explicit commit operands; never interpolate changed paths into shell commands.
Renames, deletions, mixed/empty classifications, unavailable history, force-push ambiguity and unknown inputs select broad qualification or fail acquisition, never a documentation exemption.
Emit a validated selection record bound to source, event, comparison commits and changed paths.
Missing, malformed or failed selection cannot authorize skips.

The proven documentation path retains complete authored-Markdown/native link checks and applicable dependency/security checks.
Skip converter/package construction, archive upload, consumer lanes and package mutation only when the validated selection declares them unnecessary.
The aggregate accepts only those planned skips, requires successful selection and requires every selected job to succeed.
Failure, cancellation, absence or skip in a required lane still fails.
Explicit dispatch, reusable qualification and Release take the broad path; Release still requires all existing consumer minimum/latest, mutation and security gates.
This changes applicability to irrelevant documentation, not required-check thresholds.

## Minimal release payload and file consumers

Preserve native construction and source reports under `artifacts/release-candidate/`.
After qualification/reporting, stage only the following into an explicit new transfer directory, predicted as `artifacts/release-transfer/`:

| Retained file                                | Concrete consumer or release obligation                                                         |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Exact `steam-community-bbcode-<version>.tgz` | Installed consumers, native npm publisher, registry-byte comparison and approved release asset. |
| Unchanged `candidate.json`                   | Existing candidate reader, publisher eligibility, registry provenance and bootstrap identity.   |
| Unchanged `pack-actual.json`                 | Existing bootstrap compares hosted hashes and consumes native npm pack inventory.               |
| `production.cdx.json`                        | Existing release instructions require the exact generated production SBOM as a release asset.   |
| `SHA256SUMS` for staged files                | Existing publisher/verifier consume transfer checksums.                                         |

The SBOM is a distribution-file obligation, not permission to copy all report directories.
Exclude coverage, HTML API references, source checkouts, declaration scratch trees, consumer locks, audit reports, report bundles and downloaded runtimes; retain required diagnostic evidence in logs.

Use native `readCandidate` and existing hash/checksum helpers.
Validate source/candidate identity and exact inventory, reject redirected/non-regular sources, copy without rebuilding and compare pre/post-copy hashes.
Generate the transfer manifest from its staged allowlist so excluded diagnostics are not falsely required on download.
Keep schema version 2, candidate metadata and tarball bytes unchanged.
Update upload/identity binding, inventory tests, bootstrap/registry contracts and release docs together.
The publisher continues ID-bound download, digest rejection, metadata/checksum checks and publication without checked-out project code or lifecycle scripts.
An additional mandatory file consumer requires an exact inventory amendment; do not hide it in a directory upload.

## Proposed requirements and acceptance criteria

| Requirement                                                         | Acceptance criterion                                                                                                                                                          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-001: remove report archives except owner-selected SARIF.        | AC-001: event/caller inventories match the table, including no trusted-Markdown, registry or Release diagnostic archives beyond SARIF.                                        |
| REQ-002: preserve a common package subject when qualification runs. | AC-002: required consumers use the same-run archive; identity/single-tarball/digest checks hold without repacking.                                                            |
| REQ-003: preserve failure diagnosis.                                | AC-003: success, failed producer, malformed/partial report and setup-failure fixtures expose raw available diagnostics and honest status; absent evidence never becomes PASS. |
| REQ-004: treat diagnostics as untrusted data.                       | AC-004: text cannot issue runner commands, write command files or inject summary structure; processing is restored after failures; summaries stay bounded.                    |
| REQ-005: preserve publication/recovery inputs and evidence.         | AC-005: slim inventory/hashes pass native candidate/bootstrap/publisher/verifier contracts; required qualification/registry evidence stays accessible in logs.                |
| REQ-006: preserve selected native qualification semantics.          | AC-006: selected failures/required skips fail aggregate; matrices, mutation thresholds, SARIF artifact, filter and security upload remain unchanged.                          |
| REQ-007: bind evidence and expose limitations.                      | AC-007: records identify source/run/attempt/lane, tools/hashes/paths and missing/redacted/unreported evidence; docs describe recovery/retention.                              |
| REQ-008: obtain meaningful coverage.                                | AC-008: accepted profiles cover selection/reporting/trusted qualification/staging; independent/hosted evidence targets final source.                                          |
| REQ-009: avoid irrelevant package qualification.                    | AC-009: proven docs-only PR/main cases skip package jobs and create no checks archive; unknown/mixed/deleted/renamed inputs and explicit qualification remain broad.          |
| REQ-010: bound routine retention.                                   | AC-010: consumer archives request seven days, publication candidates thirty; record hosted expiry/size without inferring billing.                                             |

## Quality scenarios and decisions

| Scenario                    | Stimulus and observable response                                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-001: integrity           | Missing, corrupt, multiple or wrong bytes fail required native consumers; no repack substitute.                                                            |
| QA-002: producer failure    | Partial JSON/traceback after consumer/mutation/registry failure remains visible; original failure gates completion.                                        |
| QA-003: command injection   | Command-looking text, fake tokens, backticks, delimiters and HTML stay data; later trusted reporting works.                                                |
| QA-004: reporting limits    | Summary overflow/unreadable reports explicitly show incomplete evidence, never truncated success.                                                          |
| QA-005: interruption/expiry | Cancellation, masking or expiry prevents completeness claims; dependent release/recovery stops rather than repacks or republishes.                         |
| QA-006: staging             | Extra scratch files, missing pack inventory, changed bytes or checksums for excluded reports reject transfer.                                              |
| QA-007: hosted parity       | Lanes show matching archive identities, correct outcomes, expected inventories and accessible diagnostics.                                                 |
| QA-008: selection           | Mixed docs/manifest/shipped README/control/rename/deletion or missing selection runs broad checks or fails acquisition, never accidental green skips.      |
| QA-009: special evidence    | All available Markdown samples remain in logs even if summaries omit detail; complete unfiltered CodeQL SARIF remains a file with unchanged filter/upload. |
| QA-010: growth              | Package archives expire after seven days; docs-only/report-only paths create none, with CodeQL separately counted.                                         |

DEC-001: native transport retains exact package bytes when required.
DEC-002: report evidence, including Release, uses protected logs and bounded summaries except SARIF.
DEC-003: conservative documentation selection governs applicability; no cached proof substitutes for required checks.
DEC-004: retain CodeQL SARIF as explicitly directed; trusted-Markdown evidence uses logs with native isolation/budgets unchanged.
DEC-005: preserve schemas/source report paths; retain consumer archives seven days, publication candidates thirty, CodeQL unchanged.
DEC-006: resolve HISEW coverage through accepted profile amendment.
DEC-007: stage the exact minimal release payload through native validation and hashes.
DEC-004's SARIF choice is owner-selected; remaining amendment decisions await acceptance of the revised draft.

## Vertical implementation slices

Likely seams are predictions, not a frozen edit manifest.
The maintainer owns integration and the owner observes hosted acceptance.
No parallel write ownership or subagent work is authorized.

| Slice     | Linked records                                                              | Observable path and predicted seam                                                                                                                                                                        | Proof                                                                                                                             | Release/cleanup implication                                                                                                         |
| --------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| SLICE-001 | REQ/AC-001/003/004/006/007/009; QA-002/003/004/008; DEC-002/003             | Docs-only changes traverse native Git selection, full Markdown reporting and aggregate acceptance of justified package skips. Seams: checks workflow, bounded selector/reporter, workflow tests and docs. | Real Git PR/push fixtures for mixed/Unicode/rename/deletion/missing selection; producer/report negatives and command-file safety. | No checks archive for proven docs-only changes; reusable/Release qualification stays broad.                                         |
| SLICE-002 | REQ/AC-001/002/003/006/007/010; QA-001/002/003/010; DEC-001/002/005         | Package checks, consumers and mutation report to logs; retain only their seven-day shared archive. Seams: checks/consumer workflows, reporter mappings, tests and Node/testing docs.                      | Real installed consumers, archive identity negatives, native mutation survivors/timeouts/errors, aggregate and retention checks.  | Ordinary and Release callers use the same reporting policy; no release-report toggle or threshold change.                           |
| SLICE-003 | REQ/AC-001/003/004/007; QA-002/003/004/005; DEC-002                         | Renderer logs exact current-run requests/responses/provenance without its archive. Seams: renderer script/workflow, tests and docs.                                                                       | Synthetic success/failure observes exact emitted directory; later authorized live native-renderer evidence.                       | Explicit cancellation limitations; no directory-sorted latest guess.                                                                |
| SLICE-004 | REQ/AC-001/003/004/006/007; QA-002/003/004/005/009; DEC-002/004/005         | Trusted Markdown logs window/samples/receipts/stdout/stderr and limits; remove its archives. Protect existing SARIF exception in policy tests.                                                            | Six-sample/budget/isolation probes and hostile candidate diagnostics; reporter runs from trusted checkout, never candidate code.  | Preserve receipt paths/tools/credentials/budgets and existing CodeQL file/filter/upload.                                            |
| SLICE-005 | REQ/AC-001/002/003/004/005/007/010; QA-001/002/005/006; DEC-001/002/005/007 | Release stages slim candidate, qualifies consumers and logs registry results without report archives. Seams: release workflow, candidate/stager/registry/bootstrap contracts, tests and docs.             | Inventory/copy/hash negatives and native candidate/pack/checksum/bootstrap dry-run consumers; visible registry failures.          | No publication for implementation acceptance; thirty-day candidate and seven-day preliminary archive have different recovery roles. |
| SLICE-006 | All REQ/AC; QA-005/007/008/010; all DEC                                     | Integrate accepted coverage/docs, freeze source and demonstrate hosted event/caller inventories.                                                                                                          | Local/independent checks, paginated inventory/expiry, complete jobs/logs bound to SHA/run/attempt.                                | Separate local/hosted/independent/release states; historical archives stay intact.                                                  |

SLICE-002 through SLICE-005 reuse SLICE-001's protected reporting boundary with independent native oracles.
Keep coupled producer/workflow/consumer changes together within each slice.
SLICE-006 integrates them; do not repeat expensive unchanged-input checks merely at procedure boundaries.
Reviewed source reverts are possible subject to irreversible past runner/provider evidence loss.

## Reporting and retention contracts

Keep source output paths for coverage/SBOM/API/declaration/prose/consumer/mutation/renderer and trusted `markdown-window/` receipts.
The new release-transfer directory is an intentional staging output, not raw-report relocation.
Reporters use allowlisted roots and exact invocation directories, never arbitrary searches or latest-directory guesses.

Logs preserve required report detail; summaries carry compact identities/outcomes/navigation.
Trusted Markdown includes window identity and all available receipts/samples/stdout/stderr; registry evidence includes metadata/signature/provenance/consumer records and failures.
Preserve native mutation failures/survivors/timeouts/errors and renderer requests/responses/provenance.
Material SBOM/lock/declaration content needed to understand/replay a graph belongs in logs; hashes alone cannot replace missing content.
Reproducible HTML sites/scratch trees need not be dumped wholesale without a failure/evidence/file consumer; specify the actual evidence inventory.
Complete CodeQL SARIF stays in its existing file artifact; full SARIF streaming is excluded.

Use unpredictable stop-commands tokens restored in `finally`; trustworthy grouping commands stay outside raw-text intervals.
Never interpolate diagnostic content into shell commands, expressions or command files.
Escape summary data, avoid arbitrary rendered Markdown/HTML, and test a budget below the platform limit.
Overflow/unavailable evidence is explicit; native JSON/schema consumers remain authoritative, not the summary.
Reporting follows non-cancelled failures where feasible and preserves original producer/aggregate outcomes.
Required evidence loss/reporting failure blocks acceptance; GitHub summary-upload semantics alone do not enforce that.
Audit runtime/npm entry-point availability, especially trusted-only Markdown setup, without another tooling graph or executing candidate-owned code in a trusted job.

Masking/truncation/cancellation/retention can prevent complete or byte-identical retrieval.
Local hashes bind original bytes, not proof of unchanged GitHub display.
Prove required evidence accessibility before removing its upload; happy-path summaries are insufficient.
A concrete file consumer or irrecoverable log-size limitation needs the smallest exact accepted exception, never a broad fallback archive.

Seven-day retention includes the preliminary consumer archive in reusable Release checks.
The publisher instead consumes the independently retained thirty-day final candidate.
A rerun needing an expired preliminary archive must fail or start a newly qualified run, never rebuild under an old identity.
Inspect hosted expiry and log/summary retention; change no account-level retention or cleanup automation here.

## Verification, oracles and profile proposal

The currently installed `focused` profile runs `test:markdown`.
`affected` runs `test:documentation-tooling` and `test:markdown`.
`full` runs `check:format`, `test:documentation-tooling`, `test:markdown`, `test:markdown:observer`, `check:markdown` and `check:conformance`.
HISEW reports input ordering and path coverage as unverified; these profiles are not demonstrated full product qualification for this change.

Propose a new `test:ci-evidence` npm entry point executing `node --test test/ci-evidence.test.js test/ci-qualification-selection.test.js test/release-candidate-staging.test.js test/bbcode-workflow.test.js test/release-workflow.test.js test/github-rendering.test.js`.
New reporter, selector and stager cases live in the proposed root test files, so existing `npm test` and `test:coverage` also discover them.
This is a proposed command contract, not implementation supplied by the plan.

| Profile    | Proposed ordered npm scripts                                                                                     | Coverage effect                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `focused`  | `test:ci-evidence`, `test:markdown`                                                                              | Preserve existing Markdown integration coverage and add bounded reporter, caller, release and renderer contracts.                                              |
| `affected` | `test:ci-evidence`, `test:documentation-tooling`, `test:markdown`, `test:markdown:observer`, `lint`, `typecheck` | Preserve existing obligations and add reporter/workflow execution plus existing lint and checked-JavaScript validation.                                        |
| `full`     | `check:product`, `test:markdown`, `test:markdown:observer`, `check:markdown`                                     | Replace the documentation-focused command list with the full existing product bundle plus unchanged Markdown integration, observer and authored-corpus checks. |

The inspected `check:product` already runs `check:format`, `check:conformance`, and coverage over `test/*.test.js`, including every file currently selected by `test:documentation-tooling` and the proposed reporter cases.
Thus the proposed full profile preserves those current obligations without also executing their standalone commands again.
It additionally covers product lint, performance, native consumers, generated declarations and type coverage; it does not contain mutation or live renderer qualification, which remain explicit route obligations when applicable.
Declare the actual workflow, script, test, report-schema, package/lockfile and runtime inputs, plus generated report/type outputs, in the native profile proposal.
No configuration is changed while writing this plan.
Implementation must confirm this resolved command/input manifest before applying the approved scope; preserve current command timeouts unless an observed need yields a separately accepted change.
Unrelated environment, timeout or profile-policy changes require a new proposal.

Use existing `npm run test:documentation-tooling`, `npm test`, `npm run check:product`, `npm run check:markdown`, `npm run test:markdown:observer`, `npm run test:package` and `npm run qualify:node-types` where their actual inputs apply.
Preserve both mutation profile commands and thresholds; release qualification still invokes both.
Use the repository `.venv` through its existing Python npm launcher whenever Python probes are involved.
The planning document itself needs native Markdown/link validation and a scoped diff check, not a product or mutation rerun.

Test oracles remain independently authored converter/package cases, native installed JS/CLI/TypeScript consumers, matching Node declaration environments, native Markdown result schemas, existing aggregate failure probes and native CodeQL/SARIF processing.
Reporter fixtures specify expected identities and failure evidence independently of the reporter implementation.
Mock only external process outcomes/network renderer responses for bounded regression tests; exercise filesystem reads, JSON parsing, environment-file behavior and reporting with real temporary files.
No mock hosted run establishes GitHub acceptance.

Hosted acceptance records the exact candidate SHA, root workflow and caller, run ID/attempt, complete expected job inventory and paginated artifact inventory.
Check documentation-only PR/main pushes, package-affecting and unknown/mixed selection, explicit qualification, renderer, trusted Markdown and Release `publish=false` paths where their changed behavior needs evidence.
Inventory includes preserved SARIF; record selection/comparison identity and archive expiry in addition to job/run/source identity.
Reuse valid evidence for unchanged CodeQL behavior with explicit identity/scope justification.
Earlier archive-based trusted-Markdown diagnostics do not prove its new reporter.
A native run dispatch is a later execution effect, not performed for this document; there is no inherited minutes restriction from the producer repository.

## Rollout, recovery and acceptance

Accept this revised amendment, configuration scope, route and changed evidence/retention trade-offs before implementation.
Recheck applicability, ownership, source and external file consumers, then start the accepted execution through the maintained procedure.
Demonstrate slices locally; freeze/review before full checks and authorized hosted delivery.
Owner acceptance covers observed selection, evidence and inventory; release approval remains separate.

Abort on wrong documentation selection, hidden failures, missing required evidence, modified SARIF retention/filtering, divergent candidate bytes or missing native-consumer files.
Forward-fix the owning implementation when understood; otherwise propose a scoped reviewed source revert.
Do not repack missing candidates, substitute latest green runs, waive evidence or republish to recover verification failure.
Registry verification may rerun against the original retained candidate while available; its thirty-day expiry bounds recovery even if logs last longer.
Logs must remain accessible through intended acceptance/recovery; inspect provider retention and obtain a separate settings decision if insufficient.
Keep native local-bootstrap report reservations and exact output paths.

No data/schema migration, backfill or reconciliation program is required.
Existing archives keep their original lifetimes; do not delete or retroactively shorten them.
Test fixtures use bounded cleanup; personal supplemental evidence follows current external HISEW storage.
Preserve historical source bundles, ONI branches and unrelated outputs.

Release/Node/testing/trusted-reuse docs distinguish local files, remote diagnostics, retained SARIF, package-transfer files and release assets.
Replace report-download obligations with complete-log records and limitations; summaries/green jobs are not independent approval.
Observe archive size/count/expiry and actionable evidence, not merely removed upload steps.
No scheduler, service, monitor or automatic deletion is introduced.

## Unknowns, discriminating experiments and re-planning

| Unknown                          | Cheapest useful evidence                                                                                                                         | Condition to proceed                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| External report-file consumer    | Inspect native scripts/procedures and owner-recorded integrations.                                                                               | Preserve/replace exact contracts through an accepted inventory amendment.               |
| Complete evidence and retention  | Compare native success/partial-failure records with hosted logs, including all Markdown samples and registry failures; inspect access/retention. | Required content remains accessible with explicit masking/cancellation/expiry limits.   |
| Safe bounded reporting           | Real hostile-text/malformed/unreadable/oversize fixtures on Windows/Linux.                                                                       | No injection or silent evidence loss; runtime integration works in all changed callers. |
| Documentation input independence | Trace build/qualification reads and PR/push Git fixtures.                                                                                        | Only proven paths select planned package skips.                                         |
| Candidate/bootstrap integration  | Native reader, hosted hashes, pack dry-run and transferred-checksum tests.                                                                       | No lost consumer files, repacking or weakened identity/provenance.                      |
| Profile coverage                 | Accepted command/input manifest and engine coverage alongside exercised tests.                                                                   | A profile name/declaration cannot close AC-008.                                         |

Re-plan for artifact-free package checks, proof reuse, another native file consumer, a larger transport, new dependency/runtime/service adoption, security-filter changes, different release assets or changed recovery windows.
Re-baseline material source changes after the inspected revision; earlier receipts stay historical.
Further report exceptions/retention changes beyond seven-day consumers/thirty-day candidates require exact proposals, not a generic release-report toggle.
Changing the owner-selected SARIF file policy needs a new owner decision.
Storage reduction must preserve qualified bytes, actionable diagnosis and recoverable publication.

## Readiness and decision record

This revised draft supplies requirements, scenarios, route/native reuse, selection/staging/reporting design and six implementation slices.
Remaining prerequisites are exact amendment/configuration acceptance, resolved external consumers and accepted verification manifest.
The synthesis request and SARIF selection, historical migration authority and producer delivery do not authorize implementation/publication.
Only this draft is revised; no application code, workflow, package setting, HISEW profile, commit or remote state changes.
