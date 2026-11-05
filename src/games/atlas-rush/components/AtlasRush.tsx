import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { regionMetadata } from '../data/regions';
import { regionTargets } from '../data/targets';
import { getResults } from '../domain/results';
import { defaultSeed } from '../domain/shuffle';
import { formatTime } from '../domain/time';
import type { ChallengeConfig, RegionId } from '../domain/types';
import {
  createRandomSeed,
  replaceCurrentChallenge,
} from '../infrastructure/browser-url';
import {
  getChallengePath,
  parseChallengeQuery,
} from '../infrastructure/challenge-url';
import { rememberLandingSettings } from '../infrastructure/landing-settings';
import { createAtlasRushStore } from '../state/createAtlasRushStore';
import { selectPhase } from '../state/selectors';
import { AnswerInput } from './AnswerInput';
import { GameHUD } from './GameHUD';
import { GameMap } from './GameMap';
import { PauseDialog } from './PauseDialog';
import styles from './AtlasRush.module.css';

type AtlasRushProps = { regionId: RegionId };

export const AtlasRush: React.FC<AtlasRushProps> = ({ regionId }) => {
  const [store] = useState(() =>
    createAtlasRushStore(
      { regionId, level: 'beginner', learning: false, seed: defaultSeed },
      { now: () => performance.now() },
    ),
  );
  const phase = useStore(store, selectPhase);
  const [linkMessage, setLinkMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const region = regionMetadata[regionId];
  const targetPlural = region.targetName === 'state' ? 'states' : 'countries';
  const result =
    phase === 'finished' ? getResults(store.getState().session) : null;

  useEffect(() => {
    const parsed = parseChallengeQuery(regionId, window.location.search);
    if (parsed.corrected) {
      replaceCurrentChallenge(parsed.config);
    }
    store.getState().startGame(parsed.config);
  }, [regionId, store]);

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

  const focusInput = () => inputRef.current?.focus();
  const changeSettings = () => {
    rememberLandingSettings(store.getState().session.config);
    window.location.assign('/games/atlas-rush/');
  };
  const replay = () => {
    const next = {
      ...store.getState().session.config,
      seed: createRandomSeed(),
    };
    replaceCurrentChallenge(next);
    store.getState().startGame(next);
  };
  const copyChallenge = async (config: ChallengeConfig) => {
    const link = new URL(getChallengePath(config), window.location.origin).href;
    try {
      await navigator.clipboard.writeText(link);
      setLinkMessage('Challenge link copied.');
    } catch {
      setLinkMessage('Could not copy the challenge link.');
    }
  };
  return (
    <div className={styles.app}>
      <GameHUD
        store={store}
        regionId={regionId}
        readySeconds={store.getState().session.durationSeconds}
      />
      <main className={styles.playfield}>
        <div className={styles.mapHeading}>
          <span>Survey grid / 01</span>
          <span>
            {region.code} · {regionTargets[regionId].length}{' '}
            {phase === 'playing' && (
              <button
                type="button"
                aria-label="End game"
                className={styles.exitButton}
                onClick={store.getState().pauseGame}
              >
                ×
              </button>
            )}
          </span>
        </div>
        <div className={styles.mapSlot}>
          <GameMap
            store={store}
            regionId={regionId}
            onReturnFocus={focusInput}
          />
        </div>
        <div className={styles.mapKey}>
          <span>■ Identify</span>
          <span>■ Identified</span>
          {region.markerNote && <span>{region.markerNote}</span>}
          {phase === 'playing' && store.getState().session.config.learning && (
            <span>
              Learning mode / Select the highlighted area to reveal its name
            </span>
          )}
        </div>
        {phase === 'playing' && (
          <div className={styles.actions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => {
                void copyChallenge(store.getState().session.config);
              }}
            >
              Copy challenge link
            </button>
            <span aria-live="polite">{linkMessage}</span>
          </div>
        )}
      </main>
      <AnswerInput
        store={store}
        phase={phase}
        targetName={region.targetName}
        inputRef={inputRef}
      />
      <PauseDialog
        store={store}
        isPaused={phase === 'paused'}
        onEnd={changeSettings}
      />
      {phase === 'ready' && (
        <div className={styles.overlay}>
          <section className={styles.panel} role="status">
            Preparing survey…
          </section>
        </div>
      )}
      {result && (
        <div className={styles.overlay}>
          <section
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-title"
          >
            <p className={styles.eyebrow}>
              Mission report //{' '}
              {result.finishReason === 'completed'
                ? 'complete'
                : 'time expired'}
            </p>
            <h2 id="results-title">
              {result.finishReason === 'completed'
                ? 'Atlas complete'
                : 'Time is up'}
            </h2>
            <p>
              {result.finishReason === 'completed'
                ? `All ${targetPlural} identified in ${formatTime(result.elapsedSeconds)}.`
                : 'Your survey is complete.'}
            </p>
            <dl className={styles.results}>
              <div>
                <dt>Total</dt>
                <dd>{result.total}</dd>
              </div>
              <div>
                <dt>Guessed</dt>
                <dd>{result.correct}</dd>
              </div>
              <div>
                <dt>Not guessed</dt>
                <dd>{result.notGuessed}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{result.coverage}%</dd>
              </div>
            </dl>
            <p>
              {result.correct} / {result.total} identified
            </p>
            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={replay}
              >
                Play again ↗
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={changeSettings}
              >
                Change settings
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  void copyChallenge(result.config);
                }}
              >
                Copy challenge link
              </button>
            </div>
            <p aria-live="polite">{linkMessage}</p>
          </section>
        </div>
      )}
    </div>
  );
};
