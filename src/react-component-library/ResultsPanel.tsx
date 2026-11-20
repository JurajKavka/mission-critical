import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';

import { regionMetadata } from '../games/atlas-rush/data/regions';
import { formatTime } from '../games/atlas-rush/domain/time';
import type { GameResults } from '../games/atlas-rush/domain/types';
import { ActionButton } from './ActionButton';
import * as UI from './atlas-styles';
import { SecondaryButton } from './SecondaryButton';
import { Actions } from './atlas-styles';
import { BreadcrumbDivider } from './BreadcrumbDivider';
import { BreadcrumbsWrapper } from './Breadcrumbs';
import { AtlasRushLayout } from './game-layouts';
import { ResultsDetails } from './ResultsDetails';
import { mb } from './media-breakpoints';
import { theme } from './theme';

const MissionReport = styled(UI.Panel)`
  padding: clamp(${rem(16)}, 4vw, ${rem(32)});
  background: linear-gradient(
    155deg,
    ${theme.colors.panelLight},
    ${theme.colors.panelDark} 46%
  );
  border-color: ${theme.colors.cyanBorder};
  scrollbar-color: ${theme.colors.cyanBorderStrong} ${theme.colors.panelDark};

  h2 {
    margin-top: 0;
    line-height: 1;
  }
`;

const MissionActions = styled(Actions)`
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);

  ${mb('xs', { max: true })} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

type ResultsPanelProps = {
  result: GameResults;
  onPlayAgain: () => void;
  onChangeSettings: () => void;
  children?: React.ReactNode;
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  onPlayAgain,
  onChangeSettings,
  children,
}) => {
  const region = regionMetadata[result.config.regionId];
  const targetPlural = region.targetName === 'state' ? 'states' : 'countries';
  return (
    <>
      <AtlasRushLayout.TopBar>
        <BreadcrumbsWrapper as="nav" aria-label="Mission report status">
          <span>Mission report</span>
          <BreadcrumbDivider />
          <span>
            {result.finishReason === 'completed' ? 'complete' : 'time expired'}
          </span>
        </BreadcrumbsWrapper>
      </AtlasRushLayout.TopBar>
      <MissionReport aria-labelledby="results-title">
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
        <ResultsDetails result={result} />
        <MissionActions>
          <ActionButton label="Play again" onClick={onPlayAgain} />
          <SecondaryButton label="Start over" onClick={onChangeSettings} />
        </MissionActions>
        {children}
      </MissionReport>
    </>
  );
};
