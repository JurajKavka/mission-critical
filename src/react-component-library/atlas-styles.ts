import { rem } from 'polished';
import { createGlobalStyle, css, styled } from 'styled-components';
import { mb } from './media-breakpoints';
import { ATLAS_THEME } from './theme';

const SPACE_BACKGROUND = css`
  background: radial-gradient(
    ellipse at 50% 44%,
    ${ATLAS_THEME.colors.spaceCenter},
    ${ATLAS_THEME.colors.spaceMiddle} 45%,
    ${ATLAS_THEME.colors.spaceOuter}
  );
`;

export const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: dark;
    font-size: ${rem(16)};
    font-family: ${ATLAS_THEME.fonts.mono};
    color: ${ATLAS_THEME.colors.text};
    background: ${ATLAS_THEME.colors.void};
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    min-width: ${rem(320)};
  }
  button,
  input {
    font: inherit;
  }
`;

export const Wrapper = styled.div`
  min-height: 100dvh;
  display: flex;
  align-items: center;
  gap: ${rem(8)};
  flex-direction: column;
  padding: ${rem(24)};
  overflow: hidden;
  position: relative;
  ${SPACE_BACKGROUND}
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(
        ${ATLAS_THEME.colors.grid} ${rem(1)},
        transparent ${rem(1)}
      ),
      linear-gradient(
        90deg,
        ${ATLAS_THEME.colors.grid} ${rem(1)},
        transparent ${rem(1)}
      );
    background-size: ${rem(42)} ${rem(42)};
    mask-image: radial-gradient(ellipse, black, transparent 80%);
  }
  ${mb('compact', { max: true })} {
    padding: ${rem(12)};
  }
  ${mb('l', { max: true, pointer: 'coarse' })} {
    height: 100dvh;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr) minmax(0, auto);
    padding: ${rem(8)} ${rem(12)};
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    grid-template-columns: minmax(0, 1fr) minmax(${rem(280)}, 48%);
    grid-template-rows: auto minmax(0, 1fr);
    column-gap: ${rem(12)};
  }
`;

export const LandingWrapper = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: ${rem(70)} ${rem(18)} ${rem(30)};
  ${SPACE_BACKGROUND}

  nav {
    position: absolute;
    top: ${rem(22)};
    left: ${rem(22)};
  }
  :focus-visible {
    outline: ${rem(2)} solid ${ATLAS_THEME.colors.cyan};
    outline-offset: ${rem(3)};
  }
`;

export const StatusBar = styled.div`
  min-width: 0;
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    grid-column: 1;
    grid-row: 1;
  }
`;

export const Label = styled.p`
  display: block;
  color: ${ATLAS_THEME.colors.muted};
  font-size: ${ATLAS_THEME.fontSizes.caption};
  text-transform: uppercase;
  letter-spacing: 0.18em;
  ${mb('compact', { max: true })} {
    font-size: ${ATLAS_THEME.fontSizes.tiny};
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    margin: ${rem(4)} 0 0;
  }
`;

export const HudStats = styled.div`
  display: flex;
  gap: clamp(${rem(25)}, 5vw, ${rem(70)});
  align-items: center;
  ${mb('compact', { max: true })} {
    gap: ${rem(16)};
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    justify-content: space-between;
    gap: ${rem(12)};
  }
`;

export const HudMetric = styled.div`
  strong[data-urgent='true'] {
    color: ${ATLAS_THEME.colors.danger};
  }
  span {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  display: flex;
  flex-direction: column;
  gap: ${rem(4)};
  strong {
    font-size: ${ATLAS_THEME.fontSizes.metric};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.03em;
  }
  ${mb('compact', { max: true })} {
    strong {
      font-size: ${rem(16)};
    }
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    strong {
      font-size: ${rem(16)};
    }
  }
`;

export const Playfield = styled.main`
  position: relative;
  z-index: 1;
  min-height: 0;
  width: min(${rem(740)}, 100%);
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    grid-column: 1;
    grid-row: 2;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
  }
`;

export const MapHeading = styled.div`
  color: ${ATLAS_THEME.colors.muted};
  font-size: ${ATLAS_THEME.fontSizes.caption};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  gap: ${rem(12)};
  align-items: center;
  padding-bottom: ${rem(8)};
  border-bottom: ${rem(1)} solid ${ATLAS_THEME.colors.cyanSubtle};
`;

