import { theme } from './theme';
import { rem } from 'polished';
import type * as React from 'react';
import { styled } from 'styled-components';

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  padding: 0 ${rem(16)};
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background 0.2s;
  border: ${rem(1)} solid ${theme.colors.secondaryBorder};
  background: transparent;
  color: ${theme.colors.secondary};
  height: ${rem(42)};

  &:hover {
    background: ${theme.colors.actionHover};
  }

  &:focus-visible {
    border-color: ${theme.colors.cyan};
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} ${theme.colors.cyan};
  }
`;

const Arrow = styled.span`
  color: ${theme.colors.cyan};
  margin-left: ${rem(8)};
`;

type SecondaryButtonProps = {
  label: string;
  ref?: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  disabled?: boolean;
};

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  ref,
  onClick,
  disabled,
}) => (
  <Button ref={ref} type="button" onClick={onClick} disabled={disabled}>
    {label}
    <Arrow aria-hidden="true">→</Arrow>
  </Button>
);
