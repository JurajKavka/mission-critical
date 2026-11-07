import { rem } from 'polished';
import { useEffect, useRef } from 'react';
import type * as React from 'react';
import styled from 'styled-components';

const BACKSPACE_HOLD_MS = 2000;

const Button = styled.button`
  position: absolute;
  top: ${rem(1)};
  right: ${rem(1)};
  bottom: ${rem(1)};
  width: ${rem(44)};
  padding: 0;
  border: 0;
  background: transparent;
  color: #9db5c8;
  font: inherit;
  font-size: ${rem(20)};
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: #69fbff;
  }

  &:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(-3)};
  }

  &:disabled {
    color: #526879;
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
  const didDeleteAll = useRef(false);
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
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    cancelHold();
    didDeleteAll.current = false;
    if (onDeleteAll) {
      holdTimer.current = setTimeout(() => {
        holdTimer.current = null;
        didDeleteAll.current = true;
        onDeleteAll();
      }, BACKSPACE_HOLD_MS);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (didDeleteAll.current && event.detail !== 0) {
      didDeleteAll.current = false;
    } else {
      didDeleteAll.current = false;
      onClick();
    }
  };

  return (
    <Button
      type="button"
      aria-label="Backspace"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onClick={handleClick}
    >
      <span aria-hidden="true">⌫</span>
    </Button>
  );
};