export const MapKey = styled.div`
  color: ${ATLAS_THEME.colors.muted};
  font-size: ${ATLAS_THEME.fontSizes.caption};
  text-transform: uppercase;
  display: flex;
  gap: ${rem(12)};
  justify-content: center;
  flex-wrap: wrap;
  letter-spacing: 0.08em;
  span {
    display: inline-flex;
    align-items: center;
    gap: ${rem(7)};
  }
  i {
    width: ${rem(7)};
    height: ${rem(7)};
    background: ${ATLAS_THEME.colors.yellow};
  }
  .keyGuessed {
    background: ${ATLAS_THEME.colors.cyan};
  }
  ${mb('compact', { max: true })} {
    font-size: ${ATLAS_THEME.fontSizes.tiny};
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    gap: ${rem(4)} ${rem(8)};
    font-size: ${ATLAS_THEME.fontSizes.tiny};
    letter-spacing: 0.08em;
  }
`;

export const MapSlot = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  flex: 1 1 auto;
`;

export const Map = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  max-height: 60vh;
  overflow: visible;
  ${mb('compact', { max: true })} {
    max-height: 48vh;
  }
  ${mb(null, { maxHeight: 'low' })} {
    max-height: 42vh;
  }
`;

export const Country = styled.path`
  fill: ${ATLAS_THEME.colors.countryFill};
  stroke: ${ATLAS_THEME.colors.countryStroke};
  stroke-width: ${rem(0.75)};
  stroke-linejoin: round;
  transition:
    fill 0.2s,
    stroke 0.2s;
  &[data-target='true'] {
    fill: ${ATLAS_THEME.colors.targetFill};
    stroke: ${ATLAS_THEME.colors.yellow};
    stroke-width: ${rem(2)};
    filter: drop-shadow(0 0 ${rem(4)} ${ATLAS_THEME.colors.amber});
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
  ${mb(null, { reducedMotion: true })} {
    transition-duration: 0.01ms;
  }
`;

export const PersistenceNotice = styled.p`
  position: relative;
  margin: ${rem(8)} 0 0;
  padding: ${rem(8)} ${rem(12)};
  background: ${ATLAS_THEME.colors.noticeSurface};
  border: ${rem(1)} solid ${ATLAS_THEME.colors.amber};
  color: ${ATLAS_THEME.colors.text};
  font-size: ${ATLAS_THEME.fontSizes.body};
  line-height: 1.4;
  overflow-wrap: anywhere;
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'short' })} {
    margin-top: ${rem(4)};
    padding: ${rem(4)} ${rem(8)};
    font-size: ${ATLAS_THEME.fontSizes.label};
  }
`;

export const Command = styled.footer`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${rem(8)};
  width: min(${rem(740)}, 100%);
  margin: 0 auto;
  padding: ${rem(20)} ${rem(20)} ${rem(16)};
  border: ${rem(1)} solid ${ATLAS_THEME.colors.cyanBorder};
  background: ${ATLAS_THEME.colors.commandSurface};
  ${mb('compact', { max: true })} {
    padding: ${rem(12)};
  }
  ${mb('l', { max: true, pointer: 'coarse' })} {
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    padding: ${rem(8)};
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    grid-column: 2;
    grid-row: 1 / -1;
    align-self: end;
    margin: 0;
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'short' })} {
    gap: ${rem(4)};
    padding: ${rem(6)};
  }
`;

export const AnswerForm = styled.form`
  input[aria-invalid='true'],
  input[aria-invalid='true']:hover,
  input[aria-invalid='true']:focus {
    border-color: ${ATLAS_THEME.colors.danger};
    box-shadow: inset 0 0 0 ${rem(2)} ${ATLAS_THEME.colors.danger};
    color: ${ATLAS_THEME.colors.danger};
  }
  &[data-mobile='true'] > button {
    display: none;
  }
  ${mb('l', { max: true, pointer: 'coarse' })} {
    &[data-mobile='true'] [data-answer-input] {
      flex-basis: 100%;
    }
    &[data-mobile='true'] input {
      min-height: ${rem(44)};
    }
  }
  display: flex;
  gap: ${rem(8)};
  ${mb('compact', { max: true })} {
    flex-wrap: wrap;
    [data-answer-input] {
      flex-basis: 100%;
    }
    > button {
      flex: 1;
    }
  }
`;

export const ScreenReaderOnly = styled.span`
  position: absolute;
  width: ${rem(1)};
  height: ${rem(1)};
  padding: 0;
  margin: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const AnswerHint = styled.p`
  margin: 0;
  color: ${ATLAS_THEME.colors.muted};
  font-size: ${ATLAS_THEME.fontSizes.small};
`;

export const Overlay = styled.div`
  position: fixed;
  z-index: 5;
  inset: 0;
  display: grid;
  place-items: center;
  padding: ${rem(20)};
  background: ${ATLAS_THEME.colors.overlay};
