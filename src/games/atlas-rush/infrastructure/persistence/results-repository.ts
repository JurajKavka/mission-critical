import type { GameResults } from '../../domain/types';
import type { SessionDatabase } from './database';

export type ResultRecord = {
  readonly attemptId: string;
  readonly finishedAt: number;
  readonly result: GameResults;
  readonly displayName?: string;
};

export const createResultsRepository = (database: SessionDatabase) => {
  const get = (attemptId: string) => database.get('results', attemptId);

  const list = async (): Promise<ResultRecord[]> => {
    const records = await database.getAllFromIndex('results', 'finishedAt');
    return records.reverse();
  };

  const save = async (record: ResultRecord): Promise<void> => {
    const transaction = database.transaction('results', 'readwrite');
    const write = async () => {
      if (!(await transaction.store.get(record.attemptId))) {
        await transaction.store.add(record);
      }
    };
    await Promise.all([write(), transaction.done]);
  };

  const updateName = async (attemptId: string, displayName: string) => {
    const transaction = database.transaction('results', 'readwrite');
    const write = async () => {
      const record = await transaction.store.get(attemptId);
      if (!record) {
        return false;
      }
      await transaction.store.put({ ...record, displayName });
      return true;
    };
    const [updated] = await Promise.all([write(), transaction.done]);
    return updated;
  };

  const remove = (attemptId: string) => database.delete('results', attemptId);

  return { get, list, save, updateName, remove };
};
