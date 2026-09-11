// SPDX-License-Identifier: MIT
// Adapted from the ONI workflow regression; see bbcode-workflow.LICENSE.
import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {parseDocument, isMap, isSeq, isScalar} from 'yaml';

const source = readFileSync(new URL('../.github/workflows/steam-community-bbcode.yml', import.meta.url), 'utf8');
const workflow = parseDocument(source);
assert.deepEqual(workflow.errors, []);
const bash = process.platform === 'win32'
  ? resolve(execFileSync('git', ['--exec-path'], {encoding: 'utf8', windowsHide: true}).trim(), '../../../bin/bash.exe')
  : 'bash';

/** @param {(string | number)[]} path */
function sequenceValues(path) {
  const node = workflow.getIn(path, true);
  assert.ok(isSeq(node));
  return node.items.map(item => { assert.ok(isScalar(item)); return item.value; });
}

test('short checks gate mutation without tolerating failed prerequisites', () => {
  assert.equal(workflow.getIn(['jobs', 'converter', 'needs']), 'dependency-review');
  assert.equal(workflow.getIn(['jobs', 'mutation', 'needs']), 'converter');
  for (const job of ['dependency-review', 'converter', 'mutation']) {
    assert.equal(workflow.getIn(['jobs', job, 'if']), undefined);
    assert.equal(workflow.getIn(['jobs', job, 'continue-on-error']), undefined);
  }
  assert.deepEqual(sequenceValues(['jobs', 'mutation', 'strategy', 'matrix', 'profile']), ['library', 'cli']);
});

test('aggregate observes every prerequisite even after failure', () => {
  assert.deepEqual(sequenceValues(['jobs', 'qualification', 'needs']), ['dependency-review', 'converter', 'mutation']);
  assert.equal(workflow.getIn(['jobs', 'qualification', 'if']), 'always()');
  assert.equal(workflow.getIn(['jobs', 'qualification', 'steps', 0, 'if']), undefined);
  assert.equal(workflow.getIn(['jobs', 'qualification', 'steps', 0, 'continue-on-error']), undefined);
  for (const [key, job] of [['DEPENDENCY_REVIEW_RESULT', 'dependency-review'], ['CHECK_RESULT', 'converter'], ['MUTATION_RESULT', 'mutation']]) {
    assert.equal(workflow.getIn(['jobs', 'qualification', 'steps', 0, 'env', key]), '${{ needs.' + job + '.result }}');
  }
});

/** @type {Record<string, string>} */
const success = {DEPENDENCY_REVIEW_RESULT: 'success', CHECK_RESULT: 'success', MUTATION_RESULT: 'success'};
const cases = [{name: 'all succeed', env: success, status: 0}, ...Object.keys(success).flatMap(stage =>
  ['failure', 'cancelled', 'skipped', ''].map(result => ({name: `${stage} ${result || 'absent'}`, env: {...success, [stage]: result}, status: 1})))];
for (const scenario of cases) {
  test(`actual Bash aggregate: ${scenario.name}`, () => {
    const command = workflow.getIn(['jobs', 'qualification', 'steps', 0, 'run']);
    assert.ok(typeof command === 'string');
    const result = spawnSync(bash, ['--noprofile', '--norc', '-eo', 'pipefail', '-c', command], {
      encoding: 'utf8', windowsHide: true, env: {...process.env, ...scenario.env},
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, scenario.status);
  });
}

test('qualification preserves the supported runtime matrix and unprivileged actions', () => {
  assert.deepEqual(sequenceValues(['jobs', 'converter', 'strategy', 'matrix', 'os']), ['ubuntu-latest', 'windows-latest']);
  assert.deepEqual(sequenceValues(['jobs', 'converter', 'strategy', 'matrix', 'node']), ['22.23.2', '24.20.0', '26.8.1']);
  assert.equal(workflow.getIn(['permissions', 'contents']), 'read');
  assert.doesNotMatch(source, /id-token:|secrets\.|pull_request_target|continue-on-error:/u);
  const jobs = workflow.get('jobs', true);
  assert.ok(isMap(jobs));
  for (const pair of jobs.items) {
    assert.ok(isMap(pair.value));
    const steps = pair.value.get('steps', true);
    assert.ok(isSeq(steps));
    for (const step of steps.items) {
      assert.ok(isMap(step));
      const action = step.get('uses');
      if (action === undefined) continue;
      assert.ok(typeof action === 'string');
      assert.match(action, /@[a-f0-9]{40}$/u);
      if (action.startsWith('actions/checkout@')) assert.equal(step.getIn(['with', 'persist-credentials']), false);
    }
  }
});

test('standalone qualification runs root checks and native Node24 bootstrap without ONI routing', () => {
  assert.doesNotMatch(source, /tools\/steam-community-bbcode|selectPullRequestChecks|steps\.scope|check:converter/u);
  assert.equal(workflow.getIn(['jobs', 'qualification', 'name']), 'BBCode / Qualification');
  assert.equal(workflow.getIn(['on', 'pull_request', 'paths']), undefined);
  assert.equal(workflow.getIn(['on', 'pull_request', 'paths-ignore']), undefined);
  assert.equal(workflow.getIn(['on', 'push', 'paths']), undefined);
  assert.equal(workflow.getIn(['on', 'push', 'paths-ignore']), undefined);
  const steps = workflow.getIn(['jobs', 'converter', 'steps'], true);
  assert.ok(isSeq(steps));
  const bootstrap = steps.items.find(step => isMap(step) && step.get('name') === 'Exercise standalone development setup');
  assert.ok(isMap(bootstrap));
  assert.equal(bootstrap.get('if'), "matrix.node == '24.20.0'");
  assert.equal(bootstrap.get('run'), 'npm exec --yes --package=npm@12.0.2 -- npm run setup:development');
  const check = steps.items.find(step => isMap(step) && step.get('name') === 'Check the converter and real packed consumer');
  assert.ok(isMap(check));
  assert.equal(check.get('if'), undefined);
  assert.equal(check.get('run'), 'npm exec --yes --package=npm@12.0.2 -- npm run check');
});

test('dependency review is PR-only while the job remains an unconditional prerequisite', () => {
  const events = workflow.get('on', true);
  assert.ok(isMap(events));
  assert.deepEqual(events.items.map(pair => { assert.ok(isScalar(pair.key)); return pair.key.value; }), ['pull_request', 'push', 'workflow_call', 'workflow_dispatch']);
  const review = workflow.getIn(['jobs', 'dependency-review'], true);
  assert.ok(isMap(review));
  assert.equal(review.get('if'), undefined);
  assert.equal(review.get('needs'), undefined);
  const steps = review.get('steps', true);
  assert.ok(isSeq(steps));
  const check = steps.items.find(step => isMap(step) && step.get('name') === 'Review introduced dependencies');
  assert.ok(isMap(check));
  assert.equal(check.get('if'), "github.event_name == 'pull_request'");
  assert.equal(check.getIn(['with', 'fail-on-severity']), 'low');
  assert.equal(check.getIn(['with', 'fail-on-scopes']), 'runtime, development, unknown');
});
