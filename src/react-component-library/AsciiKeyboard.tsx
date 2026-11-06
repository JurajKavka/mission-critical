import { rem } from 'polished';
import type * as React from 'react';
import styled from 'styled-components';

const Keyboard = styled.div`
  display: grid;
  gap: ${rem(4)};

  @media (pointer: coarse) and (max-width: ${rem(1024)}) and (max-height: ${rem(360)}) {
    gap: ${rem(3)};
  }
`;

const KeyRow = styled.div`
  display: flex;
  justify-content: center;
  gap: ${rem(4)};

  @media (pointer: coarse) and (max-width: ${rem(1024)}) and (max-height: ${rem(360)}) {
    gap: ${rem(3)};
  }
`;

const Key = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${rem(8)};
  flex: 1 1 0;
  min-width: 0;
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

  @media (pointer: coarse) and (max-width: ${rem(1024)}) and (max-height: ${rem(360)}) {
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

  @media (pointer: coarse) and (max-width: ${rem(1024)}) and (max-height: ${rem(360)}) {
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

const getKeyLabel = (key: 'Space' | 'Backspace' | 'Enter' | 'Skip') => {
  if (key === 'Backspace') {
    return (
      <>
        Bksp <span aria-hidden="true">⌫</span>
      </>
    );
  } else if (key === 'Enter') {
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

export const AsciiKeyboard: React.FC<AsciiKeyboardProps> = ({
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
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onKey(letter)}
            aria-label={letter}
          >
            {letter}
          </Key>
        ))}
      </KeyRow>
    ))}
    <KeyRow>
      {(['Space', 'Backspace', 'Skip', 'Enter'] as const).map((key) => (
        <Key
          key={key}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
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
