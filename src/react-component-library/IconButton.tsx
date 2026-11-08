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
  border: ${rem(1)} solid rgba(157, 181, 200, 0.3);
  background: transparent;
  color: #9db5c8;
  font: inherit;
  line-height: 1;
  cursor: pointer;

  &:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(2)};
  }

  &:hover:not(:disabled) {
    border-color: #69fbff;
    color: #f4feff;
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
