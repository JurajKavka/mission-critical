import { theme } from '../../../react-component-library/theme';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { IconButton, mb } from '../../../react-component-library';

export const ZoomControls = styled.div`
  position: absolute;
  z-index: 1;
  top: ${rem(3)};
  right: 0;
  display: flex;
  gap: ${rem(8)};

  ${mb('compact', { max: true })} {
    top: ${rem(5)};
  }
 
`;

export const ZoomButton = styled(IconButton)`
  background: ${theme.colors.mapOverlay};
`;
