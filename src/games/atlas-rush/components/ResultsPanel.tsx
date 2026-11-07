import type * as React from 'react';
import { ActionButton } from '../../../react-component-library';
import { regionMetadata } from '../data/regions';
import { levels } from '../domain/levels';
import { formatTime } from '../domain/time';
import type { GameResults } from '../domain/types';
import * as UI from './atlas-styles';

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
    <UI.Panel aria-labelledby="results-title">
      <UI.Eyebrow>
        Mission report //{' '}
        {result.finishReason === 'completed' ? 'complete' : 'time expired'}
      </UI.Eyebrow>
      <h2 id="results-title">
        {result.finishReason === 'completed' ? 'Atlas complete' : 'Time is up'}
      </h2>
      <p>
        {result.finishReason === 'completed'
          ? `All ${targetPlural} identified in ${formatTime(result.elapsedSeconds)}.`
          : 'Your survey is complete.'}
      </p>
      <UI.Results>
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
      </UI.Results>
      <p>
        {result.correct} / {result.total} {targetPlural} identified
      </p>
      <UI.Actions>
        <ActionButton label="Play again" onClick={onPlayAgain} />
        <button type="button" onClick={onChangeSettings}>
          Change settings
        </button>
      </UI.Actions>
    </UI.Panel>
  );
};
