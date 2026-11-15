import type * as React from 'react';
import { styled } from 'styled-components';
import { SelectionInput, SelectionLabel } from './selection-control-styles';

const RadioLabel = styled(SelectionLabel)`
  letter-spacing: 0.08em;
`;

export type RadioButtonProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'type' | 'children'
> & {
  label: React.ReactNode;
};

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  ...inputProps
}) => (
  <RadioLabel>
    <SelectionInput {...inputProps} type="radio" />
    <span>{label}</span>
  </RadioLabel>
);
