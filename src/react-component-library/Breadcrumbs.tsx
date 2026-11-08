import { rem } from 'polished';
import { styled } from 'styled-components';
import { mb } from './media-breakpoints';
import { ATLAS_THEME } from './theme';

export const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: ${rem(8)};
  color: ${ATLAS_THEME.colors.cyan};
  font-size: ${ATLAS_THEME.fontSizes.small};
  font-weight: ${ATLAS_THEME.fontWeights.heavy};
  letter-spacing: 0.25em;
  text-transform: uppercase;

  span {
    flex: 0 0 auto;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  ${mb('compact', { max: true })} {
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.12em;
  }
  ${mb('l', { max: true, pointer: 'coarse', maxHeight: 'landscape', orientation: 'landscape' })} {
    font-size: ${ATLAS_THEME.fontSizes.caption};
    letter-spacing: 0.12em;
  }
`;
