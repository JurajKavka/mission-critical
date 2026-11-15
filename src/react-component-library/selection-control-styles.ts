import { rem } from 'polished';
import { styled } from 'styled-components';
import { theme } from './theme';

export const SelectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${rem(8)};
  font-size: ${theme.fontSizes.small};
  font-weight: inherit;
  letter-spacing: normal;
  cursor: pointer;

  > span {
    margin-top: ${rem(2)};
  }
`;

export const SelectionInput = styled.input`
  flex: none;
  width: ${rem(16)};
  height: ${rem(16)};
  margin: 0;
  accent-color: ${theme.colors.cyan};
`;
