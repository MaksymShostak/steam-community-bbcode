# Destination GitHub governance

The standalone destination is MaksymShostak/steam-community-bbcode.
Only an explicit destination bootstrap push may create initial main; subsequent work uses reviewed branches and PRs.
Source package history must not be merged into ONI main.

Use native trusted-base PR linkage and immutable accepted baselines.
The pull_request_target validator checks out only github.sha from the trusted base and treats PR content as data.
It never executes candidate code.
Independent R2 review remains a real evidence obligation; CODEOWNERS assigns personal ownership without creating an independent reviewer or granting access.

Qualification and SDLC aggregate checks reject failed/skipped/cancelled dependencies.
Configure required checks only from actual emitted destination names after hosted runs.
Protect ordinary main updates against force pushes/deletion.
Environment and publisher restrictions are a separate release checkpoint.

Dependabot owns npm/pip/Actions update proposals; no automatic merge is enabled.
CodeQL covers Actions, JavaScript/TypeScript and Python, with ordinary pull_request events for fork analysis.
No ONI C# matrix or game credentials are copied.
Local YAML validation is not remote enforcement evidence.

The native label helper derives its destination from this checkout's origin.
Inspect the exact remote before running `npm run setup:sdlc:github`; names/colours are configuration, and no secret values are copied.
