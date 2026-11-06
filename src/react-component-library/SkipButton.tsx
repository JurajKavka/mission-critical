import type * as React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  padding: 12px 16px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background 0.2s;
  border: 1px solid rgba(157, 181, 200, 0.3);
  background: transparent;
  color: #9db5c8;

  &:hover {
    background: rgba(31, 142, 161, 0.35);
  }

  &:focus-visible {
    border-color: #69fbff;
    outline: none;
    box-shadow: inset 0 0 0 2px #69fbff;
  }
`;

const Arrow = styled.span`
  color: #69fbff;
  margin-left: 8px;
`;

type SkipButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SkipButton: React.FC<SkipButtonProps> = ({
  onClick,
  disabled,
}) => (
  <Button type="button" onClick={onClick} disabled={disabled}>
    Skip<Arrow aria-hidden="true">→</Arrow>
  </Button>
);
