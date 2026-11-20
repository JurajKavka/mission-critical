import { rem } from 'polished';
import { styled } from 'styled-components';
import { mb } from '../../../react-component-library/media-breakpoints';
import { theme } from '../../../react-component-library/theme';

export const Dashboard = styled.main`
  max-width: ${rem(1024)};
  margin-inline: auto;
  padding: 0 ${rem(16)} ${rem(32)};
  color: ${theme.colors.text};
  font-family: ${theme.fonts.mono};
  font-variant-numeric: tabular-nums;

  a {
    color: ${theme.colors.cyan};
  }

  .start-survey {
    justify-self: start;
    padding: ${rem(12)} ${rem(16)};
    border: ${rem(1)} solid ${theme.colors.cyanBorderStrong};
    background: ${theme.colors.actionSurface};
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: ${theme.fontSizes.small};
    font-weight: ${theme.fontWeights.bold};

    &:hover {
      background: ${theme.colors.actionHover};
    }
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1,
  h2,
  h3 {
    line-height: 1.1;
  }

  h1 {
    margin: ${rem(24)} 0;
    font-size: clamp(${rem(30)}, 7vw, ${rem(56)});
    font-weight: ${theme.fontWeights.heavy};
    letter-spacing: -0.055em;
    text-transform: uppercase;
  }

  h2 {
    font-size: clamp(${rem(18)}, 4vw, ${rem(24)});
    letter-spacing: -0.035em;
    text-transform: uppercase;
  }

  button,
  input:not([type='checkbox']),
  select {
    color: ${theme.colors.text};
    background: ${theme.colors.panelDark};
    font: inherit;
    font-size: ${theme.fontSizes.paragraph};
    border: ${rem(1)} solid ${theme.colors.inputBorder};
    min-width: 0;
    max-width: 100%;
    min-height: ${rem(42)};
    padding: ${rem(8)} ${rem(12)};

    &:focus-visible {
      border-color: ${theme.colors.cyan};
      box-shadow: inset 0 0 0 ${rem(1)} ${theme.colors.cyan};
      outline: 0;
    }
  }

  button {
    color: ${theme.colors.cyan};
    cursor: pointer;
    font-size: ${theme.fontSizes.label};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: 0.1em;
    text-transform: uppercase;

    &:hover {
      background: ${theme.colors.cyanFaint};
    }
  }

  .panel {
    min-width: 0;
    display: grid;
    gap: ${rem(16)};
    margin-block: ${rem(16)};
    padding: clamp(${rem(12)}, 3vw, ${rem(24)});
    border: ${rem(1)} solid ${theme.colors.cyanSubtle};
    background: ${theme.colors.panelDark};
  }

  .progress {
    border-top-color: ${theme.colors.cyanBorderStrong};
    background: linear-gradient(
      135deg,
      ${theme.colors.commandSurface},
      ${theme.colors.panelDark} 52%
    );
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: baseline;
    gap: ${rem(12)};
  }

  .filters,
  .summary {
    display: grid;
    grid-template-columns: repeat(
      auto-fit,
      minmax(min(${rem(145)}, 100%), 1fr)
    );
    gap: ${rem(12)};
  }

  .summary {
    margin: 0;
    gap: ${rem(1)};
    grid-template-columns: repeat(3, minmax(0, 1fr));
    background: ${theme.colors.cyanSubtle};
    border: ${rem(1)} solid ${theme.colors.cyanSubtle};
  }

  .summary > div {
    padding: clamp(${rem(8)}, 2vw, ${rem(16)});
    background: ${theme.colors.panelDark};
    display: grid;
    gap: ${rem(6)};
    align-content: space-between;
  }

  .summary dt,
  .filters label,
  .progress-filter,
  .history-count,
  th {
    color: ${theme.colors.secondary};
    font-size: ${theme.fontSizes.label};
    line-height: 1.4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .summary dd {
    margin: 0;
    color: ${theme.colors.text};
    font-size: clamp(${rem(16)}, 4vw, ${rem(30)});
    line-height: 1;
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: -0.04em;
  }

  .summary .best-coverage {
    color: ${theme.colors.cyan};
  }

  .filters label,
  .progress-filter {
    display: grid;
    gap: ${rem(6)};
    min-width: 0;
  }

  .progress-filter select,
  .filters select {
    width: 100%;
    text-transform: none;
    letter-spacing: normal;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${theme.fontSizes.bodyBig};
  }

  th,
  td {
    text-align: left;
    padding: ${rem(10)} ${rem(8)};
    border-bottom: ${rem(1)} solid ${theme.colors.cyanFaint};
  }

  td:first-child,
  td:nth-child(3),
  td:nth-child(4),
  .history-meta {
    color: ${theme.colors.secondary};
  }

  td:nth-child(3),
  .history-meta {
    text-transform: capitalize;
  }

  td:nth-child(5),
  .history-score {
    color: ${theme.colors.cyan};
    font-weight: ${theme.fontWeights.bold};
  }

  tbody tr:hover,
  tbody tr:focus-within {
    background: ${theme.colors.grid};
  }

  .cards {
    display: none;
  }

  .history-card {
    display: grid;
    gap: ${rem(8)};
    padding: ${rem(12)};
    border-left: ${rem(2)} solid ${theme.colors.cyanBorderStrong};
    background: ${theme.colors.commandSurface};
  }

  .history-card button {
    justify-self: start;
  }

  .history-meta {
    font-size: ${theme.fontSizes.body};
  }

  .hint,
  [role='status'] {
    color: ${theme.colors.secondary};
    font-size: ${theme.fontSizes.bodyBig};
  }

  .hint:empty,
  [role='status']:empty {
    display: none;
  }

  ${mb('m', { max: true })} {
    .desktop-history {
      display: none;
    }

    .cards {
      display: grid;
      gap: ${rem(8)};
    }
  }

  ${mb('compact', { max: true })} {
    .filters {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;
