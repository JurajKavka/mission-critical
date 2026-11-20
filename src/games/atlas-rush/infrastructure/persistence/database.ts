import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { SessionRecord } from './snapshot';
import type { ResultRecord } from './results-repository';

type AtlasDatabase = DBSchema & {
  sessions: { key: string; value: SessionRecord };
  results: {
    key: string;
    value: ResultRecord;
    indexes: { finishedAt: number };
  };
};

export type SessionDatabase = IDBPDatabase<AtlasDatabase>;

export const openSessionDatabase = async (): Promise<SessionDatabase> => {
  let expired = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const opened = openDB<AtlasDatabase>('atlas-rush', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        database.createObjectStore('sessions', { keyPath: 'key' });
      }
      if (oldVersion < 2) {
        const results = database.createObjectStore('results', {
          keyPath: 'attemptId',
        });
        results.createIndex('finishedAt', 'finishedAt');
      }
    },
    blocking() {
      /* The current connection closes below through its versionchange listener. */
    },
  }).then((database) => {
    if (expired) {
      database.close();
    }
    database.addEventListener('versionchange', () => database.close());
    return database;
  });
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      expired = true;
      reject(new Error('Storage opening timed out'));
    }, 3000);
  });
  try {
    return await Promise.race([opened, deadline]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
};
