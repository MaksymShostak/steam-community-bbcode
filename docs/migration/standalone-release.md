# Standalone release migration

The accepted extraction plan is retained unchanged in `docs/plans/steam-community-bbcode-repository-extraction-plan.md`, committed as `c3685102fcbdbd339444d1e975080f26f19171a7`.
The owner approved implementation checkpoints and later approved the exact environment, main ruleset and Sigstore dependency additions in this migration thread.
Publication remains separately authorized; package metadata is still private at version 1.0.0.

## Qualification and identity

The release workflow reuses the existing runtime/mutation, SDLC and CodeQL workflows at its own immutable revision.
Candidate generation requires successful prerequisites and clean exact source input.
Schema version 2 records destination repository ID, ref, workflow, run/attempt, channel and qualification results; local candidates have no hosted identity.
The protected publisher receives only the retained archive, verifies the candidate metadata hash and source identity, and executes no checked-out project code.

Native npm verifies package signatures and exposes verified SLSA bundles.
Native Sigstore additionally authenticates the expected GitHub issuer and exact workflow certificate identity before repository-specific claims are accepted.
No custom certificate parser or cryptographic verifier is introduced.

## Native reuse and dependency decision

The existing npm 12.0.2 audit was inspected first: its pacote verifier does not pass expected issuer or certificate identity constraints.
The maintained Sigstore public API supplies those controls directly.
The owner approved `sigstore@5.0.0` (Apache-2.0), then its published declaration prerequisites `@types/make-fetch-happen@10.0.4` (MIT) and `@sigstore/rekor-types@5.0.0` (Apache-2.0).
The supported Node matrix satisfies Sigstore's Node engine ranges.
Native npm installed all three with lifecycle scripts disabled and generated the lock update.
All existing locked versions and integrity values were preserved; all 53 added entries are development-only.
Their recorded licences are MIT, ISC, Apache-2.0, BSD-2-Clause and BlueOak-1.0.0.
The shipped runtime graph and package allowlist are unchanged.

Sources: [npm audit](https://docs.npmjs.com/cli/v12/commands/npm-audit/), [Sigstore verification API](https://github.com/sigstore/sigstore-js/blob/main/packages/client/README.md#verifybundle-payload-options), [GitHub native workflow reuse](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).

## Review and retained evidence

Independent review identified the missing authenticated signer constraint before release.
The original Codex Security diff scan `bd1753af-7289-4b22-a446-6da9751a12ff` retained that low-impact finding against the earlier frozen diff; it is not a clean scan of the later correction.
The retained archive hashes bounded the finding's impact to false origin assurance.
The correction uses native issuer and anchored workflow identity policy.
A real upstream signed bundle verifies under its actual identity and fails the destination policy; the production verification function also rejects it.
The fixture preserves signed public metadata without changing signed bytes.

Private recovery evidence retains the source bundle and original qualification history.
Local `artifacts/portability/` retains negative and positive gate results, native signer checks and full qualification logs.
Do not publish private recovery or security bundles as package assets.

## External state and remaining acceptance

Bootstrap commit `5637c558657cc4f13c5034dbfee35af083f3f7ac` passed the hosted six-runtime matrix, both mutation profiles, SDLC controls and CodeQL analyses.
The owner-approved `npm-release` environment restricts deployment to `main`, requires the owner reviewer, permits owner self-review and disables administrator bypass.
The owner-approved main ruleset requires pull requests, current successful named checks and resolved review threads, and blocks deletion and force-pushes without bypass actors.
GitHub human approval count is zero; required independent technical review remains separate.

The npm registry returned E404 for the package and the local account check returned ENEEDAUTH.
No package was published and no trusted publisher was configured.
Hosted release dry-run evidence, final independent acceptance, first-publication owner choice and live registry/OIDC verification remain distinct checkpoints.
