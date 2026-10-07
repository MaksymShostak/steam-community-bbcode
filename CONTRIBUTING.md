# Contributing

This package is AGPL-3.0-only from its first implementation.
Retain dependency notices and the separately attributed MIT-licensed helper and historical fixture.
Do not add an "or later" grant.

Follow the [Code of Conduct](CODE_OF_CONDUCT.md) in converter community spaces.
It identifies the private reporting channel, initial moderator and conflict-of-interest process.
The adapted Contributor Covenant policy text retains its CC BY-SA 4.0 licence; converter code remains AGPL-3.0-only.

Add an independent semantic or type-contract fixture before changing executable behavior.
Use the native JSON Schema consumer for registry structure and the domain reference checks for identities; schema validity is not source evidence or conformance.

Use JavaScript ES modules with checked JSDoc and explicit relative `.js` imports.
See [JavaScript and types](docs/javascript-and-types.md) for the compiler roles and declaration lifecycle.
Public declaration changes are API changes.
Do not patch dependencies, add compatibility shims, suppress checks or relax failing assertions.

On Node 24.21.0, run `npm run set-up:development` with the pinned tools, then `npm run check`.
On another supported converter development runtime, select `npm run set-up:development -- --product-only` and `npm run check:product`; install and check Markdown separately on Node 24.21.0.
A local pass does not authorize a commit, push, npm release, GitHub protection change or Steam publication.

Use precise verb-first names for custom npm operations, with lowercase kebab-case words and colon-separated qualifiers, such as `compare:alternatives`.
Do not name a script `run` or use the `run:` prefix.
The exact name `cli` is an exception for the multipurpose command dispatcher, not a general noun-first namespace.
Keep npm lifecycle events and `pre`/`post` hooks under their exact npm-defined names; custom hooks must refer to an existing valid script.
`test/development-command-names.test.js` enforces this repository convention; npm does not define a general custom-script naming standard or an implicit CI role for `cli`.

Edit source JSDoc to change the API reference and run `npm run generate:api-docs`.
`npm run check:api-docs` qualifies imported generics and compares native generated Markdown with the committed reference.
Supporting source modules in that reference explain referenced types; the package exports map still defines its public surface.

Use semantic line breaks for authored package guides: one sentence per source line, with editor soft wrapping for long sentences.
Run `npm run install:markdown`, then `npm run format:markdown` on the qualified Node 24.21.0 runtime.
`npm run check:markdown` performs the full authored check without writing and is included in `npm run check` and dedicated Windows/Linux CI jobs.
`npm run test:markdown` exercises the real native CLI, selected paths, literal preservation, result schema and candidate isolation.
The gate covers all repository Markdown, including historical plans and migration records; generated references and conformance projections remain owned by their generators.
Code blocks and tables retain their meaning; two-space hard breaks are rejected and safe formatting uses explicit backslash breaks.
The formatter uses deterministic sentence detection; review language and unusual abbreviations as normal prose.
