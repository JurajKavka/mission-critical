import type { SessionDatabase } from './database';
import type { SessionRecord, SessionSnapshot } from './snapshot';

export const createSessionRepository = (database: SessionDatabase) => {
  const load = async (key: string): Promise<unknown> => {
    const transaction = database.transaction('sessions');
    const read = async () => transaction.store.get(key);
    const [record] = await Promise.all([read(), transaction.done]);
    return record;
  };

  const updateRecord = async (
    key: string,
    getNextRecord: (current: SessionRecord | undefined) => SessionRecord | null,
  ): Promise<boolean> => {
    const transaction = database.transaction('sessions', 'readwrite');
    const write = async () => {
      const current = await transaction.store.get(key);
      const next = getNextRecord(current);
      if (!next) {
        return false;
      }
      await transaction.store.put(next);
      return true;
    };
    // Observe both failures immediately, even if a request rejects before done.
    const [updated] = await Promise.all([write(), transaction.done]);
    return updated;
  };

  const claim = (
    key: string,
    expected: unknown,
    generation: string,
    snapshot: SessionSnapshot | null,
  ): Promise<boolean> =>
    updateRecord(key, (current) => {
      if (JSON.stringify(current) !== JSON.stringify(expected)) {
        return null;
      }
      return {
        key,
        schemaVersion: 1,
        generation,
        revision: 0,
        updatedAt: Date.now(),
        snapshot,
      };
    });

  const save = (
    key: string,
    generation: string,
    revision: number,
    snapshot: SessionSnapshot | null,
  ): Promise<boolean> =>
    updateRecord(key, (current) => {
      if (
        !current ||
        current.generation !== generation ||
        current.revision >= revision ||
        !Number.isSafeInteger(revision)
      ) {
        return null;
      }
      return {
        key,
        schemaVersion: 1,
        generation,
        revision,
        updatedAt: Date.now(),
        snapshot,
      };
    });

  const discard = (
    key: string,
    generation: string,
    replacement: string,
  ): Promise<boolean> =>
    updateRecord(key, (current) => {
      if (!current || current.generation !== generation) {
        return null;
      }
      return {
        key,
        schemaVersion: 1,
        generation: replacement,
        revision: 0,
        updatedAt: Date.now(),
        snapshot: null,
      };
    });

  return { load, claim, save, discard };
};
