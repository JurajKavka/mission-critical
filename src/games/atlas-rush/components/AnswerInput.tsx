import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type * as React from 'react';
import { useStore } from 'zustand';
import {
  AnswerTextInput,
  AsciiKeyboard,
  SkipButton,
} from '../../../react-component-library';
import type { AsciiKey } from '../../../react-component-library';
import { regionTargets } from '../data/targets';
import { getMatchedTargetName } from '../domain/answers';
import type { AnswerComparison, GamePhase } from '../domain/types';
import { useAnswerCompletion } from '../hooks/useAnswerCompletion';
import { selectConfig } from '../state/selectors';
import { getAnswerCompletionSuffix } from './answer-completion';
import { editAnswerText } from './answer-edit';
import * as UI from '../../../react-component-library/atlas-styles';
import type { AtlasRushStore } from './types';

const MOBILE_KEYBOARD_QUERY = '(pointer: coarse) and (max-width: 1024px)';

const getAnswerHint = (comparison: AnswerComparison | undefined): string => {
  if (comparison?.mode === 'prefix') {
    return `Speed mode / First ${comparison.minimumCharacters} letters auto-identify.`;
  }
  return 'Full names auto-identify. Enter to check an answer.';
};

const getAnswerFeedback = (
  hint: string,
  identifiedName: string,
  isIncorrect: boolean,
): string => {
  if (isIncorrect) {
    return 'Incorrect answer. Try again.';
  } else if (identifiedName) {
    return `${identifiedName} identified.`;
  }
  return hint;
};

