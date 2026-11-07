import { rem } from 'polished';
import styled from 'styled-components';
import { ATLAS_THEME } from './theme';

export const Wrapper = styled.main`
  max-width: ${rem(1000)};
  margin: auto;
  padding: ${rem(40)} ${rem(22)};

  h1 {
    margin: ${rem(12)} 0;
    font-size: clamp(${rem(36)}, 6vw, ${rem(64)});
    text-transform: uppercase;
    letter-spacing: -0.06em;
  }
  > p {
    color: ${ATLAS_THEME.colors.secondary};
    line-height: 1.6;
  }
  .eyebrow {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
`;

export const Section = styled.section`
  margin-top: ${rem(36)};
  padding: ${rem(22)};
  border: ${rem(1)} solid ${ATLAS_THEME.colors.catalogBorder};
  background: ${ATLAS_THEME.colors.spaceMiddle};

  h2 {
    color: ${ATLAS_THEME.colors.cyan};
    font-size: ${ATLAS_THEME.fontSizes.small};
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  > p {
    color: ${ATLAS_THEME.colors.secondary};
    font-size: ${ATLAS_THEME.fontSizes.label};
    text-transform: uppercase;
  }
  section {
    margin: ${rem(24)} auto;
  }
`;

export const MapWrapper = styled.div`
  height: min(70vh, ${rem(600)});
  display: flex;
  justify-content: center;
`;
