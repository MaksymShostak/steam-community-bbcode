# Standalone portability decision and execution

The owner approved this local WP3 slice on 11 September 2026 after reviewing `standalone-portability-approval.md` in the private migration evidence.
The governing extraction plan is preserved unchanged alongside the original source bundle; its repository-identity instructions supersede historical ONI publication instructions without rewriting them.

## Frozen lineage

- Source: `fe75c5d8e29f68e43812439fbc6ec73df2f43b05`.
- Verified filtered import: `38c1ddf877b7ed89a94e261a3327c1aa25ddaaf5`.
- All 194 imported current blobs and modes match the source; all 23 retained commits contain exactly 197 selected historical paths.
- Original signed objects and private ignored evidence remain in protected local recovery storage. No source retirement or historical ONI purge has occurred.

## Accepted local changes

Root metadata names the destination; package scripts resolve locally; the documentation allowlist excludes original plans and migration records from npm.
Explicit setup uses native locked npm installs and Python venv with the retained Node 24.20.0, npm 12.0.2 and Python 3.14.7 pins.
The copied launcher is checked JavaScript and retains its MIT notice. Optional comparison tooling remains separate and Windows-qualified.
Historical plans keep their original bytes and source links. Maintained prose/link checks exclude historical records; real installed-archive checks enforce the publication boundary.
No dependency, compiler, runtime API, resource default, mutation threshold or publication flag is changed.

## Verification route

This is the accepted extraction plan's R2 preservation/portability slice. Executable changes use the repository-adapted test-first procedure; source/history preservation uses independent Git blobs, modes and SHA-256 comparisons.
RED demonstrated unwanted historical formatting, leaked plans in a real installed archive, broken historical-source link interpretation, and the missing setup behavior.
Targeted checks and real standalone setup are retained under `artifacts/portability/`.
Windows standalone qualification passed with Node 24.20.0, npm 12.0.2 and Python 3.14.7, including native setup in an independent checkout whose path contains spaces.
The complete check sequence passed 667 tests, six prose tests, three performance tests, runtime statement coverage of 99.93%, branch coverage of 96.53%, strict checking and 100% type coverage, repeat generation of 58 declarations, and installed JavaScript/CLI/TypeScript consumers.
Independent review identified shipped documentation links into excluded development records. The shared native Markdown validator now checks the actual installed archive as well as source documentation. RED reproduced the missing targets; immutable historical source links and an explicit source-checkout migration reference resolved them.
For the reviewed snapshot, `check-reviewed.log` in each checkout records every stage passing until that additional installed documentation check. After the final prose-only fixture-link correction, documentation checks and `installed-docs-green.log` pass in both checkouts. The earlier complete `check-final.log` and spaced `check.log` predate the stronger installed-documentation check; they are retained without relabelling.
Independent current type-coverage runs agree at 17,977/17,977 in both checkouts. Earlier logs had differing denominators despite matching recorded source hashes; their historical cause is unresolved and they are not used as proof of current equivalence.
Runtime source, specs, conformance cases, all four npm lockfiles and original plans remain unchanged. The conformance report changed only its package-metadata-bound fingerprint, retaining all 198 forward and 33 reverse cases.
Linux execution is not qualified locally because no Linux runtime is installed. Destination CI, lifecycle controls, workflow tests, publication and independent release acceptance remain later stages. Changes remain uncommitted and no destination remote is configured.
