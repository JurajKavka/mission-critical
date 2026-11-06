import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { SessionRecord } from './snapshot';

type AtlasDatabase = DBSchema & {
  sessions: { key: string; value: SessionRecord };
};

export type SessionDatabase = IDBPDatabase<AtlasDatabase>;

export const openSessionDatabase = async (): Promise<SessionDatabase> => {
  let expired = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const opened = openDB<AtlasDatabase>('atlas-rush', 1, {
    upgrade(database) {
      database.createObjectStore('sessions', { keyPath: 'key' });
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
