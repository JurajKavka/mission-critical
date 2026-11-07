import { useStore } from 'zustand';
import type * as React from 'react';
import { regionTargets } from '../data/targets';
import { regionMetadata } from '../data/regions';
import type { RegionId } from '../domain/types';
import { selectGuessedIds } from '../state/selectors';
import { GameTimer } from './GameTimer';
import * as UI from './atlas-styles';
import type { AtlasRushStore } from './types';
import { ExitButton } from '../../../react-component-library/ExitButton';
import styled from 'styled-components';

const HudExitButton = styled(ExitButton)`
  margin-left: 12px;
`;

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
    <UI.Hud>
      <div>
        <UI.Brand>
          <a href="/">MC</a> <span>//</span> Atlas Rush
        </UI.Brand>
        <UI.Label>Sector 01 / {regionMetadata[regionId].name}</UI.Label>
      </div>
      <UI.HudStats>
        <UI.HudMetric>
          <span>Identified</span>
          <strong>
            {String(guessed.length).padStart(2, '0')}/
            {String(total).padStart(2, '0')}
          </strong>
        </UI.HudMetric>
        <GameTimer store={store} readySeconds={readySeconds} />
        <HudExitButton onClick={store.getState().pauseGame} />
      </UI.HudStats>
    </UI.Hud>
  );
};
