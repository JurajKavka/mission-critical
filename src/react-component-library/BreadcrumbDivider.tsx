import type * as React from 'react';
import { styled } from 'styled-components';
import { ATLAS_THEME } from './theme';

const Divider = styled.span`
  color: ${ATLAS_THEME.colors.magenta};
`;

export const BreadcrumbDivider: React.FC = () => (
  <Divider aria-hidden="true">//</Divider>
);
