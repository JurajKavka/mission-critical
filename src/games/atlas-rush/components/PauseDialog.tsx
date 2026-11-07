import { useEffect, useRef } from 'react';
import type * as React from 'react';
import {
  ActionButton,
  SecondaryButton,
} from '../../../react-component-library';
import * as UI from './atlas-styles';
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
    <UI.Panel
      as="dialog"
      ref={dialog}
      aria-labelledby="pause-title"
      aria-describedby="pause-description"
      onCancel={(event) => {
        event.preventDefault();
        store.getState().resumeGame();
      }}
    >
      <UI.Eyebrow>Survey paused</UI.Eyebrow>
      <h2 id="pause-title">End this game?</h2>
      <p id="pause-description">Your progress in this round will be lost.</p>
      {isPaused && notice && <p role="status">{notice}</p>}
      <UI.Actions>
        <ActionButton label="End game" onClick={onEnd} />
        <SecondaryButton
          ref={continueButton}
          label="Continue"
          onClick={store.getState().resumeGame}
        />
      </UI.Actions>
    </UI.Panel>
  );
};
