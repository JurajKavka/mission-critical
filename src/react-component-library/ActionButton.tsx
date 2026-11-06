import type * as React from 'react';
import styles from './ActionButton.module.css';

type ActionButtonProps = {
  label: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  type = 'button',
  disabled = false,
  onClick,
}) => (
  <button
    className={styles.button}
    type={type}
    disabled={disabled}
    onClick={onClick}
  >
    <span data-action-label>{label}</span>
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  </button>
);
