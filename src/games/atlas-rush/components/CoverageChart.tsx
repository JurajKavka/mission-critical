import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { theme } from '../../../react-component-library/theme';
import { mb } from '../../../react-component-library/media-breakpoints';

type CoverageChartProps = {
  points: readonly { attemptId: string; coverage: number }[];
};

const Chart = styled.figure`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: ${rem(8)} ${rem(12)};
  margin: 0;
  min-width: 0;
  color: ${theme.colors.secondary};
  font-size: ${theme.fontSizes.label};

  figcaption {
    grid-column: 1 / -1;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .scale {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: end;
    line-height: 1;
    margin-bottom: ${rem(14)};
  }

  ol {
    height: clamp(${rem(72)}, 16vw, ${rem(128)});
    display: flex;
    justify-content: center;
    gap: clamp(${rem(4)}, 1.5vw, ${rem(16)});
    padding: 0 ${rem(8)};
    margin: 0;
    margin-bottom: ${rem(14)};
    list-style: none;
    border-bottom: ${rem(1)} solid ${theme.colors.cyanBorder};
    background: repeating-linear-gradient(
      to bottom,
      ${theme.colors.cyanFaint} 0 ${rem(1)},
      transparent ${rem(1)} 50%
    );
  }

  li {
    position: relative;
    display: flex;
    flex: 1;
    align-items: end;
    max-width: ${rem(48)};
    min-width: 0;
  }

  .bar {
    width: 100%;
    min-height: ${rem(1)};
    border-top: ${rem(1)} solid ${theme.colors.cyan};
    background: linear-gradient(
      to top,
      ${theme.colors.cyanFaint},
      ${theme.colors.cyan}
    );
  }

  .value {
    position: absolute;
    top: calc(100% + ${rem(4)});
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  ${mb('compact', { max: true })} {
    li:not(:last-child) .value {
      width: 1px;
      height: 1px;
      clip-path: inset(50%);
      overflow: hidden;
    }
  }
`;

export const CoverageChart: React.FC<CoverageChartProps> = ({ points }) => (
  <Chart>
    <figcaption>Recent coverage · oldest to newest</figcaption>
    <div className="scale" aria-hidden="true">
      <span>100%</span>
      <span>50%</span>
      <span>0%</span>
    </div>
    <ol role="list">
      {points.map(({ attemptId, coverage }) => (
        <li key={attemptId} title={`${coverage}%`}>
          <span
            className="bar"
            aria-hidden="true"
            style={{ blockSize: `${coverage}%` }}
          />
          <span className="value">{coverage}%</span>
        </li>
      ))}
    </ol>
  </Chart>
);
