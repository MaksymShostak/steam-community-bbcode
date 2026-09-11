// SPDX-License-Identifier: AGPL-3.0-only
// Adapted from Hadden-Industries/owlapi scripts/release-artifacts.mjs and
// scripts/qualify-public-registry.mjs at 2ac41c94e6630ca47ce110a484ec9af3b0b1f335.
// Changes (2026-09-09): converter coordinate, explicit release channel, JSDoc,
// native npm archive consumers, and no single-prerelease/immutable-release policy.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {basename, join} from 'node:path';
import {verify} from 'sigstore';

export const registry = 'https://registry.npmjs.org/';

// Native Sigstore treats certificateIdentityURI as a regular expression.
export const releaseSignerPolicy = Object.freeze({
  certificateIssuer: 'https://token.actions.githubusercontent.com',
  certificateIdentityURI: '^https://github\\.com/MaksymShostak/steam-community-bbcode/\\.github/workflows/steam-community-bbcode-release\\.yml@refs/heads/main$',
});

/** @param {Buffer} buffer */
export const sha256Buffer = buffer => createHash('sha256').update(buffer).digest('hex');
/** @param {string} path */
export const sha256File = path => sha256Buffer(readFileSync(path));
/** @param {string} left @param {string} right */
const compareCodeUnits = (left, right) => left < right ? -1 : left > right ? 1 : 0;
/** @param {{fileName: string, sha256: string}[]} entries */
export const formatSha256Sums = entries =>
  `${[...entries].sort((left, right) => compareCodeUnits(left.fileName, right.fileName))
    .map(({fileName, sha256}) => `${sha256}  ${fileName}`).join('\n')}\n`;

/** @param {unknown} value @returns {asserts value is Record<string, unknown>} */
function assertRecord(value) {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), 'Expected a registry JSON object.');
}

/** @param {{expectedName: string, expectedVersion: string, tag: string, metadata: unknown, distTags: unknown}} facts */
export function assertPublicRegistryMetadata({expectedName, expectedVersion, tag, metadata, distTags}) {
  assertRecord(metadata);
  assertRecord(distTags);
  if (metadata['name'] !== expectedName || metadata['version'] !== expectedVersion) {
    throw new Error('Public registry metadata has the wrong package coordinate.');
  }
  if (distTags[tag] !== expectedVersion) {
    throw new Error('The requested distribution tag does not identify the expected version.');
  }
  const dist = metadata['dist'];
  assertRecord(dist);
  const integrity = dist['integrity'];
  const tarballUrl = dist['tarball'];
  if (typeof integrity !== 'string' || !integrity || typeof tarballUrl !== 'string' || !tarballUrl.startsWith(`${registry}${expectedName}/-/`)) {
    throw new Error('Public registry distribution metadata is incomplete or has the wrong origin.');
  }
  return {coordinate: `${expectedName}@${expectedVersion}`, channel: tag, integrity, tarballUrl};
}

/**
 * @param {{expectedName: string, expectedVersion: string, tag: string,
 * retainedSha256: string, metadata: unknown, distTags: unknown,
 * registryTarballSha256: string}} facts
 */
export function assertPublicRegistryFacts({expectedName, expectedVersion, tag, retainedSha256, metadata, distTags, registryTarballSha256}) {
  const distribution = assertPublicRegistryMetadata({expectedName, expectedVersion, tag, metadata, distTags});
  if (registryTarballSha256 !== retainedSha256) {
    throw new Error('Public registry bytes differ from the retained candidate.');
  }
  return {...distribution, tarballSha256: registryTarballSha256};
}

/** @param {Buffer} buffer @param {string} integrity */
export function verifyIntegrity(buffer, integrity) {
  if (!/^sha512-[A-Za-z0-9+/]+={0,2}$/u.test(integrity)) {
    throw new Error('Registry integrity is not an exact sha512 SRI value.');
  }
  const actual = `sha512-${createHash('sha512').update(buffer).digest('base64')}`;
  if (actual !== integrity) throw new Error('Registry tarball fails its published sha512 integrity.');
}

/**
 * @typedef {{repository: string, repositoryId: string, ref: string, workflowRef: string, workflowSha: string,
 * runId: string, runAttempt: string, tag: string,
 * qualification: {runtimeAndMutation: string, controls: string, security: string}}} ReleaseIdentity
 */

/**
 * @typedef {{schemaVersion: 2,
 * package: {name: string, version: string, private: boolean, license: string},
 * tarball: {filename: string, sha256: string, integrity: string},
 * source: {commit: string, dirty: boolean, node: string, npm: string},
 * checks: {installedConsumers: string, productionAudit: string}, release: ReleaseIdentity | null}} ReleaseCandidate
 */

/** Read the retained native npm candidate and verify the archive before use. @param {string} directory */
export function readCandidate(directory) {
  /** @type {ReleaseCandidate} */
  const candidate = JSON.parse(readFileSync(join(directory, 'candidate.json'), 'utf8'));
  assert.equal(candidate.schemaVersion, 2);
  assert.equal(candidate.package.name, 'steam-community-bbcode');
  assert.equal(candidate.package.license, 'AGPL-3.0-only');
  assert.equal(typeof candidate.package.private, 'boolean');
  assert.equal(basename(candidate.tarball.filename), candidate.tarball.filename);
  assert.equal(candidate.tarball.filename, `${candidate.package.name}-${candidate.package.version}.tgz`);
  const archive = readFileSync(join(directory, candidate.tarball.filename));
  assert.equal(sha256Buffer(archive), candidate.tarball.sha256, 'Retained candidate archive bytes changed.');
  verifyIntegrity(archive, candidate.tarball.integrity);
  return candidate;
}

