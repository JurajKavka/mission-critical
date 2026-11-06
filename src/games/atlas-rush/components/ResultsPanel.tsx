import type * as React from 'react';
import { ActionButton } from '../../../react-component-library';
import { regionMetadata } from '../data/regions';
import { levels } from '../domain/levels';
import { formatTime } from '../domain/time';
import type { GameResults } from '../domain/types';
import styles from './AtlasRush.module.css';

type ResultsPanelProps = {
  result: GameResults;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  onPlayAgain,
  onChangeSettings,
}) => {
  const region = regionMetadata[result.config.regionId];
  const targetPlural = region.targetName === 'state' ? 'states' : 'countries';
  const difficulty =
    levels.find((level) => level.id === result.config.level)?.label ??
    result.config.level;
  return (
    <section className={styles.panel} aria-labelledby="results-title">
      <p className={styles.eyebrow}>
        Mission report //{' '}
        {result.finishReason === 'completed' ? 'complete' : 'time expired'}
      </p>
      <h2 id="results-title">
        {result.finishReason === 'completed' ? 'Atlas complete' : 'Time is up'}
      </h2>
      <p>
        {result.finishReason === 'completed'
          ? `All ${targetPlural} identified in ${formatTime(result.elapsedSeconds)}.`
          : 'Your survey is complete.'}
      </p>
      <dl className={styles.results}>
        <div>
          <dt>Region</dt>
          <dd>{region.name}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{difficulty}</dd>
        </div>
        <div>
          <dt>Elapsed</dt>
          <dd>{formatTime(result.elapsedSeconds)}</dd>
        </div>
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
        {result.correct} / {result.total} {targetPlural} identified
      </p>
      <div className={styles.actions}>
        <ActionButton label="Play again" onClick={onPlayAgain} />
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={onChangeSettings}
        >
          Change settings
        </button>
      </div>
    </section>
  );
};
