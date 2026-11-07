import styled, { createGlobalStyle } from 'styled-components';
import { ATLAS_THEME } from './theme';

export const GlobalStyles = createGlobalStyle`
:root {
color-scheme: dark;
font-size: 16px;
font-family: ${ATLAS_THEME.fonts.mono};
color: ${ATLAS_THEME.colors.text};
background: ${ATLAS_THEME.colors.void};
}
* {
box-sizing: border-box;
}
body {
margin: 0;
min-width: 320px;
}
button {
font: inherit;
}
input {
font: inherit;
}
`;

export const Wrapper = styled.div`
  & {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: column;
    padding: 24px;
    overflow: hidden;
    position: relative;
    background: radial-gradient(
      ellipse at 50% 44%,
      ${ATLAS_THEME.colors.spaceCenter},
      ${ATLAS_THEME.colors.spaceMiddle} 45%,
      ${ATLAS_THEME.colors.spaceOuter}
    );
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(${ATLAS_THEME.colors.grid} 1px, transparent 1px),
      linear-gradient(90deg, ${ATLAS_THEME.colors.grid} 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(ellipse, black, transparent 80%);
  }
  @media (max-width: 600px) {
    & {
      padding: 12px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) {
    & {
      height: 100dvh;
      min-height: 0;
      grid-template-rows: auto minmax(0, 1fr) minmax(0, auto);
      padding: 8px 12px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      grid-template-columns: minmax(0, 1fr) minmax(280px, 48%);
      grid-template-rows: auto minmax(0, 1fr);
      column-gap: 12px;
    }
  }
`;

export const StatusBar = styled.div`
  & {
    min-width: 0;
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      grid-column: 1;
      grid-row: 1;
    }
  }
`;

export const Hud = styled.header`
  & {
    position: relative;
    z-index: 1;
  }
  & {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      flex-direction: column;
      gap: 6px;
    }
  }
`;

export const Brand = styled.p`
  & {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.small};
    font-weight: ${ATLAS_THEME.fontWeights.heavy};
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin: 0 0 8px;
  }
  & a {
    color: inherit;
    text-decoration: none;
  }
  & a:hover {
    text-decoration: underline;
  }
  @media (max-width: 600px) {
    & {
      font-size: ${ATLAS_THEME.fontSizes.caption};
      letter-spacing: 0.12em;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      margin: 0;
      font-size: ${ATLAS_THEME.fontSizes.caption};
      letter-spacing: 0.12em;
    }
  }
`;

export const Label = styled.p`
  & {
    display: block;
  }
  & {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  & {
    letter-spacing: 0.18em;
  }
  @media (max-width: 600px) {
    & {
      font-size: ${ATLAS_THEME.fontSizes.tiny};
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      margin: 4px 0 0;
    }
  }
`;

export const HudStats = styled.div`
  & {
    display: flex;
    gap: clamp(25px, 5vw, 70px);
    align-items: center;
  }
  @media (max-width: 600px) {
    & {
      gap: 16px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      justify-content: space-between;
      gap: 12px;
    }
  }
`;

export const HudMetric = styled.div`
  & strong[data-urgent='true'] {
    color: ${ATLAS_THEME.colors.danger};
  }
  & span {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  & {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  & strong {
    font-size: ${ATLAS_THEME.fontSizes.metric};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.03em;
  }
  @media (max-width: 600px) {
    & strong {
      font-size: 16px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & strong {
      font-size: 16px;
    }
  }
`;

export const Playfield = styled.main`
  & {
    position: relative;
    z-index: 1;
  }
  & {
    min-height: 0;
    width: min(740px, 100%);
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      grid-column: 1;
      grid-row: 2;
      grid-template-rows: auto minmax(0, 1fr) auto auto;
    }
  }
`;

export const MapHeading = styled.div`
  & {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  & {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  & {
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid ${ATLAS_THEME.colors.cyanSubtle};
  }
`;

export const MapKey = styled.div`
  & {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  & {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  & {
    justify-content: center;
    flex-wrap: wrap;
    letter-spacing: 0.08em;
  }
  & span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  & i {
    width: 7px;
    height: 7px;
    background: ${ATLAS_THEME.colors.yellow};
  }
  & .keyGuessed {
    background: ${ATLAS_THEME.colors.cyan};
  }
  @media (max-width: 600px) {
    & {
      font-size: ${ATLAS_THEME.fontSizes.tiny};
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      gap: 4px 8px;
      font-size: ${ATLAS_THEME.fontSizes.tiny};
      letter-spacing: 0.08em;
    }
  }
`;

export const MapSlot = styled.div`
  & {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    flex: 1 1 auto;
  }
`;

export const Map = styled.svg`
  & {
    display: block;
    width: 100%;
    height: 100%;
    max-height: 60vh;
    overflow: visible;
  }
  @media (max-width: 600px) {
    & {
      max-height: 48vh;
    }
  }
  @media (max-height: 680px) {
    & {
      max-height: 42vh;
    }
  }
`;

export const Country = styled.path`
  & {
    fill: ${ATLAS_THEME.colors.countryFill};
    stroke: ${ATLAS_THEME.colors.countryStroke};
    stroke-width: 0.75px;
    stroke-linejoin: round;
    transition:
      fill 0.2s,
      stroke 0.2s;
  }
  &[data-target='true'] {
    fill: ${ATLAS_THEME.colors.targetFill};
    stroke: ${ATLAS_THEME.colors.yellow};
    stroke-width: 2px;
    filter: drop-shadow(0 0 4px ${ATLAS_THEME.colors.amber});
  }
  &[data-guessed='true'] {
    fill: ${ATLAS_THEME.colors.cyanFill};
    stroke: ${ATLAS_THEME.colors.cyan};
  }
  &[role='button'] {
    cursor: pointer;
  }
  &:focus {
    outline: none;
  }
  &:focus-visible {
    stroke: ${ATLAS_THEME.colors.text};
  }
  @media (prefers-reduced-motion: reduce) {
    & {
      transition-duration: 0.01ms;
    }
  }
`;

