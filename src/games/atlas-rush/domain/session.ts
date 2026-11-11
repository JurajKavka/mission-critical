import { regionTargets } from '../data/targets';
import { matchesTarget } from './answers';
import { getRoundSeconds } from './levels';
import { challengeVersion, shuffleTargetIds } from './shuffle';
import { getElapsedSeconds, getRemainingSeconds } from './time';
import type { ChallengeConfig, GameSession, GuessResult } from './types';

export const createSession = (config: ChallengeConfig): GameSession => ({
  challengeVersion,
  config: { ...config },
  phase: 'ready',
  remainingIds: shuffleTargetIds(
    regionTargets[config.regionId].map((target) => target.id),
    config.seed,
  ),
  guessedIds: [],
  durationSeconds: getRoundSeconds(
    regionTargets[config.regionId].length,
    config.level,
  ),
  elapsedSeconds: 0,
  finishReason: null,
});

export const startGame = (config: ChallengeConfig): GameSession => ({
  ...createSession(config),
  phase: 'playing',
});

export const resetGame = (session: GameSession): GameSession =>
  createSession(session.config);

export const getCurrentTargetId = (session: GameSession): string | null =>
  session.remainingIds[0] ?? null;

export const getCommandIndex = (session: GameSession): number =>
  Math.min(
    session.guessedIds.length + 1,
    regionTargets[session.config.regionId].length,
  );

/** Finish only on expiry or an empty queue. Exit-to-settings uses resetGame. */
export const finishGame = (
  session: GameSession,
  elapsedSeconds: number = session.elapsedSeconds,
): GameSession => {
  if (session.phase !== 'playing') {
    return session;
  }
  const elapsed = getElapsedSeconds(session, elapsedSeconds);
  if (elapsed >= session.durationSeconds) {
    return {
      ...session,
      phase: 'finished',
      elapsedSeconds: session.durationSeconds,
      finishReason: 'timeout',
    };
  } else if (session.remainingIds.length === 0) {
    return {
      ...session,
      phase: 'finished',
      elapsedSeconds: elapsed,
      finishReason: 'completed',
    };
  }
  return session;
};

export const submitGuess = (
  session: GameSession,
  answer: string,
  elapsedSeconds: number = session.elapsedSeconds,
): GuessResult => {
  const targetId = getCurrentTargetId(session);
  if (session.phase !== 'playing') {
    return { session, outcome: 'ignored', targetId };
  } else if (getRemainingSeconds(session, elapsedSeconds) <= 0) {
    return {
      session: finishGame(session, elapsedSeconds),
      outcome: 'timeout',
      targetId,
    };
  }
  const target = regionTargets[session.config.regionId].find(
    (candidate) => candidate.id === targetId,
  );
  if (
    !target ||
    !matchesTarget(target, answer, session.config.answerComparison)
  ) {
    return { session, outcome: 'incorrect', targetId };
  }
  const progressed: GameSession = {
    ...session,
    remainingIds: session.remainingIds.slice(1),
    guessedIds: [...session.guessedIds, target.id],
    elapsedSeconds: getElapsedSeconds(session, elapsedSeconds),
  };
  return { session: finishGame(progressed), outcome: 'correct', targetId };
};

export const skipCountry = (
  session: GameSession,
  elapsedSeconds: number = session.elapsedSeconds,
): GameSession => {
  if (session.phase !== 'playing') {
    return session;
  } else if (getRemainingSeconds(session, elapsedSeconds) <= 0) {
    return finishGame(session, elapsedSeconds);
  }
  const targetId = getCurrentTargetId(session);
  if (targetId === null) {
    return session;
  }
  return {
    ...session,
    remainingIds: [...session.remainingIds.slice(1), targetId],
    elapsedSeconds: getElapsedSeconds(session, elapsedSeconds),
  };
};

export const pauseGame = (
  session: GameSession,
  elapsedSeconds: number = session.elapsedSeconds,
): GameSession => {
  if (session.phase !== 'playing') {
    return session;
  } else if (getRemainingSeconds(session, elapsedSeconds) <= 0) {
    return finishGame(session, elapsedSeconds);
  }
  return {
    ...session,
    phase: 'paused',
    elapsedSeconds: getElapsedSeconds(session, elapsedSeconds),
  };
};

export const resumeGame = (session: GameSession): GameSession => {
  if (session.phase !== 'paused') {
    return session;
  }
  return { ...session, phase: 'playing' };
};
