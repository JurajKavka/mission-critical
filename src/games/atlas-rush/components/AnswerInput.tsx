import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type * as React from 'react';
import {
  ActionButton,
  AnswerTextInput,
  AsciiKeyboard,
  SkipButton,
} from '../../../react-component-library';
import type { AsciiKey } from '../../../react-component-library';
import { editAnswerText } from './answer-edit';
import * as UI from './atlas-styles';
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
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);

  const previousPhase = useRef(phase);
  const focusInput = useCallback(
    () => inputRef.current?.focus({ preventScroll: true }),
    [inputRef],
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_KEYBOARD_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMobile || usesNativeKeyboard) {
      return;
    }
    const handleResize = () => {
      const input = inputRef.current;
      if (input) {
        input.scrollLeft = input.scrollWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [inputRef, isMobile, usesNativeKeyboard]);

  useEffect(() => {
    if (phase === 'ready') {
      setAnswer('');
      setIsIncorrect(false);
    }
    if (phase === 'playing' && previousPhase.current !== 'playing') {
      inputRef.current?.focus({ preventScroll: true });
    }
    previousPhase.current = phase;
  }, [phase, inputRef]);

  const submit = useCallback(() => {
    const answer = inputRef.current?.value ?? '';
    if (answer.length === 0) {
      focusInput();
      return;
    }
    const result = store.getState().submitGuess(answer);
    if (result.outcome === 'incorrect') {
      setIsIncorrect(true);
      focusInput();
    } else if (result.outcome === 'correct') {
      setAnswer('');
      setIsIncorrect(false);
      focusInput();
    }
  }, [focusInput, inputRef, store]);
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };
  const handleSkip = useCallback(() => {
    store.getState().skipCountry();
    setAnswer('');
    setIsIncorrect(false);
    focusInput();
  }, [focusInput, store]);

  const editAnswer = useCallback(
    (text: string, isBackspace: boolean, useCaret = false) => {
      const input = inputRef.current;
      const answer = input?.value ?? '';
      const selectedStart = input?.selectionStart ?? answer.length;
      const selectedEnd = input?.selectionEnd ?? answer.length;
      const hasSelection = selectedStart !== selectedEnd;
      const start = hasSelection || useCaret ? selectedStart : answer.length;
      const end = hasSelection || useCaret ? selectedEnd : answer.length;
      const edit = editAnswerText(answer, start, end, text, isBackspace);
      setAnswer(edit.value);
      requestAnimationFrame(() => {
        if (input?.isConnected) {
          const caret = useCaret ? edit.caret : input.value.length;
          input.setSelectionRange(caret, caret);
          input.scrollLeft = input.scrollWidth;
        }
      });
    },
    [inputRef],
  );

  const handleKey = useCallback(
    (key: AsciiKey) => {
      setIsIncorrect(false);
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
    },
    [editAnswer, handleSkip, submit],
  );

  const handlePhysicalKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setIsIncorrect(false);
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

  const toggleNativeKeyboard = useCallback(() => {
    const nextUsesNativeKeyboard = !usesNativeKeyboard;
    inputRef.current?.blur();
    flushSync(() => setUsesNativeKeyboard(nextUsesNativeKeyboard));
    focusInput();
    if (!nextUsesNativeKeyboard && inputRef.current) {
      const input = inputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
      input.scrollLeft = input.scrollWidth;
    }
  }, [focusInput, inputRef, usesNativeKeyboard]);

  return (
    <UI.Command>
      <UI.AnswerForm
        onSubmit={handleSubmit}
        data-mobile={isMobile}
        autoComplete="off"
      >
        <UI.ScreenReaderOnly as="label" htmlFor="answer">
          {targetName} name
        </UI.ScreenReaderOnly>
        <AnswerTextInput
          key={usesNativeKeyboard ? 'native' : 'on-screen'}
          ref={inputRef}
          id="answer"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setIsIncorrect(false);
          }}
          onKeyDown={handlePhysicalKey}
          onClick={() => setIsIncorrect(false)}
          onBackspace={() => {
            setIsIncorrect(false);
            editAnswer('', true, true);
          }}
          onClear={() => {
            setIsIncorrect(false);
            setAnswer('');
          }}
          isInvalid={isIncorrect}
          placeholder={`Enter ${targetName} name in English`}
          feedbackId="feedback"
          keyboardHelpId="keyboard-help"
          isUsingCustomKeyboard={isMobile && !usesNativeKeyboard}
          required
          disabled={phase !== 'playing'}
        />
        <ActionButton
          label="Identify"
          type="submit"
          disabled={phase !== 'playing'}
        />
        <SkipButton onClick={handleSkip} disabled={phase !== 'playing'} />
      </UI.AnswerForm>
      <UI.ScreenReaderOnly as="p" id="feedback" aria-live="polite">
        {isIncorrect ? 'Incorrect answer. Try again.' : ''}
      </UI.ScreenReaderOnly>
      {phase === 'playing' && isMobile && (
        <AsciiKeyboard
          onKey={handleKey}
          onToggleNative={toggleNativeKeyboard}
          usesNativeKeyboard={usesNativeKeyboard}
        />
      )}
      {isMobile && !usesNativeKeyboard && (
        <UI.ScreenReaderOnly as="p" id="keyboard-help">
          Use the on-screen keyboard or a connected physical keyboard to enter
          an answer. Select Use native keyboard to type with your device
          keyboard.
        </UI.ScreenReaderOnly>
      )}
    </UI.Command>
  );
};
