import { describe, expect, it } from 'vitest';
import type { ResultRecord } from '../infrastructure/persistence/results-repository';
import { getProgress, getProgressGroup } from './progress';

const RECORD: ResultRecord = {
  attemptId: 'one',
  finishedAt: 1,
  result: {
    challengeVersion: 1,
    config: {
      regionId: 'usa',
      level: 'expert',
      learning: false,
      seed: 'first',
    },
    total: 50,
    correct: 50,
    notGuessed: 0,
    coverage: 100,
    elapsedSeconds: 120,
    finishReason: 'completed',
  },
};

describe('result progress', () => {
  it('groups different seeds but separates answer and learning modes', () => {
    const result = RECORD.result;
    expect(
      getProgressGroup({
        ...result,
        config: { ...result.config, seed: 'second' },
      }),
    ).toBe(getProgressGroup(result));
    expect(
      getProgressGroup({
        ...result,
        config: { ...result.config, learning: true },
      }),
    ).not.toBe(getProgressGroup(result));
    expect(
      getProgressGroup({
        ...result,
        config: {
          ...result.config,
          answerComparison: { mode: 'prefix', minimumCharacters: 4 },
        },
      }),
    ).not.toBe(getProgressGroup(result));
  });

  it('uses only completed games for fastest completion', () => {
    const timeout: ResultRecord = {
      ...RECORD,
      attemptId: 'two',
      result: {
        ...RECORD.result,
        correct: 0,
        notGuessed: 50,
        coverage: 0,
        elapsedSeconds: 10,
        finishReason: 'timeout',
      },
    };
    const progress = getProgress(
      [timeout, RECORD],
      getProgressGroup(RECORD.result),
    );
    expect(progress.attempts).toBe(2);
    expect(progress.fastest).toBe(120);
    expect(progress.recent.map((record) => record.attemptId)).toEqual([
      'one',
      'two',
    ]);
  });
});
