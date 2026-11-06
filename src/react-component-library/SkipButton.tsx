import type * as React from 'react';
import { SecondaryButton } from './SecondaryButton';

type SkipButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SkipButton: React.FC<SkipButtonProps> = ({
  onClick,
  disabled,
}) => <SecondaryButton label="Skip" onClick={onClick} disabled={disabled} />;
