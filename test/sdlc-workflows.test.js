// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {parseDocument, isMap, isSeq, isScalar} from 'yaml';

/** @param {string} name */
function workflow(name) {
  const document = parseDocument(readFileSync(new URL(`../.github/workflows/${name}.yml`, import.meta.url), 'utf8'));
  assert.deepEqual(document.errors, []);
  return document;
}

test('SDLC aggregate rejects unsuccessful or missing matrix results through its actual shell', () => {
  const controls = workflow('sdlc-control-tests');
  assert.equal(controls.getIn(['jobs', 'controls', 'if']), undefined);
  assert.equal(controls.getIn(['jobs', 'required', 'if']), 'always()');
  assert.equal(controls.getIn(['jobs', 'required', 'steps', 0, 'env', 'CONTROL_RESULT']), '${{ needs.controls.result }}');
  const command = controls.getIn(['jobs', 'required', 'steps', 0, 'run']);
  assert.ok(typeof command === 'string');
  const bash = process.platform === 'win32'
    ? resolve(execFileSync('git', ['--exec-path'], {encoding: 'utf8', windowsHide: true}).trim(), '../../../bin/bash.exe') : 'bash';
  for (const state of ['success', 'failure', 'cancelled', 'skipped', '']) {
    /** @type {import('node:child_process').SpawnSyncReturns<string>} */
    const result = spawnSync(bash, ['--noprofile', '--norc', '-eo', 'pipefail', '-c', command], {
      encoding: 'utf8', windowsHide: true, env: {...process.env, CONTROL_RESULT: state},
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, state === 'success' ? 0 : 1);
  }
});

test('PR linkage executes only trusted base policy with read-only access', () => {
  const linkage = workflow('sdlc-pr');
  assert.equal(linkage.getIn(['jobs', 'validate', 'steps', 0, 'with', 'ref']), '${{ github.sha }}');
  assert.equal(linkage.getIn(['jobs', 'validate', 'steps', 0, 'with', 'persist-credentials']), false);
  const permissions = linkage.get('permissions', true);
  assert.ok(isMap(permissions));
  assert.ok(permissions.items.every(pair => isScalar(pair.value) && pair.value.value === 'read'));
  const steps = linkage.getIn(['jobs', 'validate', 'steps'], true);
  assert.ok(isSeq(steps));
  for (const step of steps.items) {
    assert.ok(isMap(step));
    const command = step.get('run');
    if (typeof command === 'string') assert.doesNotMatch(command, /head\.sha|pull_request\.head|checkout|git fetch/u);
  }
});

test('CodeQL covers standalone languages and does not skip fork or documentation PRs', () => {
  const codeql = workflow('codeql');
  assert.equal(codeql.getIn(['jobs', 'analyze', 'if']), undefined);
  assert.equal(codeql.getIn(['on', 'pull_request', 'paths-ignore']), undefined);
  const languages = codeql.getIn(['jobs', 'analyze', 'strategy', 'matrix', 'language'], true);
  assert.ok(isSeq(languages));
  assert.deepEqual(languages.items.map(item => { assert.ok(isScalar(item)); return item.value; }), ['actions', 'javascript-typescript', 'python']);
});
