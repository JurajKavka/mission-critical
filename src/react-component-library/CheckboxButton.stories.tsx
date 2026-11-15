import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckboxButton } from './CheckboxButton';

const meta = {
  title: 'Components/Checkbox Button',
  component: CheckboxButton,
  args: {
    label: 'Learning mode',
    name: 'learning',
    defaultChecked: false,
  },
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof CheckboxButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};
