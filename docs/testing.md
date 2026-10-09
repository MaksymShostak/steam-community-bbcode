# Testing and qualification

`npm run format` applies Prettier to non-Markdown source using the owlapi EditorConfig convention.
`npm run check:format` rejects formatting drift without writing and runs before qualification and local package creation.
`npm run format:markdown` owns all repository Markdown layout, semantic line wrapping and literal code preservation.
`npm run check:markdown` independently requires the native `authored-gfm@1` policy and physical local-file links.
The schema 2 Markdown policy includes `**/*.md` and explicitly excludes only the operational paths formerly omitted through `.gitignore`.
The policy is the sole selection authority; all 54 authored documents remain included.
Plans, fixtures, tooling documentation, comparison documentation and generated references are checked too; `.prettierignore` cannot exempt them.
The generic Prettier invocation excludes all Markdown because the native Markdown command owns it.
Generated documentation must converge through its owning generator, and its freshness check remains required.
Repository-authored Markdown does not support two-space hard breaks; trailing-whitespace removal remains enabled.

`npm run check:api-docs` qualifies imported generic JSDoc through the isolated native TypeDoc model and Markdown renderer, then checks all ten generated reference files for freshness.
`npm run generate:api-docs` explicitly regenerates them.
Primary TS 7 checking and the strict 100% metric cover its orchestration script as well as the runtime, tests and other maintenance scripts.

Run commands from this package's source checkout with the locked dependencies installed.
`npm run check:product` retains specification projections, runtime coverage, executed conformance, TypeScript 7 checking, 100% typed-reference coverage, reproducible declarations, declaration contracts and actual npm-installed API/CLI consumers.
`npm run check` adds the full authored Markdown check and native integration/observer probes on Node 24.21.0.
The converter CI matrix uses explicit product-only setup and `check:product`; dedicated Windows/Linux Markdown jobs are mandatory prerequisites of `BBCode / Qualification`.
The standalone workflow regression under `test/bbcode-workflow.test.js` uses native YAML parsing and execution of the real Bash aggregate for successful, failed, cancelled, skipped and absent prerequisite results, including Markdown.
The qualification workflow runs for every pull request and main push, without changed-path filtering.
Every Windows/Linux development lane retains the actual product fresh-clone bootstrap at its minimum or latest supported release.
Separate consumer lanes exercise one retained package at the lower consumer minimums and latest releases; see [Node support and qualification](node-support.md).
These local workflow checks do not establish hosted execution or branch-protection enforcement; those require destination run and settings evidence.
Native ESLint recommended rules also run without inline configuration or warning allowances.

On 9 September 2026 the full package check passed locally on Windows x64 under Node 22.23.2 and 26.8.1, supplementing the existing Node 24.20.0 full verification.
The additional runtimes were unmodified official executables checked against their published SHA-256 lists, with npm 12.0.2 and the same locked dependency graphs.
Each invocation used the selected runtime for its child processes as well.
These runs do not establish Linux compatibility or successful GitHub CodeQL and dependency-review jobs.

