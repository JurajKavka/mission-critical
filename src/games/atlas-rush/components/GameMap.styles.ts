import { theme } from '../../../react-component-library/theme';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { IconButton, mb } from '../../../react-component-library';

export const ZoomButton = styled(IconButton)`
  position: absolute;
  z-index: 1;
  top: ${rem(10)};
  right: 0;
  background: ${theme.colors.mapOverlay};

  ${mb('l', { max: true, pointer: 'coarse' })} {
    margin-right: ${rem(8)};
  }
`;
