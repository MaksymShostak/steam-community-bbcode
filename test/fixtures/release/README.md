# Native signed provenance fixture

`sigstore-5.0.0-provenance.json` is the original SLSA v1 bundle returned by
https://registry.npmjs.org/-/npm/v1/attestations/sigstore@5.0.0 on 11 September 2026.
It contains public package attestation data, retained without changing signed bytes.

The native Sigstore 5.0.0 verifier authenticates its real upstream GitHub identity.
The destination release policy must reject that different workflow even though
its cryptographic signature is valid. This fixture does not establish successful
publication of steam-community-bbcode.
