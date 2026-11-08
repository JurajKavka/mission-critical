import type * as React from 'react';

import { regionMetadata } from '../games/atlas-rush/data/regions';
import { levels } from '../games/atlas-rush/domain/levels';
import { formatTime } from '../games/atlas-rush/domain/time';
import type { GameResults } from '../games/atlas-rush/domain/types';
import { ActionButton } from './ActionButton';
import * as UI from './atlas-styles';
import { SecondaryButton } from './SecondaryButton';
import { Actions } from './atlas-styles';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { Breadcrumbs } from './Breadcrumbs';

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
      <Breadcrumbs>
        <span>Mission report</span>
        <BreadcrumbDivider />
        <span>
          {result.finishReason === 'completed' ? 'complete' : 'time expired'}
        </span>
      </Breadcrumbs>
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
      <Actions>
        <ActionButton label="Play again" onClick={onPlayAgain} />
        <SecondaryButton label="Start over" onClick={onChangeSettings} />
      </Actions>
    </UI.Panel>
  );
};
