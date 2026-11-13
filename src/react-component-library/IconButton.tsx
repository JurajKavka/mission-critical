import { theme } from './theme';
import type * as React from 'react';
import { rem } from 'polished';
import { styled } from 'styled-components';
import { Icon } from './Icon';
import type { IconName } from './Icon';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${rem(32)};
  height: ${rem(32)};
  padding: 0;
  border: ${rem(1)} solid ${theme.colors.secondaryBorder};
  background: transparent;
  color: ${theme.colors.secondary};
  font: inherit;
  line-height: 1;
  cursor: pointer;

  &:focus-visible {
    outline: ${rem(2)} solid ${theme.colors.cyan};
    outline-offset: ${rem(2)};
  }

  &:hover:not(:disabled) {
    border-color: ${theme.colors.cyan};
    color: ${theme.colors.text};
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

export type IconButtonProps = {
  name: IconName;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  pressed?: boolean;
};

export const IconButton: React.FC<IconButtonProps> = ({
  name,
  label,
  onClick,
  className,
  disabled,
  pressed,
}) => (
  <Button
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    className={className}
    disabled={disabled}
    onClick={onClick}
  >
    <Icon name={name} size="l" />
  </Button>
);
