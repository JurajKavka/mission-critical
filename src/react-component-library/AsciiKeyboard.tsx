import { rem } from 'polished';
import * as React from 'react';
import styled from 'styled-components';

const COMPACT_KEYBOARD_QUERY =
  '(pointer: coarse) and (max-width: 1024px) and (max-height: 360px)';

const Keyboard = styled.div`
  display: grid;
  align-content: start;
  gap: ${rem(4)};
  min-width: 0;
  min-height: 0;
  padding: ${rem(2)};
  overflow: auto;
  overscroll-behavior: contain;

  @media ${COMPACT_KEYBOARD_QUERY} {
    gap: ${rem(3)};
  }
`;

const KeyRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${rem(4)};

  @media ${COMPACT_KEYBOARD_QUERY} {
    gap: ${rem(3)};
  }
`;

const Key = styled.button<{ $isCommandKey?: boolean; $isSpaceKey?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${rem(8)};
  flex: ${({ $isSpaceKey }) => ($isSpaceKey ? '2 1 0' : '1 1 0')};
  min-width: ${({ $isCommandKey }) => ($isCommandKey ? 'max-content' : '1.5em')};
  min-height: ${rem(44)};
  padding: ${rem(4)};
  border: ${rem(1)} solid rgba(105, 251, 255, 0.38);
  background: #071827;
  color: #f4feff;
  font: inherit;
  font-size: clamp(${rem(11)}, 2.8vw, ${rem(14)});
  font-weight: 700;
  touch-action: manipulation;

  &:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(1)};
  }

  &:active {
    background: rgba(31, 142, 161, 0.55);
  }

  @media ${COMPACT_KEYBOARD_QUERY} {
    min-height: ${rem(36)};
  }
`;

const NativeToggle = styled.button`
  justify-self: end;
  min-height: ${rem(32)};
  padding: ${rem(4)} 0;
  border: 0;
  background: transparent;
  color: #9db5c8;
  font: inherit;
  font-size: ${rem(11)};
  text-decoration: underline;

  &:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(1)};
  }

  @media ${COMPACT_KEYBOARD_QUERY} {
    min-height: ${rem(28)};
  }
`;

export type AsciiKey = 'Backspace' | 'Enter' | 'Skip' | 'Space' | string;

type AsciiKeyboardProps = {
  onKey: (key: AsciiKey) => void;
  onToggleNative: () => void;
  usesNativeKeyboard: boolean;
};

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const handleKeyMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

const getKeyLabel = (key: 'Space' | 'Enter' | 'Skip') => {
  if (key === 'Enter') {
    return (
      <>
        Enter{' '}
        <span aria-hidden="true" style={{ marginBottom: rem(4) }}>
          ↵
        </span>
      </>
    );
  } else if (key === 'Skip') {
    return (
      <>
        Skip <span aria-hidden="true">→</span>
      </>
    );
  }
  return key;
};

const _AsciiKeyboard: React.FC<AsciiKeyboardProps> = ({
  onKey,
  onToggleNative,
  usesNativeKeyboard,
}) => (
  <Keyboard role="group" aria-label="On-screen keyboard">
    {ROWS.map((row) => (
      <KeyRow key={row}>
        {Array.from(row).map((letter) => (
          <Key
            key={letter}
            type="button"
            onMouseDown={handleKeyMouseDown}
            onClick={() => onKey(letter)}
            aria-label={letter}
          >
            {letter}
          </Key>
        ))}
      </KeyRow>
    ))}
    <KeyRow>
      {(['Skip', 'Space', 'Enter'] as const).map((key) => (
        <Key
          key={key}
          $isCommandKey
          $isSpaceKey={key === 'Space'}
          type="button"
          onMouseDown={handleKeyMouseDown}
          onClick={() => onKey(key)}
          aria-label={key}
        >
          {getKeyLabel(key)}
        </Key>
      ))}
    </KeyRow>
    <NativeToggle type="button" onClick={onToggleNative}>
      {usesNativeKeyboard ? 'Use on-screen keyboard' : 'Use native keyboard'}
    </NativeToggle>
  </Keyboard>
);

export const AsciiKeyboard = React.memo(_AsciiKeyboard);
