import type * as React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  border: 1px solid rgba(157, 181, 200, 0.3);
  background: transparent;
  color: #9db5c8;
  width: 32px;
  height: 32px;
  font-size: 22px;
  padding: 0;
  line-height: 1;

  &:focus-visible {
    outline: 2px solid #69fbff;
    outline-offset: 2px;
  }

  &:hover {
    border-color: #69fbff;
    color: #f4feff;
  }
`;

type ExitButtonProps = {
  onClick: () => void;
  className?: string;
};

export const ExitButton: React.FC<ExitButtonProps> = ({
  onClick,
  className,
}) => (
  <Button
    type="button"
    aria-label="End game"
    onClick={onClick}
    className={className}
  >
    ×
  </Button>
);
