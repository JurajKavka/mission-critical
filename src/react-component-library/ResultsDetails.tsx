import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { regionMetadata } from '../games/atlas-rush/data/regions';
import { levels } from '../games/atlas-rush/domain/levels';
import { formatTime } from '../games/atlas-rush/domain/time';
import type { GameResults } from '../games/atlas-rush/domain/types';
import { Results } from './atlas-styles';
import { theme } from './theme';

const Score = styled.div<{ $completed: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: ${rem(8)} ${rem(16)};
  padding: clamp(${rem(12)}, 3vw, ${rem(20)});
  background: linear-gradient(
    105deg,
    ${theme.colors.commandSurface},
    ${theme.colors.panelDark}
  );
  border: ${rem(1)} solid ${theme.colors.cyanSubtle};
  border-left: ${rem(2)} solid
    ${({ $completed }) => ($completed ? theme.colors.cyan : theme.colors.amber)};
  font-variant-numeric: tabular-nums;

  span {
    display: block;
    color: ${theme.colors.secondary};
    font-size: ${theme.fontSizes.label};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    margin-top: ${rem(4)};
    color: ${theme.colors.text};
    font-size: clamp(${rem(19)}, 5vw, ${rem(36)});
    line-height: 1;
    letter-spacing: -0.05em;
  }

  div + div {
    text-align: right;
  }

  div + div strong {
    color: ${theme.colors.cyan};
  }

  meter {
    grid-column: 1 / -1;
    display: block;
    width: 100%;
    height: ${rem(4)};
    appearance: none;
    background: ${theme.colors.meterTrack};
  }

  meter::-webkit-meter-bar {
    border: 0;
    border-radius: 0;
    background: ${theme.colors.meterTrack};
  }

  meter::-webkit-meter-optimum-value {
    background: ${theme.colors.cyan};
  }

  meter::-moz-meter-bar {
    background: ${theme.colors.cyan};
  }
`;

const ReportMetrics = styled(Results)`
  grid-template-columns: repeat(auto-fit, minmax(min(100%, ${rem(90)}), 1fr));
  margin: 0 0 ${rem(16)};
  padding: ${rem(16)} 0;
  border-top: 0;
`;

type ResultsDetailsProps = { result: GameResults };

export const ResultsDetails: React.FC<ResultsDetailsProps> = ({ result }) => {
  const region = regionMetadata[result.config.regionId];
  const difficulty =
    levels.find((level) => level.id === result.config.level)?.label ??
    result.config.level;
  const comparison = result.config.answerComparison;
  return (
    <>
      <Score $completed={result.finishReason === 'completed'}>
        <div>
          <span>
            {region.targetName === 'state'
              ? 'States identified'
              : 'Countries identified'}
          </span>
          <strong>{`${result.correct} / ${result.total}`}</strong>
        </div>
        <div>
          <span>Coverage</span>
          <strong>{result.coverage}%</strong>
        </div>
        <meter
          aria-label="Coverage"
          min={0}
          max={100}
          value={result.coverage}
        />
      </Score>
      <ReportMetrics>
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
          <dt>Learning</dt>
          <dd>{result.config.learning ? 'On' : 'Off'}</dd>
        </div>
        <div>
          <dt>Answer mode</dt>
          <dd>
            {comparison?.mode === 'prefix'
              ? `Speed ${comparison.minimumCharacters}`
              : 'Full name'}
          </dd>
        </div>
      </ReportMetrics>
    </>
  );
};
