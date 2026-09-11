# Standalone lifecycle commands

Run `npm run setup:development` for package tooling, then `npm run setup:sdlc:dependencies` for the separate hash-locked lifecycle dependencies.
Run `npm run setup:sdlc` to generate repository-local Codex policy and activate only the six local adapted skills.
No external Skills CLI, MCP service, game tooling or global hook is installed.

`npm run check:sdlc` compares generated configuration.
It does not establish host loading or trust.
Preserve independent hooks/settings; the native setup transaction rejects unowned conflicts.
See [adoption](adoption.md).

Use `npm run sdlc -- --help`.
R0/R1 may use the accepted task brief; R2/R3 require a previously accepted baseline.
An immutable committed Markdown plan may be passed through `--baseline` with the real owner decision in `--intent-reference`.
A supplied reference does not authenticate owner approval.
Do not fabricate an Issue or receipt just to fill a field.

Focused verification checks whitespace and generated configuration.
Affected and full profiles run the complete standalone package checks, SDLC tests and setup tests: this small repository needs no monorepo path selector.
Invoke verification through `npm run sdlc -- verify`, which supplies the native npm CLI path.
Fingerprints include all tracked/nonignored inputs plus actual package/tooling locks and Python requirements.
Old ONI runtime state is never reused.

Before proposing a commit run `npm run check`, `npm run test:sdlc`, `npm run test:setup` and `npm run check:sdlc`.
Independent R2 review and relevant specialist evidence remain separate.
Preserve failures and exact output paths.
Review/commit/push/publication each retain their applicable owner authority.
