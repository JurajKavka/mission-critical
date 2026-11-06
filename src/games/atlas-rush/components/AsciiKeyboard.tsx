import type * as React from 'react';
import styles from './AtlasRush.module.css';

export type AsciiKey = 'Backspace' | 'Enter' | 'Skip' | 'Space' | string;

type AsciiKeyboardProps = {
  onKey: (key: AsciiKey) => void;
  onToggleNative: () => void;
  usesNativeKeyboard: boolean;
};

const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export const AsciiKeyboard: React.FC<AsciiKeyboardProps> = ({
  onKey,
  onToggleNative,
  usesNativeKeyboard,
}) => (
  <div className={styles.keyboard} role="group" aria-label="On-screen keyboard">
    {rows.map((row) => (
      <div key={row} className={styles.keyRow}>
        {Array.from(row).map((letter) => (
          <button
            key={letter}
            type="button"
            className={styles.key}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onKey(letter)}
            aria-label={letter}
          >
            {letter}
          </button>
        ))}
      </div>
    ))}
    <div className={styles.keyRow}>
      {(['Space', 'Backspace', 'Enter', 'Skip'] as const).map((key) => (
        <button
          key={key}
          type="button"
          className={styles.key}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onKey(key)}
        >
          {key}
        </button>
      ))}
    </div>
    <button
      type="button"
      className={styles.nativeToggle}
      onClick={onToggleNative}
    >
      {usesNativeKeyboard ? 'Use on-screen keyboard' : 'Use native keyboard'}
    </button>
  </div>
);
