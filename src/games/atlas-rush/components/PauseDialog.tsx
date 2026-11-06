import { useEffect, useRef } from 'react';
import type * as React from 'react';
import styles from './AtlasRush.module.css';
import type { AtlasRushStore } from './types';

type PauseDialogProps = {
  store: AtlasRushStore;
  isPaused: boolean;
  onEnd: () => void;
  notice: string;
};
export const PauseDialog: React.FC<PauseDialogProps> = ({
  store,
  isPaused,
  onEnd,
  notice,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) {
      return;
    }
    if (isPaused && !element.open) {
      element.showModal();
      continueButton.current?.focus();
    } else if (!isPaused && element.open) {
      element.close();
    }
  }, [isPaused]);
  return (
    <dialog
      ref={dialog}
      className={styles.panel}
      aria-labelledby="pause-title"
      aria-describedby="pause-description"
      onCancel={(event) => {
        event.preventDefault();
        store.getState().resumeGame();
      }}
    >
      <p className={styles.eyebrow}>Survey paused</p>
      <h2 id="pause-title">End this game?</h2>
      <p id="pause-description">Your progress in this round will be lost.</p>
      {notice && <p role="status">{notice}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.primaryButton} onClick={onEnd}>
          End game
        </button>
        <button
          ref={continueButton}
          type="button"
          className={styles.secondaryButton}
          onClick={store.getState().resumeGame}
        >
          Continue
        </button>
      </div>
    </dialog>
  );
};
