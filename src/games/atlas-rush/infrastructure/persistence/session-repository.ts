import type { SessionDatabase } from './database';
import type { SessionRecord, SessionSnapshot } from './snapshot';

export const createSessionRepository = (database: SessionDatabase) => {
  const load = async (key: string): Promise<unknown> =>
    database.get('sessions', key);

  const claim = async (
    key: string,
    expected: unknown,
    generation: string,
    snapshot: SessionSnapshot | null,
  ): Promise<boolean> => {
    const transaction = database.transaction('sessions', 'readwrite');
    const current: unknown = await transaction.store.get(key);
    if (JSON.stringify(current) !== JSON.stringify(expected)) {
      await transaction.done;
      return false;
    }
    const record: SessionRecord = {
      key,
      schemaVersion: 1,
      generation,
      revision: 0,
      updatedAt: Date.now(),
      snapshot,
    };
    await transaction.store.put(record);
    await transaction.done;
    return true;
  };

  const save = async (
    key: string,
    generation: string,
    revision: number,
    snapshot: SessionSnapshot | null,
  ): Promise<boolean> => {
    const transaction = database.transaction('sessions', 'readwrite');
    const current = await transaction.store.get(key);
    if (
      !current ||
      current.generation !== generation ||
      current.revision >= revision ||
      !Number.isSafeInteger(revision)
    ) {
      await transaction.done;
      return false;
    }
    await transaction.store.put({
      key,
      schemaVersion: 1,
      generation,
      revision,
      updatedAt: Date.now(),
      snapshot,
    });
    await transaction.done;
    return true;
  };

  const discard = async (
    key: string,
    generation: string,
    replacement: string,
  ): Promise<boolean> => {
    const transaction = database.transaction('sessions', 'readwrite');
    const current = await transaction.store.get(key);
    if (!current || current.generation !== generation) {
      await transaction.done;
      return false;
    }
    await transaction.store.put({
      key,
      schemaVersion: 1,
      generation: replacement,
      revision: 0,
      updatedAt: Date.now(),
      snapshot: null,
    });
    await transaction.done;
    return true;
  };

  return { load, claim, save, discard };
};
