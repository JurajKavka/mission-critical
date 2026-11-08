import type { GameSession } from './types';

/** Total active seconds, supplied by the caller; never a wall/monotonic timestamp. */
export const getElapsedSeconds = (
  session: GameSession,
  elapsedSeconds: number = session.elapsedSeconds,
): number => {
  if (session.phase !== 'playing' || Number.isNaN(elapsedSeconds)) {
    return session.elapsedSeconds;
  }
  return Math.min(
    session.durationSeconds,
    Math.max(session.elapsedSeconds, elapsedSeconds),
  );
};

export const getRemainingSeconds = (
  session: GameSession,
  elapsedSeconds: number = session.elapsedSeconds,
): number =>
  session.durationSeconds - getElapsedSeconds(session, elapsedSeconds);

export const formatTime = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};
