import { useStore } from 'zustand';
import type * as React from 'react';
import { regionTargets } from '../data/targets';
import { regionMetadata } from '../data/regions';
import type { RegionId } from '../domain/types';
import { selectGuessedIds } from '../state/selectors';
import { GameTimer } from './GameTimer';
import styles from './AtlasRush.module.css';
import type { AtlasRushStore } from './types';

type GameHUDProps = {
  store: AtlasRushStore;
  regionId: RegionId;
  readySeconds: number;
};
export const GameHUD: React.FC<GameHUDProps> = ({
  store,
  regionId,
  readySeconds,
}) => {
  const guessed = useStore(store, selectGuessedIds);
  const total = regionTargets[regionId].length;
  return (
    <header className={styles.hud}>
      <div>
        <p className={styles.brand}>
          <a href="/">Mission Critical</a> <span>//</span> Atlas Rush
        </p>
        <p className={styles.label}>
          Sector 01 / {regionMetadata[regionId].name}
        </p>
      </div>
      <div className={styles.hudStats}>
        <div className={styles.telemetry}>
          <span>Identified</span>
          <strong>
            {String(guessed.length).padStart(2, '0')} /{' '}
            {String(total).padStart(2, '0')}
          </strong>
        </div>
        <GameTimer store={store} readySeconds={readySeconds} />
      </div>
    </header>
  );
};
