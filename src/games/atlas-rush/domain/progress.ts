import type { GameResults } from './types';

type ProgressRecord = { readonly result: GameResults };

export const getProgressGroup = (result: GameResults): string =>
  JSON.stringify([
    result.challengeVersion,
    result.config.regionId,
    result.config.level,
    result.config.learning,
    result.config.answerComparison?.mode === 'prefix'
      ? result.config.answerComparison.minimumCharacters
      : 0,
  ]);

export const getProgress = <T extends ProgressRecord>(
  records: readonly T[],
  group: string,
) => {
  const comparable = records.filter(
    (record) => getProgressGroup(record.result) === group,
  );
  const completed = comparable.filter(
    (record) => record.result.finishReason === 'completed',
  );
  return {
    attempts: comparable.length,
    bestCoverage: comparable.reduce(
      (best, record) => Math.max(best, record.result.coverage),
      0,
    ),
    fastest: completed.reduce<number | null>((best, record) => {
      if (best === null) {
        return record.result.elapsedSeconds;
      }
      return Math.min(best, record.result.elapsedSeconds);
    }, null),
    recent: comparable.slice(0, 10).reverse(),
  };
};
