import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { selectPhase } from '../state/selectors';
import { TimerDisplay } from './TimerDisplay';
import type { AtlasRushStore } from './types';

type GameTimerProps = { store: AtlasRushStore; readySeconds: number };
export const GameTimer: React.FC<GameTimerProps> = ({
  store,
  readySeconds,
}) => {
  const phase = useStore(store, selectPhase);
  const [seconds, setSeconds] = useState(() =>
    store.getState().getRemainingSeconds(),
  );
  useEffect(() => {
    const update = () => {
      const remaining = store.getState().getRemainingSeconds();
      setSeconds(remaining);
      if (remaining <= 0) {
        store.getState().finishGame();
      }
    };
    update();
    if (phase !== 'playing') {
      return;
    }
    const interval = window.setInterval(update, 200);
    return () => window.clearInterval(interval);
  }, [phase, store]);
  return <TimerDisplay seconds={phase === 'ready' ? readySeconds : seconds} />;
};
