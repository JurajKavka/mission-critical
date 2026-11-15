import type * as React from 'react';
import { SelectionInput, SelectionLabel } from './selection-control-styles';

export type CheckboxButtonProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'type' | 'children'
> & {
  label: React.ReactNode;
};

export const CheckboxButton: React.FC<CheckboxButtonProps> = ({
  label,
  ...inputProps
}) => (
  <SelectionLabel>
    <SelectionInput {...inputProps} type="checkbox" />
    <span>{label}</span>
  </SelectionLabel>
);
