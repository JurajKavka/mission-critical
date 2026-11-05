import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptsDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

// Remote services and model execution are replaced; Git and Bash remain real.
const mockCommand = String.raw`#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const command = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const record = (entry) => fs.appendFileSync(process.env.MOCK_RECORD, JSON.stringify(entry) + '\n');
const option = (name) => args[args.indexOf(name) + 1];
record({ command, args });
if (command === 'gh') {
  if (args[0] === 'repo') {
    console.log('JurajKavka/mission-critical');
  } else if (args[1] === 'list') {
    if (process.env.MOCK_LIST_FAILURE) { process.exit(1); }
    console.log(Array.from({ length: 12 }, (_, index) => 20 + index).join('\n'));
  } else {
    const issue = Number(args[2]);
    if (issue === 17) {
      console.log('PARENT_REQUIREMENTS_FIXTURE');
    } else {
      const model = process.env.MOCK_BAD_METADATA && issue === 31 ? 'unknown' : 'gpt-6.1-sol';
      console.log(JSON.stringify({
        title: 'Task ' + issue, state: 'OPEN',
        body: 'model: ' + model + '\nreasoning: medium\norder: ' + String(issue - 19).padStart(2, '0') + '/12\n',
      }));
    }
  }
} else if (command === 'codex') {
  if (args.indexOf('--ask-for-approval') > args.indexOf('exec')) { process.exit(2); }
  const schema = JSON.parse(fs.readFileSync(option('--output-schema'), 'utf8'));
  if (!schema.required.includes('status')) { process.exit(2); }
  const prompt = fs.readFileSync(0, 'utf8');
  const issue = Number(prompt.match(/sub-issue #(\d+)/)[1]);
  record({ prompt, issue });
  fs.mkdirSync('docs', { recursive: true });
  fs.appendFileSync('docs/atlas-rush-migration.md', 'Task ' + issue + '\n');
  const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (issue >= 21 && !process.env.MOCK_MISSING_UNIT) { packageData.scripts.test = 'vitest run'; }
  if (issue >= 23 && !process.env.MOCK_MISSING_E2E) { packageData.scripts['test:e2e'] = 'playwright test'; }
  fs.writeFileSync('package.json', JSON.stringify(packageData));
  const result = { issue_number: issue, status: 'complete', summary: 'Implemented', blockers: [], tests: [] };
  const behavior = process.env.MOCK_RESULT;
  if (behavior === 'blocked') { result.status = 'blocked'; result.blockers = ['Unavailable dependency']; }
  if (behavior === 'wrong-issue') { result.issue_number = 99; }
  if (behavior === 'blockers') { result.blockers = ['Unfinished work']; }
  if (behavior !== 'missing') {
    fs.writeFileSync(option('--output-last-message'), behavior === 'malformed' ? 'not json' : JSON.stringify(result));
  }
} else if (command === 'npm') {
  if (args[1] === process.env.MOCK_FAIL_GATE) { process.exit(1); }
}
`;

