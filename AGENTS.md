# Repository instructions

Preserve existing working-tree changes.
Use direct, scoped edits; never restore or discard user work without explicit authorization.
Commits and pushes require separate explicit authorization; use the committing-to-git skill for commits.

Configuration changes require explicit approval of their scope.
Reuse the owner's recorded pre-approval for changes explicitly specified in the accepted migration implementation plan; do not request the same approval again.
New settings outside that scope require a concrete proposal.

Read docs/sdlc/howto.md before lifecycle work and docs/sdlc/engineering-principles.md for material work.
The accepted task is authoritative; use the smallest justified risk route.
Use .sdlc/skills/test-driven-development/SKILL.md as the sole implementation procedure.
Follow REVIEW.md for independent review.
Role installation never authorizes delegation against user limits.

Keep names semantically precise, use native consumer-owned parsers/validators, and introduce no shims without a specific prior override.
Preserve the ESM checked-JavaScript API, AGPL-3.0-only package boundary, copied MIT notices and unchanged qualification thresholds.

Use npm entry points and the repository .venv.
Ordinary package setup and optional SDLC activation are separate operations.
Check actual consumers and preserve exact emitted evidence paths.
Hosted CI, hook trust, independent review, release approval and npm publication are distinct acceptance boundaries.

The migration must never merge the historical package branch into ONI main or use ONI publishing identity.
Read docs/sdlc/adoption.md for destination state.
Retain source recovery evidence until accepted cutover; source retirement needs its own exact authorization.
