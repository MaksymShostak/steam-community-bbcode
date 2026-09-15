# Standalone SDLC adoption

This destination selectively adopts the tested Python lifecycle/setup controls from frozen ONI commit fe75c5d8e29f68e43812439fbc6ec73df2f43b05 under the owner-approved extraction plan, WP4.
The source itself records Universal Ontology b3984ffbfe9b38cca7bd4570aeb3f5bc0fa6f20e and codex-sdlc 1.0.0 pre-release.
SOURCE_PACKAGE.json is preserved historical package provenance, not a destination deployment receipt.
UPSTREAM.json records source bytes before adaptations; no hashes are rewritten to disguise changes.

The supported package procedure is reviewed selective copying; no package updater exists.
The Python state/schema engine and transactional setup are preserved. Destination verification calls native package and Python controls directly, without ONI routing, mod tooling, global.json or Jest. Native node:test owns JavaScript tests. The root remains AGPL-3.0-only; scripts/SDLC-LICENSE, tests/SDLC-LICENSE and .sdlc/UPSTREAM-LICENSE retain copied MIT terms.

Generated .codex and local skill activation are ignored.
No .sdlc/runtime state, prior locks, approvals, issue snapshots or old receipts were imported.
Generated configuration is not hook trust or successful host execution.
Existing user-level command protection is unchanged; no DCG binary, licence override or operator configuration is installed.

The destination repository is public and was created empty by the owner on 11 September 2026.
Hosted checks, main protections, external publisher binding and release acceptance are pending bootstrap.
Independent local verification evidence is recorded in verification.md.
Source ONI remains frozen and recoverable.
