# Trusted Markdown qualification reuse

The trusted staging checker, its negative probes, the six-sample window driver,
the Python resource observer and its probes, and the workflow are adapted from
Hadden-Industries/owlapi at `4f6adbd3a925ad2e0ccfc98550f216642957f870`.
The reused source is AGPL-3.0-only, matching this repository's package boundary.
The adaptations select Steam's repository and bounded authored policy.
They retain candidate data isolation, credential exclusion, report validation,
process observation, exact identity binding and the 30-second/512-MiB budgets.

`release.json` preserves the producer's immutable Markdown Quality 1.0.3 tuple
from Hadden-Industries/markdown-quality at
`7994fdb08efa4fc391f6e035c9fff17820635b58`, binding released source
`92d6e9f61b5fffe6f33d8878ef8e2880ca187ac0`.
The isolated package retains its own `LICENSE` and `THIRD-PARTY-NOTICES.md`,
including upstream native notices; no native asset is copied into Steam source.

Shadow qualification does not format live documents or retire Snapper.
The separately prepared local cutover replaces the prose-exclusive consumer files and canonical command references; it does not uninstall packages from an existing Python environment.
The bootstrap must pass incumbent checks and be integrated before its trusted
workflow can qualify a cutover candidate for exact owner acceptance.
