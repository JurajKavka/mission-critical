import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipButton } from './SkipButton';

const meta = {
  title: 'Components/Skip Button',
  component: SkipButton,
  args: { onClick: () => {} },
} satisfies Meta<typeof SkipButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
