import { theme } from './theme';
import { rem } from 'polished';
import type * as React from 'react';
import { styled } from 'styled-components';

const Button = styled.button`
  border: ${rem(1)} solid ${theme.colors.cyan};
  background: ${theme.colors.actionSurface};
  color: ${theme.colors.text};
  padding: 0 ${rem(16)};
  font: inherit;
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: background 0.2s;
  cursor: pointer;
  height: ${rem(42)};

  &:hover {
    background: ${theme.colors.actionHover};
  }

  &:focus-visible {
    border-color: ${theme.colors.cyan};
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} ${theme.colors.cyan};
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
`;

const Arrow = styled.span`
  color: ${theme.colors.cyan};
  margin-left: ${rem(8)};
`;

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
  <Button type={type} disabled={disabled} onClick={onClick}>
    <span data-action-label>{label}</span>
    <Arrow aria-hidden="true">↗</Arrow>
  </Button>
);