type AnswerInputProps = {
  store: AtlasRushStore;
  phase: GamePhase;
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
  const [identifiedName, setIdentifiedName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [usesNativeKeyboard, setUsesNativeKeyboard] = useState(false);
  const { completionValue, isCompleting, startCompletion } =
    useAnswerCompletion(phase);

  const previousPhase = useRef(phase);
  const previousIsCompleting = useRef(false);
  const isComposing = useRef(false);
  const compositionFrame = useRef<number | null>(null);
  const config = useStore(store, selectConfig);
  const answerHint = getAnswerHint(config.answerComparison);
  const feedback = getAnswerFeedback(answerHint, identifiedName, isIncorrect);
  const focusInput = useCallback(
    () => inputRef.current?.focus({ preventScroll: true }),
    [inputRef],
  );

  useEffect(() => {
    if (previousIsCompleting.current && !isCompleting && phase === 'playing') {
      focusInput();
    }
    previousIsCompleting.current = isCompleting;
  }, [focusInput, isCompleting, phase]);

  useEffect(() => {
    if (completionValue !== null && inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [completionValue, inputRef]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_KEYBOARD_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    return () => {
      if (compositionFrame.current !== null) {
        cancelAnimationFrame(compositionFrame.current);
      }
    };
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
      setIdentifiedName('');
    }
    if (phase === 'playing' && previousPhase.current !== 'playing') {
      inputRef.current?.focus({ preventScroll: true });
    }
    previousPhase.current = phase;
  }, [phase, inputRef]);

  const identifyAnswer = useCallback(
    (nextAnswer: string, isAutomatic: boolean) => {
      if (nextAnswer.length === 0 || isComposing.current) {
        return;
      }
      const state = store.getState();
      const result = state.submitGuess(nextAnswer);
      if (result.outcome === 'incorrect' && !isAutomatic) {
        setIsIncorrect(true);
        focusInput();
      } else if (result.outcome === 'correct') {
        const target = regionTargets[state.session.config.regionId].find(
          (candidate) => candidate.id === result.targetId,
        );
        setIdentifiedName(target?.name ?? 'Country');
        setAnswer('');
        setIsIncorrect(false);
        focusInput();
      }
    },
    [focusInput, store],
  );
  const submitAnswer = useCallback(
    (nextAnswer: string, isAutomatic: boolean) => {
      if (isCompleting || isComposing.current || nextAnswer.length === 0) {
        return;
      }
      const { session } = store.getState();
      if (
        session.phase === 'playing' &&
        session.config.answerComparison?.mode === 'prefix'
      ) {
        const target = regionTargets[session.config.regionId].find(
          (candidate) => candidate.id === session.remainingIds[0],
        );
        const matchedName = target
          ? getMatchedTargetName(
              target,
              nextAnswer,
              session.config.answerComparison,
            )
          : null;
        const suffix = matchedName
          ? getAnswerCompletionSuffix(nextAnswer, matchedName)
          : '';
        if (target && suffix) {
          startCompletion(nextAnswer, suffix, () => {
            const current = store.getState().session;
            if (
              current.phase === 'playing' &&
              current.remainingIds[0] === target.id &&
              current.config === session.config
            ) {
              identifyAnswer(nextAnswer, isAutomatic);
            }
          });
          return;
        }
      }
      identifyAnswer(nextAnswer, isAutomatic);
    },
    [identifyAnswer, isCompleting, startCompletion, store],
  );
  const updateAnswer = useCallback(
    (nextAnswer: string) => {
      if (isCompleting) {
        return;
      }
      setAnswer(nextAnswer);
      setIsIncorrect(false);
      setIdentifiedName('');
      submitAnswer(nextAnswer, true);
    },
    [isCompleting, submitAnswer],
  );
  const submit = useCallback(() => {
    submitAnswer(inputRef.current?.value ?? '', false);
    focusInput();
  }, [focusInput, inputRef, submitAnswer]);
  const handleCompositionStart = () => {
    if (compositionFrame.current !== null) {
      cancelAnimationFrame(compositionFrame.current);
      compositionFrame.current = null;
    }
    isComposing.current = true;
  };
  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    // Commit once after the browser's final composition/input events settle.
    compositionFrame.current = requestAnimationFrame(() => {
      compositionFrame.current = null;
      isComposing.current = false;
      if (input.isConnected && input === inputRef.current) {
        updateAnswer(input.value);
      }
    });
  };
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };
  const handleSkip = useCallback(() => {
    if (isCompleting) {
      return;
    }
    store.getState().skipCountry();
    setAnswer('');
    setIsIncorrect(false);
    setIdentifiedName('');
    focusInput();
  }, [focusInput, isCompleting, store]);

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
      updateAnswer(edit.value);
      requestAnimationFrame(() => {
        if (input?.isConnected) {
          const caret = useCaret ? edit.caret : input.value.length;
          input.setSelectionRange(caret, caret);
          input.scrollLeft = input.scrollWidth;
        }
      });
    },
    [inputRef, updateAnswer],
  );

  const handleKey = useCallback(
    (key: AsciiKey) => {
      if (isCompleting) {
        return;
      }
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
    [editAnswer, handleSkip, isCompleting, submit],
  );

  const handlePhysicalKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }
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
        aria-busy={isCompleting || undefined}
      >
        <UI.ScreenReaderOnly as="label" htmlFor="answer">
          {targetName} name
        </UI.ScreenReaderOnly>
        <AnswerTextInput
          key={usesNativeKeyboard ? 'native' : 'on-screen'}
          ref={inputRef}
          id="answer"
          value={completionValue ?? answer}
          onChange={(event) => {
            updateAnswer(event.target.value);
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handlePhysicalKey}
          onClick={() => setIsIncorrect(false)}
          onBackspace={() => {
            setIsIncorrect(false);
            editAnswer('', true, true);
          }}
          onClear={() => {
            updateAnswer('');
          }}
          isInvalid={isIncorrect}
          placeholder={`Enter ${targetName} name in English`}
          feedbackId="feedback"
          keyboardHelpId="keyboard-help"
          isUsingCustomKeyboard={isMobile && !usesNativeKeyboard}
          required
          disabled={phase !== 'playing' || isCompleting}
        />
        <SkipButton
          onClick={handleSkip}
          disabled={phase !== 'playing' || isCompleting}
        />
      </UI.AnswerForm>
      <UI.AnswerHint id="feedback" aria-live="polite">
        {feedback}
      </UI.AnswerHint>
      {phase === 'playing' && isMobile && (
        <AsciiKeyboard
          onKey={handleKey}
          onToggleNative={toggleNativeKeyboard}
          usesNativeKeyboard={usesNativeKeyboard}
          disabled={isCompleting}
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
