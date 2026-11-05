import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import type * as React from 'react';
import { regionMetadata } from '../data/regions';
import { regionTargets } from '../data/targets';
import { getRoundSeconds, levels } from '../domain/levels';
import { getResults } from '../domain/results';
import { defaultSeed } from '../domain/shuffle';
import { formatTime } from '../domain/time';
import type { ChallengeConfig, RegionId } from '../domain/types';
import {
  createRandomSeed,
  replaceCurrentChallenge,
} from '../infrastructure/browser-url';
import {
  parseChallengeQuery,
  serializeChallengeQuery,
} from '../infrastructure/challenge-url';
import { createAtlasRushStore } from '../state/createAtlasRushStore';
import { selectPhase } from '../state/selectors';
import { AnswerInput } from './AnswerInput';
import { GameHUD } from './GameHUD';
import { GameMap } from './GameMap';
import { PauseDialog } from './PauseDialog';
import styles from './AtlasRush.module.css';

const initialConfig: ChallengeConfig = {
  regionId: 'africa',
  level: 'beginner',
  learning: false,
  seed: defaultSeed,
};
const regionOrder: readonly RegionId[] = [
  'africa',
  'south-america',
  'usa',
  'europe',
];

export const AtlasRush: React.FC = () => {
  const [store] = useState(() =>
    createAtlasRushStore(initialConfig, { now: () => performance.now() }),
  );
  const phase = useStore(store, selectPhase);
  const [settings, setSettings] = useState(initialConfig);
  const [isHydrated, setIsHydrated] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const regionId =
    phase === 'ready'
      ? settings.regionId
      : store.getState().session.config.regionId;
  const region = regionMetadata[regionId];
  const result =
    phase === 'finished' ? getResults(store.getState().session) : null;
  useEffect(() => {
    const parsed = parseChallengeQuery('africa', window.location.search);
    setSettings(parsed.config);
    if (parsed.corrected) {
      replaceCurrentChallenge(parsed.config);
    }
    setIsHydrated(true);
  }, []);
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
  const updateCurrentUrl = (config: ChallengeConfig) => {
    if (config.regionId === 'africa') {
      replaceCurrentChallenge(config);
    } else {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.hash}`,
      );
    }
  };
  const start = () => {
    updateCurrentUrl(settings);
    store.getState().startGame(settings);
  };
  const replay = () => {
    const next = {
      ...store.getState().session.config,
      seed: createRandomSeed(),
    };
    setSettings(next);
    updateCurrentUrl(next);
    store.getState().startGame(next);
  };
  const createNewChallenge = () => {
    const next = { ...settings, seed: createRandomSeed() };
    setSettings(next);
    updateCurrentUrl(next);
    setLinkMessage('New challenge created.');
  };
  const copyChallenge = async (config: ChallengeConfig) => {
    const link = `${window.location.origin}${window.location.pathname}${serializeChallengeQuery(config)}`;
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
        readySeconds={getRoundSeconds(
          regionTargets[regionId].length,
          settings.level,
        )}
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
            key={regionId}
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
      </main>
      <AnswerInput
        store={store}
        phase={phase}
        targetName={region.targetName}
        inputRef={inputRef}
      />
      <PauseDialog store={store} isPaused={phase === 'paused'} />
      {phase === 'ready' && (
        <div className={styles.overlay}>
          <section
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-title"
          >
            <p className={styles.eyebrow}>Sector 01</p>
            <h1 id="start-title">
              Atlas <em>Rush</em>
            </h1>
            <p>Identify countries before the clock runs out.</p>
            <fieldset disabled={!isHydrated}>
              <legend>Select a region</legend>
              {regionOrder.map((id) => (
                <label key={id}>
                  <input
                    type="radio"
                    name="region"
                    checked={settings.regionId === id}
                    onChange={() => setSettings({ ...settings, regionId: id })}
                  />{' '}
                  {regionMetadata[id].name}
                </label>
              ))}
            </fieldset>
            <fieldset disabled={!isHydrated}>
              <legend>Select a level</legend>
              {levels.map((level) => (
                <label key={level.id}>
                  <input
                    type="radio"
                    name="level"
                    checked={settings.level === level.id}
                    onChange={() =>
                      setSettings({ ...settings, level: level.id })
                    }
                  />{' '}
                  {level.label}
                </label>
              ))}
            </fieldset>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={!isHydrated}
              onClick={start}
            >
              Start survey ↗
            </button>
            <label className={styles.learning}>
              <input
                type="checkbox"
                disabled={!isHydrated}
                checked={settings.learning}
                onChange={(event) =>
                  setSettings({ ...settings, learning: event.target.checked })
                }
              />{' '}
              Learning mode
            </label>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={!isHydrated}
                onClick={createNewChallenge}
              >
                New random challenge
              </button>
              {settings.regionId === 'africa' && (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={!isHydrated}
                  onClick={() => {
                    void copyChallenge(settings);
                  }}
                >
                  Copy challenge link
                </button>
              )}
            </div>
            {settings.regionId !== 'africa' && (
              <p>
                Challenge links for this region will be available with region
                pages.
              </p>
            )}
            <p aria-live="polite">{linkMessage}</p>
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
                ? `All ${region.targetName === 'state' ? 'states' : 'countries'} identified in ${formatTime(result.elapsedSeconds)}.`
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
                onClick={store.getState().resetGame}
              >
                Change settings
              </button>
              {regionId === 'africa' && (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    void copyChallenge(result.config);
                  }}
                >
                  Copy challenge link
                </button>
              )}
            </div>
            <p aria-live="polite">{linkMessage}</p>
          </section>
        </div>
      )}
    </div>
  );
};
