# JavaScript and checked contracts

## Node declaration compatibility

Runtime qualification covers Node 22, 24 and 26.
Each runtime lane also selects its matching locked `@types/node` environment under `tooling/node-types/`.
`npm run set-up:development` installs those three environments; Dependabot updates each within its own major.

1. Run `npm run check` to produce the canonical package archive.
2. Run `npm run qualify:node-types` to check all three declaration targets against that archive.
   To check only Node 22, run `npm run qualify:node-types -- --major 22`.
3. Inspect the log and exact declaration version in `artifacts/node-declarations/<major>/`.
   The compatibility checks run TS7 source checking, TS6 compiler-API checking, TypeDoc, 100% type coverage and installed declaration consumers without changing canonical dependency locks or rebuilding the archive.

Native compiler file lists and TypeDoc's actual programs must resolve every Node declaration from the selected environment.
A matching declaration environment establishes type compatibility.
Run on the corresponding Node executable to establish runtime compatibility.

## Source and generated declarations

Executable source, CLI code, tests and maintenance scripts use JavaScript ES modules and JSDoc.
TypeScript 7.0.2 checks authored JavaScript and generates the public declaration files; consumers execute the shipped JavaScript directly.

`tsconfig.json` checks source, scripts and runtime tests without emission.
`tsconfig.declarations.json` emits `.d.ts` and `.d.ts.map` from `src/` into the ignored `types/` directory.
Edit the owning JavaScript contract, never the generated declaration.
Declaration maps must resolve to the source included in the tarball.

### Choose a consumer check

| Question                                                           | Command                                                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Do the public types accept valid examples and reject invalid ones? | `npm run test:types` checks positive and negative fixtures against freshly generated declarations.   |
| Can the declaration build be reproduced?                           | `npm run check:types` compares two clean builds.                                                     |
| Will an installed consumer load ESM and resolve declarations?      | `npm run test:package` packs with npm 12 and installs the archive in an isolated temporary consumer. |

The installed JavaScript smoke executes parsing, MDAST interpretation and GFM serialization and the partial reverse API, including diagnosed fallbacks.

Declaration fixtures cover the public APIs and nested/media extension contracts.
The consumer check also invokes the installed npm binary with offline resolution for help, stdin conversion and the shipped conformance report.
CLI source has a native Node shebang and requires no compiler or loader at execution time.

`npm run check:type-coverage` uses the approved isolated TypeScript 6.0.3 environment.
It measures the parent project's authored JavaScript at 100%, with no exclusions or suppressions beyond the declared generated/comparison-directory boundary.
TypeScript 7 remains authoritative for primary checking and declaration emission.
The extra typing metric does not establish Steam syntax or semantic coverage.

`npm run generate:api-docs` uses TypeDoc 0.28.20 with the [approved temporary minimatch patch](../tooling/api-docs/patches/README.md) and TypeScript 6.0.3 only in `tooling/api-docs`, under the separate approved docs qualification.
Native `typedoc-plugin-markdown` 4.14.1 renders the reference.
A maintained imported generic fixture checks native type identities and rendered comments; the check compares generated Markdown bytes with the committed reference.

The docs orchestration script has its own strict config because TypeDoc's native API declarations require the standard DOM WebAssembly types.
The parent's TS 7 executable checks it through `typecheck:api-docs`; DOM globals do not enter runtime or consumer checking.
The isolated metric also requires 100% for that script.
No TS 6 compiler generates the package declarations or checks consumers.

Public declarations reuse mdast/unist contracts.
Their definition packages are runtime dependencies so fresh consumers receive them; the compiler and internal Node definitions remain development-only.
Parser-vendor types must remain inside the syntax boundary and must not escape through public API declarations.