export const PersistenceNotice = styled.p.attrs({
  className: 'persistenceNotice',
})`
  & {
    position: relative;
    margin: 8px 0 0;
    padding: 8px 12px;
    background: ${ATLAS_THEME.colors.noticeSurface};
    border: 1px solid ${ATLAS_THEME.colors.amber};
    color: ${ATLAS_THEME.colors.text};
    font-size: ${ATLAS_THEME.fontSizes.body};
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 360px) {
    & {
      margin-top: 4px;
      padding: 4px 8px;
      font-size: ${ATLAS_THEME.fontSizes.label};
    }
  }
`;

export const Command = styled.footer`
  & {
    position: relative;
    z-index: 1;
  }
  & {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(740px, 100%);
    margin: 0 auto;
    padding: 20px 20px 16px;
    border: 1px solid ${ATLAS_THEME.colors.cyanBorder};
    background: ${ATLAS_THEME.colors.commandSurface};
  }
  @media (max-width: 600px) {
    & {
      padding: 12px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) {
    & {
      min-height: 0;
      max-height: 100%;
      overflow-y: auto;
      padding: 8px;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 500px) and (orientation: landscape) {
    & {
      grid-column: 2;
      grid-row: 1 / -1;
      align-self: end;
      margin: 0;
    }
  }
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 360px) {
    & {
      gap: 4px;
      padding: 6px;
    }
  }
`;

export const AnswerForm = styled.form`
  &[data-mobile='true'] button {
    display: none;
  }
  @media (pointer: coarse) and (max-width: 1024px) {
    &[data-mobile='true'] [data-answer-input] {
      flex-basis: 100%;
    }
    &[data-mobile='true'] input {
      min-height: 44px;
    }
  }
  & {
    display: flex;
    gap: 8px;
  }
  @media (max-width: 600px) {
    & {
      flex-wrap: wrap;
    }
  }
  @media (max-width: 600px) {
    & [data-answer-input] {
      flex-basis: 100%;
    }
  }
  @media (max-width: 600px) {
    & button {
      flex: 1;
    }
  }
`;

export const ScreenReaderOnly = styled.span`
  & {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export const Overlay = styled.div`
  & {
    position: fixed;
    z-index: 5;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: ${ATLAS_THEME.colors.overlay};
  }
`;

export const Panel = styled.section`
  & {
    width: min(540px, 100%);
    max-height: calc(100dvh - 36px);
    overflow-y: auto;
    padding: 32px 40px;
    border: 1px solid ${ATLAS_THEME.colors.cyanBorderStrong};
    background: linear-gradient(
      135deg,
      ${ATLAS_THEME.colors.panelLight},
      ${ATLAS_THEME.colors.panelDark} 75%
    );
    color: ${ATLAS_THEME.colors.text};
    font: inherit;
    box-shadow: 0 0 60px ${ATLAS_THEME.colors.panelGlow};
  }
  &::backdrop {
    background: ${ATLAS_THEME.colors.overlay};
  }
  & h1 {
    margin: 12px 0;
    line-height: 0.95;
    text-transform: uppercase;
  }
  & h2 {
    margin: 12px 0;
    line-height: 0.95;
    text-transform: uppercase;
  }
  & h1 {
    font-size: clamp(43px, 8vw, 72px);
    letter-spacing: -0.065em;
  }
  & h1 em {
    color: ${ATLAS_THEME.colors.cyan};
    font-style: normal;
  }
  & h2 {
    font-size: clamp(28px, 5vw, 40px);
    letter-spacing: -0.04em;
  }
  & p {
    color: ${ATLAS_THEME.colors.secondary};
    line-height: 1.7;
    font-size: ${ATLAS_THEME.fontSizes.paragraph};
  }
  & .eyebrow {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  & fieldset {
    display: grid;
    gap: 12px;
    margin: 24px 0 12px;
    padding: 16px 0;
    border: 0;
    border-top: 1px solid ${ATLAS_THEME.colors.cyanFaint};
  }
  & legend {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.label};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  & label {
    font-size: ${ATLAS_THEME.fontSizes.small};
    cursor: pointer;
  }
  & input {
    accent-color: ${ATLAS_THEME.colors.cyan};
  }
`;

export const Modal = styled.dialog`
  & {
    width: min(540px, calc(100vw - 36px));
    max-width: none;
    max-height: calc(100dvh - 36px);
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  &::backdrop {
    background: ${ATLAS_THEME.colors.overlay};
  }
`;

export const Eyebrow = styled.p.attrs({ className: 'eyebrow' })``;

export const Actions = styled.div`
  & {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
`;

export const Results = styled.dl`
  & {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 24px 0 12px;
    padding: 20px 0;
    border-block: 1px solid ${ATLAS_THEME.colors.cyanFaint};
  }
  & dt {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  & dd {
    margin: 8px 0 0;
    font-size: clamp(14px, 2.5vw, 22px);
    overflow-wrap: anywhere;
    font-weight: ${ATLAS_THEME.fontWeights.bold};
  }
  @media (max-width: 600px) {
    & {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

export const MapHint = styled.span`
  @media (pointer: coarse) and (max-width: 1024px) and (max-height: 360px) {
    & {
      display: none;
    }
  }
`;
