import { rem } from 'polished';
import * as React from 'react';
import { styled } from 'styled-components';
import { theme } from './theme';
import type { AsciiKey } from './AsciiKeyboard';

export const COMPACT_KEYBOARD_QUERY =
  '(pointer: coarse) and (max-width: 1024px) and (max-height: 360px)';

const Button = styled.button<{
  $isCommandKey: boolean;
  $isSpaceKey: boolean;
  $isPressed: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${rem(8)};
  flex: ${({ $isSpaceKey }) => ($isSpaceKey ? '3 1 0' : '1 1 0')};
  min-width: ${({ $isCommandKey }) => ($isCommandKey ? 'max-content' : '1.5em')};
  min-height: ${rem(44)};
  padding: ${rem(4)};
  border: ${rem(1)} solid ${theme.colors.keyboardBorder};
  background: ${({ $isPressed }) =>
    $isPressed ? theme.colors.keyboardHover : theme.colors['nebula-blue']};
  color: ${theme.colors.text};
  font: inherit;
  font-size: clamp(${rem(11)}, 2.8vw, ${rem(14)});
  font-weight: 700;
  touch-action: manipulation;
  user-select: none;
  -webkit-touch-callout: none;

  &:focus-visible {
    outline: ${rem(2)} solid ${theme.colors.cyan};
    outline-offset: ${rem(1)};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }

  @media ${COMPACT_KEYBOARD_QUERY} {
    min-height: ${rem(36)};
  }
`;

type AsciiKeyboardKeyProps = {
  keyValue: AsciiKey;
  onKey: (key: AsciiKey) => void;
  disabled?: boolean;
  isCommandKey?: boolean;
  children: React.ReactNode;
};

const AsciiKeyboardKeyComponent: React.FC<AsciiKeyboardKeyProps> = ({
  keyValue,
  onKey,
  disabled = false,
  isCommandKey = false,
  children,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePointerDown = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setIsPressed(true);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      setIsPressed(false);
    }
  };

  const handleClick = () => {
    onKey(keyValue);
  };

  return (
    <Button
      type="button"
      aria-label={keyValue}
      disabled={disabled}
      $isCommandKey={isCommandKey}
      $isSpaceKey={keyValue === 'Space'}
      $isPressed={isPressed && !disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePressEnd}
      onPointerCancel={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onLostPointerCapture={handlePressEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handlePressEnd}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
};

export const AsciiKeyboardKey = React.memo(AsciiKeyboardKeyComponent);
