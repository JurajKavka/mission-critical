import { theme } from '../../../react-component-library/theme';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { IconButton } from '../../../react-component-library';

export const ZoomButton = styled(IconButton)`
  position: absolute;
  z-index: 1;
  top: ${rem(2)};
  right: 0;
  width: ${rem(44)};
  height: ${rem(44)};
  background: ${theme.colors.mapOverlay};
`;
