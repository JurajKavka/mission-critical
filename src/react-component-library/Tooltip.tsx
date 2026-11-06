import type * as React from 'react';
import styled from 'styled-components';
import { pixelsToRem } from '../utils/units';

const TooltipSurface = styled.div`
  position: fixed;
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
  x: number;
  y: number;
};

export const Tooltip: React.FC<TooltipProps> = ({ name, x, y }) => (
  <TooltipSurface role="status" style={{ left: x, top: y }}>
    {name}
  </TooltipSurface>
);
