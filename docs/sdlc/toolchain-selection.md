# Standalone SDLC toolchain

The package retains Node 24.20.0, npm 12.0.2 and Python 3.14.7 as development pins, while converter CI also qualifies Node 22.23.2 and 26.8.1.
The existing Node test runner and YAML 2.9.0 regression parser need no additional JavaScript tooling graph.

The lifecycle's pinned direct Python requirements are resolved to a complete native uv hash lock; pip installs binary distributions through the repository interpreter.
This does not replace the separately hash-locked prose environment.
Source licences and selection rationale are in [package reuse](package-reuse-assessment.md).

Existing development dependencies and compiler versions remain unchanged.
