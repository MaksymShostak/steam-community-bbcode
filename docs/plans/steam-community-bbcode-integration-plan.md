# Steam Community BBCode: Markdown Quality integration

Date: 2026-10-07, Europe/Bucharest.
Status: owner-accepted HISEW implementation plan; execution qualification pending.
Owner: Maksym Shostak.
Target: `C:\Users\maksy\GitHub\steam-community-bbcode`, public repository `MaksymShostak/steam-community-bbcode`.
Parent: [shared implementation plan, SLICE-009](https://github.com/Hadden-Industries/markdown-quality/blob/7994fdb08efa4fc391f6e035c9fff17820635b58/docs/plans/implementation-plan.md#slice-009-migrate-the-remaining-mature-consumers-one-at-a-time).

## Authority and purpose

### Execution acceptance, 2026-10-07

The owner instructed the executing Codex session to implement this plan using HISEW.
That instruction accepts the R2 route, requirements, decisions, quality scenarios and staged implementation below.
It authorizes the configuration changes called for by this plan and local signed commits with detailed per-file messages, including this plan at SLICE-001's first commit point.
Record discovered scope and recovery preimages before implementation writes.
Remote-main pushes, bootstrap/cutover merges, exact trusted-run acceptance, source retirement outside this migration and publication retain their separate approval boundaries.
The proposal history below describes the earlier planning state; this acceptance governs execution.

The owner requested a proposal based on successful integrations in other repositories.
This document proposes requirements, decisions and a bounded R2 migration of developer tooling and CI enforcement.
It does not authorize registration, installations, environment changes, source reformatting, independent scans, commits, pushes, merges or publication in Steam.
The target's `AGENTS.md` requires approval of configuration scope and separate commit/push authorization; an accepted exact migration scope can supply the recorded configuration approval.
This proposal now belongs in Steam's `docs/plans`; its former Markdown Quality copy has been moved here.
Steam is registered and active in personal HISEW mode at the current inspection.
No target product tests or lifecycle mutations were performed during planning.
Before implementation, obtain scope acceptance and recheck HISEW applicability, approved verification settings and execution ownership; registration is no longer a prerequisite gap.

The outcome is one maintained implementation of authored Markdown formatting, linting and physical-file link checks, without changing the converter's runtime contract, generated documentation, fixture semantics or product qualification floors.
Fewer tools and fewer repeated CI invocations are useful only if this outcome remains demonstrably true.
All `REQ`, `AC`, `QA` and `DEC` identifiers below are Steam-local; parent identifiers remain unchanged.

## Observed baseline and precedents

Steam local `main` and remote `main` both identify `9db3103d71a4b3a608b9609dba10280890d873d7` at inspection.
Steam's working tree was clean immediately before moving this proposal here; the earlier `docs/temp.txt` observation is obsolete and that file is absent.
The move must not recreate it or any other previously removed file.
Refresh these observations before execution and freeze all later unrelated changes as sentinels.

| Precedent                     | Observed integration                                                                                                                                                                                                                                       | Reuse in Steam                                                                                                                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OwlAPI                        | [PR #49](https://github.com/Hadden-Industries/owlapi/pull/49), integrated `4f6adbd3a925ad2e0ccfc98550f216642957f870`; exact isolated tooling pin and lock `1.0.3`; [CI 37504430078](https://github.com/Hadden-Industries/owlapi/actions/runs/37504430078). | Isolated `tooling/markdown`, canonical CLI, exact tuple validation, retained recovery and trusted candidate-as-data qualification.                                                                                            |
| WebVOWL                       | [PR #57](https://github.com/Hadden-Industries/webvowl/pull/57), integrated `693e5aa22269aec4d5860e38c03abf559ccb32a4`; manifest `>=1.0.3`, exact lock `1.0.3`; [CI 37501151711](https://github.com/Hadden-Industries/webvowl/actions/runs/37501151711).    | Validate manifest agreement and exact installed lock/native identities; preserve generated/product boundaries and unrelated edits. Steam will use an exact manifest pin.                                                      |
| Software Engineering Workflow | Remote `main` `41ae8b5f30a0566ff67042a8ebde174b0bdfe5ef` pins and locks `1.0.3`, uses native Markdown commands, removes the dedicated Python prose group and retains Python engine/build tooling.                                                          | Retire dependencies by actual consumers rather than deleting Python wholesale; add consumer-specific preservation/selection tests. Its root devDependency placement is unsuitable for Steam's multi-major development matrix. |

The [pilot record](https://github.com/Hadden-Industries/markdown-quality/blob/7994fdb08efa4fc391f6e035c9fff17820635b58/docs/pilot-migrations.md) distinguishes current integrations from earlier alpha.4 six-run windows and restoration evidence.
Reuse architecture and verified package material, not another consumer's acceptance or timings as Steam evidence.
The trusted OwlAPI workflow and `scripts/check-markdown-candidate.mjs`, its probes and window observer are reference implementations; freeze their actual upstream revisions and notices before considering reuse.
Review their substantive trust and staging behavior rather than copying repository-specific assumptions or hundreds of lines indiscriminately.

On 2026-10-07, npm reports `latest = 1.0.3`, `pilot = 1.0.2`, AGPL-3.0-only and engine `>=24.21.0 <25` for the published core.
Use the coherent [immutable 1.0.3 tuple](https://github.com/Hadden-Industries/markdown-quality/blob/7994fdb08efa4fc391f6e035c9fff17820635b58/docs/releases/1.0.3.json), bound to source `92d6e9f61b5fffe6f33d8878ef8e2880ca187ac0` and GitHub release `v1.0.3`, as the proposed migration target.
The producer's later qualified source is `7994fdb08efa4fc391f6e035c9fff17820635b58`, with engines `^22.23.3 || ^24.21.0 || >=26.10.0` and minimum/latest lanes for Node 22/24/26 on Windows x64 and Ubuntu 24.04 x64.
One tuple packed on reference Node 24.21.0 passed those lanes, including isolated installation, real native CLI execution and Node 22-compatible test mocks without relaxing assertions.
The completed [package qualification](https://github.com/Hadden-Industries/markdown-quality/actions/runs/37539180714), [transported-candidate qualification](https://github.com/Hadden-Industries/markdown-quality/actions/runs/37539180707) and [CodeQL](https://github.com/Hadden-Industries/markdown-quality/actions/runs/37539179834) all bind that source, attempt 1.
This source has not been released: the owner explicitly deferred a new package release.
Published 1.0.3 archives and engine metadata remain unchanged; do not install unreleased source as though it were that release or bypass its Node 24 range.
Node 26.10.0 is a [Current release](https://nodejs.org/en/blog/release/v26.10.0); the [planned 2026-10-28 LTS transition](https://github.com/nodejs/Release/issues/1152) does not yet specify an exact 26.x version.
Do not describe 26.10.0 as the first LTS version or infer qualification for later major versions from an open-ended engine range.
If a newer stable release exists at implementation time, compare its actual changes, qualification and rights evidence and amend the proposed target explicitly before freezing the lock.
Do not acquire a moving `latest` identity during verification.

Steam currently has:

- Consumer engines `^22.11.0 || ^24.11.0 || ^26.0.0`, distinct development ranges, pinned npm `12.0.2`, and matching locked declaration environments for Node 22/24/26.
- Native Python Snapper `0.11.4` in `tooling/prose/requirements.in` and a hash-locked requirements file; `format_docs.py` forces `--native` and records check JSON at `artifacts/prose/check.json`.
- A source-defined authored selection of 23 existing files: six root Markdown files and 17 authored documents beneath `docs/`.
- Separate generated TypeDoc/reference, specification, executed-example, conformance, declarations, packed-consumer, performance, coverage and mutation checks.
- A physical-file link checker that also checks generated documents outside the prose formatter's selection.
- A Python comparison consumer in `scripts/compare-alternatives.js`; the repository Python launcher has a retained MIT notice and tests.
- LF checkout policy in `.gitattributes` and historical/generated exclusions in `.prettierignore`.

Observed effective main rules require `BBCode / Qualification`, `Analyze (actions)`, `Analyze (javascript-typescript)` and `Analyze (python)`, with strict current-base status checks and a pull-request rule.
These are ruleset controls: the classic branch-protection endpoint returns 404 even though the branch is protected.
Use effective ruleset inspection rather than treating that 404 as absence of protection.

## Proposed requirements and acceptance

| ID               | Requirement                                       | Acceptance criterion                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REQ-001 / AC-001 | Preserve scope and ownership.                     | Native full selection equals the frozen incumbent 23-path set at baseline; future authored additions follow the approved policy. Generated/history/fixture bytes and unrelated sentinels stay unchanged.                                                         |
| REQ-002 / AC-002 | Adopt the exact maintained capability.            | Core and both native lock records match accepted release versions/integrities; anonymous `npm ci --ignore-scripts` and real CLI checks pass on Windows x64 and Ubuntu 24.04 x64.                                                                                 |
| REQ-003 / AC-003 | Preserve converter runtime and package contracts. | Existing consumer/development ranges, matching declaration lanes, exports, shipped dependencies, AGPL and MIT notices remain valid; no Markdown dependency enters the converter's shipped runtime graph.                                                         |
| REQ-004 / AC-004 | Enforce the existing `authored-gfm@1` policy.     | Full authored checks reject broken local links, non-code trailing whitespace and two-space hard breaks; safe formatting uses explicit breaks, preserves literal code, converges and refuses unsafe writes. No new preset or blanket exception.                   |
| REQ-005 / AC-005 | Preserve product checks and observable reports.   | All incumbent product thresholds and required statuses remain; JSON report at `artifacts/prose/check.json` uses the package's native result schema, preserves exit 0/1/2 and never converts operation failure into success. Generated-doc link coverage remains. |
| REQ-006 / AC-006 | Make required checking attributable and safe.     | Trusted graph/policy/ignore bytes check exact candidate data without candidate executable/configuration authority, credentials or lifecycle execution; hosted positive and negative probes pass before exact owner acceptance.                                   |
| REQ-007 / AC-007 | Demonstrate recovery and measured cost.           | Exact document/config/tooling preimages and unrelated sentinels survive a timed restoration; full candidate checks and both platform windows meet accepted budgets or trigger explicit replanning.                                                               |

## Selected design and decisions to accept

DEC-001: use a private, isolated npm project at `tooling/markdown`, pinned exactly to the accepted release, rather than adding the formatter to Steam's root dependency graph or a workspace.
This follows OwlAPI/WebVOWL and prevents Steam's other development runtimes from installing the published 1.0.3 tool outside its Node 24 engine range.
Even a future release of the newly qualified source would have higher minimums than Steam's existing development floors (`22.22.2`, `24.15.0`, `26.0.0`); it would not justify silently attaching Markdown installation to every product lane.
Do not introduce a second formatter, vendored native binary, unpinned npx command or download-on-run installer.

DEC-002: run Markdown tooling on exact Node 24.21.0, Windows x64 and Ubuntu 24.04 x64; keep converter, installed-consumer and matching-declaration lanes on their existing runtimes and floors.
Existing workflows also use Node 24.15.0, 24.20.0 and 26.0.0, so placing the new CLI in every existing `npm run check` lane would be incorrect.
Introduce `check:product` as the unchanged product-control aggregate minus the retired Python prose controls; keep `check` as the complete local product-plus-Markdown aggregate on a qualified Markdown runtime.
Run product controls in the existing converter matrix and full Markdown controls in dedicated Linux/Windows jobs, making `BBCode / Qualification` require both.
Document explicit product and Markdown invocations for developers using another supported converter runtime; unsupported Markdown execution fails clearly, with no automatic download or successful skip.
The release candidate path must require those same Markdown results and cannot retain an install of old Snapper or call an incompatible CLI under its current Node 24.20.0 step.

DEC-003: use canonical `install:markdown`, `format:markdown`, `check:markdown` and `test:markdown` commands.
Update all current references to `docs:format`, `docs:format:check` and `qualify:prose` in active documentation, setup, tests and workflows; historical plans remain untouched.
No compatibility aliases or format-rule shims are proposed.
Prettier continues to own non-Markdown layout; exclude `**/*.md` from its active generic format/check invocation so two tools do not compete.
Native Markdown checking remains full-scope, even for a code-only or link-target-only change.

DEC-004: root `.markdown-quality.json` uses `authored-gfm@1`, includes `*.md` and `docs/**/*.md`, and explicitly excludes `docs/reference/**`, `docs/plans/**`, `docs/migration/**`, `docs/conversion-semantics.md` and `docs/steam-support-matrix.md`.
Use existing `.gitignore` and `.prettierignore` with native semantics, `links.localFiles = true`, `links.rootRelative = reject`, and LF/tab width 2.
Prove selected-path parity: the old Python selector does not read ignore files, so the proposed ignore composition must not silently drop any incumbent authored document.
Retain `scripts/check-documentation-links.js` and its real-file assertion in `test/documentation.test.js` because its scope includes generated/reference Markdown that the formatter excludes.
Narrowing or retiring that checker is separate work requiring equivalent broader coverage; this migration does not weaken it.
Semantic and literal fixture exclusions do not relax physical existence of local links in selected authored documents.

DEC-005: retain `artifacts/prose/check.json` as the consumer evidence locator but store the shared CLI's versioned JSON result, not a simulated Snapper array.
The source search found active documentation and artifact upload references, with no observed machine reader of that old array; repeat this search before changing its schema.
Use native JSON parsing and the package's shipped result schema; use existing Ajv if actual validation is needed.
Prefer native CLI output capture over custom report interpretation; any small consumer launcher exists only for runtime selection, artifact persistence and exact exit propagation, not formatter/link/diagnostic rules.
Record stderr separately, check report freshness and bind package/config/selected paths/candidate identity.
Retain historical report files and update active explanations of the new report contract.

DEC-006: preserve Python, `.venv`, the pinned Python version, comparator requirements, Python launcher and original notices while retiring only proven prose-exclusive consumers.
Remove the old formatter/config/tests/requirements and pip update entry only after consumer search and accepted cutover.
Do not uninstall packages from the user's existing environment as incidental cleanup; a narrowly scoped environment removal needs its own concrete authorization.
Keep all CodeQL languages and required configurations, including Python: the comparator remains, and losing a base configuration previously caused misleading PR scanning gaps in another migration.

DEC-007: adopt the pilots' exact trusted-run owner-acceptance path for Steam, subject to explicit acceptance here.
Name/App required checks do not identify trusted workflow source; do not claim automatic workflow-specific enforcement.
A trusted default-branch bootstrap can install the reviewed graph and qualify separately fetched candidate data before cutover.
This requires a small reviewed bootstrap PR through all incumbent controls, then the final cutover PR; ordinary CI Markdown jobs provide continuous full-scope checking after integration.
Keep `pull_request_target` out of candidate execution, strip checking credentials and disable checkout credential persistence and lifecycle scripts.
No new App, subscription, secret, publication privilege or status-writer service is proposed.

DEC-008: propose the parent migration targets for explicit Steam acceptance: six consecutive valid full checks per frozen corpus/platform, observed nearest-rank p95 at most 30 seconds, measured 512 MiB platform budget, zero unexpected failures/adjudicated false positives, and one restoration within 60 minutes.
Six-sample p95 is the observed maximum, not a population guarantee.
Measure command runtime separately from installation; retain comparable old/new measurements on the same corpus, OS and reference runtime.
Reuse the producer's batching optimizations; no consumer compilation, custom cache or performance shortcut is proposed.
If Steam needs different operating targets, submit measured evidence and an explicit amendment rather than silently weakening them.

## Quality scenarios and oracles

| ID     | Scenario and observable oracle                                                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-001 | Excluded generated/reference/fixture/history documents and any unrelated sentinels frozen at execution remain byte-identical after checking and formatting; authored inventory matches the incumbent selector.                |
| QA-002 | A real missing relative target fails, including when only its target changes; a generated-doc missing target still fails the retained product checker. Fragment-only/external links follow documented native semantics.       |
| QA-003 | Two-space hard breaks are findings and format to explicit backslashes without changing meaning; fenced BBCode/Markdown literals retain exact body bytes; unsafe inline/HTML cases remain findings without destructive writes. |
| QA-004 | Check changes no candidate document; format is convergent, preserves permissions within the package contract and writes nothing when preservation/convergence/operational validation fails.                                   |
| QA-005 | Candidate policy/ignore edits cannot hide a defect, candidate script markers never execute, malformed staging fails, and no checking subprocess inherits registry/repository-write/OIDC credentials.                          |
| QA-006 | A clean document, findings case and missing/native/report failure yield schema-valid reports with exact 0/1/2 behavior; stale/absent report cannot satisfy qualification.                                                     |
| QA-007 | All existing converter/declaration/installed-package matrix results, mutation obligations, CodeQL configurations and release prerequisites remain effective; Markdown failure blocks the aggregate.                           |
| QA-008 | Both measured windows meet DEC-008; task-owned restoration restores tool/config/document preimages and sentinels within 60 minutes, followed by relevant product and full Markdown checks.                                    |

The old selector and frozen selected paths own the scope oracle; product generators and executed example/conformance fixtures own converter behavior; the maintained package's parser, result schema and documented guards own Markdown contracts.
Use real temporary directories and real installed CLI/native execution for integration fixtures.
Mock only genuine external setup/acquisition failures, as existing setup tests do; do not mock Markdown output and call it parity.
Consumer tests should cover integration boundaries and representative product literals, not duplicate the producer's entire formatter suite or preserve obsolete two-space-break expectations.

## Implementation slices

### SLICE-001: Freeze scope, prerequisites and recovery

Accept this draft route/design, recheck effective rules and registrations, and establish approved HISEW applicability, ownership and verification coverage in Steam.
Freeze base, 23 authored paths, ignored/generated/fixture byte inventories, every unrelated sentinel, current commands/report consumers, package/native identities and existing required statuses.
Refresh registry identity, anonymous access, lock/native rights notices and vulnerability evidence; inspect relevant transitive advisories before proposing any narrowly justified lock override, rather than blindly copying WebVOWL's KaTeX override.
Capture old checks and timing in a disposable baseline using the existing locked Snapper native backend; old failures are findings to classify, not permission to weaken the new gate.
Prepare retained preimages and a complete predicted delta/recovery manifest for scope acceptance before source/config writes.
Commit the accepted plan and necessary planning documents at the first separately authorized commit point, preserving excluded historical plans and unrelated edits.

Exit: owner-accepted concrete scope, selected controls/profiles, authoritative package identity and rights references, comparable baseline and recoverable inventories.
If registration, trusted CI feasibility, dependency clearance or scope is unresolved, retain a draft blocker; do not start implementation under inactive controls.

### SLICE-002: Integrate a shadow native path and trusted bootstrap

Add the isolated tool graph, bounded configuration, native commands/report contract, focused consumer tests and a trusted candidate-as-data qualification path.
Retain old prose enforcement during shadow qualification; inspect and adjudicate every selection/diagnostic/output delta in an isolated corpus.
Prepare and integrate only the accepted bootstrap scope through normal protected PR controls, with focused assurance of its dependency and CI trust boundaries.
No duplicate-tool retirement or live document formatting belongs in this bootstrap.
The newly integrated trusted source can qualify the exact later cutover candidate independently of candidate workflows and scripts.

Exit: actual Windows/Linux installation and native execution, path parity, QA-001 to QA-006 probes and successful incumbent bootstrap CI.
Capture the bootstrap merge/source/run identities and rollback preimages; do not infer final cutover acceptance from a green bootstrap.

### SLICE-003: Consolidate cutover and retire proven duplication

Prepare one consolidated candidate with reviewed authored-document changes, canonical command/reference updates, product/Markdown check separation, setup and release-workflow coherence, and retirement of proven prose-exclusive tooling.
Retain the root shipped dependency graph, comparator environments, generated docs and broader link checker, declarations/consumer matrix, CodeQL and existing product thresholds.
Regenerate `coverage.json` through `conformance:generate` if changed package inputs invalidate its provenance; never edit generated hashes or docs by hand.
Use LF Git blobs/checkout policy for any new first-party provenance hashing, with a real checkout-drift regression if such hashing is introduced.
Do not rerun upstream native rights qualification for unchanged binaries or claim it clears an altered installed graph.

Run focused regressions, then applicable product/full profiles on the frozen candidate.
Commission one bounded ordinary/independent review and scoped security assurance of the new dependency, subprocess/report and CI trust changes; reuse valid unchanged package reviews with explicit limits.
The executing session owns correction verification; consolidate corrections and use narrowly scoped follow-up review only.
Prefer the owner-selected Claude Opus 5.5/medium reviewer; if unavailable, retain the failure and use the authorized fallback, with one attempt per unavailable provider.
If Antigravity is selected, allow at least 900 seconds and a finite process-hierarchy ceiling; natural earlier completion is valid.
Allow at most two correction/follow-up rounds; unresolved substantive issues require replanning rather than endless review.

Exit: no unresolved correctness/security blockers, all relevant product checks pass, generated and unrelated bytes preserved, and one stable exact candidate ready for trusted hosted qualification.
Any candidate change invalidates only the evidence whose inputs changed; do not rerun broad assurance merely to repeat an already established claim.

### SLICE-004: Qualify, restore and integrate exact candidate

Run the trusted bootstrap against the exact candidate on both qualified platforms, six checks each, with resource measurements and retained positive/negative probe evidence.
Rehearse restoration in a task-owned isolated checkout/environment: restore every migration-owned tool/config/document preimage and check generated/unrelated sentinels and relevant controls.
Restore the final candidate after rehearsal and prove its exact tree before final hosted qualification/acceptance; do not discard unrelated user work or reset the live checkout.
Bind candidate and trusted source SHAs, tool/native integrities, policy/ignore hashes, selected paths, job/run/attempt IDs, report schemas/results and current required statuses.
Obtain separately recorded owner acceptance of that exact trusted run and normal protected merge authorization; never infer it from this proposal.
After authorized integration, verify remote main, attributable integrated checks, anonymous installation identity and the native report/commands on integrated source.
Finish HISEW handoff with actual native verification evidence and accurately attributed operator claims; archive only authorized spent branches and retain evidence for maintained lifetime plus three years.
No Steam npm release, moving release tag, registry promotion or producer release is required for this developer-tooling migration.

## Traceability and verification scope

| Slice     | Requirements / scenarios / decisions                         | Falsifiable proof                                                                                                             | Delivery and cleanup                                            |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| SLICE-001 | REQ/AC-001 to 003, 007; QA-001/007/008; DEC-001/002/006/008  | Exact inventories, frozen registry/native tuple, effective controls, comparable baseline and retained-preimage readback.      | Planning/scope acceptance; no implicit implementation approval. |
| SLICE-002 | REQ/AC-001/002/004 to 006; QA-001 to 006; DEC-001 to 005/007 | Real isolated installs/CLI, schema/exit checks, selection parity, trust probes and incumbent bootstrap CI.                    | Reviewed shadow bootstrap; old gate retained.                   |
| SLICE-003 | REQ/AC-001 to 006; QA-001 to 007; DEC-001 to 007             | Focused integration, affected product and final full controls; consolidated ordinary/independent/security disposition.        | Exact cutover candidate; only proven duplicate tooling retired. |
| SLICE-004 | REQ/AC-002/005 to 007; QA-005 to 008; DEC-007/008            | Hosted windows/resources, actual restoration, exact trusted-run acceptance, all required checks and integrated-main readback. | Protected merge and HISEW handoff; approved archival cleanup.   |

Concrete product commands include `format:check`, `spec:check`, `lint`, `docs:api:check`, `test:coverage`, `qualify:performance`, `conformance:check`, `typecheck`, `type-coverage`, `types:check`, `test:types`, `test:package` and `qualify:node-types` with each matching declaration root.
Preserve `docs:check`/documentation examples through the existing test suite and run mutation library/CLI when the release/selected route requires them.
Runtime matrices and release security workflows retain their actual invocation semantics; a local full check does not establish hosted/renderer/release acceptance.
Define or amend approved focused/affected/full HISEW profiles from these real inputs and the new isolated Markdown controls, rather than importing producer profiles by name.

## Predicted seams and scope

Likely additions: `.markdown-quality.json`, `tooling/markdown/package.json` and lock, native consumer regression tests, a bounded report/runtime launcher only if native command orchestration needs it, and trusted candidate/probe/window workflow material after reuse assessment.
Likely edits: root package scripts, `scripts/setup-development.js`, `test/setup-development.test.js`, active maintainer/testing/releasing/software-selection/node-support guidance, `.github/dependabot.yml`, `steam-community-bbcode.yml`, `steam-community-bbcode-release.yml`, and generated `coverage.json` through its owner if affected.
Likely retirement: `.snapperrc.toml` and the four `tooling/prose` source/test/requirements files, after exhaustive reference and environment-consumer search.
The exact formatted authored files and final added/modified/deleted paths are discovered through baseline comparison and accepted in SLICE-001; these predictions are not an approved file manifest.
No planned edit to converter source, public types/contracts, generated reference projections, comparison locks, fixture bytes, historical plans/migration evidence or remote rulesets.
Product Python remains; schema evolution is confined to the existing development evidence locator and must be documented and validated before cutover.

The executing Steam session coordinates delivery; Maksym owns exact scope, configuration, trust and merge decisions.
Read-only corpus inventories and reference research may proceed independently; config, check splitting, setup, release/qualification aggregation and document changes share semantics and must be consolidated before broad review.
No parallel write delegation is authorized by this plan.

## Recovery, abort and replanning

Abort before live mutation on base/preimage drift, changed ignored-file selection, unknown report readers, an unavailable coherent tuple, unmet rights/security requirements or an infeasible trusted workflow path.
Stop cutover on literal/semantic changes, out-of-scope formatting, any preserved generated/fixture/sentinel change, check/report fail-open, dropped Node or CodeQL coverage, budget failure or unmatched candidate/run identity.
Recovery restores complete migration-owned preimages, reinstates the exact old tooling/commands if retired and revalidates sentinels and required checks.
Restoring only a dependency version does not restore formatted Markdown bytes.
After an integrated failure, propose a normal reviewed revert/forward correction through existing protection; never force-push or move immutable tags.
Partial bootstrap/cutover commits resume from observed branch/PR/run identities and preserved evidence; rerun only invalidated checks and record interrupted processes/resources explicitly.
Changed corpus, package identity, parser/preset behavior, runtime qualification, effective rules or reported security conditions require a bounded rebaseline and scope amendment.

Cheapest discriminating experiments at execution are selected-path comparison, actual installed engine/native graph inspection, three report exit fixtures, a real generated-link failure and one isolated old/new full corpus sample.
Only after these pass should full hosted windows and exact cutover review be commissioned.
There is no need to investigate compilation, alter converter runtime floors or publish a new formatter release merely to integrate the already qualified 1.0.3 tuple.

## Evidence and reference notes

Planning inspected Steam source and effective remote main/rulesets, producer release/pilot records, OwlAPI/WebVOWL isolated configurations and locks, OwlAPI's remote trusted workflow, Software Engineering Workflow's remote config/manifest/lock, and current npm metadata.
The authored inventory was derived by read-only filesystem enumeration applying the observed Python selector; no corpus formatting, installation, product suite, security scan or hosted dispatch was run for Steam.
Only this proposal's own layout, links and whitespace were checked during document preparation.
No completed Steam migration, performance result, restoration or independent security approval is claimed.

The proposed separation of contributor tooling from consumer compatibility follows npm's distinction between [engines and devEngines](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#devengines).
Reproducible acquisition uses [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/); `--ignore-scripts` prevents lifecycle execution but explicitly invoked scripts still execute, so it alone is not candidate-data isolation.
Trusted workflow reuse retains verified full-SHA Action pins and the isolation principles in [GitHub's secure-use reference](https://docs.github.com/en/actions/reference/security/secure-use).
Consumer trust follows the [existing shared CI decision](https://github.com/Hadden-Industries/markdown-quality/blob/7994fdb08efa4fc391f6e035c9fff17820635b58/docs/ci-trust.md), subject to Steam-specific owner acceptance; no pilot's approval is transferred automatically.
Historical Steam Node qualification establishes why matching runtime/declaration roots and retained product checks matter, but current source and hosted results must be refreshed during implementation.
