import { rem } from 'polished';
import { useState } from 'react';
import type * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { BackspaceButton } from './BackspaceButton';

const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const Input = styled.input<{ $isUsingCustomKeyboard: boolean }>`
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  border: ${rem(1)} solid rgba(105, 251, 255, 0.28);
  background: #020b16;
  color: #f4feff;
  padding: ${rem(12)} ${rem(56)} ${rem(12)} ${rem(16)};
  font: inherit;
  font-size: ${rem(14)};
  text-transform: uppercase;
  caret-color: ${({ $isUsingCustomKeyboard }) =>
    $isUsingCustomKeyboard ? 'transparent' : 'auto'};

  &::placeholder {
    color: #8099ae;
    text-transform: none;
  }

  &:hover,
  &:focus {
    border-color: #69fbff;
    outline: none;
    box-shadow: inset 0 0 0 ${rem(2)} #69fbff;
  }
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const CaretViewport = styled.span`
  position: absolute;
  inset: 0 ${rem(56)} 0 ${rem(17)};
  display: flex;
  align-items: center;
  overflow: hidden;
  pointer-events: none;
  font: inherit;
  font-size: ${rem(14)};
  text-transform: uppercase;
  white-space: pre;
  visibility: hidden;

  ${InputContainer}:focus-within & {
    visibility: visible;
  }
`;

const CaretText = styled.span`
  visibility: hidden;
`;

const CaretContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${rem(2)};
`;

const Caret = styled.span`
  display: inline-block;
  width: ${rem(1)};
  height: 1em;
  background: #69fbff;
  box-shadow: 0 0 ${rem(6)} ${rem(1)} #69fbff;
  animation: ${blink} 1s step-end infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type AnswerTextInputProps = {
  ref?: React.Ref<HTMLInputElement>;
  id?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
  onBackspace?: () => void;
  onClear?: () => void;
  isInvalid?: boolean;
  placeholder?: string;
  'aria-label'?: string;
  feedbackId?: string;
  keyboardHelpId?: string;
  isUsingCustomKeyboard?: boolean;
  required?: boolean;
  disabled?: boolean;
};

export const AnswerTextInput: React.FC<AnswerTextInputProps> = ({
  ref,
  id,
  value,
  onChange,
  onKeyDown,
  onClick,
  onBackspace,
  onClear,
  isInvalid = false,
  placeholder,
  'aria-label': ariaLabel,
  feedbackId,
  keyboardHelpId,
  isUsingCustomKeyboard = false,
  required,
  disabled,
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const describedBy = [feedbackId, isUsingCustomKeyboard && keyboardHelpId]
    .filter(Boolean)
    .join(' ');
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (isUsingCustomKeyboard) {
      event.currentTarget.scrollLeft = event.currentTarget.scrollWidth;
    }
  };

  return (
    <InputContainer data-answer-input>
      <Input
        $isUsingCustomKeyboard={isUsingCustomKeyboard}
        ref={ref}
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onFocus={handleFocus}
        onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy || undefined}
        required={required}
        disabled={disabled}
        readOnly={isUsingCustomKeyboard}
        inputMode={isUsingCustomKeyboard ? 'none' : 'text'}
      />
      {isUsingCustomKeyboard && !disabled && (
        <CaretViewport aria-hidden="true">
          <CaretContent style={{ transform: `translateX(-${scrollLeft}px)` }}>
            <CaretText>{value}</CaretText>
            <Caret data-custom-caret />
          </CaretContent>
        </CaretViewport>
      )}
      {onBackspace && (
        <BackspaceButton
          disabled={disabled}
          onClick={onBackspace}
          onDeleteAll={onClear}
        />
      )}
    </InputContainer>
  );
};
