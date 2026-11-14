import type { Meta, StoryObj } from '@storybook/react-vite';
import { AsciiKeyboardKey } from './AsciiKeyboardKey';

const meta = {
  title: 'Components/Mobile Keyboard Key',
  component: AsciiKeyboardKey,
  args: {
    keyValue: 'A',
    children: 'A',
    onKey: () => {},
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof AsciiKeyboardKey>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Command: Story = {
  args: { keyValue: 'Skip', children: 'Skip →', isCommandKey: true },
};
export const Disabled: Story = { args: { disabled: true } };