| Command                               | Contract                                                                                 |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm test`                            | Focused runtime examples and seeded properties                                           |
| `npm run qualify:parser`              | Native grammar foundation and resource contracts                                         |
| `npm run qualify:performance`         | Bounded subprocess regression for opaque text and adjacent formatting                    |
| `npm run qualify:github`              | Opt-in live GitHub HTML assertions for three synthetic renderer scenarios                |
| `npm run test:coverage`               | Both suites under c8/V8, including unloaded runtime source                               |
| `npm run check:conformance`           | Generated forward/reverse policy report matches executed cases                           |
| `npm run check:docs`                  | Construct examples and package-local documentation links                                 |
| `npm run check:markdown`              | Full native authored layout, lint and physical local-file links, without writing         |
| `npm run test:markdown`               | Public tuple, policy, profile, Steam literals, consumer reports/exits and KaTeX override |
| `npm run test:markdown:qualification` | Public trusted staging, candidate isolation and bounded checking                         |
| `npm run test:documentation-tooling`  | Focused setup, workflow aggregation and broader documentation-link regressions           |
| `npm run test:mutation`               | Sequential Stryker library and real-process CLI qualification                            |
| `npm run test:package`                | Packed source, declarations, maps, executable and fresh consumers                        |

Runtime coverage requires at least 98% statements, lines and functions and 95% branches.
Three JSDoc-only modules with `export {}` are excluded from runtime measurement because c8 assigns them fictitious unloaded functions.
Their contracts remain subject to primary type/declaration checks.

The existing evidence locator `artifacts/prose/check.json` now contains the installed capability's versioned native result, not the old Snapper array.
Its shipped JSON Schema validates the report; operation findings exit 1, operational failures exit 2 and success exits 0.
Each check clears stale output first and records stderr separately at `artifacts/prose/check.stderr.txt`; absent or malformed output cannot qualify.
The generated/reference document link checker remains part of the product documentation tests and is not narrowed to the formatter's authored selection.

For this documentation-tooling migration, the owner excluded local full product suites.
Use focused native, setup, workflow and documentation checks and byte/manifest evidence; unchanged converter behavior does not require rerunning unrelated package, coverage, performance or mutation qualification.
Hosted required controls and release thresholds remain unchanged acceptance boundaries.
Executable diagnostic arrays are counted even when unloaded.
See `.c8rc.json` for the exact scope.

Both mutation profiles require 90%; neither excludes surviving mutants or uses checker suppressions.
Ordinary PR and main-push iteration checks skip mutation; manual checks opt in with `run-mutation`.
The reusable workflow defaults to requiring mutation, and the release workflow explicitly requests both profiles before qualifying an RC archive.
The aggregate accepts a skipped mutation job only when mutation was not requested; requested mutation failures, cancellations and skips block qualification.
CI requires the dependency-review job to succeed before starting the six ordinary converter jobs.
When requested, the full library and CLI profiles run in separate parallel Linux jobs only after every ordinary check passes.
The dependency-review action runs only for affected pull requests; its job remains eligible on push and manual runs so those events can reach the test stages.
The aggregate requires dependency review and the runtime matrix to succeed, plus the mutation result appropriate to the selected mode.
Superseded PR runs are cancelled within the same workflow and PR; main and manual runs remain independent.
The first remote run spent about 40 minutes on library mutation testing and ten minutes on CLI mutation testing, compared with 40 seconds for ordinary converter checks.
Parallel jobs reduce the expected critical path without reducing mutation scope; runner availability still affects elapsed time.
Incremental mutation-result caching is not enabled: Stryker's command runner cannot detect CLI test changes, and environment and dependency changes require separate invalidation.
The library uses Stryker's maintained TAP runner with `node:test` and per-file coverage.
The CLI uses its built-in command runner with real child processes, because in-process TAP coverage cannot establish coverage inside a spawned CLI.
CLI mutation coverage analysis is disabled by that runner's contract, not inferred from the library score.

Stryker runs disposable sandboxes under `artifacts/`, never in place.
Native Node ancestor resolution supplies the package's installed dependencies without extra node_modules links.
Runtime mutation sandboxes omit compiler configurations: Stryker 10's config rewriter depends on an API removed in TypeScript 7, and the JavaScript runner does not consume those files.
Primary checking and declaration generation still use the real TypeScript 7 configurations outside the sandbox.
TypeScript 6.0.3 remains confined to the two approved metric and docs packages; neither supplies a compiler to a mutation sandbox or primary checking.

Reports live under `artifacts/runtime-coverage`, `artifacts/mutation-library` and `artifacts/mutation-cli`.
Retain original failures and classify survivors before changing tests.
A timeout can count as detected in Stryker's score; it is not an assertion failure.
Host execution may be necessary on Windows where a restricted process sandbox denies Stryker's cleanup of its own workers.
This does not require changing filesystem permissions, command guards or installed vendor code.

Runtime-error mutants are reported separately and excluded by Stryker's native score calculation; they are not assertion kills.
Mutated native grammar setup or module initialization can fail before an assertion runs.
Preserve the native reasons and exact counts in the execution record alongside survivors and uncovered mutants.
The unmutated suite passes; an invalid instrumented grammar is not a production failure or proof that an assertion detects a fault.

Scores measure the configured code and tests.
They do not prove complete Steam syntax, rendering fidelity, security approval or stable-release readiness.
The shipped `coverage.json` is a separate **conformance** report, not runtime coverage.
Current numerical results and retained logs belong to the [execution record](https://github.com/MaksymShostak/oxygen-not-included/blob/fe75c5d8e29f68e43812439fbc6ec73df2f43b05/docs/plans/2026-09-08-steam-community-bbcode-execution.md).

The [release workflow](releasing.md) reuses the same installed API, CLI and TS 7 declaration consumers for both retained archives and exact public coordinates.
`npm run pack:release` also retains native production audit, CycloneDX inventory and archive integrity.
Registry acceptance checks cover coexistence of release channels and rejection of wrong coordinates, tag targets, archive bytes, origins and SHA-512 integrity.
The independent public installation and native signature/provenance audit require an actual authorized publication; local fixture checks do not attest those remote operations.

## Performance disposition

On 10 September 2026 the owner accepted the existing general-purpose synchronous API with the documented large-input serializer limitation in the [security model](security-model.md#resource-limits-and-their-scope).
The default 1-MiB byte allowance remains intact; Workshop callers can select 8,000 bytes through the existing API or CLI.
The three five-second subprocess regression fixtures remain mandatory.
They establish a regression floor for those cases, not a universal time bound or proof that the upstream defect is fixed.

Retained measurements on Windows, Node 24.20.0 and an Intel Core i9-12900K exclude process startup.
The committed ONI description contains 6,765 UTF-8 bytes and converted in a median 2.344 ms, with a 12.33 ms first call.
At 8,000 bytes, ordinary prose took a median 0.201 ms, opaque brackets 41.898 ms and bare brackets 54.673 ms.
Opaque bracket cases at 16,000, 32,000 and 64,000 bytes took medians of 163.267, 656.281 and 2,619.569 ms respectively.
These are observed sample timings, not worst-case guarantees; concurrent work and different hardware can change the effect.
The upstream defect remains relevant for larger or adversarial workloads even though the sampled Workshop descriptions complete quickly.

The measurements and preserved large-input failures are in `.sdlc/runtime/converter/release-qualification/`, including `workshop-size-timings.json`.
An isolated upstream patch proposal passes the upstream API suite and local equivalence checks, but the installed dependency remains unmodified and the report remains unsent.

## Selected GitHub renderer conformance

`npm run qualify:github` now verifies all three independently specified cases: underline/insertion/spoiler/table presentation, literal autolinks, and flow structure with protected spaces.
Expected HTML is reviewed source, not regenerated from live observations.
Comparison normalizes CRLF and terminal newlines while preserving meaningful text padding.
The flow case additionally renders an independently authored Markdown target for comparison.
The HTTP-success regression tests reject missing structures, active script markup, newly activated literal links and lost text.

Each opt-in live run sends only the hardcoded synthetic public cases to GitHub's Markdown API in GFM mode, without credentials or repository context.
It retains requests, responses, expected HTML, timestamps, request IDs and hashes in a new `artifacts/github-rendering/run-*` directory.
All three cases passed a fresh live run on 10 September 2026.
This is endpoint-specific HTML evidence; it does not assert browser interaction, live Steam acceptance or every GitHub surface's presentation.

The `steam-community-bbcode-renderer.yml` workflow runs the same command weekly and on manual dispatch, with a production-only locked install.
Its reporting step uses the exact directory emitted by the current invocation, including after a renderer failure, and streams requests, responses and provenance into logs instead of uploading an archive.
It is separate from mutation testing and has a ten-minute job limit.
Its syntax passes native actionlint; remote scheduling is not active because the owner requires all current changes to stay local.
Adapt and activate it in the destination repository as part of that repository's CI setup.
The original plan's selected-renderer qualification is complete here; destination schedule activation remains a delivery task.

## Actions selection and diagnostic evidence

`npm run qualify:ci-selection` records exact Git comparison inputs under `artifacts/ci-selection/selection.json`.
Only added/modified `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and Markdown under `docs/plans/` or `docs/migration/` qualify for documentation-only selection; nested agent instructions require package checks.
These paths are excluded from the distributed package and have no converter/build inputs; native authored-Markdown/link checks still inspect them.
PR merge parents must match the event base/head; main pushes must be non-forced exact before/after comparisons.
Unknown/mixed paths, deletions, renames, missing history or ambiguous identities select broad qualification; missing/failed selection cannot green the aggregate.
Explicit dispatch, reusable qualification and Release remain broad.

`npm run generate:ci-evidence -- --mode <lane>` streams native diagnostic files with runner commands suspended and emits a bounded summary of identities, file sizes, hashes and retrieval limits.
Reports keep their existing product paths; local files remain useful for local diagnosis.
Required evidence is in the reporting step's log, including mutation survivors/timeouts/errors and all available trusted-Markdown window samples, receipts, stdout and stderr.
No routine converter, Markdown, consumer, mutation, renderer, trusted-Markdown or registry-report archive is uploaded, including during Release.
Complete unfiltered CodeQL SARIF stays in its existing file artifact, with unchanged repository-default retention, filtering and native security upload.
Only the seven-day shared consumer archive and the thirty-day slim release candidate otherwise remain.
Logs can be masked, truncated, cancelled or expire; a local hash identifies original bytes and does not prove an unchanged GitHub display.
Reporting failure blocks qualification, and missing required evidence prevents acceptance; inspect complete logs and their actual retention rather than treating summaries as a complete report.
`npm run test:ci-evidence` exercises native Git fixtures, real Bash aggregates, safe diagnostic streaming, exact renderer directories, transfer bytes/checksums and existing native release gates.
