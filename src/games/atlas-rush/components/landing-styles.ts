import { rem } from 'polished';
import { createGlobalStyle, styled } from 'styled-components';
import { ATLAS_THEME } from '../../../react-component-library/theme';

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
  }
  :focus-visible {
    outline: ${rem(2)} solid ${ATLAS_THEME.colors.cyan};
    outline-offset: ${rem(3)};
  }
`;

export const SettingsForm = styled.form`
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
`;
