import { useEffect, useRef } from 'react';
import type * as React from 'react';
import * as UI from './atlas-styles';

const FOCUSABLE_ELEMENTS_QUERY =
  'button, [href], input, select, textarea, [tabindex]';

type ModalDialogProps = {
  labelledBy: string;
  children: React.ReactNode;
};

export const ModalDialog: React.FC<ModalDialogProps> = ({
  labelledBy,
  children,
}) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) {
      return;
    }
    element.showModal();
    return () => element.close();
  }, []);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    // Restoring or leaving a finished round requires an explicit choice.
    event.preventDefault();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') {
      return;
    }
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS_QUERY,
      ),
    ).filter(
      (element) =>
        element.tabIndex >= 0 &&
        !element.matches(':disabled') &&
        element.getClientRects().length > 0,
    );
    const first = controls[0];
    const last = controls.at(-1);
    const active = event.currentTarget.ownerDocument.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return (
    <UI.Modal
      ref={dialog}
      aria-labelledby={labelledBy}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
    >
      {children}
    </UI.Modal>
  );
};
