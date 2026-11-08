import { rem } from 'polished';
import type * as React from 'react';
import { styled } from 'styled-components';

const Button = styled.button`
  border: ${rem(1)} solid #69fbff;
  background: rgba(21, 97, 116, 0.2);
  color: #f4feff;
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
    background: rgba(31, 142, 161, 0.35);
  }

  &:focus-visible {
    border-color: #69fbff;
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} #69fbff;
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms;
  }
`;

const Arrow = styled.span`
  color: #69fbff;
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