/** Match source identity only after native npm has verified the attestation cryptography.
 * @param {ReleaseCandidate} candidate @param {unknown} audit
 */
function verifiedProvenanceBundle(candidate, audit) {
  assertRecord(audit);
  /** @type {unknown} */
  const entries = audit['verified'];
  assert.ok(Array.isArray(entries), 'Native audit has no verified provenance entries.');
  /** @type {unknown[]} */
  const verified = entries;
  const matches = verified.filter(entry => {
    assertRecord(entry);
    return entry['name'] === candidate.package.name && entry['version'] === candidate.package.version && entry['registry'] === registry;
  });
  assert.equal(matches.length, 1, 'Expected exactly one verified target package provenance entry.');
  const entry = matches[0];
  assertRecord(entry);
  /** @type {unknown} */
  const bundles = entry['attestationBundles'];
  assert.ok(Array.isArray(bundles), 'Native audit omitted verified provenance bundles.');
  /** @type {unknown[]} */
  const attestations = bundles;
  const provenance = attestations.filter(value => {
    assertRecord(value);
    return value['predicateType'] === 'https://slsa.dev/provenance/v1';
  });
  assert.equal(provenance.length, 1, 'Expected exactly one verified SLSA provenance statement.');
  const attestation = provenance[0];
  assertRecord(attestation);
  // Native sigstore.verify parses and validates this external JSON at its boundary.
  const bundle = /** @type {import('sigstore').Bundle} */ (attestation['bundle']);
  assertRecord(bundle);
  return bundle;
}

/** Check expected claims; this alone does not authenticate their signer.
 * @param {ReleaseCandidate} candidate @param {unknown} audit
 */
export function assertExpectedProvenanceClaims(candidate, audit) {
  assertProvenanceClaims(candidate, verifiedProvenanceBundle(candidate, audit));
}

/** Authenticate the exact signer with native Sigstore, then match the expected claims.
 * @param {ReleaseCandidate} candidate @param {unknown} audit
 */
export async function verifyExpectedProvenance(candidate, audit) {
  const bundle = verifiedProvenanceBundle(candidate, audit);
  await verify(bundle, releaseSignerPolicy);
  assertProvenanceClaims(candidate, bundle);
}

/** @param {ReleaseCandidate} candidate @param {import('sigstore').Bundle} bundle */
function assertProvenanceClaims(candidate, bundle) {
  assert.ok(candidate.release, 'Expected a hosted candidate for provenance verification.');
  const identity = candidate.release;
  const repositoryUrl = 'https://github.com/MaksymShostak/steam-community-bbcode';
  assert.equal(identity.repository, 'MaksymShostak/steam-community-bbcode');
  assert.equal(identity.ref, 'refs/heads/main');
  assert.equal(identity.workflowSha, candidate.source.commit);
  const envelope = bundle['dsseEnvelope'];
  assertRecord(envelope);
  assert.equal(envelope['payloadType'], 'application/vnd.in-toto+json');
  const payload = envelope['payload'];
  assert.ok(typeof payload === 'string');
  /** @type {unknown} */
  const statement = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  assertRecord(statement);
  assert.equal(statement['_type'], 'https://in-toto.io/Statement/v1');
  assert.equal(statement['predicateType'], 'https://slsa.dev/provenance/v1');
  assert.deepEqual(statement['subject'], [{name: `pkg:npm/${candidate.package.name}@${candidate.package.version}`,
    digest: {sha512: Buffer.from(candidate.tarball.integrity.slice('sha512-'.length), 'base64').toString('hex')}}]);
  const predicate = statement['predicate'];
  assertRecord(predicate);
  const definition = predicate['buildDefinition'];
  assertRecord(definition);
  assert.equal(definition['buildType'], 'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1');
  const parameters = definition['externalParameters'];
  assertRecord(parameters);
  assert.deepEqual(parameters['workflow'], {repository: repositoryUrl,
    path: '.github/workflows/steam-community-bbcode-release.yml', ref: identity.ref});
  assert.deepEqual(definition['resolvedDependencies'], [{uri: `git+${repositoryUrl}@${identity.ref}`, digest: {gitCommit: candidate.source.commit}}]);
  const internal = definition['internalParameters'];
  assertRecord(internal);
  const github = internal['github'];
  assertRecord(github);
  assert.equal(github['repository_id'], identity.repositoryId);
  assert.equal(github['event_name'], 'workflow_dispatch');
  const run = predicate['runDetails'];
  assertRecord(run);
  assert.deepEqual(run['builder'], {id: 'https://github.com/actions/runner/github-hosted'});
  const metadata = run['metadata'];
  assertRecord(metadata);
  assert.equal(metadata['invocationId'], `${repositoryUrl}/actions/runs/${identity.runId}/attempts/${identity.runAttempt}`);
}
