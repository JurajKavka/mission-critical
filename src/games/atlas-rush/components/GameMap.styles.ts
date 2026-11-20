import { theme } from '../../../react-component-library/theme';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { IconButton } from '../../../react-component-library';

export const ZoomControls = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  display: flex;
  gap: ${rem(8)};
`;

export const ZoomButton = styled(IconButton)`
  background: ${theme.colors.mapOverlay};
`;
