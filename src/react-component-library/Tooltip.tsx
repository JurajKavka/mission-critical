import { useLayoutEffect, useRef, useState } from 'react';
import type * as React from 'react';
import styled from 'styled-components';
import { pixelsToRem } from '../utils/units';
import { getTooltipPosition } from './tooltip-position';

const TooltipSurface = styled.div<{
  $left: number;
  $top: number;
  $isPositioned: boolean;
}>`
  position: fixed;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  visibility: ${({ $isPositioned }) => ($isPositioned ? 'visible' : 'hidden')};
  z-index: 4;
  width: max-content;
  max-width: calc(100vw - 16px);
  box-sizing: border-box;
  overflow-wrap: anywhere;
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

export const Tooltip: React.FC<TooltipProps> = ({ name, left, top }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    anchorLeft: number;
    anchorTop: number;
    name: string;
  } | null>(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      const bounds = tooltipRef.current?.getBoundingClientRect();
      if (!bounds) {
        return;
      }
      setPosition({
        ...getTooltipPosition(
          { left, top },
          { width: bounds.width, height: bounds.height },
          { width: window.innerWidth, height: window.innerHeight },
        ),
        anchorLeft: left,
        anchorTop: top,
        name,
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [left, top, name]);

  return (
    <TooltipSurface
      ref={tooltipRef}
      role="status"
      $left={position?.left ?? 0}
      $top={position?.top ?? 0}
      $isPositioned={
        position?.anchorLeft === left &&
        position.anchorTop === top &&
        position.name === name
      }
    >
      {name}
    </TooltipSurface>
  );
};
