import { theme } from './theme';
import { rem } from 'polished';
import * as React from 'react';
import { styled } from 'styled-components';
import { AsciiKeyboardKey, COMPACT_KEYBOARD_QUERY } from './AsciiKeyboardKey';

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

const NativeToggle = styled.button`
  justify-self: end;
  min-height: ${rem(32)};
  padding: ${rem(4)} 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.secondary};
  font: inherit;
  font-size: ${rem(11)};
  text-decoration: underline;

  &:focus-visible {
    outline: ${rem(2)} solid ${theme.colors.cyan};
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
  disabled?: boolean;
};

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

const KEY_LABELS = {
  Space: 'Space',
  Enter: (
    <>
      Enter{' '}
      <span aria-hidden="true" style={{ marginBottom: rem(4) }}>
        ↵
      </span>
    </>
  ),
  Skip: (
    <>
      Skip <span aria-hidden="true">→</span>
    </>
  ),
};

const _AsciiKeyboard: React.FC<AsciiKeyboardProps> = ({
  onKey,
  onToggleNative,
  usesNativeKeyboard,
  disabled = false,
}) => {
  return (
    <Keyboard role="group" aria-label="On-screen keyboard">
      {ROWS.map((row) => (
        <KeyRow key={row}>
          {Array.from(row).map((letter) => (
            <AsciiKeyboardKey key={letter} keyValue={letter} disabled={disabled} onKey={onKey}>
              {letter}
            </AsciiKeyboardKey>
          ))}
        </KeyRow>
      ))}
      <KeyRow>
        {(['Skip', 'Space', 'Enter'] as const).map((key) => (
          <AsciiKeyboardKey
            key={key}
            keyValue={key}
            isCommandKey
            disabled={disabled}
            onKey={onKey}
          >
            {KEY_LABELS[key]}
          </AsciiKeyboardKey>
        ))}
      </KeyRow>
      <NativeToggle type="button" onClick={onToggleNative} disabled={disabled}>
        {usesNativeKeyboard ? 'Use on-screen keyboard' : 'Use native keyboard'}
      </NativeToggle>
    </Keyboard>
  );
};

export const AsciiKeyboard = React.memo(_AsciiKeyboard);
