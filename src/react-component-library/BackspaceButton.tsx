import { theme } from './theme';
import { rem } from 'polished';
import { useEffect, useRef } from 'react';
import type * as React from 'react';
import { styled } from 'styled-components';

const BACKSPACE_HOLD_MS = 750;

const Button = styled.button`
  position: absolute;
  top: ${rem(1)};
  right: ${rem(1)};
  bottom: ${rem(1)};
  width: ${rem(44)};
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.secondary};
  font: inherit;
  font-size: ${rem(20)};
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-touch-callout: none;

  &:focus-visible {
    outline: none;
    border: none;
  }

  &:disabled {
    color: ${theme.colors['blue-526879']};
    cursor: default;
  }
`;

type BackspaceButtonProps = {
  onClick: () => void;
  onDeleteAll?: () => void;
  disabled?: boolean;
};

export const BackspaceButton: React.FC<BackspaceButtonProps> = ({
  onClick,
  onDeleteAll,
  disabled,
}) => {
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHold = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  useEffect(() => {
    if (disabled) {
      cancelHold();
    }
    return cancelHold;
  }, [disabled]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!onDeleteAll) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    cancelHold();
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      onDeleteAll();
    }, BACKSPACE_HOLD_MS);
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <Button
      type="button"
      aria-label="Backspace"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerCancel={cancelHold}
      onLostPointerCapture={cancelHold}
      onContextMenu={(event) => event.preventDefault()}
      onClick={handleClick}
    >
      <span aria-hidden="true">⌫</span>
    </Button>
  );
};
