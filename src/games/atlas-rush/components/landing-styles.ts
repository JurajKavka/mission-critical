import { createGlobalStyle, styled } from 'styled-components';
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
  padding: 70px 18px 30px;
  background: radial-gradient(
    ellipse at 50% 44%,
    ${ATLAS_THEME.colors.spaceCenter},
    ${ATLAS_THEME.colors.spaceMiddle} 45%,
    ${ATLAS_THEME.colors.spaceOuter}
  );

  nav {
    position: absolute;
    top: 22px;
    left: 22px;
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
    outline: 2px solid ${ATLAS_THEME.colors.cyan};
    outline-offset: 3px;
  }
`;

export const Panel = styled.section`
  width: min(540px, 100%);
  padding: 32px 42px;
  border: 1px solid ${ATLAS_THEME.colors.cyanBorderStrong};
  background: linear-gradient(
    135deg,
    ${ATLAS_THEME.colors.panelLight},
    ${ATLAS_THEME.colors.panelDark} 75%
  );
  box-shadow: 0 0 60px ${ATLAS_THEME.colors.panelGlow};

  h1 {
    margin: 12px 0;
    font-size: clamp(43px, 8vw, 72px);
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
    gap: 12px;
    margin: 24px 0 12px;
    padding: 15px 0;
    border: 0;
    border-top: 1px solid ${ATLAS_THEME.colors.cyanFaint};
    text-transform: uppercase;
  }
  fieldset + fieldset {
    margin-top: 12px;
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
    gap: 10px;
    font-size: ${ATLAS_THEME.fontSizes.small};
    letter-spacing: 0.08em;
    cursor: pointer;
  }
  input {
    flex: none;
    width: 16px;
    height: 16px;
    margin: 0;
    accent-color: ${ATLAS_THEME.colors.cyan};
  }
  .learning {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    margin-top: 20px;
    letter-spacing: normal;
  }
  .start-action button {
    min-width: 190px;
    margin-top: 12px;
  }
  .start-action button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  @media (max-width: 600px) {
    padding: 26px;
  }
`;
