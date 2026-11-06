import { createStore } from 'zustand/vanilla';
import {
  createSession,
  finishGame as finishSession,
  pauseGame as pauseSession,
  resetGame as resetSession,
  resumeGame as resumeSession,
  skipCountry as skipTarget,
  startGame as startSession,
  submitGuess as submitAnswer,
} from '../domain/session';
import { getElapsedSeconds, getRemainingSeconds } from '../domain/time';
import type {
  ChallengeConfig,
  GameSession,
  GuessResult,
} from '../domain/types';
import { isValidSession } from './validateSession';

export type GameClock = { readonly now: () => number };

export type AtlasRushState = {
  readonly session: GameSession;
  readonly startGame: (config?: ChallengeConfig) => void;
  readonly submitGuess: (answer: string) => GuessResult;
  readonly skipCountry: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
  readonly finishGame: () => void;
  readonly resetGame: () => void;
  readonly restoreGame: (snapshot: unknown) => boolean;
  readonly checkpointGame: () => void;
  readonly getRemainingSeconds: () => number;
};

export const createAtlasRushStore = (
  config: ChallengeConfig,
  clock: GameClock,
) => {
  let anchor: number | null = null;
  return createStore<AtlasRushState>()((set, get) => {
    const elapsedAt = (session: GameSession, now: number): number => {
      if (session.phase !== 'playing' || anchor === null) {
        return session.elapsedSeconds;
      }
      return session.elapsedSeconds + Math.max(0, now - anchor) / 1000;
    };
    const install = (
      previous: GameSession,
      next: GameSession,
      now: number,
    ): void => {
      if (previous === next) {
        return;
      }
      anchor = next.phase === 'playing' ? now : null;
      set({ session: next });
    };
    return {
      session: createSession(config),
      startGame: (nextConfig) => {
        const previous = get().session;
        if (previous.phase !== 'ready' && previous.phase !== 'finished') {
          return;
        }
        const now = clock.now();
        install(previous, startSession(nextConfig ?? previous.config), now);
      },
      submitGuess: (answer) => {
        const previous = get().session;
        const now = clock.now();
        const result = submitAnswer(previous, answer, elapsedAt(previous, now));
        install(previous, result.session, now);
        return result;
      },
      skipCountry: () => {
        const previous = get().session;
        const now = clock.now();
        install(previous, skipTarget(previous, elapsedAt(previous, now)), now);
      },
      pauseGame: () => {
        const previous = get().session;
        const now = clock.now();
        install(
          previous,
          pauseSession(previous, elapsedAt(previous, now)),
          now,
        );
      },
      resumeGame: () => {
        const previous = get().session;
        const now = clock.now();
        install(previous, resumeSession(previous), now);
      },
      finishGame: () => {
        const previous = get().session;
        const now = clock.now();
        install(
          previous,
          finishSession(previous, elapsedAt(previous, now)),
          now,
        );
      },
      resetGame: () => {
        const previous = get().session;
        install(previous, resetSession(previous), clock.now());
      },
      restoreGame: (snapshot) => {
        if (!isValidSession(snapshot)) {
          return false;
        }
        const restored: GameSession = {
          ...snapshot,
          config: { ...snapshot.config },
          remainingIds: [...snapshot.remainingIds],
          guessedIds: [...snapshot.guessedIds],
          phase: snapshot.phase === 'playing' ? 'paused' : snapshot.phase,
        };
        install(get().session, restored, clock.now());
        return true;
      },
      checkpointGame: () => {
        const previous = get().session;
        if (previous.phase !== 'playing') {
          return;
        }
        const now = clock.now();
        const elapsed = getElapsedSeconds(previous, elapsedAt(previous, now));
        if (elapsed >= previous.durationSeconds) {
          install(previous, finishSession(previous, elapsed), now);
        } else {
          install(previous, { ...previous, elapsedSeconds: elapsed }, now);
        }
      },
      getRemainingSeconds: () => {
        const session = get().session;
        return getRemainingSeconds(session, elapsedAt(session, clock.now()));
      },
    };
  });
};
