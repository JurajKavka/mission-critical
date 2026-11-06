import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useStore } from 'zustand';
import type * as React from 'react';
import { regionTargets } from '../data/targets';
import { getCommandIndex } from '../domain/session';
import { AsciiKeyboard } from './AsciiKeyboard';
import { editAnswerText } from './answer-edit';
import type { AsciiKey } from './AsciiKeyboard';
import styles from './AtlasRush.module.css';
import type { AtlasRushStore } from './types';

const MOBILE_KEYBOARD_QUERY = '(pointer: coarse) and (max-width: 1024px)';

type AnswerInputProps = {
  store: AtlasRushStore;
  phase: string;
  targetName: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export const AnswerInput: React.FC<AnswerInputProps> = ({
  store,
  phase,
  targetName,
  inputRef,
}) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);
  const commandIndex = useStore(store, (state) =>
    getCommandIndex(state.session),
  );
  const totalTargets =
    regionTargets[store.getState().session.config.regionId].length;
  const previousPhase = useRef(phase);
  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  useEffect(() => {
    const media = window.matchMedia(MOBILE_KEYBOARD_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (phase === 'ready') {
      setAnswer('');
      setFeedback('');
    }
    if (phase === 'playing' && previousPhase.current !== 'playing') {
      inputRef.current?.focus({ preventScroll: true });
    }
    previousPhase.current = phase;
  }, [phase, inputRef]);

  const submit = () => {
    if (answer.length === 0) {
      focusInput();
      return;
    }
    const result = store.getState().submitGuess(answer);
    if (result.outcome === 'incorrect') {
      setFeedback(`Not a match. Try again or skip this ${targetName}.`);
      inputRef.current?.select();
    } else if (result.outcome === 'correct') {
      setFeedback('');
      setAnswer('');
      focusInput();
    }
  };
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };
  const handleSkip = () => {
    store.getState().skipCountry();
    setAnswer('');
    setFeedback('');
    focusInput();
  };

  const editAnswer = (text: string, isBackspace: boolean) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? answer.length;
    const end = input?.selectionEnd ?? answer.length;
    const edit = editAnswerText(answer, start, end, text, isBackspace);
    setAnswer(edit.value);
    requestAnimationFrame(() => {
      input?.setSelectionRange(edit.caret, edit.caret);
    });
  };

  const handleKey = (key: AsciiKey) => {
    switch (key) {
      case 'Enter':
        submit();
        break;
      case 'Skip':
        handleSkip();
        break;
      case 'Backspace':
        editAnswer('', true);
        break;
      case 'Space':
        editAnswer(' ', false);
        break;
      default:
        editAnswer(key, false);
    }
  };

  const handlePhysicalKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !isMobile ||
      usesNativeKeyboard ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    if (event.key === 'Backspace' || event.key === 'Enter') {
      event.preventDefault();
      handleKey(event.key);
    } else if (event.key.length === 1) {
      event.preventDefault();
      editAnswer(event.key, false);
    }
  };

  const toggleNativeKeyboard = () => {
    inputRef.current?.blur();
    flushSync(() => setUsesNativeKeyboard(!usesNativeKeyboard));
    focusInput();
  };

  return (
    <footer className={styles.command}>
      <div className={styles.commandIndex}>
        Target {String(commandIndex).padStart(2, '0')} / {totalTargets}
      </div>
      {phase === 'playing' && isMobile && (
        <AsciiKeyboard
          onKey={handleKey}
          onToggleNative={toggleNativeKeyboard}
          usesNativeKeyboard={usesNativeKeyboard}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className={`${styles.answerForm} ${isMobile ? styles.mobileAnswerForm : ''}`}
        autoComplete="off"
      >
        <label className={styles.srOnly} htmlFor="answer">
          {targetName} name
        </label>
        <input
          ref={inputRef}
          id="answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={handlePhysicalKey}
          placeholder={`Enter ${targetName} name in English`}
          aria-describedby={
            isMobile && !usesNativeKeyboard
              ? 'feedback keyboard-help'
              : 'feedback'
          }
          required
          disabled={phase !== 'playing'}
          readOnly={isMobile && !usesNativeKeyboard}
          inputMode={isMobile && !usesNativeKeyboard ? 'none' : 'text'}
        />
        <button
          className={styles.primaryButton}
          type="submit"
          disabled={phase !== 'playing'}
        >
          Identify ↗
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={handleSkip}
          disabled={phase !== 'playing'}
        >
          Skip →
        </button>
      </form>
      {isMobile && !usesNativeKeyboard && (
        <p id="keyboard-help" className={styles.srOnly}>
          Use the on-screen keyboard or a connected physical keyboard to enter
          an answer. Select Use native keyboard to type with your device
          keyboard.
        </p>
      )}
      <p id="feedback" className={styles.feedback} aria-live="polite">
        {feedback ||
          `Type a name, then press Enter. Skip to return to a ${targetName} later.`}
      </p>
    </footer>
  );
};
