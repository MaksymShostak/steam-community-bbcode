// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createVerifier} from 'sigstore';
import {releaseSignerPolicy} from '../scripts/release-artifacts.js';

test('native Sigstore verifies a real bundle but rejects its different authenticated workflow', async () => {
  /** @type {import('sigstore').Bundle} */
  const bundle = JSON.parse(readFileSync(new URL('./fixtures/release/sigstore-5.0.0-provenance.json', import.meta.url), 'utf8'));
  const cache = mkdtempSync(join(tmpdir(), 'bbcode-signer-policy-'));
  const upstreamIdentity = '^https://github\\.com/sigstore/sigstore-js/\\.github/workflows/release\\.yml@refs/heads/main$';
  try {
    // Native packaged trust-root seeds make this deterministic and offline.
    // Production verification uses Sigstore's normal TUF refresh instead.
    const cacheOptions = {tufCachePath: cache, tufForceCache: true};
    const original = await createVerifier({...releaseSignerPolicy, certificateIdentityURI: upstreamIdentity, ...cacheOptions});
    assert.ok(original.verify(bundle).identity, 'Fixture must have a valid native signature and authenticated identity.');
    const release = await createVerifier({...releaseSignerPolicy, ...cacheOptions});
    assert.throws(() => release.verify(bundle), {code: 'UNTRUSTED_SIGNER_ERROR'});
    const wrongIssuer = await createVerifier({...releaseSignerPolicy, certificateIdentityURI: upstreamIdentity,
      certificateIssuer: 'https://accounts.google.com', ...cacheOptions});
    assert.throws(() => wrongIssuer.verify(bundle), {code: 'UNTRUSTED_SIGNER_ERROR'});
  } finally { rmSync(cache, {recursive: true}); }
});

test('native signer identity policy matches exactly rather than accepting regex lookalikes', () => {
  const identity = 'https://github.com/MaksymShostak/steam-community-bbcode/.github/workflows/steam-community-bbcode-release.yml@refs/heads/main';
  const policy = new RegExp(releaseSignerPolicy.certificateIdentityURI, 'u');
  assert.match(identity, policy);
  for (const value of [identity + '/extra', 'prefix/' + identity, identity.replace('github.com', 'githubXcom'),
    identity.replace('.github', 'Xgithub'), identity.replace('.yml', 'Xyml'), identity.replace('/main', '/other')]) {
    assert.doesNotMatch(value, policy);
  }
});
