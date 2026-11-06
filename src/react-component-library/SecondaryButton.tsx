import { rem } from 'polished';
import type * as React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  padding: ${rem(12)} ${rem(16)};
  font-size: ${rem(10)};
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background 0.2s;
  border: ${rem(1)} solid rgba(157, 181, 200, 0.3);
  background: transparent;
  color: #9db5c8;

  &:hover {
    background: rgba(31, 142, 161, 0.35);
  }

  &:focus-visible {
    border-color: #69fbff;
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} #69fbff;
  }
`;

const Arrow = styled.span`
  color: #69fbff;
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
