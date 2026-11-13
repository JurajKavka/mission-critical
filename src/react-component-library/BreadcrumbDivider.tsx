import type * as React from 'react';
import { styled } from 'styled-components';
import { theme } from './theme';

const Divider = styled.span`
  color: ${theme.colors.magenta};
`;

export const BreadcrumbDivider: React.FC = () => (
  <Divider aria-hidden="true">//</Divider>
);