`;

export const Eyebrow = styled.p``;

export const Panel = styled.section`
  width: min(${rem(540)}, 100%);
  max-height: calc(100dvh - ${rem(36)});
  overflow-y: auto;
  padding: ${rem(32)};
  ${mb('compact', { max: true })} {
    padding: ${rem(24)};
  }
  border: ${rem(1)} solid ${ATLAS_THEME.colors.cyanBorderStrong};
  background: linear-gradient(
    135deg,
    ${ATLAS_THEME.colors.panelLight},
    ${ATLAS_THEME.colors.panelDark} 75%
  );
  color: ${ATLAS_THEME.colors.text};
  font: inherit;
  box-shadow: 0 0 ${rem(60)} ${ATLAS_THEME.colors.panelGlow};
  &::backdrop {
    background: ${ATLAS_THEME.colors.overlay};
  }
  h1,
  h2 {
    margin: ${rem(12)} 0;
    line-height: 0.95;
    text-transform: uppercase;
    font-size: clamp(${rem(28)}, 5vw, ${rem(40)});
    letter-spacing: -0.04em;
  }
  h1 {
    font-size: clamp(${rem(43)}, 8vw, ${rem(72)});
    letter-spacing: -0.065em;
  }
  h1 em {
    color: ${ATLAS_THEME.colors.cyan};
    font-style: normal;
  }
  p {
    color: ${ATLAS_THEME.colors.secondary};
    line-height: 1.7;
    font-size: ${ATLAS_THEME.fontSizes.bodyBig};
    margin: ${rem(12)} 0;
    ${mb('compact', { max: true })} {
      margin: ${rem(8)} 0;
      font-size: ${ATLAS_THEME.fontSizes.body};
    }
  }
  ${Eyebrow} {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  fieldset {
    display: grid;
    gap: ${rem(12)};
    margin: ${rem(24)} 0 ${rem(12)};
    padding: ${rem(16)} 0;
    border: 0;
    border-top: ${rem(1)} solid ${ATLAS_THEME.colors.cyanFaint};
  }
  legend {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.label};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  label {
    font-size: ${ATLAS_THEME.fontSizes.small};
    cursor: pointer;
  }
  input {
    accent-color: ${ATLAS_THEME.colors.cyan};
  }
`;

export const SettingsForm = styled.form`
  fieldset {
    padding: ${rem(15)} 0;
    text-transform: uppercase;
  }
  fieldset + fieldset {
    margin-top: ${rem(12)};
  }
  .regions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(3, auto);
    grid-auto-flow: column;
    gap: ${rem(12)} ${rem(16)};
  }
  label {
    display: flex;
    align-items: center;
    gap: ${rem(10)};
    letter-spacing: 0.08em;
  }
  input {
    flex: none;
    width: ${rem(16)};
    height: ${rem(16)};
    margin: 0;
  }
  .learning,
  .mode-option {
    align-items: flex-start;
    margin-top: ${rem(20)};
    letter-spacing: normal;
  }
  .start-action button {
    min-width: ${rem(190)};
    margin-top: ${rem(12)};
  }
  .start-action button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

export const Modal = styled.dialog`
  width: min(${rem(540)}, calc(100vw - ${rem(36)}));
  max-width: none;
  max-height: calc(100dvh - ${rem(36)});
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  &::backdrop {
    background: ${ATLAS_THEME.colors.overlay};
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${rem(10)};
  ${mb('compact', { max: true })} {
    > button {
      width: 100%;
    }
  }
`;

export const Results = styled.dl`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${rem(16)};
  margin: ${rem(12)} 0 ${rem(32)};
  ${mb('compact', { max: true })} {
    margin: ${rem(12)} 0 ${rem(24)};
    gap: ${rem(8)};
  }
  padding: ${rem(20)} 0;
  border-block: ${rem(1)} solid ${ATLAS_THEME.colors.cyanFaint};
  dt {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  dd {
    margin: ${rem(8)} 0 0;
    ${mb('compact', { max: true })} {
      margin: ${rem(4)} 0 0;
    }
    overflow-wrap: anywhere;
    font-size: ${ATLAS_THEME.fontSizes.paragraphBig};
    font-weight: ${ATLAS_THEME.fontWeights.bold};
    ${mb('compact', { max: true })} {
      font-size: ${ATLAS_THEME.fontSizes.paragraph};
    }
  }
  ${mb('compact', { max: true })} {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const MapHint = styled.span`
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'short' })} {
    display: none;
  }
`;
