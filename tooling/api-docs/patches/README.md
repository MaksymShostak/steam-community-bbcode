# Temporary TypeDoc minimatch patch

TypeDoc 0.28.20 calls the removed `Minimatch.matchOne` API during entry-point discovery.
The patched minimatch 11 dependency therefore needs a corresponding change in its TypeDoc consumer.
The patch follows [upstream PR #3151](https://github.com/TypeStrong/typedoc/pull/3151), revision `529c39478acca1a1e7a9901bdf70c48a04696279`: use native partial matching and preserve negation handling with `flipNegate`.
It adds no substitute parser and leaves TypeDoc's conversion, diagnostics and rendering intact.

The owner approved this temporary compatibility exception on 13 November 2026.
TypeDoc is pinned to 0.28.20, and the patch is applied by `patch-package` 8.0.1 with `--error-on-fail`.
Development setup and all documentation npm entry points apply it explicitly, including after installs using `--ignore-scripts`.
Patch refusal stops the command; there is no fallback to vulnerable minimatch.

Remove the patch, the exact TypeDoc pin, the patch tool and its invocation when a qualified stable TypeDoc release incorporates this change.
Reassess on the next TypeDoc release or by 13 December 2026 if no release has addressed it.
Qualification must cover nested entry points, glob exclusions and negation, the repository's generic/union documentation fixtures and generated links, and clean installation.

The patch modifies Apache-2.0-licensed TypeDoc development tooling.
Its upstream licence is retained in `typedoc.LICENSE`; installed dependencies retain their notices.
Neither the patch nor TypeDoc enters the published runtime package.
