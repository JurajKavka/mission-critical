import { rem } from 'polished';
import { styled } from 'styled-components';
import { theme } from '../../../react-component-library/theme';

export const ResultField = styled.label`
  min-width: 0;
  display: grid;
  gap: ${rem(6)};
  color: ${theme.colors.secondary};
  font-size: ${theme.fontSizes.small};

  input {
    width: 100%;
  }
`;

export const ResultInputRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: ${rem(8)};

  > label {
    flex: 1 1 ${rem(150)};
  }
`;

export const ResultActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${rem(8)} ${rem(16)};
`;

export const ResultShare = styled.div`
  min-width: 0;
  display: grid;
  gap: ${rem(12)};
  padding: ${rem(12)};
  background: ${theme.colors.panelDark};
  border: ${rem(1)} solid ${theme.colors.cyanSubtle};
`;
