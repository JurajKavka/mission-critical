import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import {
  ActionButton,
  BreadcrumbDivider,
  Breadcrumbs,
  IconButton,
  mb,
  SecondaryButton,
} from '../../../react-component-library';
import { regionMetadata } from '../data/regions';
import { regionTargets } from '../data/targets';
import { getResults } from '../domain/results';
import { defaultSeed } from '../domain/shuffle';
import type { RegionId } from '../domain/types';
import { createRandomSeed } from '../infrastructure/browser-url';
import { getChallengePath } from '../infrastructure/challenge-url';
import { rememberLandingSettings } from '../infrastructure/landing-settings';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { createAtlasRushStore } from '../state/createAtlasRushStore';
import { selectGuessedIds, selectPhase } from '../state/selectors';
import { AnswerInput } from './AnswerInput';
import { GameMap } from './GameMap';
import { ModalDialog } from './ModalDialog';
import { PauseDialog } from './PauseDialog';
import { ResultsPanel } from '../../../react-component-library/ResultsPanel';
import * as UI from '../../../react-component-library/atlas-styles';
import { GameTimer } from './GameTimer';
import { styled } from 'styled-components';

const HomeBreadcrumbMobile = styled.span`
  display: inline-block;
  ${mb('s')} {
    display: none;
  }
`;
const HomeBreadcrum = styled.span`
  display: none;
  ${mb('s')} {
    display: inline-block;
  }
`;

type AtlasRushProps = { regionId: RegionId };

export const AtlasRush: React.FC<AtlasRushProps> = ({ regionId }) => {
  const [store] = useState(() =>
    createAtlasRushStore(
      { regionId, level: 'beginner', learning: false, seed: defaultSeed },
      { now: () => performance.now() },
    ),
  );
  const phase = useStore(store, selectPhase);
  const guessed = useStore(store, selectGuessedIds);
  const total = regionTargets[regionId].length;
  const persistence = useSessionPersistence(store, regionId);
  const inputRef = useRef<HTMLInputElement>(null);
  const region = regionMetadata[regionId];
  const result =
    phase === 'finished' ? getResults(store.getState().session) : null;

  const readySeconds = store.getState().session.durationSeconds;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.repeat &&
        store.getState().session.phase === 'playing'
      ) {
        store.getState().pauseGame();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  const changeSettings = async () => {
    if (!(await persistence.discard())) {
      return;
    }
    rememberLandingSettings(store.getState().session.config);
    window.location.assign('/games/atlas-rush/');
  };
  const replay = () => {
    const next = {
      ...store.getState().session.config,
      seed: createRandomSeed(),
    };
    window.location.assign(getChallengePath(next));
  };
  return (
    <>
      <UI.GlobalStyles />
      <UI.Wrapper>
        {persistence.initialization === 'ready' &&
          persistence.notice &&
          phase !== 'paused' && (
            <UI.StatusBar>
              <UI.PersistenceNotice role="status">
                {persistence.notice}
              </UI.PersistenceNotice>
            </UI.StatusBar>
          )}

        <UI.Playfield>
          <UI.MapHeading>
            <div>
              <Breadcrumbs>
                <a href="/">
                  <HomeBreadcrumbMobile>MC</HomeBreadcrumbMobile>
                  <HomeBreadcrum>MISSION CRITICAL</HomeBreadcrum>
                </a>
                <BreadcrumbDivider />
                {regionMetadata[regionId].name}
              </Breadcrumbs>
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
              <IconButton
                name="exit"
                label="End game"
                onClick={store.getState().pauseGame}
              />
            </UI.HudStats>
          </UI.MapHeading>
          <UI.MapSlot>
            <GameMap
              store={store}
              regionId={regionId}
              onReturnFocus={focusInput}
            />
          </UI.MapSlot>
          <UI.MapKey>
            <span>
              <i aria-hidden="true" /> Identify
            </span>
            <span>
              <i className="keyGuessed" aria-hidden="true" /> Identified
            </span>
            {region.markerNote && <UI.MapHint>{region.markerNote}</UI.MapHint>}
            {phase === 'playing' &&
              store.getState().session.config.learning && (
                <UI.MapHint>
                  Learning mode / Select the highlighted area to reveal its name
                </UI.MapHint>
              )}
          </UI.MapKey>
        </UI.Playfield>
        <AnswerInput
          store={store}
          phase={phase}
          targetName={region.targetName}
          inputRef={inputRef}
        />
        <PauseDialog
          store={store}
          isPaused={phase === 'paused'}
          onEnd={() => {
            void changeSettings();
          }}
          notice={persistence.notice}
        />
        {persistence.initialization === 'loading' && (
          <UI.Overlay>
            <UI.Panel role="status">Preparing survey…</UI.Panel>
          </UI.Overlay>
        )}
        {persistence.initialization === 'choose' && (
          <ModalDialog labelledBy="restore-title">
            <UI.Panel>
              <UI.Eyebrow>Survey archive</UI.Eyebrow>
              <h2 id="restore-title">Continue your survey?</h2>
              <p>
                {persistence.canContinue
                  ? 'Resume saved progress or begin this challenge again.'
                  : 'Start this challenge again.'}
              </p>
              <UI.Actions>
                {persistence.canContinue && (
                  <ActionButton
                    label="Continue"
                    onClick={persistence.continueGame}
                  />
                )}
                {persistence.canContinue ? (
                  <SecondaryButton
                    label="Start new"
                    onClick={persistence.startNew}
                  />
                ) : (
                  <ActionButton
                    label="Start new"
                    onClick={persistence.startNew}
                  />
                )}
              </UI.Actions>
              <p role="status">{persistence.notice}</p>
            </UI.Panel>
          </ModalDialog>
        )}
        {result && (
          <ModalDialog labelledBy="results-title">
            <ResultsPanel
              result={result}
              onPlayAgain={replay}
              onChangeSettings={() => {
                void changeSettings();
              }}
            />
          </ModalDialog>
        )}
      </UI.Wrapper>
    </>
  );
};
