import { useCallback, useEffect, useRef, useState } from 'react';
import type { GamePhase } from '../domain/types';

const CHARACTER_DELAY_MS = 12;
const MAX_TYPING_DURATION_MS = 180;
const COMPLETED_NAME_HOLD_MS = 250;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const useAnswerCompletion = (phase: GamePhase) => {
  const [completionValue, setCompletionValue] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase !== 'playing') {
      cancelTimer();
      setCompletionValue(null);
    }
    return cancelTimer;
  }, [cancelTimer, phase]);

  const startCompletion = useCallback(
    (answer: string, suffix: string, onComplete: () => void) => {
      if (timer.current !== null) {
        return;
      }
      if (suffix.length === 0) {
        onComplete();
        return;
      }
      const finishCompletion = () => {
        timer.current = null;
        onComplete();
        setCompletionValue(null);
      };
      if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        setCompletionValue(answer + suffix);
        timer.current = setTimeout(finishCompletion, COMPLETED_NAME_HOLD_MS);
        return;
      }
      const characters = Array.from(suffix);
      const delay = Math.min(
        CHARACTER_DELAY_MS,
        MAX_TYPING_DURATION_MS / characters.length,
      );
      const showCharacter = (index: number) => {
        setCompletionValue(answer + characters.slice(0, index + 1).join(''));
        if (index === characters.length - 1) {
          timer.current = setTimeout(finishCompletion, COMPLETED_NAME_HOLD_MS);
        } else {
          timer.current = setTimeout(() => showCharacter(index + 1), delay);
        }
      };
      setCompletionValue(answer);
      timer.current = setTimeout(() => showCharacter(0), delay);
    },
    [],
  );

  return {
    completionValue,
    isCompleting: completionValue !== null,
    startCompletion,
  };
};
