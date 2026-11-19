import { rem } from 'polished';
import { styled } from 'styled-components';
import { BREAKPOINTS } from './media-breakpoints';
import { Card } from './WellcomePanel.styles';

export const WellcomeScreenContentWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  justify-content: start;

  ${Card} {
    flex-shrink: 0;
    margin-top: ${rem(52)};

    @media (max-width: ${rem(BREAKPOINTS.compact)}),
      (max-width: ${rem(BREAKPOINTS.l)}) and (pointer: coarse) {
      margin-top: clamp(${rem(8)}, calc(10dvh - ${rem(36)}), ${rem(36)});
    }
  }
`;
