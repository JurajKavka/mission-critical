import { rem } from 'polished';
import type * as React from 'react';
import { styled } from 'styled-components';

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  border: ${rem(1)} solid rgba(157, 181, 200, 0.3);
  background: transparent;
  color: #9db5c8;
  width: ${rem(32)};
  height: ${rem(32)};
  font-size: ${rem(22)};
  padding: 0;
  line-height: 1;

  &:focus-visible {
    outline: ${rem(2)} solid #69fbff;
    outline-offset: ${rem(2)};
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
