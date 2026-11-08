import { useState } from 'react';
import type * as React from 'react';
import { regionTargets } from '../data/targets';
import { getCoverage } from '../domain/results';
import { createSession } from '../domain/session';
import { defaultSeed } from '../domain/shuffle';
import type { ChallengeConfig, GameResults } from '../domain/types';
import { getChallengePath } from '../infrastructure/challenge-url';
import { createAtlasRushStore } from '../state/createAtlasRushStore';
import { GameMap } from './GameMap';
import { ResultsPanel } from '../../../react-component-library/ResultsPanel';
import { TimerDisplay } from './TimerDisplay';
import { GlobalStyles } from '../../../react-component-library/atlas-styles';
import * as UI from './catalog-styles';

const CATALOG_CONFIG: ChallengeConfig = {
  regionId: 'africa',
  level: 'beginner',
  learning: false,
  seed: defaultSeed,
};
const CATALOG_GUESSED = ['NGA', 'ZAF', 'KEN'];
const CATALOG_RESULT: GameResults = {
  challengeVersion: 1,
  config: CATALOG_CONFIG,
  total: 54,
  correct: 37,
  notGuessed: 17,
  coverage: getCoverage(37, 54),
  elapsedSeconds: 300,
  finishReason: 'timeout',
};

const createCatalogStore = () => {
  const store = createAtlasRushStore(CATALOG_CONFIG, { now: () => 0 });
  const initial = createSession(CATALOG_CONFIG);
  const remainingIds = [
    'DZA',
    ...regionTargets.africa
      .map((target) => target.id)
      .filter((id) => id !== 'DZA' && !CATALOG_GUESSED.includes(id)),
  ];
  store.getState().restoreGame({
    ...initial,
    phase: 'paused',
    guessedIds: CATALOG_GUESSED,
    remainingIds,
    elapsedSeconds: 377,
  });
  store.getState().resumeGame();
  return store;
};

export const GraphicsCatalog: React.FC = () => {
  const [store] = useState(createCatalogStore);
  const openSurvey = () =>
    window.location.assign(getChallengePath(CATALOG_CONFIG));
  const openSettings = () => window.location.assign('/games/atlas-rush/');
  const ignoreMapFocus = () => {};
  return (
    <>
      <GlobalStyles />
      <UI.Wrapper>
        <p className="eyebrow">Mission Critical // Development reference</p>
        <h1>Atlas Rush graphics</h1>
        <p>Shared components used in the Africa survey.</p>
        <UI.Section>
          <h2>Continent map</h2>
          <UI.MapWrapper>
            <GameMap
              store={store}
              regionId="africa"
              onReturnFocus={ignoreMapFocus}
            />
          </UI.MapWrapper>
          <p>■ Identify &nbsp; ■ Identified</p>
        </UI.Section>
        <UI.Section>
          <h2>Countdown timer</h2>
          <TimerDisplay seconds={163} />
        </UI.Section>
        <UI.Section>
          <h2>Results modal</h2>
          <ResultsPanel
            result={CATALOG_RESULT}
            onPlayAgain={openSurvey}
            onChangeSettings={openSettings}
          />
        </UI.Section>
      </UI.Wrapper>
    </>
  );
};
