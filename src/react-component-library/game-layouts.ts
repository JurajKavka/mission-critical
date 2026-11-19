import { rem } from 'polished';
import { css, styled } from 'styled-components';
import { LandingWrapper, Playfield, TopBar, Wrapper } from './atlas-styles';
import { WellcomeScreenContentWrapper } from './WellcomeScreenContentWrapper';

const SIDE_PADDING = rem(16);

const ATLAS_RUSH_WRAPPER_PADDING = css`
  --game-wrapper-padding-inline: ${SIDE_PADDING};
`;

export const AsteroidsLayout = {
  Wrapper,
  LandingWrapper,
  TopBar: styled(TopBar)`
    padding-inline: ${SIDE_PADDING};
  `,
  Playfield,
  WelcomeContent: styled(WellcomeScreenContentWrapper)`
    max-width: calc(100% - 2 * ${SIDE_PADDING});
  `,
};

export const AtlasRushLayout = {
  Wrapper: styled(Wrapper)`
    ${ATLAS_RUSH_WRAPPER_PADDING}
  `,
  LandingWrapper: styled(LandingWrapper)`
    ${ATLAS_RUSH_WRAPPER_PADDING}
  `,
  TopBar,
  Playfield,
};
