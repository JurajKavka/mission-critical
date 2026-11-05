import { useEffect, useRef, useState } from 'react';
import type * as React from 'react';
import styles from './AtlasRush.module.css';
import type { AtlasRushStore } from './types';

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
  const previousPhase = useRef(phase);
  useEffect(() => {
    if (phase === 'ready') {
      setAnswer('');
      setFeedback('');
    }
    if (phase === 'playing' && previousPhase.current !== 'playing') {
      inputRef.current?.focus();
    }
    previousPhase.current = phase;
  }, [phase, inputRef]);
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = store.getState().submitGuess(answer);
    if (result.outcome === 'incorrect') {
      setFeedback(`Not a match. Try again or skip this ${targetName}.`);
      inputRef.current?.select();
    } else if (result.outcome === 'correct') {
      setFeedback('');
      setAnswer('');
      inputRef.current?.focus();
    }
  };
  const handleSkip = () => {
    store.getState().skipCountry();
    setAnswer('');
    setFeedback('');
    inputRef.current?.focus();
  };
  return (
    <footer className={styles.command}>
      <form
        onSubmit={handleSubmit}
        className={styles.answerForm}
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
          placeholder={`Enter ${targetName} name in English`}
          aria-describedby="feedback"
          required
          disabled={phase !== 'playing'}
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
      <p id="feedback" className={styles.feedback} aria-live="polite">
        {feedback ||
          `Type a name, then press Enter. Skip to return to a ${targetName} later.`}
      </p>
    </footer>
  );
};
