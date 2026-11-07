import styled from 'styled-components';
import { ATLAS_THEME } from './theme';

export const Wrapper = styled.main`
  max-width: 1000px;
  margin: auto;
  padding: 40px 22px;

  h1 {
    margin: 12px 0;
    font-size: clamp(36px, 6vw, 64px);
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
  margin-top: 36px;
  padding: 22px;
  border: 1px solid ${ATLAS_THEME.colors.catalogBorder};
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
    margin: 24px auto;
  }
`;

export const MapWrapper = styled.div`
  height: min(70vh, 600px);
  display: flex;
  justify-content: center;
`;
