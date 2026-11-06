import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { deleteDB } from 'idb';
import { startGame, submitGuess } from '../../domain/session';
import { createConfig } from '../../domain/test-fixtures';
import { regionTargets } from '../../data/targets';
import { openSessionDatabase } from './database';
import type { SessionDatabase } from './database';
import { createSessionRepository } from './session-repository';
import {
  captureSnapshot,
  getChallengeIdentity,
  isValidRecord,
} from './snapshot';

const config = createConfig();
const key = getChallengeIdentity(config);
let database: SessionDatabase | null = null;

afterEach(async () => {
  database?.close();
  database = null;
  await deleteDB('atlas-rush');
});

const createRepository = async () => {
  database = await openSessionDatabase();
  return createSessionRepository(database);
};

describe('session persistence', () => {
  it.each(['africa', 'south-america', 'usa', 'europe'] as const)(
    'validates the %s target set and rejects duplicates',
    (regionId) => {
      const regionConfig = createConfig({ regionId });
      const snapshot = captureSnapshot(startGame(regionConfig));
      const record = {
        key: getChallengeIdentity(regionConfig),
        schemaVersion: 1,
        generation: 'one',
        revision: 1,
        updatedAt: 1,
        snapshot,
      };
      expect(isValidRecord(record, regionConfig)).toBe(true);
      expect(
        isValidRecord(
          {
            ...record,
            snapshot: {
              ...snapshot,
              remainingIds: [
                snapshot.remainingIds[0],
                ...snapshot.remainingIds.slice(0, -1),
              ],
            },
          },
          regionConfig,
        ),
      ).toBe(false);
    },
  );
  it('validates snapshots and rejects incorrect identity, IDs, score and timing', () => {
    const session = startGame(config);
    const snapshot = captureSnapshot(session);
    const record = {
      key,
      schemaVersion: 1,
      generation: 'one',
      revision: 1,
      updatedAt: 1,
      snapshot,
    };
    expect(isValidRecord(record, config)).toBe(true);
    expect(isValidRecord({ ...record, schemaVersion: 2 }, config)).toBe(false);
    expect(isValidRecord(record, { ...config, seed: 'different' })).toBe(false);
    expect(
      isValidRecord(
        { ...record, snapshot: { ...snapshot, currentTargetId: 'wrong' } },
        config,
      ),
    ).toBe(false);
    expect(
      isValidRecord(
        {
          ...record,
          snapshot: {
            ...snapshot,
            remainingIds: [...snapshot.remainingIds.slice(1), 'bad-id'],
          },
        },
        config,
      ),
    ).toBe(false);
    expect(
      isValidRecord(
        { ...record, snapshot: { ...snapshot, correctCount: 2 } },
        config,
      ),
    ).toBe(false);
    expect(
      isValidRecord(
        { ...record, snapshot: { ...snapshot, remainingSeconds: -1 } },
        config,
      ),
    ).toBe(false);
  });

  it('keeps newest revision, rejects stale owners and preserves tombstones', async () => {
    const repository = await createRepository();
    const initial = captureSnapshot(startGame(config));
    expect(await repository.claim(key, undefined, 'first', null)).toBe(true);
    expect(await repository.save(key, 'first', 2, initial)).toBe(true);
    expect(await repository.save(key, 'first', 1, initial)).toBe(false);
    const saved = await repository.load(key);
    expect(isValidRecord(saved, config)).toBe(true);
    expect(await repository.claim(key, saved, 'second', initial)).toBe(true);
    expect(await repository.save(key, 'first', 3, initial)).toBe(false);
    expect(await repository.discard(key, 'first', 'old-reset')).toBe(false);
    expect(await repository.discard(key, 'second', 'tombstone')).toBe(true);
    expect(await repository.save(key, 'second', 1, initial)).toBe(false);
    expect(await repository.load(key)).toMatchObject({
      generation: 'tombstone',
      snapshot: null,
    });
  });

  it('detects changes between read and claim and keeps challenge identities independent', async () => {
    const repository = await createRepository();
    const otherConfig = { ...config, seed: 'another-seed' };
    const otherKey = getChallengeIdentity(otherConfig);
    expect(await repository.claim(key, undefined, 'first', null)).toBe(true);
    expect(await repository.claim(key, undefined, 'stale', null)).toBe(false);
    expect(
      await repository.claim(
        otherKey,
        undefined,
        'other',
        captureSnapshot(startGame(otherConfig)),
      ),
    ).toBe(true);
    expect(await repository.load(key)).toMatchObject({
      generation: 'first',
      snapshot: null,
    });
    expect(await repository.load(otherKey)).toMatchObject({
      generation: 'other',
    });
  });

  it('stores exact progression and captured time without geometry', async () => {
    const repository = await createRepository();
    const initial = startGame(config);
    const target = regionTargets[config.regionId].find(
      (item) => item.id === initial.remainingIds[0],
    );
    expect(target).toBeDefined();
    const next = submitGuess(initial, target?.name ?? '', 12.5).session;
    const snapshot = captureSnapshot(next);
    await repository.claim(key, undefined, 'first', null);
    await repository.save(key, 'first', 1, snapshot);
    const saved = await repository.load(key);
    expect(isValidRecord(saved, config)).toBe(true);
    if (isValidRecord(saved, config)) {
      expect(saved.snapshot).toEqual(snapshot);
      expect(saved.snapshot?.remainingSeconds).toBe(
        next.durationSeconds - 12.5,
      );
      expect(JSON.stringify(saved)).not.toContain('path');
    }
  });
});
