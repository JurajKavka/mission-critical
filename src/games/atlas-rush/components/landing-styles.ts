import { rem } from 'polished';
import { createGlobalStyle, styled } from 'styled-components';
import { mb } from '../../../react-component-library/media-breakpoints';
import { ATLAS_THEME } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`;

export const Wrapper = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: ${rem(70)} ${rem(18)} ${rem(30)};
  background: radial-gradient(
    ellipse at 50% 44%,
    ${ATLAS_THEME.colors.spaceCenter},
    ${ATLAS_THEME.colors.spaceMiddle} 45%,
    ${ATLAS_THEME.colors.spaceOuter}
  );

  nav {
    position: absolute;
    top: ${rem(22)};
    left: ${rem(22)};
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.label};
    font-weight: ${ATLAS_THEME.fontWeights.heavy};
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  nav a {
    color: inherit;
    text-decoration: none;
  }
  nav a:hover {
    text-decoration: underline;
  }
  nav span {
    color: ${ATLAS_THEME.colors.magenta};
  }
  :focus-visible {
    outline: ${rem(2)} solid ${ATLAS_THEME.colors.cyan};
    outline-offset: ${rem(3)};
  }
`;

export const Panel = styled.section`
  width: min(${rem(540)}, 100%);
  padding: ${rem(32)} ${rem(42)};
  border: ${rem(1)} solid ${ATLAS_THEME.colors.cyanBorderStrong};
  background: linear-gradient(
    135deg,
    ${ATLAS_THEME.colors.panelLight},
    ${ATLAS_THEME.colors.panelDark} 75%
  );
  box-shadow: 0 0 ${rem(60)} ${ATLAS_THEME.colors.panelGlow};

  h1 {
    margin: ${rem(12)} 0;
    font-size: clamp(${rem(43)}, 8vw, ${rem(72)});
    line-height: 0.95;
    letter-spacing: -0.065em;
    text-transform: uppercase;
  }
  h1 em {
    color: ${ATLAS_THEME.colors.cyan};
    font-style: normal;
  }
  p {
    color: ${ATLAS_THEME.colors.secondary};
    font-size: ${ATLAS_THEME.fontSizes.paragraph};
    line-height: 1.7;
  }
  .eyebrow {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  fieldset {
    display: grid;
    gap: ${rem(12)};
    margin: ${rem(24)} 0 ${rem(12)};
    padding: ${rem(15)} 0;
    border: 0;
    border-top: ${rem(1)} solid ${ATLAS_THEME.colors.cyanFaint};
    text-transform: uppercase;
  }
  fieldset + fieldset {
    margin-top: ${rem(12)};
  }
  legend {
    color: ${ATLAS_THEME.colors.muted};
    font-size: ${ATLAS_THEME.fontSizes.label};
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  label {
    display: flex;
    align-items: center;
    gap: ${rem(10)};
    font-size: ${ATLAS_THEME.fontSizes.small};
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  input {
    flex: none;
    width: ${rem(16)};
    height: ${rem(16)};
    margin: 0;
    accent-color: ${ATLAS_THEME.colors.cyan};
  }
  .learning {
    display: flex;
    gap: ${rem(10)};
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
  ${mb('compact', { max: true })} {
    padding: ${rem(26)};
  }
`;
