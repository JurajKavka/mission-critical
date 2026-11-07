import { useEffect, useRef, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);

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
      focusInput();
    } else if (result.outcome === 'correct') {
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
    focusInput();
  };

  const editAnswer = (text: string, isBackspace: boolean) => {
    const input = inputRef.current;
    const selectedStart = input?.selectionStart ?? answer.length;
    const selectedEnd = input?.selectionEnd ?? answer.length;
    const hasSelection = selectedStart !== selectedEnd;
    const start = hasSelection ? selectedStart : answer.length;
    const end = hasSelection ? selectedEnd : answer.length;
    const edit = editAnswerText(answer, start, end, text, isBackspace);
    setAnswer(edit.value);
    requestAnimationFrame(() => {
      if (input?.isConnected) {
        input.setSelectionRange(input.value.length, input.value.length);
        input.scrollLeft = input.scrollWidth;
      }
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
    const nextUsesNativeKeyboard = !usesNativeKeyboard;
    inputRef.current?.blur();
    flushSync(() => setUsesNativeKeyboard(nextUsesNativeKeyboard));
    focusInput();
    if (!nextUsesNativeKeyboard && inputRef.current) {
      const input = inputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
      input.scrollLeft = input.scrollWidth;
    }
  };

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
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={handlePhysicalKey}
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