const createFixture = (context, overrides = {}, resume = false) => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'atlas-runner-test-'));
  context.after(() =>
    rmSync(temporaryDirectory, { recursive: true, force: true }),
  );
  const checkout = join(temporaryDirectory, 'checkout');
  const bin = join(temporaryDirectory, 'bin');
  mkdirSync(join(checkout, 'scripts'), { recursive: true });
  mkdirSync(bin);
  for (const filename of [
    'run-atlas-rush-m1.sh',
    'atlas-rush-task-result.schema.json',
  ]) {
    copyFileSync(
      join(scriptsDirectory, filename),
      join(checkout, 'scripts', filename),
    );
  }
  for (const command of ['gh', 'codex', 'npm']) {
    writeFileSync(join(bin, command), mockCommand, { mode: 0o755 });
  }
  const scripts = { check: 'check', build: 'build' };
  if (resume) {
    scripts.test = 'vitest run';
    scripts['test:e2e'] = 'playwright test';
    mkdirSync(join(checkout, 'docs'));
    writeFileSync(
      join(checkout, 'docs/atlas-rush-migration.md'),
      'Architecture\n',
    );
  }
  writeFileSync(join(checkout, 'package.json'), JSON.stringify({ scripts }));
  const recordPath = join(temporaryDirectory, 'commands.jsonl');
  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    ATLAS_LOG_DIR: join(temporaryDirectory, 'logs'),
    DRY_RUN: '0',
    START_ISSUE: '20',
    GIT_AUTHOR_NAME: 'Runner Test',
    GIT_AUTHOR_EMAIL: 'runner@example.invalid',
    GIT_COMMITTER_NAME: 'Runner Test',
    GIT_COMMITTER_EMAIL: 'runner@example.invalid',
    MOCK_RECORD: recordPath,
    ...overrides,
  };
  const git = (...args) => {
    const result = spawnSync('git', args, {
      cwd: checkout,
      env,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  git('init', '-b', 'test-migration');
  git('add', '.');
  git('-c', 'commit.gpgsign=false', 'commit', '-m', 'Fixture');
  // Keep user signing/hooks out of disposable test commits.
  git('config', 'commit.gpgsign', 'false');
  git('config', 'core.hooksPath', join(temporaryDirectory, 'no-hooks'));
  const run = () =>
    spawnSync('/bin/bash', ['scripts/run-atlas-rush-m1.sh'], {
      cwd: checkout,
      env,
      encoding: 'utf8',
      timeout: 60_000,
    });
  const records = () => {
    if (!existsSync(recordPath)) {
      return [];
    }
    return readFileSync(recordPath, 'utf8').trim().split('\n').map(JSON.parse);
  };
  const commitCount = () => Number(git('rev-list', '--count', 'HEAD')) - 1;
  return { run, records, commitCount, checkout };
};

test('Bash runs all 12 tasks with parent context, handoffs and test gates', (context) => {
  const fixture = createFixture(context);
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fixture.commitCount(), 12);
  const records = fixture.records();
  const prompts = records.filter((entry) => entry.prompt);
  assert.equal(prompts.length, 12);
  for (const { prompt } of prompts) {
    assert.match(prompt, /PARENT_REQUIREMENTS_FIXTURE/);
    assert.match(prompt, /docs\/atlas-rush-migration.md/);
    assert.match(prompt, /Do not commit/);
  }
  const commands = records.filter((entry) => entry.command === 'npm');
  for (const [gate, count] of [
    ['check', 12],
    ['test', 11],
    ['test:e2e', 9],
    ['build', 12],
  ]) {
    assert.equal(
      commands.filter((entry) => entry.args[1] === gate).length,
      count,
    );
  }
});

test('dry run validates metadata without invoking Codex/npm or committing', (context) => {
  const fixture = createFixture(context, { DRY_RUN: '1' });
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fixture.commitCount(), 0);
  assert.equal(
    fixture.records().some((entry) => ['codex', 'npm'].includes(entry.command)),
    false,
  );
});

for (const behavior of [
  'blocked',
  'wrong-issue',
  'blockers',
  'missing',
  'malformed',
]) {
  test(`successful Codex process with ${behavior} report cannot commit or advance`, (context) => {
    const fixture = createFixture(context, { MOCK_RESULT: behavior });
    const result = fixture.run();
    assert.notEqual(result.status, 0);
    assert.equal(fixture.commitCount(), 0);
    assert.equal(fixture.records().filter((entry) => entry.prompt).length, 1);
  });
}

for (const [setting, expectedCommits] of [
  ['MOCK_MISSING_UNIT', 1],
  ['MOCK_MISSING_E2E', 3],
]) {
  test(`missing required suite ${setting} stops before that task is committed`, (context) => {
    const fixture = createFixture(context, { [setting]: '1' });
    const result = fixture.run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Missing npm run/);
    assert.equal(fixture.commitCount(), expectedCommits);
  });
}

for (const [gate, expectedCommits] of [
  ['check', 0],
  ['test', 1],
  ['test:e2e', 3],
  ['build', 0],
]) {
  test(`${gate} failure prevents commit and later tasks`, (context) => {
    const fixture = createFixture(context, { MOCK_FAIL_GATE: gate });
    const result = fixture.run();
    assert.notEqual(result.status, 0);
    assert.equal(fixture.commitCount(), expectedCommits);
  });
}

test('invalid final issue metadata prevents any agent execution', (context) => {
  const fixture = createFixture(context, { MOCK_BAD_METADATA: '1' });
  const result = fixture.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid model for #31/);
  assert.equal(
    fixture.records().some((entry) => entry.command === 'codex'),
    false,
  );
});

test('issue-list API failure is not swallowed by process substitution', (context) => {
  const fixture = createFixture(context, { MOCK_LIST_FAILURE: '1' });
  assert.notEqual(fixture.run().status, 0);
  assert.equal(
    fixture.records().some((entry) => entry.command === 'codex'),
    false,
  );
});

test('resume requires the architecture handoff', (context) => {
  const fixture = createFixture(context, { START_ISSUE: '24' });
  const result = fixture.run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Resume requires/);
  assert.equal(fixture.commitCount(), 0);
});

test('resume runs only remaining issues with existing tooling', (context) => {
  const fixture = createFixture(context, { START_ISSUE: '24' }, true);
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fixture.commitCount(), 8);
  assert.equal(fixture.records().find((entry) => entry.prompt).issue, 24);
});
