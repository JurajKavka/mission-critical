import { regionTargets } from '../data/targets';
import type { GameResults, GameSession } from './types';

export const getCoverage = (correct: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return Math.round((correct / total) * 100);
};

export const getResults = (session: GameSession): GameResults | null => {
  if (session.phase !== 'finished' || session.finishReason === null) {
    return null;
  }
  const total = regionTargets[session.config.regionId].length;
  const correct = session.guessedIds.length;
  return {
    challengeVersion: session.challengeVersion,
    config: session.config,
    total,
    correct,
    notGuessed: total - correct,
    coverage: getCoverage(correct, total),
    elapsedSeconds: session.elapsedSeconds,
    finishReason: session.finishReason,
  };
};
