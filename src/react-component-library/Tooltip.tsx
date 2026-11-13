import { theme } from './theme';
import { rem } from 'polished';
import { useLayoutEffect, useRef, useState } from 'react';
import type * as React from 'react';
import { styled } from 'styled-components';
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
  max-width: calc(100vw - ${rem(16)});
  box-sizing: border-box;
  overflow-wrap: anywhere;
  padding: ${rem(8)} ${rem(12)};
  border: ${rem(1)} solid ${theme.colors.focusBorder};
  background: ${theme.colors.noticeSurface};
  color: ${theme.colors.text};
  font-size: ${rem(12)};
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
