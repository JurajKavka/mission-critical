import type * as React from 'react';
import styled from 'styled-components';
import { pixelsToRem } from '../utils/units';

const TooltipSurface = styled.div<{ $left: number; $top: number }>`
  position: fixed;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  z-index: 4;
  max-width: calc(100vw - 16px);
  padding: ${pixelsToRem(8)} ${pixelsToRem(12)};
  border: 1px solid rgba(105, 251, 255, 0.7);
  background: #030d19;
  color: #f4feff;
  font-size: 12px;
  pointer-events: none;
  text-transform: uppercase;
`;

type TooltipProps = {
  name: string;
  left: number;
  top: number;
};

export const Tooltip: React.FC<TooltipProps> = ({ name, left, top }) => (
  <TooltipSurface role="status" $left={left} $top={top}>
    {name}
  </TooltipSurface>
);
