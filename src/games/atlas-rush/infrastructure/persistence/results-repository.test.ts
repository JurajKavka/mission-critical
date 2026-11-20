import 'fake-indexeddb/auto';
import { deleteDB, openDB } from 'idb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { finishGame, startGame } from '../../domain/session';
import { createConfig } from '../../domain/test-fixtures';
import { openSessionDatabase } from './database';
import { createResultsRepository } from './results-repository';
import { createSessionRepository } from './session-repository';
import { captureSnapshot, getChallengeIdentity } from './snapshot';
import type { ResultRecord } from './results-repository';

const CONFIG = createConfig();
const RESULT: ResultRecord = {
  attemptId: 'attempt',
  finishedAt: 42,
  result: {
    challengeVersion: 1,
    config: CONFIG,
    total: 50,
    correct: 0,
    notGuessed: 50,
    coverage: 0,
    elapsedSeconds: 500,
    finishReason: 'timeout',
  },
};

afterEach(async () => {
  vi.restoreAllMocks();
  await deleteDB('atlas-rush');
});

describe('result storage', () => {
  it('upgrades version one and retains the session store', async () => {
    const old = await openDB('atlas-rush', 1, {
      upgrade(database) {
        database.createObjectStore('sessions', { keyPath: 'key' });
      },
    });
    await old.put('sessions', { key: 'old', value: 1 });
    old.close();
    const database = await openSessionDatabase();
    expect(await database.get('sessions', 'old')).toEqual({
      key: 'old',
      value: 1,
    });
    expect(database.objectStoreNames.contains('results')).toBe(true);
    database.close();
  });

  it('finalizes once and rejects stale owners', async () => {
    const database = await openSessionDatabase();
    const sessions = createSessionRepository(database);
    const results = createResultsRepository(database);
    const key = getChallengeIdentity(CONFIG);
    const playing = startGame(CONFIG);
    const snapshot = captureSnapshot(
      finishGame(playing, playing.durationSeconds),
    );
    expect(
      await sessions.claim(key, undefined, 'owner', null, RESULT.attemptId),
    ).toBe(true);
    expect(await sessions.finish(key, 'stale', 1, snapshot, RESULT)).toBe(
      false,
    );
    expect(await sessions.finish(key, 'owner', 1, snapshot, RESULT)).toBe(true);
    await results.updateName(RESULT.attemptId, 'Player');
    expect(
      await sessions.finish(key, 'owner', 1, snapshot, {
        ...RESULT,
        finishedAt: 99,
      }),
    ).toBe(true);
    expect(await results.get(RESULT.attemptId)).toMatchObject({
      finishedAt: 42,
      displayName: 'Player',
    });
    database.close();
  });

  it('rolls back the checkpoint and result when finalization aborts', async () => {
    const database = await openSessionDatabase();
    const sessions = createSessionRepository(database);
    const key = getChallengeIdentity(CONFIG);
    await sessions.claim(key, undefined, 'owner', null, RESULT.attemptId);
    const original = await sessions.load(key);
    const add = IDBObjectStore.prototype.add;
    const spy = vi
      .spyOn(IDBObjectStore.prototype, 'add')
      .mockImplementation(function (this: IDBObjectStore, ...args) {
        const request = add.apply(this, args);
        queueMicrotask(() => this.transaction.abort());
        return request;
      });
    const playing = startGame(CONFIG);
    const snapshot = captureSnapshot(
      finishGame(playing, playing.durationSeconds),
    );
    await expect(
      sessions.finish(key, 'owner', 1, snapshot, RESULT),
    ).rejects.toMatchObject({ name: 'AbortError' });
    spy.mockRestore();
    expect(await sessions.load(key)).toEqual(original);
    expect(await database.get('results', RESULT.attemptId)).toBeUndefined();
    database.close();
  });
});
